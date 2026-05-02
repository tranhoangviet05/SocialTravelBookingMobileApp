<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Lấy Firebase UID từ middleware phía trước
        $firebaseUid = $request->attributes->get('firebaseUid');

        if (!$firebaseUid) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xác thực: Không tìm thấy Firebase UID.'
            ], 401);
        }

        // 2. Sử dụng Cache để giảm truy vấn DB (Lưu trong 60 phút)
        $cacheKey = "user_role_{$firebaseUid}";
        $user = \Illuminate\Support\Facades\Cache::remember($cacheKey, now()->addMinutes(60), function () use ($firebaseUid) {
            return \App\Models\User::where('firebase_uid', $firebaseUid)->first();
        });

        if (!$user) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            return response()->json([
                'success' => false,
                'message' => 'Người dùng chưa được đồng bộ với hệ thống.'
            ], 404);
        }

        // 3. Kiểm tra Role
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thực hiện hành động này.'
            ], 403);
        }

        // 4. Đính kèm user model vào request
        $request->merge(['user' => $user]);

        return $next($request);
    }
}
