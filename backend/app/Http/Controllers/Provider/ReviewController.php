<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use App\Models\Review;
use App\Models\Service;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    private function getProvider(Request $request)
    {
        $user = $request->input('user');
        return ProviderProfile::where('user_id', $user->id)->first();
    }

    /**
     * Danh sách đánh giá cho các dịch vụ của nhà cung cấp
     */
    public function index(Request $request)
    {
        $provider = $this->getProvider($request);
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ nhà cung cấp.'], 404);
        }

        $serviceIds = Service::where('provider_id', $provider->id)->pluck('id');

        $reviews = Review::with(['user', 'service'])
            ->whereIn('service_id', $serviceIds)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Trả lời đánh giá
     */
    public function reply(Request $request, $id)
    {
        $provider = $this->getProvider($request);
        $review = Review::findOrFail($id);

        // Kiểm tra review thuộc dịch vụ của provider này
        $service = Service::find($review->service_id);
        if (!$service || $service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền trả lời đánh giá này.'], 403);
        }

        $request->validate([
            'reply' => 'required|string|max:1000'
        ]);

        $review->provider_reply = $request->reply;
        $review->provider_reply_at = now();
        $review->save();

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi phản hồi thành công.',
            'data' => $review->load(['user', 'service'])
        ]);
    }
}
