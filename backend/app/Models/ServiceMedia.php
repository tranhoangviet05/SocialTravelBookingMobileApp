<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceMedia extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    public $timestamps = false; // Phù hợp với schema SQL chỉ có created_at

    // --- QUAN HỆ ---

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
