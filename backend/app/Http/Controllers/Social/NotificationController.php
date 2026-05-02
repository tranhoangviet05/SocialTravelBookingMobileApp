<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\SocialNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Lấy danh sách thông báo của người dùng hiện tại
     */
    public function index(Request $request)
    {
        try {
            $user = $request->attributes->get('userModel');
            $type = $request->query('type'); // all, follow, reply, like

            $query = SocialNotification::with(['sender', 'post'])
                ->where('user_id', $user->id);

            if ($type && $type !== 'all') {
                if ($type === 'reply') {
                    $query->where('type', 'comment');
                } else {
                    $query->where('type', $type);
                }
            }

            $notifications = $query->orderByDesc('created_at')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);
        } catch (\Throwable $e) {
            Log::error('Fetch Notifications Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách thông báo'
            ], 500);
        }
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    public function markAsRead(Request $request, string $id)
    {
        try {
            $user = $request->attributes->get('userModel');
            $notification = SocialNotification::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thông báo không tồn tại'
                ], 404);
            }

            $notification->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Đã đánh dấu là đã đọc'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật trạng thái thông báo'
            ], 500);
        }
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->attributes->get('userModel');
            SocialNotification::where('user_id', $user->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Đã đánh dấu tất cả là đã đọc'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật trạng thái thông báo'
            ], 500);
        }
    }
}
