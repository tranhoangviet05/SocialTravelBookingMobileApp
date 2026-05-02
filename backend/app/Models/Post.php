<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Post extends Model
{
    use HasUuids, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'likes_count'    => 'integer',
            'comments_count' => 'integer',
            'created_at'     => 'datetime',
            'updated_at'     => 'datetime',
            'deleted_at'     => 'datetime',
        ];
    }

    // --- Relationships ---

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function media()
    {
        return $this->hasMany(PostMedia::class)->orderBy('order');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tags');
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->orderByDesc('created_at');
    }

    public function location()
    {
        return $this->belongsTo(\App\Models\Location::class);
    }

    public function service()
    {
        return $this->belongsTo(\App\Models\Service::class);
    }

    // Kiểm tra user hiện tại đã like chưa
    public function likedByUser(string $userId): bool
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }
}
