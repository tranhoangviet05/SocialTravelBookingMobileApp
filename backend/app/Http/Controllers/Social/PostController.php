<?php
namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\SocialService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    protected $socialService;

    public function __construct(SocialService $socialService)
    {
        $this->socialService = $socialService;
    }

    /**
     * Lấy News Feed cho người dùng hiện tại
     */
    public function index(Request $request)
    {
        try {
            $user = $request->attributes->get('userModel');

            // Guard: user chưa sync vào DB
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản chưa được đồng bộ. Vui lòng đăng nhập lại.'
                ], 401);
            }

            // Nếu có tham số tìm kiếm thì gọi searchPosts
            if ($request->has('q') || $request->has('tag') || $request->has('location_id')) {
                $feed = $this->socialService->searchPosts(
                    $user,
                    $request->get('q'),
                    $request->get('tag'),
                    $request->get('location_id'),
                    $request->get('limit', 15)
                );
            } else {
                $feed = $this->socialService->getFeed(
                    $user, 
                    $request->get('limit', 10),
                    $request->get('mode', 'all')
                );
            }

            return response()->json([
                'success' => true,
                'data' => $feed
            ]);
        } catch (\Throwable $e) {
            Log::error('PostController@index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy dữ liệu bài viết'
            ], 500);
        }
    }


    /**
     * Tạo bài viết mới
     */
    public function store(Request $request)
    {
        try {
            $user = $request->attributes->get('userModel');
            
            $validated = $request->validate([
                'content'     => 'nullable|string',
                'media'       => 'nullable|array',
                'media.*.url' => 'required|url',
                'media.*.type' => 'nullable|string',
                'media.*.width' => 'nullable|integer',
                'media.*.height' => 'nullable|integer',
                'tags'        => 'nullable|array',
                'location_id' => 'nullable|integer|exists:locations,id',
                'service_id'  => 'nullable|uuid|exists:services,id',
                'visibility'  => 'nullable|string|in:public,private',
            ]);

            $post = $this->socialService->createPost($user, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Bài viết đã được đăng thành công',
                'data'    => $post
            ], 201);
        } catch (\Throwable $e) {
            Log::error('PostController@store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đăng bài: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy bài viết chi tiết
     */
    public function show(Request $request, string $id)
    {
        try {
            $user = $request->attributes->get('userModel');
            $post = Post::with(['author.socialProfile', 'media', 'tags', 'location', 'service.media'])
                        ->withCount(['likes as is_liked' => function($q) use ($user) {
                            $q->where('user_id', $user->id);
                        }])
                        ->findOrFail($id);

            // Trạng thái follow
            $post->author->is_following = \App\Models\Follow::where('follower_id', $user->id)
                                                            ->where('following_id', $post->user_id)
                                                            ->exists();

            return response()->json([
                'success' => true,
                'data'    => $post
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết'
            ], 404);
        }
    }

    /**
     * Xóa bài viết
     */
    public function destroy(Request $request, string $id)
    {
        try {
            $user = $request->attributes->get('userModel');
            $post = Post::where('id', $id)->where('user_id', $user->id)->firstOrFail();

            $post->delete();
            $user->socialProfile()->decrement('posts_count');

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa bài viết'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa bài viết'
            ], 500);
        }
    }

    /**
     * Lấy danh sách bài viết của một người dùng cụ thể
     */
    public function userPosts(Request $request, string $userId)
    {
        try {
            $user = $request->attributes->get('userModel');
            $posts = $this->socialService->getUserPosts($user, $userId, $request->get('limit', 10));

            return response()->json([
                'success' => true,
                'data'    => $posts
            ]);
        } catch (\Throwable $e) {
            Log::error('PostController@userPosts error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải bài viết của người dùng'
            ], 500);
        }
    }
    /**
     * Tìm kiếm tổng hợp
     */
    public function searchAll(Request $request)
    {
        try {
            $user = $request->attributes->get('userModel');
            $q = $request->query('q');

            if (!$q) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'posts' => [],
                        'users' => [],
                        'merged' => []
                    ]
                ]);
            }

            $results = $this->socialService->searchAll($user, $q);

            return response()->json([
                'success' => true,
                'data'    => $results
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm kiếm tổng hợp'
            ], 500);
        }
    }
}
