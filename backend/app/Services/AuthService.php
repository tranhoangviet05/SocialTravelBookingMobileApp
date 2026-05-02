<?php

namespace App\Services;

use App\Models\User;

class AuthService
{
    public function syncFirebaseUser(array $firebaseData): array
    {
        $firebaseUid = $firebaseData['uid'];
        $firebaseEmail = $firebaseData['email'];
        $requestedRole = $firebaseData['role'] ?? 'tourist';

        $isNewUser = false;

        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (!$user && $firebaseEmail) {
            $user = User::where('email', $firebaseEmail)->first();
            if ($user) {
                $user->update(['firebase_uid' => $firebaseUid]);
            }
        }

        if (!$user) {
            $isNewUser = true;

            $displayName = $firebaseData['name']
                ?? explode('@', $firebaseEmail)[0]
                ?? 'Người dùng';

            $user = User::create([
                'firebase_uid' => $firebaseUid,
                'email' => $firebaseEmail,
                'display_name' => $displayName,
                'avatar_url' => $firebaseData['picture'] ?? null,
                'role' => $requestedRole,
                'status' => 'active',
            ]);
        } else {
            $user->update([
                'display_name' => $firebaseData['name'] ?? $user->display_name,
                'avatar_url' => $firebaseData['picture'] ?? $user->avatar_url,
            ]);
        }

        return [
            'user' => $user,
            'is_new_user' => $isNewUser
        ];
    }
}
