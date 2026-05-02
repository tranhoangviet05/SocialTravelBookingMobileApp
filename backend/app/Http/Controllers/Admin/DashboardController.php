<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Service;
use App\Models\ProviderProfile;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Lấy thống kê tổng quan cho Admin Dashboard
     * GET /api/admin/dashboard/stats
     */
    public function stats()
    {
        // --- Thống kê người dùng ---
        $totalUsers = User::count();
        $newUsersThisMonth = User::where('created_at', '>=', Carbon::now()->startOfMonth())->count();
        $newUsersLastMonth = User::whereBetween('created_at', [
            Carbon::now()->subMonth()->startOfMonth(),
            Carbon::now()->subMonth()->endOfMonth()
        ])->count();
        $userGrowth = $newUsersLastMonth > 0
            ? round((($newUsersThisMonth - $newUsersLastMonth) / $newUsersLastMonth) * 100, 1)
            : ($newUsersThisMonth > 0 ? 100 : 0);

        // --- Thống kê nhà cung cấp ---
        $totalProviders = User::where('role', 'provider')->count();
        $totalProviderProfiles = ProviderProfile::count();
        $pendingProviders = ProviderProfile::where('status', 'pending')->count();

        // --- Thống kê dịch vụ ---
        $totalServices = Service::count();
        $activeServices = Service::where('status', 'active')->count();
        $pendingServices = Service::where('status', 'pending_review')->count();

        // --- Thống kê đặt chỗ ---
        $totalBookings = Booking::count();
        $newBookingsToday = Booking::where('created_at', '>=', Carbon::today())->count();
        $bookingsThisMonth = Booking::where('created_at', '>=', Carbon::now()->startOfMonth())->count();

        // --- Thống kê doanh thu ---
        $totalRevenue = Booking::where('payment_status', 'paid')->sum('total_amount') ?? 0;
        $revenueThisMonth = Booking::where('payment_status', 'paid')
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->sum('total_amount') ?? 0;
        $revenueLastMonth = Booking::where('payment_status', 'paid')
            ->whereBetween('created_at', [
                Carbon::now()->subMonth()->startOfMonth(),
                Carbon::now()->subMonth()->endOfMonth()
            ])->sum('total_amount') ?? 0;
        $revenueGrowth = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : ($revenueThisMonth > 0 ? 100 : 0);

        // --- Thống kê đánh giá ---
        $totalReviews = Review::count();
        $avgRating = Review::avg('rating') ?? 0;

        // --- Doanh thu 6 tháng gần nhất (cho biểu đồ) ---
        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthRevenue = Booking::where('payment_status', 'paid')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total_amount') ?? 0;
            $monthBookings = Booking::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();

            $revenueChart[] = [
                'name' => 'T' . $month->month,
                'revenue' => round($monthRevenue / 1000000, 1), // Triệu VND
                'bookings' => $monthBookings,
            ];
        }

        // --- Booking gần nhất ---
        $recentBookings = Booking::with(['user:id,display_name,email', 'service:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code ?? ('BK-' . substr($booking->id, 0, 4)),
                    'customer' => $booking->user->display_name ?? $booking->user->email ?? 'N/A',
                    'service' => $booking->service->name ?? 'N/A',
                    'amount' => number_format($booking->total_amount ?? 0) . '₫',
                    'status' => $booking->status ?? 'pending',
                    'payment_status' => $booking->payment_status ?? 'pending',
                    'date' => $booking->created_at ? $booking->created_at->diffForHumans() : 'N/A',
                ];
            });

        // --- Phân bổ nguồn doanh thu theo loại dịch vụ ---
        $revenueByType = DB::table('bookings')
            ->join('services', 'bookings.service_id', '=', 'services.id')
            ->where('bookings.payment_status', 'paid')
            ->select('services.type', DB::raw('SUM(bookings.total_amount) as total'))
            ->groupBy('services.type')
            ->get();

        $totalPaidRevenue = $revenueByType->sum('total');
        $revenueSources = $revenueByType->map(function ($item) use ($totalPaidRevenue) {
            return [
                'label' => $this->getTypeLabel($item->type),
                'value' => $totalPaidRevenue > 0
                    ? round(($item->total / $totalPaidRevenue) * 100) . '%'
                    : '0%',
                'color' => $this->getTypeColor($item->type),
            ];
        })->values();

        // Nếu chưa có dữ liệu, trả về mặc định
        if ($revenueSources->isEmpty()) {
            $revenueSources = collect([
                ['label' => 'Tours & Trải nghiệm', 'value' => '0%', 'color' => 'bg-sky-500'],
                ['label' => 'Khách sạn & Resort', 'value' => '0%', 'color' => 'bg-emerald-500'],
                ['label' => 'Dịch vụ di chuyển', 'value' => '0%', 'color' => 'bg-amber-500'],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_users' => $totalUsers,
                    'user_growth' => $userGrowth,
                    'total_providers' => $totalProviders,
                    'pending_providers' => $pendingProviders,
                    'total_revenue' => $totalRevenue,
                    'revenue_growth' => $revenueGrowth,
                    'total_bookings' => $totalBookings,
                    'new_bookings_today' => $newBookingsToday,
                    'bookings_this_month' => $bookingsThisMonth,
                    'total_services' => $totalServices,
                    'active_services' => $activeServices,
                    'pending_services' => $pendingServices,
                    'total_reviews' => $totalReviews,
                    'avg_rating' => round($avgRating, 1),
                ],
                'revenue_chart' => $revenueChart,
                'recent_bookings' => $recentBookings,
                'revenue_sources' => $revenueSources,
            ]
        ]);
    }

    /**
     * Lấy tên hiển thị cho loại dịch vụ
     */
    private function getTypeLabel(?string $type): string
    {
        return match ($type) {
            'tour' => 'Tours & Trải nghiệm',
            'hotel' => 'Khách sạn & Resort',
            'homestay' => 'Homestay',
            'vehicle' => 'Dịch vụ di chuyển',
            default => 'Khác',
        };
    }

    /**
     * Lấy màu Tailwind cho loại dịch vụ
     */
    private function getTypeColor(?string $type): string
    {
        return match ($type) {
            'tour' => 'bg-sky-500',
            'hotel' => 'bg-emerald-500',
            'homestay' => 'bg-indigo-500',
            'vehicle' => 'bg-amber-500',
            default => 'bg-gray-500',
        };
    }
}
