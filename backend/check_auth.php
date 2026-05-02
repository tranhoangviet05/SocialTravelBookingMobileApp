<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "--- USER AUTH CHECK ---\n";
foreach(User::all() as $u) {
    echo "Email: " . $u->email . " | Firebase UID: " . ($u->firebase_uid ?: 'NULL') . "\n";
}
