<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Http\Requests\General\LocationRequest;
use App\Http\Resources\General\LocationResource;
use App\Models\Location;
use App\Services\LocationService;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * Lấy danh sách địa điểm
     * Endpoint: GET /api/general/get/locations
     */
    public function index(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 8);
        $search = $request->get('search');
        $isPopular = $request->get('is_popular');

        $filters = $request->only(['root_only']);
        
        if ($request->has('is_popular')) {
            $filters['is_popular'] = filter_var($isPopular, FILTER_VALIDATE_BOOLEAN);
        }

        $query = Location::with(['parent']);

        if ($search) {
            $query->where('name', 'ilike', "%{$search}%");
        }
        if (isset($filters['is_popular'])) {
            $query->where('is_popular', $filters['is_popular']);
        }
        if (!empty($filters['root_only'])) {
            $query->whereNull('parent_id');
        }

        // Nếu yêu cầu tất cả (không phân trang)
        if ($request->has('all')) {
            $data = $query->orderBy('name', 'asc')->get();
            return response()->json([
                'success' => true,
                'data' => LocationResource::collection($data)
            ]);
        }

        $paginated = $query->orderBy('name', 'asc')->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => LocationResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    /**
     * Lấy chi tiết một địa điểm
     */
    public function show($id)
    {
        $location = $this->locationService->getLocationById($id);

        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy địa điểm'
            ], 404);
        }

        return (new LocationResource($location))->additional([
            'success' => true
        ]);
    }

    /**
     * Thêm địa điểm mới
     */
    public function store(LocationRequest $request)
    {
        $location = $this->locationService->createLocation($request->validated());
        $location->load('parent');

        return (new LocationResource($location))->additional([
            'success' => true,
            'message' => 'Thêm địa điểm thành công'
        ])->response()->setStatusCode(201);
    }

    /**
     * Cập nhật địa điểm
     */
    public function update(LocationRequest $request, $id)
    {
        $location = $this->locationService->updateLocation($id, $request->validated());
        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy địa điểm để cập nhật'
            ], 404);
        }

        $location->load('parent');

        return (new LocationResource($location))->additional([
            'success' => true,
            'message' => 'Cập nhật địa điểm thành công'
        ]);
    }

    /**
     * Xóa địa điểm
     */
    public function destroy($id)
    {
        try {
            $deleted = $this->locationService->deleteLocation((int) $id);
            
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa điểm hoặc xóa thất bại'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Xóa địa điểm thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
