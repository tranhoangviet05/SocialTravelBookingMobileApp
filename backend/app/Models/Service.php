<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    /**
     * Tự động chuyển đổi dữ liệu JSON từ Postgres sang mảng PHP
     */
    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'includes' => 'array',
            'excludes' => 'array',
            // 'tags' được xử lý qua Accessor và Mutator bên dưới
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Accessor: Chuyển đổi chuỗi text[] của Postgres thành mảng PHP khi đọc
     */
    public function getTagsAttribute($value)
    {
        if (is_array($value)) return array_values($value);
        if (!$value || $value === '{}') return [];
        
        $tags = array_filter(explode(',', trim($value, '{}')));
        return array_values(array_map(function($t) {
            return trim($t, '"\' ');
        }, $tags));
    }

    /**
     * Mutator: Chuyển đổi mảng PHP thành chuỗi text[] của Postgres khi lưu
     */
    public function setTagsAttribute($value)
    {
        if (is_array($value)) {
            // Thêm dấu ngoặc kép để tránh lỗi nếu tag có chứa dấu phẩy hoặc khoảng trắng
            $formatted = array_map(fn($t) => '"' . addslashes(trim($t, '"\'')) . '"', $value);
            $this->attributes['tags'] = '{' . implode(',', $formatted) . '}';
        } else {
            $this->attributes['tags'] = '{' . trim($value, '{}') . '}';
        }
    }

    // --- QUAN HỆ ---

    public function provider()
    {
        return $this->belongsTo(ProviderProfile::class, 'provider_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function media()
    {
        return $this->hasMany(ServiceMedia::class);
    }

    public function schedules()
    {
        return $this->hasMany(ServiceSchedule::class);
    }

    public function availabilities()
    {
        return $this->hasMany(ServiceAvailability::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function roomTypes()
    {
        return $this->hasMany(HotelRoomType::class);
    }
}
