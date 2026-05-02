<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceSchedule extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'activities' => 'array',
            'meals' => 'array',
        ];
    }

    // --- QUAN HỆ ---

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
