<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SocialProfile extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_verified'      => 'boolean',
            'followers_count'  => 'integer',
            'following_count'  => 'integer',
            'posts_count'      => 'integer',
            'created_at'       => 'datetime',
            'updated_at'       => 'datetime',
        ];
    }

    // --- Relationships ---

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
