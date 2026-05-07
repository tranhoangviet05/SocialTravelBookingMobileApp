<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceAvailability;
use App\Models\HotelRoomType;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AvailabilityController extends Controller
{
    /**
     * Helper: Lấy profile của nhà cung cấp từ user đang đăng nhập
     */
    private function getProvider(Request $request)
    {
        $user = $request->input('user');
        if (!$user) return null;
        return \App\Models\ProviderProfile::where('user_id', $user->id)->first();
    }

    /**
     * Lấy danh sách trạng thái trong một khoảng thời gian
     */
    public function index(Request $request, $serviceId)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($serviceId);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $startDate = $request->get('start_date', Carbon::now()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->addDays(30)->toDateString());
        $roomTypeId = $request->get('room_type_id'); // Optional cho Hotel

        $query = ServiceAvailability::where('service_id', $serviceId)
            ->whereBetween('available_date', [$startDate, $endDate]);

        if ($roomTypeId) {
            $query->where('room_type_id', $roomTypeId);
        } else {
            $query->whereNull('room_type_id');
        }

        $availability = $query->orderBy('available_date')->get();

        return response()->json([
            'success' => true,
            'data' => $availability
        ]);
    }

    /**
     * Cập nhật trạng thái hàng loạt (Bulk Update)
     */
    public function updateBatch(Request $request, $serviceId)
    {
        $provider = $this->getProvider($request);
        $service = Service::findOrFail($serviceId);

        if ($service->provider_id !== $provider->id) {
            return response()->json(['success' => false, 'message' => 'Không có quyền.'], 403);
        }

        $validated = $request->validate([
            'room_type_id' => 'nullable|uuid|exists:hotel_room_types,id',
            'dates' => 'required|array|min:1',
            'dates.*' => 'date_format:Y-m-d',
            'total_slots' => 'required|integer|min:0',
            'price_override' => 'nullable|numeric|min:0',
            'is_blocked' => 'boolean'
        ]);

        $roomTypeId = $validated['room_type_id'] ?? null;
        $defaultSlots = $service->max_guests || 0;

        // Kiểm tra room_type có thuộc service không và lấy inventory làm mặc định
        if ($roomTypeId) {
            $roomType = HotelRoomType::where('service_id', $serviceId)->findOrFail($roomTypeId);
            $defaultSlots = $roomType->inventory;
        }

        try {
            DB::transaction(function () use ($serviceId, $roomTypeId, $validated) {
                foreach ($validated['dates'] as $date) {
                    ServiceAvailability::updateOrCreate(
                        [
                            'service_id' => $serviceId,
                            'room_type_id' => $roomTypeId,
                            'available_date' => $date
                        ],
                        [
                            'total_slots' => $validated['total_slots'],
                            'price_override' => $validated['price_override'] ?? null,
                            'is_blocked' => $validated['is_blocked'] ?? false,
                        ]
                    );
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật trạng thái khả dụng thành công.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }
}
