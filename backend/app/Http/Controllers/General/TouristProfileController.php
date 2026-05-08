<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\TouristProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TouristProfileController extends Controller
{
    /**
     * Lấy thông tin profile của khách du lịch
     */
    public function show(Request $request)
    {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $profile = $user->touristProfile;

        // Nếu chưa có profile thì trả về thông tin mặc định từ user
        if (!$profile) {
            return response()->json([
                'success' => true,
                'data' => [
                    'name' => $user->display_name,
                    'phone_number' => null,
                    'gender' => null,
                    'date_of_birth' => null,
                    'nationality' => null,
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $profile
        ]);
    }

    /**
     * Cập nhật hoặc tạo mới profile
     */
    public function update(Request $request)
    {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $profile = TouristProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validator->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật hồ sơ thành công',
            'data' => $profile
        ]);
    }
}
