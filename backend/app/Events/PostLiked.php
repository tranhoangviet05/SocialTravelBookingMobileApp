<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostLiked implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $postId;
    public $likesCount;
    public $likedBy;
    public $liked;

    public function __construct(string $postId, int $likesCount, string $likedBy, bool $liked = true)
    {
        $this->postId = $postId;
        $this->likesCount = $likesCount;
        $this->likedBy = $likedBy;
        $this->liked = $liked;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('social-interactions'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'post.liked';
    }
}
