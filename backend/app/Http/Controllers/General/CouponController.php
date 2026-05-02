<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Lấy danh sách mã giảm giá đang hoạt động (Public)
     */
    public function index()
    {
        $coupons = Coupon::where(function ($query) {
                $query->whereNull('valid_until')
                      ->orWhere('valid_until', '>', now());
            })
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $coupons
        ]);
    }

    /**
     * Kiểm tra và áp dụng mã giảm giá
     */
    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', $request->code)
            ->where(function ($query) {
                $query->whereNull('valid_until')
                      ->orWhere('valid_until', '>', now());
            })
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'
            ], 404);
        }

        // Kiểm tra giới hạn sử dụng
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá đã hết lượt sử dụng.'
            ], 400);
        }

        $subtotal = $request->order_amount;
        $discountAmount = 0;

        if ($coupon->type === 'percent') {
            $discountAmount = (int) ($subtotal * $coupon->discount_value / 100);
        } else {
            $discountAmount = (int) $coupon->discount_value;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'code' => $coupon->code,
                'discount_type' => $coupon->type,
                'discount_value' => $coupon->discount_value,
                'discount_amount' => $discountAmount,
                'total_amount' => max(0, $subtotal - $discountAmount)
            ]
        ]);
    }
}
