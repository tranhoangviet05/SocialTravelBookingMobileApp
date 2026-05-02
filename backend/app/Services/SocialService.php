<?php

namespace App\Services;

use App\Models\User;
use App\Models\SocialProfile;
use App\Events\PostLiked;
use App\Events\CommentCreated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class SocialService
{
    /**
     * Kích hoạt hồ sơ mạng xã hội lần đầu (Onboarding).
     */
    public function activateSocialProfile(User $user, array $data): bool
    {
        return DB::transaction(function () use ($user, $data) {
            try {
                if (!empty($data['displayName'])) {
                    $user->display_name = $data['displayName'];
                }
                if (!empty($data['avatarUrl'])) {
                    $user->avatar_url = $data['avatarUrl'];
                }
                
                $user->social_active = true;
                $user->save();

                SocialProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'username'        => $data['username'],
                        'bio'             => $data['bio'] ?? '',
                        'is_verified'     => false,
                        'followers_count' => 0,
                        'following_count' => 0,
                        'posts_count'     => 0,
                        'website_url'     => $data['websiteUrl'] ?? null,
                    ]
                );

                return true;
            } catch (Exception $e) {
                Log::error('SocialService@activateSocialProfile error: ' . $e->getMessage());
                throw $e;
            }
        });
    }

    /**
     * Tạo bài viết mới
     */
    public function createPost(User $user, array $data): \App\Models\Post
    {
        return DB::transaction(function () use ($user, $data) {
            $post = \App\Models\Post::create([
                'user_id'     => $user->id,
                'content'     => $data['content'] ?? null,
                'location_id' => $data['location_id'] ?? null,
                'service_id'  => $data['service_id'] ?? null,
                'visibility'  => $data['visibility'] ?? 'public',
            ]);

            // Xử lý media
            if (!empty($data['media'])) {
                foreach ($data['media'] as $index => $item) {
                    $post->media()->create([
                        'url'   => $item['url'],
                        'type'  => $item['type'] ?? 'image',
                        'order' => $index,
                    ]);
                }
            }

            // Xử lý tags
            if (!empty($data['tags'])) {
                foreach ($data['tags'] as $tagName) {
                    $tag = \App\Models\Tag::firstOrCreate(
                        ['name' => strtolower($tagName)],
                        ['display_name' => $tagName]
                    );
                    $post->tags()->attach($tag->id);
                }
            }

            // Cập nhật số lượng bài viết trong social_profile
            $user->socialProfile()->increment('posts_count');

            return $post->load(['author.socialProfile', 'media', 'tags', 'location', 'service.media']);
        });
    }

    /**
     * Like hoặc Unlike bài viết
     */
    public function toggleLike(User $user, string $postId): array
    {
        $post = \App\Models\Post::findOrFail($postId);
        $like = \App\Models\Like::where('user_id', $user->id)->where('post_id', $postId)->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            \App\Models\Like::firstOrCreate([
                'user_id' => $user->id,
                'post_id' => $postId
            ]);
            $liked = true;
            
            // TẠO THÔNG BÁO LIKE
            $this->createNotification($post->user_id, $user->id, 'like', $postId);
        }

        // Đếm lại số lượng thực tế để tránh sai lệch do nhấn nhanh
        $likesCount = \App\Models\Like::where('post_id', $postId)->count();
        $post->update(['likes_count' => $likesCount]);

        broadcast(new PostLiked($postId, $post->likes_count, $user->id, $liked));

        return ['liked' => $liked, 'likes_count' => $post->likes_count];
    }

    /**
     * Thêm bình luận
     */
    public function addComment(User $user, string $postId, string $content, ?string $serviceId = null): \App\Models\Comment
    {
        return DB::transaction(function () use ($user, $postId, $content, $serviceId) {
            $post = \App\Models\Post::findOrFail($postId);
            
            $comment = \App\Models\Comment::create([
                'user_id' => $user->id,
                'post_id' => $postId,
                'content' => $content,
                'service_id' => $serviceId
            ]);

            $post->increment('comments_count');

            $comment = $comment->load(['author', 'service.media']);
            
            // TẠO THÔNG BÁO COMMENT
            $this->createNotification($post->user_id, $user->id, 'comment', $postId, $comment->id);

            // Gửi notification real-time cho tất cả mọi người
            broadcast(new CommentCreated($comment));

            return $comment;
        });
    }

    /**
     * Follow hoặc Unfollow người dùng
     */
    public function toggleFollow(User $follower, string $followingId): array
    {
        if ($follower->id === $followingId) {
            throw new \Exception("Bạn không thể theo dõi chính mình");
        }

        $followingUser = User::findOrFail($followingId);
        
        $follow = \App\Models\Follow::where('follower_id', $follower->id)
                                    ->where('following_id', $followingId)
                                    ->first();

        if ($follow) {
            $follow->delete();
            $status = false;
        } else {
            \App\Models\Follow::create([
                'follower_id'  => $follower->id,
                'following_id' => $followingId
            ]);
            $status = true;

            // TẠO THÔNG BÁO FOLLOW
            $this->createNotification($followingId, $follower->id, 'follow');
        }

        // Đếm lại chính xác số lượng từ DB
        $followerCount = \App\Models\Follow::where('following_id', $followingId)->count();
        $followingCount = \App\Models\Follow::where('follower_id', $follower->id)->count();

        // Cập nhật vào SocialProfile
        $followingUser->socialProfile()->update(['followers_count' => $followerCount]);
        $follower->socialProfile()->update(['following_count' => $followingCount]);

        // Phát tín hiệu Real-time
        broadcast(new \App\Events\UserFollowed(
            $follower->id, 
            $followingId, 
            $status, 
            $followerCount, 
            $followingCount
        ));

        return [
            'following' => $status,
            'followers_count' => $followerCount,
            'following_count' => $followingCount
        ];
    }

    public function getFeed(User $user, int $perPage = 10, string $mode = 'all')
    {
        // Lấy danh sách ID những người đang theo dõi
        $followingIds = \App\Models\Follow::where('follower_id', $user->id)
                                          ->pluck('following_id')
                                          ->toArray();
        
        // Luôn bao gồm bài viết của chính mình
        $followingIds[] = $user->id;

        $posts = \App\Models\Post::whereIn('user_id', $followingIds)
                               ->with(['author.socialProfile', 'media', 'tags', 'location', 'service.media'])
                               ->withCount([
                                   'likes as is_liked' => function($query) use ($user) {
                                       $query->where('user_id', $user->id);
                                   }
                               ])
                               ->orderByDesc('created_at')
                               ->paginate($perPage);

        // Bổ sung trạng thái follow cho từng author
        $posts->getCollection()->transform(function ($post) use ($user) {
            $post->author->is_following = \App\Models\Follow::where('follower_id', $user->id)
                                                            ->where('following_id', $post->user_id)
                                                            ->exists();
            return $post;
        });

        // Nếu bản tin theo dõi trống VÀ đang ở chế độ 'all', gợi ý bài viết công khai của mọi người (Discovery Mode)
        if ($posts->total() === 0 && $mode === 'all') {
            $discoveryPosts = \App\Models\Post::where('visibility', 'public')
                                   ->with(['author.socialProfile', 'media', 'tags', 'location', 'service.media'])
                                   ->withCount([
                                       'likes as is_liked' => function($query) use ($user) {
                                           $query->where('user_id', $user->id);
                                       }
                                   ])
                                   ->orderByDesc('created_at')
                                   ->paginate($perPage);
            
            $discoveryPosts->getCollection()->transform(function ($post) use ($user) {
                $post->author->is_following = \App\Models\Follow::where('follower_id', $user->id)
                                                                ->where('following_id', $post->user_id)
                                                                ->exists();
                return $post;
            });
            
            return $discoveryPosts;
        }

        return $posts;
    }

    /**
     * Lấy bài viết của một người dùng cụ thể
     */
    public function getUserPosts(User $user, string $targetUserId, int $perPage = 10)
    {
        $posts = \App\Models\Post::where('user_id', $targetUserId)
                               ->with(['author.socialProfile', 'media', 'tags', 'location', 'service.media'])
                               ->withCount(['likes as is_liked' => function($query) use ($user) {
                                   $query->where('user_id', $user->id);
                               }])
                               ->orderByDesc('created_at')
                               ->paginate($perPage);

        $isFollowing = \App\Models\Follow::where('follower_id', $user->id)
                                         ->where('following_id', $targetUserId)
                                         ->exists();

        $posts->getCollection()->transform(function ($post) use ($isFollowing) {
            $post->author->is_following = $isFollowing;
            return $post;
        });

        return $posts;
    }

    /**
     * Lấy danh sách bình luận của một người dùng cụ thể (Replies)
     */
    public function getUserComments(string $userId, int $perPage = 15)
    {
        return \App\Models\Comment::where('user_id', $userId)
                                  ->with(['post.author', 'author', 'service.media'])
                                  ->orderByDesc('created_at')
                                  ->paginate($perPage);
    }

    /**
     * Tìm kiếm bài viết (theo từ khóa, hashtag hoặc địa điểm)
     */
    public function searchPosts(User $user, ?string $q = null, ?string $tag = null, ?int $locationId = null, int $perPage = 15)
    {
        $query = \App\Models\Post::with(['author.socialProfile', 'media', 'tags', 'location', 'service.media'])
                                 ->withCount(['likes as is_liked' => function($q) use ($user) {
                                     $q->where('user_id', $user->id);
                                 }])
                                 ->where('visibility', 'public');

        if ($tag) {
            $query->whereHas('tags', function($q) use ($tag) {
                $q->where('name', strtolower($tag));
            });
        }

        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        if ($q) {
            $query->where(function($sub) use ($q) {
                $sub->where('content', 'like', "%{$q}%")
                    ->orWhereHas('author', function($sub2) use ($q) {
                        $sub2->where('display_name', 'like', "%{$q}%");
                    });
            });
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    /**
     * Tìm kiếm người dùng
     */
    public function searchUsers(User $user, string $q, int $perPage = 20)
    {
        $users = User::with('socialProfile')
                     ->where('social_active', true)
                     ->where(function($query) use ($q) {
                         $query->where('display_name', 'like', "%{$q}%")
                               ->orWhereHas('socialProfile', function($sub) use ($q) {
                                   $sub->where('username', 'like', "%{$q}%");
                               });
                     })
                     ->where('id', '!=', $user->id)
                     ->paginate($perPage);

        // Bổ sung trạng thái is_following
        $users->getCollection()->transform(function($u) use ($user) {
            $u->is_following = \App\Models\Follow::where('follower_id', $user->id)
                                                 ->where('following_id', $u->id)
                                                 ->exists();
            return $u;
        });

        return $users;
    }
    /**
     * Lấy danh sách người theo dõi của một user
     */
    public function getFollowers(User $currentUser, string $userId, int $perPage = 20)
    {
        $followers = User::whereIn('id', function($query) use ($userId) {
            $query->select('follower_id')->from('follows')->where('following_id', $userId);
        })->with('socialProfile')->paginate($perPage);

        $followers->getCollection()->transform(function($u) use ($currentUser) {
            $u->is_following = \App\Models\Follow::where('follower_id', $currentUser->id)
                                                 ->where('following_id', $u->id)
                                                 ->exists();
            return $u;
        });

        return $followers;
    }

    /**
     * Lấy danh sách những người mà user đang theo dõi
     */
    public function getFollowing(User $currentUser, string $userId, int $perPage = 20)
    {
        $following = User::whereIn('id', function($query) use ($userId) {
            $query->select('following_id')->from('follows')->where('follower_id', $userId);
        })->with('socialProfile')->paginate($perPage);

        $following->getCollection()->transform(function($u) use ($currentUser) {
            $u->is_following = \App\Models\Follow::where('follower_id', $currentUser->id)
                                                 ->where('following_id', $u->id)
                                                 ->exists();
            return $u;
        });

        return $following;
    }
    /**
     * Lấy thông tin profile của một người dùng bất kỳ
     */
    public function getOtherUserProfile(User $currentUser, string $targetUserId)
    {
        $targetUser = User::with('socialProfile')->findOrFail($targetUserId);
        
        $targetUser->is_following = \App\Models\Follow::where('follower_id', $currentUser->id)
                                                      ->where('following_id', $targetUserId)
                                                      ->exists();
        
        return $targetUser;
    }

    /**
     * Tạo thông báo mới
     */
    private function createNotification(string $userId, string $senderId, string $type, ?string $postId = null, ?string $commentId = null, ?array $data = null)
    {
        if ($userId === $senderId) return null;

        return \App\Models\SocialNotification::create([
            'user_id'    => $userId,
            'sender_id'  => $senderId,
            'type'       => $type,
            'post_id'    => $postId,
            'comment_id' => $commentId,
            'data'       => $data,
            'is_read'    => false
        ]);
    }

    /**
     * Lấy danh sách thông báo hoạt động
     */
    public function getNotifications(User $user, int $perPage = 20)
    {
        return \App\Models\SocialNotification::where('user_id', $user->id)
                                             ->with(['sender.socialProfile', 'post.media'])
                                             ->orderByDesc('created_at')
                                             ->paginate($perPage);
    }
}
