<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CouponController extends Controller
{
    /**
     * Lấy danh sách mã giảm giá
     * GET /api/admin/coupons
     */
    public function index(Request $request)
    {
        $query = Coupon::query();

        if ($request->has('search') && $request->search) {
            $query->where('code', 'ilike', "%{$request->search}%");
        }

        $coupons = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $coupons
        ]);
    }

    /**
     * Tạo mã giảm giá mới
     * POST /api/admin/coupons
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
        ]);

        try {
            $adminUid = $request->attributes->get('firebaseUid');
            $admin = User::where('firebase_uid', $adminUid)->first();

            $validated['created_by'] = $admin->id ?? null;
            $coupon = Coupon::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo mã giảm giá thành công',
                'data' => $coupon
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Create coupon error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo mã giảm giá: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật mã giảm giá
     * PUT /api/admin/coupons/{id}
     */
    public function update(Request $request, $id)
    {
        $coupon = Coupon::find($id);
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy mã giảm giá'
            ], 404);
        }

        $validated = $request->validate([
            'code' => "sometimes|string|max:50|unique:coupons,code,{$id}",
            'type' => 'sometimes|in:percent,fixed',
            'discount_value' => 'sometimes|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
        ]);

        try {
            $coupon->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật mã giảm giá thành công',
                'data' => $coupon
            ]);
        } catch (\Throwable $e) {
            Log::error('Update coupon error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật mã giảm giá'
            ], 500);
        }
    }

    /**
     * Xóa mã giảm giá
     * DELETE /api/admin/coupons/{id}
     */
    public function destroy($id)
    {
        $coupon = Coupon::find($id);
        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy mã giảm giá'
            ], 404);
        }

        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa mã giảm giá thành công'
        ]);
    }
}
