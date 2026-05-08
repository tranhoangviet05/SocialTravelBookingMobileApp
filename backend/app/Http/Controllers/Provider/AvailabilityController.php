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
        $query = ServiceAvailability::where('service_id', $serviceId)
            ->whereBetween('available_date', [$startDate, $endDate]);

        $availability = $query->orderBy('available_date')->get();

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
            'dates' => 'required|array|min:1',
            'dates.*' => 'date_format:Y-m-d',
            'total_slots' => 'required|integer|min:0',
            'price_override' => 'nullable|numeric|min:0',
            'is_blocked' => 'boolean'
        ]);

        $defaultSlots = $service->max_guests || 0;

        try {
            DB::transaction(function () use ($serviceId, $validated) {
                foreach ($validated['dates'] as $date) {
                    ServiceAvailability::updateOrCreate(
                        [
                            'service_id' => $serviceId,
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
