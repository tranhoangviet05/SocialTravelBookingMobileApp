<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->input('user');
        $provider = ProviderProfile::where('user_id', $user->id)->first();

        if (!$provider) {
            return response()->json([
                'success' => true,
                'data' => [
                    'has_profile' => false,
                    'active_services' => 0,
                    'total_bookings' => 0,
                    'pending_bookings' => 0,
                    'revenue' => 0,
                    'avg_rating' => 0,
                    'total_reviews' => 0,
                ]
            ]);
        }

        $serviceIds = Service::where('provider_id', $provider->id)->pluck('id');

        $activeServices = Service::where('provider_id', $provider->id)
            ->where('status', 'active')
            ->count();

        $totalBookings = Booking::where('provider_id', $provider->id)->count();
        $pendingBookings = Booking::where('provider_id', $provider->id)
            ->where('status', 'pending')
            ->count();

        $revenue = Booking::where('provider_id', $provider->id)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_amount');

        $totalReviews = Review::whereIn('service_id', $serviceIds)->count();
        $avgRating = Review::whereIn('service_id', $serviceIds)->avg('rating') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'has_profile' => true,
                'provider_id' => $provider->id,
                'business_name' => $provider->business_name,
                'provider_status' => $provider->status,
                'active_services' => $activeServices,
                'total_bookings' => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'revenue' => $revenue,
                'avg_rating' => round($avgRating, 1),
                'total_reviews' => $totalReviews,
            ]
        ]);
    }
}
