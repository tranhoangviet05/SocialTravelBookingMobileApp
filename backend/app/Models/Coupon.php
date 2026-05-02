<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    public $timestamps = false; // Schema chỉ có created_at

    protected function casts(): array
    {
        return [
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
        ];
    }

    // --- QUAN HỆ ---

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
