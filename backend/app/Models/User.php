<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids;

    /**
     * Cho phép gán mọi trường dữ liệu (Mass Assignment)
     */
    protected $guarded = [];

    /**
     * Các trường cần ẩn khi chuyển sang JSON
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Các thuộc tính cần ép kiểu
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'social_active' => 'boolean',
        ];
    }

    /**
     * Appends photoURL for frontend compatibility (matching Firebase naming)
     */
    protected $appends = ['photoURL'];

    public function getPhotoURLAttribute()
    {
        return $this->avatar_url;
    }

    /**
     * Khai báo cột mật khẩu cho Laravel Auth (vì tên cũ là 'password_hash')
     */
    public function getAuthPasswordName()
    {
        return 'password_hash';
    }

    // --- QUAN HỆ (RELATIONSHIPS) ---

    public function providerProfile()
    {
        return $this->hasOne(ProviderProfile::class);
    }

    public function socialProfile()
    {
        return $this->hasOne(SocialProfile::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
