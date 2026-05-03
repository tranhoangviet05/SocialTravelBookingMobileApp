<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ProviderProfile;

class ProfileController extends Controller
{
    /**
     * Khởi tạo hồ sơ nhà cung cấp
     */
    public function setup(Request $request)
    {
        $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $user = $request->input('user');
        
        $profile = ProviderProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'business_name' => $request->business_name,
                'business_type' => $request->business_type,
                'phone' => $request->phone,
                'address' => $request->address,
                'description' => $request->description,
                'status' => 'pending',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Hồ sơ nhà cung cấp đã được khởi tạo thành công.',
            'data' => $profile
        ]);
    }
}
