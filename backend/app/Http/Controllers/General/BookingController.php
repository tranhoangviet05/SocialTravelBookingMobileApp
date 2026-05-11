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
use Carbon\Carbon;

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
            'check_out_date' => 'nullable|date|after_or_equal:check_in_date',
            'num_adults'  => 'required|integer|min:1|max:50',
            'num_children' => 'nullable|integer|min:0|max:20',
            'contact_name'  => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'special_requests' => 'nullable|string|max:1000',
            'coupon_code'  => 'nullable|string|max:50',
            'payment_method' => 'required|in:momo,vnpay,banking,sepay',
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
                
                // --- PHÂN TÁCH LOGIC QUẢN LÝ KHO/SLOT ---
                
                if (in_array($service->type, ['hotel', 'homestay'])) {
                    // 1. LOGIC CHO CHỖ Ở: Trừ trực tiếp vào inventory của HotelRoomType
                    if (!$request->room_type_id) {
                        throw new \Exception("Vui lòng chọn loại phòng.");
                    }

                    $roomType = \App\Models\HotelRoomType::lockForUpdate()->find($request->room_type_id);
                    
                    if (!$roomType || $roomType->inventory <= 0) {
                        throw new \Exception("Xin lỗi, loại phòng này đã hết chỗ.");
                    }

                    // Trừ 1 vào inventory (mỗi booking chỗ ở tính là 1 phòng)
                    $roomType->decrement('inventory');
                    
                } else {
                    // 2. LOGIC CHO TOUR/KHÁC: Dùng bảng service_availability quản lý theo ngày
                    $checkIn = Carbon::parse($request->check_in_date);
                    $date = $checkIn->toDateString();
                    
                    $requiredSlots = $adultCount + $childCount;

                    $availability = \App\Models\ServiceAvailability::lockForUpdate()->firstOrCreate(
                        [
                            'service_id' => $service->id,
                            'available_date' => $date
                        ],
                        [
                            'total_slots' => $service->max_guests ?? 10,
                            'booked_slots' => 0,
                            'is_blocked' => false
                        ]
                    );

                    if ($availability->is_blocked) {
                        throw new \Exception("Dịch vụ đã bị chặn vào ngày " . $date);
                    }

                    if (($availability->booked_slots + $requiredSlots) > $availability->total_slots) {
                        throw new \Exception("Xin lỗi, tour đã hết chỗ vào ngày " . $date);
                    }

                    $availability->increment('booked_slots', $requiredSlots);
                }

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
                    'tourist_check_in_at' => $bk->tourist_check_in_at,
                    'is_checked_in' => (bool)$bk->is_checked_in,
                    'checked_in_at' => $bk->checked_in_at,
                    'checked_out_at' => $bk->checked_out_at,
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
        $booking = Booking::with('service')->where('id', $id)->where('user_id', $userId)->firstOrFail();

        if ($booking->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể hủy đơn đặt chỗ đang ở trạng thái chờ xử lý.'
            ], 400);
        }

        try {
            DB::transaction(function () use ($booking, $request) {
                // 1. Hoàn trả lại slots/inventory
                if (in_array($booking->service->type, ['hotel', 'homestay'])) {
                    if ($booking->room_type_id) {
                        $roomType = \App\Models\HotelRoomType::find($booking->room_type_id);
                        if ($roomType) {
                            $roomType->increment('inventory');
                        }
                    }
                } else {
                    $date = $booking->check_in_date->toDateString();
                    $requiredSlots = $booking->num_adults + $booking->num_children;
                    
                    $availability = \App\Models\ServiceAvailability::where('service_id', $booking->service_id)
                        ->where('available_date', $date)
                        ->first();
                    
                    if ($availability) {
                        $availability->decrement('booked_slots', $requiredSlots);
                    }
                }

                // 2. Cập nhật trạng thái booking
                $booking->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'cancel_reason' => $request->cancel_reason ?? 'Người dùng yêu cầu hủy'
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy đơn đặt chỗ thành công và hoàn trả chỗ trống.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi hủy đơn: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một đơn đặt chỗ
     * GET /api/user/bookings/{id}
     */
    public function show(Request $request, $id)
    {
        $userId = $request->user->id;
        $booking = Booking::with(['service.media', 'roomType', 'provider'])
            ->where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    /**
     * Check-in (Tourist nhấn nút yêu cầu)
     * POST /api/user/bookings/{id}/check-in
     */
    public function checkIn(Request $request, $id, \App\Services\ChatService $chatService)
    {
        $userId = $request->user->id;
        $booking = Booking::where('id', $id)->where('user_id', $userId)->firstOrFail();

        if ($booking->tourist_check_in_at) {
            return response()->json(['success' => false, 'message' => 'Bạn đã gửi yêu cầu check-in rồi.'], 400);
        }

        $booking->update([
            'tourist_check_in_at' => now(),
            // Chúng ta chưa cập nhật status chính thức sang 'ongoing' cho đến khi provider xác nhận
        ]);

        $chatService->sendCheckInRequestMessage($booking);

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi yêu cầu check-in! Vui lòng chờ nhà cung cấp xác nhận.',
            'data' => $booking
        ]);
    }

    /**
     * Hoàn tác Check-in (Tourist nhấn nút hủy yêu cầu nếu nhầm)
     * POST /api/user/bookings/{id}/undo-check-in
     */
    public function undoCheckIn(Request $request, $id, \App\Services\ChatService $chatService)
    {
        $userId = $request->user->id;
        $booking = Booking::where('id', $id)->where('user_id', $userId)->firstOrFail();

        if ($booking->is_checked_in) {
            return response()->json(['success' => false, 'message' => 'Nhà cung cấp đã xác nhận, không thể hoàn tác.'], 400);
        }

        if (!$booking->tourist_check_in_at) {
            return response()->json(['success' => false, 'message' => 'Bạn chưa thực hiện check-in.'], 400);
        }

        $booking->update([
            'tourist_check_in_at' => null,
        ]);

        $chatService->sendUndoCheckInMessage($booking);

        return response()->json([
            'success' => true,
            'message' => 'Đã hoàn tác yêu cầu check-in.',
            'data' => $booking
        ]);
    }

    /**
     * Check-out (Tourist)
     * POST /api/user/bookings/{id}/check-out
     */
    public function checkOut(Request $request, $id, \App\Services\ChatService $chatService)
    {
        $userId = $request->user->id;
        $booking = Booking::where('id', $id)->where('user_id', $userId)->firstOrFail();

        if (!$booking->is_checked_in) {
            return response()->json(['success' => false, 'message' => 'Bạn chưa được xác nhận check-in, không thể check-out.'], 400);
        }

        if ($booking->checked_out_at) {
            return response()->json(['success' => false, 'message' => 'Bạn đã check-out rồi.'], 400);
        }

        $booking->update([
            'checked_out_at' => now(),
            'status' => 'completed' // Chuyển sang trạng thái hoàn thành
        ]);

        $chatService->sendCheckOutMessage($booking);

        return response()->json([
            'success' => true,
            'message' => 'Check-out thành công! Hy vọng bạn hài lòng với dịch vụ.',
            'data' => $booking
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
