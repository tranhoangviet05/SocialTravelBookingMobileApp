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

        // Tìm kiếm theo từ khóa (tên hoặc mô tả)
        if (!empty($filters['keyword'])) {
            $query->where(function (Builder $q) use ($filters) {
                $q->where('name', 'ILIKE', '%' . $filters['keyword'] . '%')
                  ->orWhere('description', 'ILIKE', '%' . $filters['keyword'] . '%');
            });
        }

        // Lọc theo địa điểm
        if (!empty($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        }

        // Lọc theo danh mục
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Lọc theo giá
        if (isset($filters['price_min'])) {
            $query->where('base_price', '>=', $filters['price_min']);
        }
        if (isset($filters['price_max'])) {
            $query->where('base_price', '<=', $filters['price_max']);
        }

        // Mặc định lấy kèm ảnh đại diện (cover) và địa điểm
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
