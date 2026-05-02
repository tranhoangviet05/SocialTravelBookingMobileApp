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
            'tags' => 'array', // Dùng cho TEXT[] trong Postgres
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
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

    public function availability()
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
