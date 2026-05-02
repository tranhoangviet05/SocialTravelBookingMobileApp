<?php

namespace App\Services;

use App\Models\Location;
use App\Models\Service;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class LocationService
{
    /**
     * Lấy danh sách địa điểm (Có thể lọc theo popular hoặc thành phố)
     */
    public function getAllLocations(array $filters = []): Collection
    {
        $query = Location::with(['parent']);

        // Lọc địa điểm phổ biến
        if (isset($filters['is_popular'])) {
            $query->where('is_popular', filter_var($filters['is_popular'], FILTER_VALIDATE_BOOLEAN));
        }

        // Chỉ lấy cấp thành phố/tỉnh (không có parent_id)
        if (isset($filters['root_only']) && filter_var($filters['root_only'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereNull('parent_id');
        }

        return $query->orderBy('name', 'asc')->get();
    }

    /**
     * Lấy thông tin chi tiết một địa điểm
     */
    public function getLocationById(int $id): ?Location
    {
        return Location::with(['children', 'parent'])->find($id);
    }

    /**
     * Thêm địa điểm mới
     */
    public function createLocation(array $dataLocation): Location
    {
        if (empty($dataLocation['slug'])) {
            $slug = Str::slug($dataLocation['name']);
            
            $originalSlug = $slug;
            $count = 1;
            while (Location::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
            $dataLocation['slug'] = $slug;
        }

        if (!isset($dataLocation['description'])) {
            $dataLocation['description'] = '';
        }
        
        return Location::create($dataLocation);
    }

    /**
     * Cập nhật địa điểm
     */
    public function updateLocation(int $id, array $dataLocation): ?Location
    {
        $location = Location::find($id);
        if (!$location) return null;

        if (isset($dataLocation['name']) && empty($dataLocation['slug'])) {
            $dataLocation['slug'] = Str::slug($dataLocation['name']);
        }

        if (array_key_exists('description', $dataLocation) && $dataLocation['description'] === null) {
            $dataLocation['description'] = '';
        }

        $location->update($dataLocation);
        return $location;
    }

    /**
     * Xóa địa điểm
     */
    public function deleteLocation(int $id): bool
    {
        $location = Location::find($id);
        if (!$location) return false;

        if (Service::where('location_id', $id)->exists()) {
            throw new \Exception('Không thể xóa địa điểm đang có dịch vụ du lịch.');
        }

        return $location->delete();
    }
}
