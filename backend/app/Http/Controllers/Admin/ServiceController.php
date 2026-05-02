<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ServiceController extends Controller
{
    /**
     * Lấy danh sách TẤT CẢ dịch vụ (Admin xem toàn bộ, bao gồm draft/rejected)
     * GET /api/admin/services
     */
    public function index(Request $request)
    {
        $query = Service::with(['provider.user:id,display_name,email', 'category:id,name', 'location:id,name', 'media']);

        // Lọc theo type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Lọc theo status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Tìm kiếm
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('slug', 'ilike', "%{$search}%")
                  ->orWhere('address', 'ilike', "%{$search}%");
            });
        }

        $services = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ]
        ]);
    }

    /**
     * Lấy chi tiết một dịch vụ
     * GET /api/admin/services/{id}
     */
    public function show($id)
    {
        $service = Service::with(['provider.user:id,display_name,email', 'category', 'location', 'media', 'schedules', 'reviews.user:id,display_name'])
            ->find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    /**
     * Tạo dịch vụ mới (Admin tạo trực tiếp)
     * POST /api/admin/services
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider_id' => 'required|uuid|exists:provider_profiles,id',
            'category_id' => 'nullable|integer|exists:categories,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:tour,hotel,homestay,vehicle',
            'status' => 'nullable|in:draft,pending_review,active,rejected',
            'base_price' => 'required|numeric|min:0',
            'price_unit' => 'nullable|string|max:20',
            'max_guests' => 'nullable|integer|min:1',
            'duration_days' => 'nullable|integer|min:0',
            'duration_nights' => 'nullable|integer|min:0',
            'address' => 'nullable|string',
            'amenities' => 'nullable|array',
            'includes' => 'nullable|array',
            'excludes' => 'nullable|array',
        ]);

        // Tạo slug tự động
        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(6);
        $validated['status'] = $validated['status'] ?? 'active'; // Admin tạo → mặc định active

        try {
            $service = Service::create($validated);
            $service->load(['provider.user:id,display_name,email', 'category:id,name', 'location:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'Tạo dịch vụ thành công',
                'data' => $service
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Create service error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật dịch vụ
     * PUT /api/admin/services/{id}
     */
    public function update(Request $request, $id)
    {
        $service = Service::find($id);
        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ'
            ], 404);
        }

        $validated = $request->validate([
            'category_id' => 'nullable|integer|exists:categories,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:tour,hotel,homestay,vehicle',
            'status' => 'nullable|in:draft,pending_review,active,rejected',
            'rejection_reason' => 'nullable|string',
            'base_price' => 'sometimes|numeric|min:0',
            'price_unit' => 'nullable|string|max:20',
            'max_guests' => 'nullable|integer|min:1',
            'duration_days' => 'nullable|integer|min:0',
            'duration_nights' => 'nullable|integer|min:0',
            'address' => 'nullable|string',
            'amenities' => 'nullable|array',
            'includes' => 'nullable|array',
            'excludes' => 'nullable|array',
        ]);

        // Cập nhật slug nếu tên thay đổi
        if (isset($validated['name']) && $validated['name'] !== $service->name) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(6);
        }

        try {
            $service->update($validated);
            $service->load(['provider.user:id,display_name,email', 'category:id,name', 'location:id,name']);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dịch vụ thành công',
                'data' => $service
            ]);
        } catch (\Throwable $e) {
            Log::error('Update service error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa dịch vụ (soft delete)
     * DELETE /api/admin/services/{id}
     */
    public function destroy($id)
    {
        $service = Service::find($id);
        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ'
            ], 404);
        }

        $service->delete(); // Soft delete vì model có SoftDeletes

        return response()->json([
            'success' => true,
            'message' => 'Xóa dịch vụ thành công'
        ]);
    }

    /**
     * Cập nhật trạng thái dịch vụ (duyệt/từ chối)
     * PATCH /api/admin/services/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:draft,pending_review,active,rejected',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ]);

        $service = Service::find($id);
        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dịch vụ'
            ], 404);
        }

        $service->status = $request->status;
        if ($request->status === 'rejected') {
            $service->rejection_reason = $request->rejection_reason;
        }
        $service->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái dịch vụ thành công',
            'data' => $service
        ]);
    }
}
