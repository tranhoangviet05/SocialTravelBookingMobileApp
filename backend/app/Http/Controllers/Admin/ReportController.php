<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use App\Services\N8nService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    protected $n8n;

    public function __construct(N8nService $n8n)
    {
        $this->n8n = $n8n;
    }
    /**
     * Lấy danh sách báo cáo
     * GET /api/admin/reports
     */
    public function index(Request $request)
    {
        $query = Report::with([
            'reporter:id,display_name,email',
            'reviewer:id,display_name',
            'service:id,name,slug'
        ]);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ]
        ]);
    }

    /**
     * Lấy chi tiết báo cáo
     */
    public function show($id)
    {
        $report = Report::with([
            'reporter',
            'reviewer:id,display_name',
            'service:id,name,slug,provider_id',
            'service.provider.user:id,display_name'
        ])->find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy báo cáo'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    /**
     * Xử lý báo cáo
     * PATCH /api/admin/reports/{id}/resolve
     */
    public function resolve(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:resolved,dismissed',
            'resolution_note' => 'nullable|string|max:1000',
        ]);

        $report = Report::find($id);
        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy báo cáo'
            ], 404);
        }

        try {
            $adminUid = $request->attributes->get('firebaseUid');
            $admin = User::where('firebase_uid', $adminUid)->first();

            $report->status = $request->status;
            $report->resolution_note = $request->resolution_note;
            $report->reviewed_by = $admin->id ?? null;
            $report->reviewed_at = now();
            $report->save();

            // --- N8N AUTOMATION: Thông báo cho người report về kết quả xử lý ---
            $this->n8n->trigger('report_resolved', [
                'report_id' => $report->id,
                'reporter_email' => $report->reporter->email ?? null,
                'status' => $report->status,
                'resolution_note' => $report->resolution_note,
                'service_name' => $report->service->name ?? 'Dịch vụ'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật báo cáo thành công',
                'data' => $report
            ]);
        } catch (\Throwable $e) {
            Log::error('Resolve report error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xử lý báo cáo'
            ], 500);
        }
    }

    /**
     * Xóa báo cáo
     */
    public function destroy($id)
    {
        $report = Report::find($id);
        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy báo cáo'
            ], 404);
        }

        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa bản ghi báo cáo'
        ]);
    }
}
