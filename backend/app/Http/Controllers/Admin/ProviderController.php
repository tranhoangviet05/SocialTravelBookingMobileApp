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
        $query = ProviderProfile::with(['user:id,display_name,email,avatar_url', 'approver:id,display_name']);

        // Lọc theo status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Tìm kiếm theo tên doanh nghiệp hoặc email user
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'ilike', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('display_name', 'ilike', "%{$search}%")
                         ->orWhere('email', 'ilike', "%{$search}%");
                  });
            });
        }

        $providers = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $providers->items(),
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
