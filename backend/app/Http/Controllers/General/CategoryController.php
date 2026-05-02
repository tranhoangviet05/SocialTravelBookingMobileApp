<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Http\Requests\General\CategoryRequest;
use App\Http\Resources\General\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    /**
     * Lấy danh sách danh mục
     * Endpoint: GET /api/general/get/categories
     */
    public function index(Request $request)
    {
        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 8);
        $search = $request->get('search');

        $query = Category::orderBy('name', 'asc');

        if ($search) {
            $query->where('name', 'ilike', "%{$search}%");
        }

        if ($request->has('all')) {
            $data = $query->get();
            return response()->json([
                'success' => true,
                'data' => CategoryResource::collection($data)
            ]);
        }

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    /**
     * Lấy chi tiết danh mục kèm danh sách dịch vụ (có bộ lọc)
     * Endpoint: GET /api/general/get/categories/{slug}
     */
    public function show(Request $request, $slug)
    {
        $filters = $request->only(['is_popular', 'min_rating']);
        $category = $this->categoryService->getCategoryBySlug($slug, $filters);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        return (new CategoryResource($category))->additional([
            'success' => true,
            'message' => 'Lấy thông tin danh mục thành công'
        ]);
    }

    /**
     * Thêm danh mục mới (Admin)
     */
    public function store(CategoryRequest $request)
    {
        $category = $this->categoryService->createCategory($request->validated());

        return (new CategoryResource($category))->additional([
            'success' => true,
            'message' => 'Thêm danh mục mới thành công'
        ])->response()->setStatusCode(201);
    }

    /**
     * Cập nhật danh mục (Admin)
     */
    public function update(CategoryRequest $request, $id)
    {
        $category = $this->categoryService->updateCategory((int)$id, $request->validated());

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        return (new CategoryResource($category))->additional([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công'
        ]);
    }

    /**
     * Xóa danh mục (Admin)
     */
    public function destroy($id)
    {
        try {
            $deleted = $this->categoryService->deleteCategory((int)$id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy danh mục'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Xóa danh mục thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
