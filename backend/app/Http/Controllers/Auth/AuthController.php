<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Str;

use App\Services\AuthService;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Đồng bộ người dùng từ Firebase (Đăng ký/Đăng nhập tự động).
     */
    public function sync(Request $request)
    {
        try {
            // Lấy thông tin từ Middleware FirebaseAuthMiddleware
            // Ưu tiên displayName từ request body (Email/Password signup)
            // Fallback sang token claim 'name' (Google OAuth)
            $firebaseData = [
                'uid' => $request->attributes->get('firebaseUid'),
                'email' => $request->attributes->get('firebaseEmail'),
                'name' => $request->input('displayName')
                    ?? $request->attributes->get('firebaseUser')['name'] 
                    ?? null,
                'picture' => $request->attributes->get('firebaseUser')['picture'] ?? null,
                'role' => $request->input('role') ?? 'tourist',
            ];

            if (!$firebaseData['uid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy định danh Firebase trong yêu cầu.'
                ], 400);
            }

            // Gọi Service để xử lý logic
            $result = $this->authService->syncFirebaseUser($firebaseData);
            $user = $result['user'];
            $isNewUser = $result['is_new_user'];

            return response()->json([
                'success' => true,
                'message' => $isNewUser ? 'Đăng ký thành viên thành công' : 'Đăng nhập thành công',
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'display_name' => $user->display_name,
                    'avatar_url' => $user->avatar_url,
                    'role' => $user->role,
                    'social_active' => $user->social_active,
                    'is_new_user' => $isNewUser
                ]
            ]);

        } catch (\Throwable $e) {
            Log::error('Auth Sync CRITICAL ERROR: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra trong quá trình đồng bộ tài khoản: ' . $e->getMessage()
            ], 500);
        }
    }
}
