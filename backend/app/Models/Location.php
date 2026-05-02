<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * Tắt timestamp mặc định của Laravel nếu DB chỉ có created_at
     */
    public $timestamps = true; 

    // --- QUAN HỆ ---

    public function parent()
    {
        return $this->belongsTo(Location::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Location::class, 'parent_id');
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
