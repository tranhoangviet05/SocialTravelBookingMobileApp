<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BehaviorDatabaseController extends Controller
{

    /**
     * UPSERT hành vi người dùng
     */
    public function upsertBehavior(Request $request)
    {
        // Xử lý tags: Luôn đưa về mảng, kể cả khi n8n gửi dữ liệu trống hoặc sai
        $tags = $request->tags;
        if (empty($tags) || $tags === 'undefined' || !is_array($tags)) {
            $tags = [];
        }

        $score = (float)($request->score ?? 0);
        $userId = $request->user_id;
        $locationId = $request->location_id;
        $actionType = $request->action_type ?? 'unknown';
        
        // --- LOGIC CHUẨN HÓA DANH MỤC MẸ ---
        $rawType = strtolower($request->service_type ?? '');
        $serviceType = 'tour'; // Mặc định là tour

        // Các loại thuộc về "Chỗ ở"
        $hotelTypes = ['hotel', 'khách sạn', 'homestay', 'resort', 'villa', 'studio', 'apartment', 'căn hộ', 'chỗ ở'];
        foreach ($hotelTypes as $hType) {
            if (str_contains($rawType, $hType)) {
                $serviceType = 'hotel';
                break;
            }
        }
        // ------------------------------------

        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Missing User ID'], 400);
        }

        $existing = DB::table('user_behaviors')
            ->where('user_id', $userId)
            ->where('location_id', $locationId)
            ->where('service_type', $serviceType) // Phân biệt theo loại dịch vụ
            ->first();

        if ($existing) {
            DB::table('user_behaviors')
                ->where('id', $existing->id) // Cập nhật đúng bản ghi đó
                ->update([
                    'score' => $existing->score + $score,
                    'tags' => json_encode($tags),
                    'action_type' => $actionType,
                    'is_pending' => true,
                    'updated_at' => now()
                ]);
            \Log::info("Updated behavior for user $userId, Location $locationId, Type $serviceType, set is_pending = true");
        } else {
            DB::table('user_behaviors')->insert([
                'user_id' => $userId,
                'location_id' => $locationId,
                'action_type' => $actionType,
                'service_type' => $serviceType,
                'score' => $score,
                'tags' => json_encode($tags),
                'is_pending' => true,
                'updated_at' => now(),
                'created_at' => now()
            ]);
            \Log::info("Inserted new behavior for user $userId, Location $locationId, Type $serviceType, set is_pending = true");
        }

        return response()->json(['success' => true]);
    }

    /**
     * Lấy danh sách user đang chờ xử lý gợi ý
     */
    public function getPendingUsers()
    {
        $users = DB::table('user_behaviors')
            ->where('is_pending', true)
            ->select('user_id')
            ->distinct()
            ->get();
            
        return response()->json($users);
    }

    /**
     * Lấy hành vi tốt nhất để tính Cross-sell
     */
    public function getBestInterest(Request $request)
    {
        $userId = $request->query('user_id');
        
        $interest = DB::table('user_behaviors as b')
            ->leftJoin('services as s', 's.location_id', '=', 'b.location_id')
            ->where('b.user_id', $userId)
            ->select('b.*', 's.type as last_type')
            ->orderBy('b.score', 'desc')
            ->first();
            
        return response()->json($interest);
    }

    /**
     * Lưu danh sách gợi ý và Reset trạng thái pending
     */
    public function saveRecommendations(Request $request)
    {
        $userId = $request->user_id;
        $recommendations = $request->recommendations;

        DB::table('user_recommendations')->updateOrInsert(
            ['user_id' => $userId],
            [
                'recommendations' => json_encode($recommendations),
                'updated_at' => now()
            ]
        );

        DB::table('user_behaviors')->where('user_id', $userId)->update(['is_pending' => false]);

        return response()->json(['success' => true]);
    }

    /**
     * Dọn dẹp dữ liệu cũ
     */
    /**
     * Xử lý gợi ý hàng loạt cho tất cả người dùng đang pending
     */
    public function processBulkRecommendations()
    {
        // 1. Lấy tất cả các bản ghi đang chờ xử lý
        $pendingBehaviors = DB::table('user_behaviors')
            ->where('is_pending', true)
            ->whereNotNull('location_id')
            ->get();

        if ($pendingBehaviors->isEmpty()) {
            return response()->json(['success' => true, 'message' => 'No pending behaviors']);
        }

        $processedCount = 0;

        foreach ($pendingBehaviors as $behavior) {
            $userId = $behavior->user_id;
            $locationId = $behavior->location_id;
            $serviceType = $behavior->service_type;

            \Log::info("Processing recommendation for user: $userId at location: $locationId (Type: $serviceType)");

            // 2. Xác định loại hình cần gợi ý (Bán chéo)
            if ($serviceType === 'tour') {
                $targetTypes = ['hotel', 'homestay'];
                $targetLabel = 'Accommodations';
            } else {
                $targetTypes = ['tour'];
                $targetLabel = 'Tours';
            }

            // 3. Tìm top 4 dịch vụ gợi ý (sử dụng Model Service để lấy kèm Media/Ảnh)
            $recommendations = \App\Models\Service::query()
                ->where('location_id', $locationId)
                ->whereIn('type', $targetTypes)
                ->where('status', 'active')
                ->with(['media' => function($q) {
                    $q->where('is_cover', true);
                }])
                ->orderBy('rating_avg', 'desc')
                ->limit(4)
                ->get();

            if ($recommendations->isNotEmpty()) {
                // 4. Lưu gợi ý theo User và Location
                DB::table('user_recommendations')->updateOrInsert(
                    [
                        'user_id' => $userId,
                        'location_id' => $locationId
                    ],
                    [
                        'suggested_services' => json_encode($recommendations),
                        'updated_at' => now()
                    ]
                );
                $processedCount++;
                \Log::info("Saved " . $recommendations->count() . " recommendations for user: $userId at location: $locationId");
            } else {
                \Log::warning("No $targetLabel found for location $locationId");
            }

            // 5. Đánh dấu đã xử lý bản ghi này
            DB::table('user_behaviors')->where('id', $behavior->id)->update(['is_pending' => false]);
        }

        return response()->json([
            'success' => true, 
            'processed_records' => $processedCount
        ]);
    }

    public function cleanup()
    {
        DB::table('user_behaviors')->where('updated_at', '<', now()->subDays(2))->delete();
        return response()->json(['success' => true]);
    }
}
