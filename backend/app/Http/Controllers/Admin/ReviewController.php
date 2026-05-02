<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    /**
     * Lấy danh sách tất cả đánh giá
     * GET /api/admin/reviews
     */
    public function index(Request $request)
    {
        $query = Review::with([
            'user:id,display_name,email,avatar_url',
            'service:id,name,slug',
            'booking:id,booking_code'
        ]);

        // Lọc theo rating
        if ($request->has('rating') && $request->rating) {
            $query->where('rating', $request->rating);
        }

        // Lọc trạng thái phản hồi
        if ($request->has('replied')) {
            if ($request->replied === 'true') {
                $query->whereNotNull('provider_reply');
            } elseif ($request->replied === 'false') {
                $query->whereNull('provider_reply');
            }
        }

        // Tìm kiếm theo nội dung hoặc tên khách
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('content', 'ilike', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('display_name', 'ilike', "%{$search}%")
                         ->orWhere('email', 'ilike', "%{$search}%");
                  })
                  ->orWhereHas('service', function ($sq) use ($search) {
                      $sq->where('name', 'ilike', "%{$search}%");
                  });
            });
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ]
        ]);
    }

    /**
     * Lấy chi tiết một đánh giá
     * GET /api/admin/reviews/{id}
     */
    public function show($id)
    {
        $review = Review::with([
            'user:id,display_name,email,avatar_url',
            'service:id,name,slug,provider_id',
            'service.provider.user:id,display_name',
            'booking:id,booking_code,check_in_date'
        ])->find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    /**
     * Phản hồi đánh giá (Admin có thể phản hồi thay mặt hoặc hỗ trợ)
     * POST /api/admin/reviews/{id}/reply
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        $review = Review::find($id);
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá'
            ], 404);
        }

        try {
            $review->provider_reply = $request->reply;
            $review->provider_reply_at = now();
            $review->save();

            return response()->json([
                'success' => true,
                'message' => 'Gửi phản hồi thành công',
                'data' => $review
            ]);
        } catch (\Throwable $e) {
            Log::error('Admin reply review error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi gửi phản hồi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa đánh giá (Moderation)
     * DELETE /api/admin/reviews/{id}
     */
    public function destroy($id)
    {
        $review = Review::find($id);
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá'
            ], 404);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa đánh giá thành công'
        ]);
    }
}
