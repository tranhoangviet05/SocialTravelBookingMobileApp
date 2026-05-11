<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    /**
     * Lấy danh sách tất cả đơn đặt chỗ
     * GET /api/admin/bookings
     */
    public function index(Request $request)
    {
        $query = Booking::with([
            'user:id,display_name,email,avatar_url',
            'service:id,name,slug,type',
            'provider.user:id,display_name'
        ]);

        // Lọc theo status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Lọc theo payment_status
        if ($request->has('payment_status') && $request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        // Lọc theo thời gian
        if ($request->has('date_from') && $request->date_from) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        // Tìm kiếm
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'ilike', "%{$search}%")
                  ->orWhere('contact_name', 'ilike', "%{$search}%")
                  ->orWhere('contact_email', 'ilike', "%{$search}%")
                  ->orWhere('contact_phone', 'ilike', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('display_name', 'ilike', "%{$search}%")
                         ->orWhere('email', 'ilike', "%{$search}%");
                  })
                  ->orWhereHas('service', function ($sq) use ($search) {
                      $sq->where('name', 'ilike', "%{$search}%");
                  });
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $bookings->items(),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
            ]
        ]);
    }

    /**
     * Lấy chi tiết một đơn đặt chỗ
     * GET /api/admin/bookings/{id}
     */
    public function show($id)
    {
        $booking = Booking::with([
            'user:id,display_name,email,avatar_url',
            'service:id,name,slug,type,base_price,address',
            'service.media',
            'provider.user:id,display_name,email',
            'review'
        ])->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn đặt chỗ'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    /**
     * Cập nhật trạng thái đơn đặt chỗ
     * PATCH /api/admin/bookings/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:cancelled', // Admin chỉ có quyền hủy khi có tranh chấp
            'cancel_reason' => 'required|string|min:10', // Yêu cầu lý do chi tiết
        ]);

        $booking = Booking::find($id);
        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn đặt chỗ'], 404);
        }

        try {
            // Admin can thiệp hủy đơn
            $booking->status = 'cancelled';
            $booking->cancel_reason = '[ADMIN CAN THIỆP] ' . $request->cancel_reason;
            $booking->cancelled_at = now();

            $booking->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Admin đã thực hiện hủy đơn hàng thành công.',
                'data' => $booking->load(['user', 'service'])
            ]);
        } catch (\Throwable $e) {
            Log::error('Update booking status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật trạng thái: ' . $e->getMessage()
            ], 500);
        }
    }
}
