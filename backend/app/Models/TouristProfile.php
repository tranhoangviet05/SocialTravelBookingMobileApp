<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TouristProfile extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    /**
     * Quan hệ với User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
