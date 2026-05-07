<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ServiceService
{
    /**
     * Tìm kiếm và lọc dịch vụ
     */
    public function search(array $filters): Collection
    {
        $query = Service::query()->where('status', 'active');

        // 1. Lọc theo location_id (chính xác, ưu tiên cao nhất)
        if (!empty($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        } elseif (!empty($filters['keyword'])) {
            // 2. Nếu không có location_id, tìm location theo tên keyword
            //    rồi lọc service theo location_id tìm được
            $keyword = $filters['keyword'];

            // Tìm các location_id khớp tên
            $locationIds = \App\Models\Location::where('name', 'ILIKE', '%' . $keyword . '%')
                ->pluck('id')
                ->toArray();

            $query->where(function (Builder $q) use ($keyword, $locationIds) {
                // Tìm theo tên/mô tả/địa chỉ của service
                $q->where('name', 'ILIKE', '%' . $keyword . '%')
                  ->orWhere('description', 'ILIKE', '%' . $keyword . '%')
                  ->orWhere('address', 'ILIKE', '%' . $keyword . '%');

                // HOẶC tìm theo location_id
                if (!empty($locationIds)) {
                    $q->orWhereIn('location_id', $locationIds);
                }
            });
        }

        // Lọc theo danh mục ID
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Lọc theo loại hình dịch vụ (type) - Ví dụ: hotel,homestay,tour,vehicle
        if (!empty($filters['type'])) {
            $types = explode(',', $filters['type']);
            $query->whereIn('type', $types);
        }

        // Lọc theo giá
        if (isset($filters['price_min'])) {
            $query->where('base_price', '>=', $filters['price_min']);
        }
        if (isset($filters['price_max'])) {
            $query->where('base_price', '<=', $filters['price_max']);
        }

        // Lấy kèm ảnh đại diện (cover) và địa điểm
        return $query->with(['media' => function($q) {
            $q->where('is_cover', true);
        }, 'location'])
        ->orderBy('created_at', 'desc')
        ->limit($filters['limit'] ?? 20)
        ->get();
    }

    /**
     * Lấy chi tiết dịch vụ theo Slug
     */
    public function getBySlug(string $slug): ?Service
    {
        return Service::where('slug', $slug)
            ->where('status', 'active')
            ->with(['media', 'schedules', 'provider', 'location', 'reviews.user', 'roomTypes'])
            ->first();
    }

    /**
     * Lấy danh sách dịch vụ mới nhất
     */
    public function getLatest(int $limit = 10): Collection
    {
        return Service::where('status', 'active')
            ->with(['media' => function($q) {
                $q->where('is_cover', true);
            }, 'location'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
