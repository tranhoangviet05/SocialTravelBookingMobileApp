<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tourist\SocialRequest;
use App\Models\User;
use App\Services\SocialService;
use Illuminate\Support\Facades\Log;

class SocialController extends Controller
{
    protected $socialService;

    public function __construct(SocialService $socialService)
    {
        $this->socialService = $socialService;
    }

    /**
     * Lấy trạng thái kích hoạt mạng xã hội của người dùng hiện tại
     */
    public function getSocialStatus(\Illuminate\Http\Request $request)
    {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = User::with('socialProfile')->where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'social_active' => $user->social_active,
                'id'            => $user->id,
                'email'         => $user->email,
                'display_name'  => $user->display_name,
                'avatar_url'    => $user->avatar_url,
                'username'      => $user->socialProfile ? $user->socialProfile->username : null,
            ]
        ]);
    }

    /**
     * Lấy hồ sơ mạng xã hội của chính người dùng hiện tại
     */
    public function getMyProfile(\Illuminate\Http\Request $request)
    {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = User::with('socialProfile')->where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }

        if (!$user->social_active) {
            return response()->json([
                'success' => true,
                'social_active' => false,
                'message' => 'Người dùng chưa kích hoạt mạng xã hội'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'display_name' => $user->display_name,
                'avatar_url' => $user->avatar_url,
                'social_active' => $user->social_active,
                'social_profile' => $user->socialProfile,
            ]
        ]);
    }

    /**
     * Đồng bộ hồ sơ mạng xã hội (Onboarding)
     */
    public function syncSocialProfile(SocialRequest $request)
    {
        try {
            $firebaseUid = $request->attributes->get('firebaseUid');
            $user = User::where('firebase_uid', $firebaseUid)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại'
                ], 404);
            }

            $validatedData = $request->validated();

            $this->socialService->activateSocialProfile($user, $validatedData);

            // Reload user để lấy dữ liệu mới nhất
            $user->refresh();
            $user->load('socialProfile');

            return response()->json([
                'success' => true,
                'message' => 'Hồ sơ mạng xã hội đã được kích hoạt thành công',
                'data' => [
                    'id'            => $user->id,
                    'social_active' => true,
                    'display_name'  => $user->display_name,
                    'avatar_url'    => $user->avatar_url,
                    'social_profile' => $user->socialProfile,
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('SyncSocialProfile Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi đồng bộ hồ sơ: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Lấy hồ sơ của một người dùng bất kỳ
     */
    public function getOtherProfile(\Illuminate\Http\Request $request, string $userId)
    {
        try {
            $currentUser = $request->attributes->get('userModel');
            $targetUser = $this->socialService->getOtherUserProfile($currentUser, $userId);

            return response()->json([
                'success' => true,
                'data'    => $targetUser
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tìm thấy người dùng'
            ], 404);
        }
    }

    /**
     * Đăng bài tự động (Dành cho n8n)
     * POST /api/social/post
     */
    public function createPost(\Illuminate\Http\Request $request)
    {
        // Trong thực tế, bạn sẽ lưu bài đăng vào DB hoặc gọi API Facebook/Instagram
        // Ở đây chúng ta giả lập thành công để n8n không báo lỗi
        
        $content = $request->input('content', 'Bài đăng tự động từ n8n');
        
        Log::info('N8N Auto Post: ' . $content);

        return response()->json([
            'success' => true,
            'message' => 'Bài viết đã được đăng tự động thành công!',
            'data' => [
                'post_id' => bin2hex(random_bytes(8)),
                'content' => $content,
                'created_at' => now()->toDateTimeString()
            ]
        ]);
    }
}
