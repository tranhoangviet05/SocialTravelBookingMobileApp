<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;
use Kreait\Firebase\Exception\Auth\RevokedIdToken;

class FirebaseAuthMiddleware
{
    /**
     * Xác thực người dùng qua Firebase ID Token.
     *
     * Client gửi token trong header:
     *   Authorization: Bearer <firebase-id-token>
     *
     * Sau khi xác thực thành công, thông tin user Firebase
     * được lưu vào request attributes để các controller sử dụng:
     *   $request->firebaseUid     — UID của user trên Firebase
     *   $request->firebaseUser    — Toàn bộ decoded token
     *   $request->firebaseEmail   — Email của user
     */
    public function handle(Request $request, Closure $next): mixed
    {
        // Lấy token từ header Authorization
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return $this->unauthorizedResponse('Token không được cung cấp.');
        }

        try {
            // Xác minh ID Token với Firebase (thêm 60s leeway để tránh lỗi lệch thời gian nhỏ)
            $auth = Firebase::auth();
            $verifiedToken = $auth->verifyIdToken($bearerToken, false, 60);

            // Lưu thông tin user vào request để dùng ở controller
            $uid = $verifiedToken->claims()->get('sub');
            $request->attributes->set('firebaseUid', $uid);
            $request->attributes->set('firebaseEmail', $verifiedToken->claims()->get('email'));
            $request->attributes->set('firebaseUser', $verifiedToken->claims()->all());

            // Gắn Eloquent User Model
            $user = \App\Models\User::where('firebase_uid', $uid)->first();
            if ($user) {
                $request->setUserResolver(fn () => $user);
                $request->attributes->set('userModel', $user);
            }

        } catch (RevokedIdToken $e) {
            \Log::error('Firebase Auth: Token revoked', ['error' => $e->getMessage()]);
            return $this->unauthorizedResponse('Token đã bị thu hồi. Vui lòng đăng nhập lại.');
        } catch (FailedToVerifyToken $e) {
            \Log::error('Firebase Auth: Token verification failed', ['error' => $e->getMessage()]);
            return $this->unauthorizedResponse('Token không hợp lệ: ' . $e->getMessage());
        } catch (\Throwable $e) {
            \Log::error('Firebase Auth: CRITICAL ERROR', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống trong quá trình xác thực: ' . $e->getMessage(),
            ], 500);
        }

        return $next($request);
    }

    /**
     * Trả về response lỗi 401 dạng JSON.
     */
    private function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 401);
    }
}
