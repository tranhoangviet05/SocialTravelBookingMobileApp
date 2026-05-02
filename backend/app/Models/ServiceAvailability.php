<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceAvailability extends Model
{
    /**
     * Bảng này có tên đặc thù trong schema của bạn
     */
    protected $table = 'service_availability';

    use HasFactory, HasUuids;

    protected $guarded = [];

    public $timestamps = false;

    // --- QUAN HỆ ---

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
