<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Lấy thông tin cấu hình cửa hàng của nhà cung cấp
     */
    public function index(Request $request)
    {
        $user = $request->input('user');
        $profile = ProviderProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $profile
        ]);
    }

    /**
     * Cập nhật thông tin cửa hàng
     */
    public function update(Request $request)
    {
        $user = $request->input('user');
        $profile = ProviderProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ.'], 404);
        }

        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'address' => 'nullable|string',
        ]);

        $profile->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin cửa hàng thành công.',
            'data' => $profile
        ]);
    }
}
