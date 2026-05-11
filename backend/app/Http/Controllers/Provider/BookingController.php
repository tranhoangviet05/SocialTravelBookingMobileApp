<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ProviderProfile;
use Illuminate\Http\Request;

class BookingController extends Controller
{

    private function getProvider(Request $request)
    {
        $user = $request->input('user');
        return ProviderProfile::where('user_id', $user->id)->first();
    }

    /**
     * Danh sách đơn đặt chỗ của nhà cung cấp
     */
    public function index(Request $request)
    {
        $provider = $this->getProvider($request);
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ nhà cung cấp.'], 404);
        }

        $query = Booking::with(['user', 'service'])
            ->where('provider_id', $provider->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'checkin_requested') {
                $query->whereNotNull('tourist_check_in_at')
                      ->where('is_checked_in', false);
            } else {
                $query->where('status', $request->status);
            }
        }

        $bookings = $query->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Chi tiết đơn đặt chỗ
     */
    public function show(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $booking = Booking::with(['user', 'service', 'review'])->findOrFail($id);

        if ($booking->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền xem đơn này.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    /**
     * Cập nhật trạng thái đơn (confirmed, ongoing, completed, cancelled)
     */
    public function updateStatus(Request $request, $id, \App\Services\ChatService $chatService)
    {
        $provider = $this->getProvider($request);
        $booking = Booking::findOrFail($id);

        if ($booking->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền cập nhật đơn này.'], 403);
        }

        $request->validate([
            'status' => 'required|in:confirmed,ongoing,completed,cancelled'
        ]);

        $newStatus = $request->status;

        $validTransitions = [
            'confirmed' => ['ongoing', 'cancelled'],
            'ongoing' => ['completed'],
        ];

        $currentStatus = $booking->status;
        
        // Nếu là pending, Provider không được làm gì cả
        if ($currentStatus === 'pending') {
            return response()->json([
                'success' => false,
                'message' => "Đơn hàng đang chờ khách thanh toán. Bạn không thể thực hiện hành động nào lúc này."
            ], 422);
        }

        if (!isset($validTransitions[$currentStatus]) || !in_array($newStatus, $validTransitions[$currentStatus])) {
            return response()->json([
                'success' => false,
                'message' => "Không thể chuyển từ trạng thái '{$currentStatus}' sang '{$newStatus}'."
            ], 422);
        }

        $booking->status = $newStatus;

        if ($newStatus === 'ongoing') {
            $booking->is_checked_in = true;
            $booking->checked_in_at = now();
        }

        if ($newStatus === 'cancelled') {
            $booking->cancel_reason = $request->input('cancel_reason', 'Bị hủy bởi nhà cung cấp');
            $booking->cancelled_at = now();
        }

        $booking->save();

        // Gửi tin nhắn tự động khi xác nhận
        if ($newStatus === 'confirmed') {
            $chatService->sendBookingConfirmedMessage($booking);
        }

        if ($newStatus === 'ongoing') {
            $chatService->sendCheckInConfirmedMessage($booking);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn đặt chỗ thành công.',
            'data' => $booking->load(['user', 'service'])
        ]);
    }
}
