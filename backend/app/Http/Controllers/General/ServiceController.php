<?php

namespace App\Http\Controllers\General;

use App\Http\Resources\ServiceDetailResource;
use App\Http\Controllers\Controller;
use App\Http\Requests\General\ServiceSearchRequest;
use App\Services\ServiceService;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    protected $serviceService;

    public function __construct(ServiceService $serviceService)
    {
        $this->serviceService = $serviceService;
    }

    /**
     * Tìm kiếm và lọc danh sách dịch vụ (vaitro/hanhdong/chucnang)
     * Endpoint: GET /api/general/get/services
     */
    public function index(ServiceSearchRequest $request)
    {
        $filters = $request->validated();
        $services = $this->serviceService->search($filters);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách dịch vụ thành công',
            'data' => $services
        ]);
    }

    /**
     * Lấy chi tiết dịch vụ theo Slug (vaitro/hanhdong/chucnang)
     * Endpoint: GET /api/general/get/services/detail/{slug}
     */
    public function show($slug)
    {
        $service = $this->serviceService->getBySlug($slug);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy chi tiết dịch vụ'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ServiceDetailResource($service)
        ]);
    }

    /**
     * Lấy danh sách dịch vụ mới nhất (vaitro/hanhdong/chucnang)
     * Endpoint: GET /api/general/get/services/latest
     */
    public function latest(Request $request)
    {
        $limit = $request->get('limit', 10);
        $services = $this->serviceService->getLatest((int) $limit);

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }
}
