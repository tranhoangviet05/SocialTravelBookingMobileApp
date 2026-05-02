<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderProfile extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    // --- QUAN HỆ ---

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'provider_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'provider_id');
    }
}
