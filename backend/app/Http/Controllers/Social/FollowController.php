<?php
namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SocialProfile;
use App\Services\SocialService;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    protected $socialService;

    public function __construct(SocialService $socialService)
    {
        $this->socialService = $socialService;
    }

    /**
     * Follow / Unfollow người dùng
     */
    public function toggleFollow(Request $request, string $followingId)
    {
        $user = $request->attributes->get('userModel');
        $result = $this->socialService->toggleFollow($user, $followingId);

        return response()->json([
            'success' => true,
            'data'    => $result
        ]);
    }

    /**
     * Lấy danh sách người theo dõi của một user
     */
    public function getFollowers(Request $request, string $userId)
    {
        $currentUser = $request->attributes->get('userModel');
        $followers = $this->socialService->getFollowers(
            $currentUser, 
            $userId, 
            $request->get('per_page', 20)
        );

        return response()->json([
            'success' => true,
            'data'    => $followers
        ]);
    }

    /**
     * Lấy danh sách đang theo dõi của một user
     */
    public function getFollowing(Request $request, string $userId)
    {
        $currentUser = $request->attributes->get('userModel');
        $following = $this->socialService->getFollowing(
            $currentUser, 
            $userId, 
            $request->get('per_page', 20)
        );

        return response()->json([
            'success' => true,
            'data'    => $following
        ]);
    }

    /**
     * Gợi ý người dùng để theo dõi
     */
    public function suggestions(Request $request)
    {
        $user = $request->attributes->get('userModel');
        
        // Lấy danh sách ID đã follow để loại trừ
        $followingIds = \App\Models\Follow::where('follower_id', $user->id)
                                          ->pluck('following_id')
                                          ->toArray();
        $followingIds[] = $user->id; // Loại trừ chính mình

        // Gợi ý những người chưa follow, có social_active = true
        $suggestions = User::with('socialProfile')
                           ->where('social_active', true)
                           ->whereNotIn('id', $followingIds)
                           ->inRandomOrder()
                           ->limit(5)
                           ->get();

        return response()->json([
            'success' => true,
            'data'    => $suggestions
        ]);
    }

    public function search(Request $request)
    {
        try {
            $user = $request->attributes->get('userModel');
            $q = $request->query('q');

            if (!$q) {
                return response()->json([
                    'success' => true,
                    'data' => ['data' => []]
                ]);
            }

            $users = $this->socialService->searchUsers($user, $q, $request->get('limit', 20));

            return response()->json([
                'success' => true,
                'data'    => $users
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm kiếm người dùng'
            ], 500);
        }
    }
}
