<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserFollowed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $followerId;
    public $followingId;
    public $status; // true for follow, false for unfollow
    public $followerCount;
    public $followingCount;

    public function __construct($followerId, $followingId, $status, $followerCount, $followingCount)
    {
        $this->followerId = $followerId;
        $this->followingId = $followingId;
        $this->status = $status;
        $this->followerCount = $followerCount;
        $this->followingCount = $followingCount;
    }

    public function broadcastOn()
    {
        // Broadcast public để cả 2 bên đều nhận được cập nhật
        return new Channel('social-updates');
    }

    public function broadcastAs()
    {
        return 'user.followed';
    }
}
