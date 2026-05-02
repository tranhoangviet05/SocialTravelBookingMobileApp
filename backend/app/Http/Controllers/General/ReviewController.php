<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Booking;
use App\Models\Service;
use App\Services\N8nService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    protected $n8n;

    public function __construct(N8nService $n8n)
    {
        $this->n8n = $n8n;
    }

    /**
     * Gửi đánh giá cho một đơn đặt chỗ đã hoàn thành
     */
    public function store(Request $request)
    {
        $user = $request->input('user');
        
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string|min:10',
            'images' => 'nullable|array'
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        // Chỉ được đánh giá nếu đúng là người đặt và đơn đã hoàn thành/thanh toán
        if ($booking->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Bạn không thể đánh giá đơn hàng này.'], 403);
        }

        try {
            return DB::transaction(function () use ($validated, $user, $booking) {
                $review = Review::create([
                    'booking_id' => $booking->id,
                    'service_id' => $booking->service_id,
                    'user_id' => $user->id,
                    'rating' => $validated['rating'],
                    'content' => $validated['content'],
                    'images' => $validated['images'] ?? []
                ]);

                // Cập nhật rating trung bình cho dịch vụ (giả định)
                $service = Service::find($booking->service_id);
                if ($service) {
                    $avg = Review::where('service_id', $service->id)->avg('rating');
                    $service->update(['avg_rating' => $avg]);
                }

                // --- N8N AUTOMATION: Báo cho nhà cung cấp có review mới ---
                $this->n8n->trigger('new_review', [
                    'review_id' => $review->id,
                    'service_name' => $service->name ?? 'Dịch vụ',
                    'rating' => $review->rating,
                    'customer_name' => $user->display_name,
                    'content' => $review->content,
                    'provider_email' => $service->provider->user->email ?? null
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Cảm ơn bạn đã đánh giá!',
                    'data' => $review
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}
