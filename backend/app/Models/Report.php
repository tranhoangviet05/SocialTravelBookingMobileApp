<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    public $timestamps = false; // Phù hợp schema chỉ có created_at

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    // --- QUAN HỆ ---

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
