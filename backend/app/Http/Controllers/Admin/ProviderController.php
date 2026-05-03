<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProviderController extends Controller
{

    /**
     * Lấy danh sách tất cả nhà cung cấp
     * GET /api/admin/providers
     */
    public function index(Request $request)
    {
        // Lấy tất cả User có role là provider, kèm theo hồ sơ nếu có
        $query = User::where('role', 'provider')
            ->with(['providerProfile.approver:id,display_name'])
            ->leftJoin('provider_profiles', 'users.id', '=', 'provider_profiles.user_id')
            ->select(
                'users.id as user_id',
                'users.display_name',
                'users.email',
                'users.created_at as user_created_at',
                'provider_profiles.id as profile_id',
                'provider_profiles.business_name',
                'provider_profiles.business_type',
                'provider_profiles.status',
                'provider_profiles.address',
                'provider_profiles.created_at as profile_created_at'
            );

        // Lọc theo status
        if ($request->has('status') && $request->status) {
            if ($request->status === 'not_initialized') {
                $query->whereNull('provider_profiles.id');
            } else {
                $query->where('provider_profiles.status', $request->status);
            }
        }

        // Tìm kiếm theo tên doanh nghiệp hoặc email user
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('provider_profiles.business_name', 'ilike', "%{$search}%")
                  ->orWhere('users.display_name', 'ilike', "%{$search}%")
                  ->orWhere('users.email', 'ilike', "%{$search}%");
            });
        }

        $providers = $query->orderBy('users.created_at', 'desc')->paginate($request->get('per_page', 20));

        // Format lại dữ liệu trả về để Frontend dễ xử lý
        $formattedData = collect($providers->items())->map(function ($item) {
            return [
                'id' => $item->profile_id, // ID hồ sơ (null nếu chưa tạo)
                'user_id' => $item->user_id,
                'business_name' => $item->business_name ?? 'Chưa khởi tạo',
                'business_type' => $item->business_type,
                'status' => $item->profile_id ? $item->status : 'not_initialized',
                'address' => $item->address,
                'created_at' => $item->profile_created_at ?? $item->user_created_at,
                'user' => [
                    'id' => $item->user_id,
                    'display_name' => $item->display_name,
                    'email' => $item->email,
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedData,
            'meta' => [
                'current_page' => $providers->currentPage(),
                'last_page' => $providers->lastPage(),
                'per_page' => $providers->perPage(),
                'total' => $providers->total(),
            ]
        ]);
    }

    /**
     * Lấy chi tiết hồ sơ nhà cung cấp
     * GET /api/admin/providers/{id}
     */
    public function show($id)
    {
        $provider = ProviderProfile::with(['user', 'approver:id,display_name', 'services'])->find($id);

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ nhà cung cấp'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $provider
        ]);
    }

    /**
     * Cập nhật trạng thái nhà cung cấp (Duyệt/Từ chối/Khóa)
     * PATCH /api/admin/providers/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected,suspended',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ]);

        $provider = ProviderProfile::find($id);
        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ nhà cung cấp'
            ], 404);
        }

        try {
            $adminUid = $request->attributes->get('firebaseUid');
            $admin = User::where('firebase_uid', $adminUid)->first();

            $provider->status = $request->status;
            
            if ($request->status === 'approved') {
                $provider->approved_by = $admin->id ?? null;
                $provider->approved_at = now();
                $provider->rejection_reason = null;

                // Tự động nâng cấp role của user thành provider nếu chưa có
                $user = $provider->user;
                if ($user && $user->role === 'tourist') {
                    $user->role = 'provider';
                    $user->save();
                }
            } elseif ($request->status === 'rejected') {
                $provider->rejection_reason = $request->rejection_reason;
                $provider->approved_by = null;
                $provider->approved_at = null;
            }

            $provider->save();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái nhà cung cấp thành công',
                'data' => $provider->load('user:id,display_name,role')
            ]);
        } catch (\Throwable $e) {
            Log::error('Update provider status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật trạng thái: ' . $e->getMessage()
            ], 500);
        }
    }
}
