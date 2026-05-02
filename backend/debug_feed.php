<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Post;
use App\Models\User;
use App\Services\SocialService;

$email = 'hoangviet2992005@gmail.com'; // Probable user email from USERS list
$user = User::where('email', $email)->first();

if (!$user) {
    echo "USER NOT FOUND for email: $email\n";
    $user = User::first();
    echo "Using fallback User: " . ($user ? $user->display_name : 'NONE') . "\n";
}

if ($user) {
    echo "Current User ID: " . $user->id . "\n";
    $service = app(SocialService::class);
    
    try {
        $feed = $service->getFeed($user);
        echo "Feed Total: " . $feed->total() . "\n";
        foreach($feed->items() as $p) {
            echo " - Post: " . $p->id . " by " . $p->author->display_name . " [Visibility: " . $p->visibility . "]\n";
        }
    } catch (\Exception $e) {
        echo "FEED ERROR: " . $e->getMessage() . "\n";
    }

    try {
        $myPosts = $service->getUserPosts($user, $user->id);
        echo "My Posts Total: " . $myPosts->total() . "\n";
    } catch (\Exception $e) {
        echo "MY POSTS ERROR: " . $e->getMessage() . "\n";
    }
} else {
    echo "NO USERS IN DB\n";
}

echo "\n--- RAW DB CHECK ---\n";
echo "Total Posts (including trashed): " . Post::withTrashed()->count() . "\n";
foreach(Post::withTrashed()->get() as $p) {
    echo "ID: " . $p->id . " | Visibility: " . $p->visibility . " | User: " . $p->user_id . " | Deleted: " . ($p->deleted_at ? 'YES' : 'NO') . "\n";
}
