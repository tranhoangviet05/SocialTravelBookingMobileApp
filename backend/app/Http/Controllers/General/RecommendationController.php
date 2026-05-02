<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    /**
     * Lấy danh sách dịch vụ gợi ý cho người dùng hiện tại.
     */
    public function index(Request $request)
    {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = \App\Models\User::where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $recommendation = \Illuminate\Support\Facades\DB::table('user_recommendations')
            ->where('user_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->first();

        if (!$recommendation) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No recommendations yet'
            ]);
        }

        $suggestedServices = is_string($recommendation->suggested_services) 
            ? json_decode($recommendation->suggested_services, true) 
            : $recommendation->suggested_services;

        // Xử lý để lấy ảnh bìa (cover_image) từ mảng media nếu có
        $processedServices = collect($suggestedServices)->map(function($service) {
            $service = (array) $service;
            $media = collect($service['media'] ?? []);
            
            // Tìm ảnh bìa (is_cover = true hoặc 1)
            $coverMedia = $media->first(function($m) {
                $m = (array) $m;
                return ($m['is_cover'] ?? false) == true || ($m['is_cover'] ?? 0) == 1;
            });

            // Nếu không có ảnh bìa, lấy ảnh đầu tiên
            if (!$coverMedia && $media->isNotEmpty()) {
                $coverMedia = $media->first();
            }

            $coverMedia = (array) $coverMedia;
            $service['cover_image'] = $coverMedia['url'] ?? null;
            
            return $service;
        });

        $location = \App\Models\Location::find($recommendation->location_id);

        return response()->json([
            'success' => true,
            'data' => [
                'location_name' => $location ? $location->name : 'địa điểm bạn vừa xem',
                'suggested_services' => $processedServices,
                'updated_at' => $recommendation->updated_at,
            ]
        ]);
    }
}
