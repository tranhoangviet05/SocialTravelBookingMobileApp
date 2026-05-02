<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AutomationController extends Controller
{
    /**
     * Lấy danh sách workflow từ hệ thống (giả lập hoặc kết nối n8n API)
     * GET /api/admin/automation/workflows
     */
    public function index()
    {
        // Trong thực tế, bạn có thể gọi n8n API để lấy danh sách workflow thật
        $workflows = [
            [
                'id' => 'wf-1',
                'name' => 'Cross-sell Automation',
                'desc' => 'Tự động gửi email giới thiệu Tour khi khách đặt Khách sạn.',
                'status' => 'active',
                'lastRun' => '15 ph trước',
                'successRate' => '98%',
                'webhook' => 'https://n8n.travelbooking.vn/webhook/cross-sell'
            ],
            [
                'id' => 'wf-2',
                'name' => 'Upsell Strategy',
                'desc' => 'Gợi ý nâng cấp hạng phòng hoặc dịch vụ đi kèm sau 1 ngày đặt.',
                'status' => 'active',
                'lastRun' => '2 giờ trước',
                'successRate' => '95%',
                'webhook' => 'https://n8n.travelbooking.vn/webhook/upsell'
            ],
            [
                'id' => 'wf-3',
                'name' => 'Customer Retention',
                'desc' => 'Gửi mã giảm giá cho khách hàng sau 30 ngày không quay lại.',
                'status' => 'paused',
                'lastRun' => '1 ngày trước',
                'successRate' => '100%',
                'webhook' => 'https://n8n.travelbooking.vn/webhook/retention'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $workflows,
            'connection' => [
                'status' => 'online',
                'url' => 'https://n8n.travelbooking.vn',
                'version' => 'v1.2.4'
            ]
        ]);
    }

    /**
     * Đồng bộ trạng thái workflow
     * PATCH /api/admin/automation/workflows/{id}/toggle
     */
    public function toggle(Request $request, $id)
    {
        // Giả lập cập nhật trạng thái
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái workflow thành công'
        ]);
    }
}
