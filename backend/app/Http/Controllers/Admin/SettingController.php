<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class SettingController extends Controller
{
    /**
     * Lấy tất cả cài đặt hệ thống
     * GET /api/admin/settings
     */
    public function index()
    {
        $settings = DB::table('system_settings')->get();
        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Cập nhật nhiều cài đặt cùng lúc
     * POST /api/admin/settings/batch
     */
    public function updateBatch(Request $request)
    {
        $settings = $request->input('settings', []); // Expecting array of {key, value}

        try {
            $adminUid = $request->attributes->get('firebaseUid');
            $admin = User::where('firebase_uid', $adminUid)->first();

            DB::beginTransaction();
            foreach ($settings as $key => $value) {
                DB::table('system_settings')
                    ->where('key', $key)
                    ->update([
                        'value' => $value,
                        'updated_by' => $admin->id ?? null,
                        'updated_at' => now()
                    ]);
            }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật cấu hình hệ thống thành công'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật cấu hình: ' . $e->getMessage()
            ], 500);
        }
    }
}
