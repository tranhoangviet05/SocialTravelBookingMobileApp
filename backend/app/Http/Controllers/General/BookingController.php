<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\ProviderProfile;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{


    /**
     * Tạo đơn đặt chỗ mới (Tourist)
     * POST /api/bookings
     */
    public function store(Request $request)
    {
        $request->validate([
            'service_id'   => 'required|uuid|exists:services,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'nullable|date|after:check_in_date',
            'num_adults'  => 'required|integer|min:1|max:50',
            'num_children' => 'nullable|integer|min:0|max:20',
            'contact_name'  => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'special_requests' => 'nullable|string|max:1000',
            'coupon_code'  => 'nullable|string|max:50',
            'payment_method' => 'required|in:wallet,momo,vnpay,banking,sepay',
            'room_type_id' => 'nullable|uuid|exists:hotel_room_types,id',
        ]);

        try {
            $service = Service::with('provider')->findOrFail($request->service_id);

            // Tính giá dựa trên loại phòng (nếu là khách sạn/homestay) hoặc dịch vụ chung
            $basePrice = $service->base_price ?? $service->price ?? 0;
            $roomType = null;

            if ($request->room_type_id) {
                $roomType = \App\Models\HotelRoomType::where('service_id', $service->id)->findOrFail($request->room_type_id);
                $basePrice = $roomType->base_price;
            }

            $adultCount = (int) $request->num_adults;
            $childCount = (int) ($request->num_children ?? 0);

            // Tính subtotal
            if (in_array($service->type, ['hotel', 'homestay'])) {
                // Với khách sạn/homestay: Tính theo đêm (giá phòng)
                $checkIn = new \DateTime($request->check_in_date);
                $checkOut = new \DateTime($request->check_out_date ?? $request->check_in_date);
                $nights = $checkIn->diff($checkOut)->days;
                if ($nights < 1) $nights = 1;
                
                $subtotal = $basePrice * $nights;
            } else {
                // Với tour/xe/khác: Tính theo số người
                $subtotal = $basePrice * $adultCount + ($basePrice * 0.5 * $childCount);
            }

            // Kiểm tra & áp dụng coupon
            $discountAmount = 0;
            $appliedCoupon = null;
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', $request->coupon_code)
                    ->where(function ($query) {
                        $query->whereNull('valid_until')
                              ->orWhere('valid_until', '>', now());
                    })
                    ->first();

                if ($coupon && (!$coupon->usage_limit || $coupon->used_count < $coupon->usage_limit)) {
                    $coupon->increment('used_count');
                    $appliedCoupon = $coupon;
                    if ($coupon->type === 'percent') {
                        $discountAmount = (int) ($subtotal * $coupon->discount_value / 100);
                    } else {
                        $discountAmount = (int) $coupon->discount_value;
                    }
                }
            }

            $totalAmount = max(0, $subtotal - $discountAmount);

            // Tạo booking
            $booking = DB::transaction(function () use ($request, $service, $adultCount, $childCount, $subtotal, $discountAmount, $totalAmount, $appliedCoupon, $basePrice) {
                $booking = Booking::create([
                    'booking_code' => 'BK-' . strtoupper(Str::random(6)) . '-' . date('ymd'),
                    'user_id' => $request->user->id,
                    'service_id' => $service->id,
                    'room_type_id' => $request->room_type_id,
                    'provider_id' => $service->provider_id,
                    'check_in_date' => $request->check_in_date,
                    'check_out_date' => $request->check_out_date,
                    'num_adults' => $adultCount,
                    'num_children' => $childCount,
                    'contact_name' => $request->contact_name,
                    'contact_email' => $request->contact_email,
                    'contact_phone' => $request->contact_phone,
                    'special_requests' => $request->special_requests,
                    'coupon_id' => $appliedCoupon?->id,
                    'coupon_code' => $appliedCoupon?->code,
                    'discount_amount' => $discountAmount,
                    'unit_price' => $basePrice,
                    'subtotal' => $subtotal,
                    'total_amount' => $totalAmount,
                    'payment_method' => $request->payment_method,
                    'payment_status' => 'pending',
                    'status' => 'pending',
                ]);

                return $booking;
            });

            $booking->load(['service:id,name,slug,type,base_price', 'user:id,display_name,email', 'roomType']);

            return response()->json([
                'success' => true,
                'message' => 'Đặt chỗ thành công! Vui lòng hoàn tất thanh toán.',
                'data' => $booking
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Booking store error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo đơn đặt chỗ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách đặt chỗ của user hiện tại
     * GET /api/user/bookings
     */
    public function myBookings(Request $request)
    {
        $userId = $request->user->id;

        $bookings = Booking::with(['service.media', 'roomType'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bk) {
                return [
                    'id' => $bk->id,
                    'booking_code' => $bk->booking_code,
                    'service' => $bk->service ? [
                        'id'   => $bk->service->id,
                        'name' => $bk->service->name,
                        'slug' => $bk->service->slug,
                        'type' => $bk->service->type,
                        'price' => $bk->service->base_price,
                        'image' => (count($bk->service->media) > 0) ? $bk->service->media[0]->url : null,
                    ] : null,
                    'room_type' => $bk->roomType ? [
                        'id'   => $bk->roomType->id,
                        'name' => $bk->roomType->name,
                        'rank' => $bk->roomType->rank,
                    ] : null,
                    'check_in_date' => $bk->check_in_date,
                    'check_out_date' => $bk->check_out_date,
                    'num_adults' => $bk->num_adults,
                    'num_children' => $bk->num_children,
                    'total_amount' => $bk->total_amount,
                    'contact_name' => $bk->contact_name,
                    'contact_phone' => $bk->contact_phone,
                    'payment_method' => $bk->payment_method,
                    'payment_status' => $bk->payment_status,
                    'status' => $bk->status,
                    'created_at' => $bk->created_at?->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Hủy đơn đặt chỗ (Tourist)
     * POST /api/user/bookings/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $userId = $request->user->id;
        $booking = Booking::where('id', $id)->where('user_id', $userId)->firstOrFail();

        if ($booking->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể hủy đơn đặt chỗ đang ở trạng thái chờ xử lý.'
            ], 400);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => 'Người dùng yêu cầu hủy'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã hủy đơn đặt chỗ thành công.'
        ]);
    }

    /**
     * Lấy lịch sử booking theo User ID (Dành riêng cho n8n)
     */
    public function myBookingsByUserId($userId)
    {
        // Kiểm tra UUID hợp lệ để tránh lỗi SQLSTATE[22P02] với PostgreSQL
        if (!\Illuminate\Support\Str::isUuid($userId)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid User ID format. Expected UUID, got: ' . $userId
            ], 400);
        }

        $bookings = Booking::with(['service.media'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }
}
