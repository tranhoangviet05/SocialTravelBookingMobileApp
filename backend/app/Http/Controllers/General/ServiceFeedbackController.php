<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ServiceFeedbackController extends Controller
{
    /**
     * Lấy danh sách đánh giá & bình luận của một dịch vụ
     */
    public function index($serviceId)
    {
        $feedbacks = Review::where('service_id', $serviceId)
            ->with(['user:id,display_name,avatar_url'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $feedbacks
        ]);
    }

    /**
     * Gửi đánh giá & bình luận mới cho dịch vụ
     */
    public function store(Request $request, $serviceId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $service = Service::find($serviceId);
        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Dịch vụ không tồn tại'
            ], 404);
        }

        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng chưa đồng bộ'
            ], 401);
        }

        // Tạo review thay vì comment để gộp chung
        $feedback = Review::create([
            'service_id' => $serviceId,
            'user_id' => $user->id,
            'content' => $request->content,
            'rating' => $request->rating,
            'is_verified' => false, // Mặc định không phải từ booking (nếu muốn logic chặt chẽ hơn có thể check booking tại đây)
        ]);

        // Cập nhật rating trung bình cho dịch vụ
        $this->updateServiceRating($serviceId);

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá thành công',
            'data' => $feedback->load('user:id,display_name,avatar_url')
        ], 201);
    }

    private function updateServiceRating($serviceId)
    {
        $avg = Review::where('service_id', $serviceId)->avg('rating');
        Service::where('id', $serviceId)->update(['rating_avg' => $avg]);
    }
}
