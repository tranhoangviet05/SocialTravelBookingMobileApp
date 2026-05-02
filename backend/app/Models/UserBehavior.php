<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBehavior extends Model
{
    public $timestamps = false;
    protected $guarded = [];
    protected $table = 'user_behaviors';

    protected function casts(): array
    {
        return [
            'metadata'   => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }

    /**
     * Ghi nhận hành vi người dùng.
     */
    public static function record(
        string $userId,
        string $actionType,
        ?string $postId = null,
        ?int $tagId = null,
        ?int $locationId = null,
        ?string $serviceId = null,
        array $metadata = []
    ): self {
        return self::create([
            'user_id'     => $userId,
            'action_type' => $actionType,
            'post_id'     => $postId,
            'tag_id'      => $tagId,
            'location_id' => $locationId,
            'service_id'  => $serviceId,
            'metadata'    => empty($metadata) ? null : $metadata,
        ]);
    }

    /**
     * Lấy top địa điểm được quan tâm của user.
     */
    public static function topLocationsForUser(string $userId, int $limit = 5): array
    {
        return self::selectRaw('location_id, COUNT(*) as score')
            ->where('user_id', $userId)
            ->whereIn('action_type', ['view_post', 'like_post', 'click_affiliate'])
            ->whereNotNull('location_id')
            ->groupBy('location_id')
            ->orderByDesc('score')
            ->limit($limit)
            ->pluck('score', 'location_id')
            ->toArray();
    }

    /**
     * Lấy top tags được quan tâm của user.
     */
    public static function topTagsForUser(string $userId, int $limit = 10): array
    {
        return self::selectRaw('tag_id, COUNT(*) as score')
            ->where('user_id', $userId)
            ->whereIn('action_type', ['view_post', 'like_post', 'click_affiliate'])
            ->whereNotNull('tag_id')
            ->groupBy('tag_id')
            ->orderByDesc('score')
            ->limit($limit)
            ->pluck('score', 'tag_id')
            ->toArray();
    }
}
