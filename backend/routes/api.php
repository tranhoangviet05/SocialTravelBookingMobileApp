<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Social Travel Booking
|--------------------------------------------------------------------------
| Tiền tố: /api (ví dụ: GET /api/ping)
|
| Middleware 'firebase.auth':
|   - Xác thực Firebase ID Token từ header: Authorization: Bearer <token>
|   - Sau xác thực: $request->firebaseUid, ->firebaseEmail, ->firebaseUser
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Auth\AuthController;

use App\Http\Controllers\General\LocationController;
use App\Http\Controllers\General\CategoryController;
use App\Http\Controllers\General\BehaviorTrackingController;
use App\Http\Controllers\General\RecommendationController;
use App\Http\Controllers\General\BehaviorRedisController;
use App\Http\Controllers\General\BehaviorDatabaseController;
use App\Http\Controllers\General\ServiceController;
use App\Http\Controllers\Social\PostController;
use App\Http\Controllers\Social\InteractionController;
use App\Http\Controllers\Social\FollowController;
use App\Http\Controllers\Social\TagController;
use App\Http\Controllers\General\ServiceFeedbackController;

// ========================
// ROUTE CÔNG KHAI (không cần đăng nhập)
// ========================
Route::get('/ping', fn() => response()->json([
    'success' => true,
    'message' => 'Social Travel Booking API đang chạy!',
    'timestamp' => now()->toISOString(),
]));

// Địa điểm & Danh mục (Public)
Route::get('/locations', [LocationController::class, 'index']);
Route::get('/locations/{id}', [LocationController::class, 'show']);
Route::get('/general/get/locations', [LocationController::class, 'index']);
Route::get('/general/get/locations/{id}', [LocationController::class, 'show']);
Route::get('/general/get/categories', [CategoryController::class, 'index']);
Route::get('/general/get/categories/{slug}', [CategoryController::class, 'show']);

// Dịch vụ du lịch (Public)
Route::get('/general/get/services', [ServiceController::class, 'index']);
Route::get('/general/get/services/detail/{slug}', [ServiceController::class, 'show']);
Route::get('/general/get/services/latest', [ServiceController::class, 'latest']);
Route::get('/general/get/services/{id}/feedbacks', [ServiceFeedbackController::class, 'index']);

// Mã giảm giá (Public)
Route::get('/general/get/coupons', [\App\Http\Controllers\General\CouponController::class, 'index']);

// Webhook SePay (Public - không cần auth, SePay gọi vào)
Route::post('/payment/sepay/webhook', [\App\Http\Controllers\General\PaymentController::class, 'sepayWebhook']);


// ========================
// INTERNAL API FOR n8n (No Auth for local bridge)
// ========================
Route::group(['prefix' => 'internal'], function() {
    // Behavior tracking sync
    Route::post('/behavior/sync', [BehaviorTrackingController::class, 'syncFromN8n']);
    Route::get('/behavior/active-users', [BehaviorTrackingController::class, 'getActiveUsers']);
    Route::post('/behavior/process-recommendations', [BehaviorTrackingController::class, 'processRecommendations']);
    Route::post('/behavior/cleanup', [BehaviorDatabaseController::class, 'cleanup']);

    // Database Bridge
    Route::group(['prefix' => 'db'], function() {
        Route::post('/upsert-behavior', [BehaviorDatabaseController::class, 'upsertBehavior']);
        Route::post('/process-bulk', [BehaviorDatabaseController::class, 'processBulkRecommendations']);
        Route::get('/get-pending', [BehaviorDatabaseController::class, 'getPendingUsers']);
        Route::get('/get-best-interest', [BehaviorDatabaseController::class, 'getBestInterest']);
        Route::post('/save-recommendations', [BehaviorDatabaseController::class, 'saveRecommendations']);
        Route::post('/cleanup', [BehaviorDatabaseController::class, 'cleanup']);
    });
});

// ========================
// ROUTE BẢO VỆ (yêu cầu Firebase Auth)
// ========================
Route::middleware('firebase.auth')->group(function () {
    // 1. Đồng bộ người dùng khi đăng nhập Firebase
    Route::post('/auth/post/sync', [AuthController::class, 'sync']);
    
    // Behavior Tracking & Recommendations (Public/User API)
    Route::post('/track-behavior', [BehaviorTrackingController::class, 'track']);
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    
    // 2. Upload tệp tin
    Route::post('/upload', [\App\Http\Controllers\General\UploadController::class, 'upload']);

    // 3. Lấy thông tin user hiện tại
    Route::get('/user/get/profile', function (\Illuminate\Http\Request $request) {
        $firebaseUid = $request->attributes->get('firebaseUid');
        $user = \App\Models\User::with('socialProfile')->where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // Đảm bảo social_active luôn trả về boolean thật (tránh Postgres trả về 0/1)
        $userData = $user->toArray();
        $userData['social_active'] = (bool) $user->social_active;

        return response()->json([
            'success' => true,
            'data' => $userData
        ]);
    });

    // 3. Routes Mạng xã hội
    Route::get('/user/get/social-status', [\App\Http\Controllers\Social\SocialController::class, 'getSocialStatus']);
    Route::get('/user/get/social-profile', [\App\Http\Controllers\Social\SocialController::class, 'getMyProfile']);
    Route::post('/auth/post/sync-social-profile', [\App\Http\Controllers\Social\SocialController::class, 'syncSocialProfile']);

    Route::prefix('social')->group(function () {
        // Bài đăng
        Route::get('/posts', [PostController::class, 'index']);
        Route::post('/posts', [PostController::class, 'store']);
        Route::get('/posts/{id}', [PostController::class, 'show']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
        Route::get('/users/{userId}/posts', [PostController::class, 'userPosts']);

        // Tương tác
        Route::post('/posts/{postId}/like', [InteractionController::class, 'toggleLike']);
        Route::get('/posts/{postId}/comments', [InteractionController::class, 'getComments']);
        Route::post('/posts/{postId}/comments', [InteractionController::class, 'storeComment']);
        Route::get('/users/{userId}/replies', [InteractionController::class, 'userReplies']);

        // Theo dõi
        Route::post('/users/{followingId}/follow', [FollowController::class, 'toggleFollow']);
        Route::get('/users/{userId}/followers', [FollowController::class, 'getFollowers']);
        Route::get('/users/{userId}/following', [FollowController::class, 'getFollowing']);
        Route::get('/users/{userId}/profile', [\App\Http\Controllers\Social\SocialController::class, 'getOtherProfile']);
        Route::get('/users/search', [FollowController::class, 'search']);
        Route::get('/suggestions/users', [FollowController::class, 'suggestions']);

        // Hashtags
        Route::get('/tags/suggestions', [TagController::class, 'suggestions']);

        // Thông báo
        Route::get('/notifications', [\App\Http\Controllers\Social\NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\Social\NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [\App\Http\Controllers\Social\NotificationController::class, 'markAllAsRead']);
    });

    // ===========================================================
    // TOURIST ROUTES (Khách du lịch - Cần User Model)
    // ===========================================================
    Route::middleware('role:tourist,provider,admin')->group(function () {
        Route::post('/bookings', [\App\Http\Controllers\General\BookingController::class, 'store']);
        Route::get('/user/bookings', [\App\Http\Controllers\General\BookingController::class, 'myBookings']);
        Route::post('/user/bookings/{id}/cancel', [\App\Http\Controllers\General\BookingController::class, 'cancel']);
        Route::post('/reviews', [\App\Http\Controllers\General\ReviewController::class, 'store']);
        Route::post('/services/{id}/feedbacks', [ServiceFeedbackController::class, 'store']);

        // Payment routes
        Route::post('/payment/initiate', [\App\Http\Controllers\General\PaymentController::class, 'initiate']);
        Route::get('/payment/status/{bookingId}', [\App\Http\Controllers\General\PaymentController::class, 'checkStatus']);
        Route::get('/wallet/balance', [\App\Http\Controllers\General\PaymentController::class, 'walletBalance']);
        Route::post('/coupons/apply', [\App\Http\Controllers\General\CouponController::class, 'apply']);
    });

    // ===========================================================
    // ADMIN ROUTES (Quản trị viên)
    // ===========================================================
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Dashboard thống kê
        Route::get('/dashboard/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);

        // Quản lý Người dùng
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
        Route::patch('/users/{id}/role', [\App\Http\Controllers\Admin\UserController::class, 'updateRole']);
        Route::patch('/users/{id}/status', [\App\Http\Controllers\Admin\UserController::class, 'updateStatus']);

        // Quản lý Địa điểm
        Route::post('/locations', [LocationController::class, 'store']);
        Route::put('/locations/{id}', [LocationController::class, 'update']);
        Route::delete('/locations/{id}', [LocationController::class, 'destroy']);

        // Quản lý Danh mục
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Quản lý Dịch vụ
        Route::get('/services', [\App\Http\Controllers\Admin\ServiceController::class, 'index']);
        Route::get('/services/{id}', [\App\Http\Controllers\Admin\ServiceController::class, 'show']);
        Route::post('/services', [\App\Http\Controllers\Admin\ServiceController::class, 'store']);
        Route::put('/services/{id}', [\App\Http\Controllers\Admin\ServiceController::class, 'update']);
        Route::patch('/services/{id}/status', [\App\Http\Controllers\Admin\ServiceController::class, 'updateStatus']);
        Route::delete('/services/{id}', [\App\Http\Controllers\Admin\ServiceController::class, 'destroy']);

        // Quản lý Đặt chỗ
        Route::get('/bookings', [\App\Http\Controllers\Admin\BookingController::class, 'index']);
        Route::get('/bookings/{id}', [\App\Http\Controllers\Admin\BookingController::class, 'show']);
        Route::patch('/bookings/{id}/status', [\App\Http\Controllers\Admin\BookingController::class, 'updateStatus']);

        // Quản lý Nhà cung cấp
        Route::get('/providers', [\App\Http\Controllers\Admin\ProviderController::class, 'index']);
        Route::get('/providers/{id}', [\App\Http\Controllers\Admin\ProviderController::class, 'show']);
        Route::patch('/providers/{id}/status', [\App\Http\Controllers\Admin\ProviderController::class, 'updateStatus']);

        // Quản lý Đánh giá
        Route::get('/reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index']);
        Route::post('/reviews/{id}/reply', [\App\Http\Controllers\Admin\ReviewController::class, 'reply']);
        Route::delete('/reviews/{id}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy']);

        // Quản lý Mã giảm giá
        Route::get('/coupons', [\App\Http\Controllers\Admin\CouponController::class, 'index']);
        Route::post('/coupons', [\App\Http\Controllers\Admin\CouponController::class, 'store']);
        Route::put('/coupons/{id}', [\App\Http\Controllers\Admin\CouponController::class, 'update']);
        Route::delete('/coupons/{id}', [\App\Http\Controllers\Admin\CouponController::class, 'destroy']);

        // Quản lý Báo cáo vi phạm
        Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index']);
        Route::get('/reports/{id}', [\App\Http\Controllers\Admin\ReportController::class, 'show']);
        Route::patch('/reports/{id}/resolve', [\App\Http\Controllers\Admin\ReportController::class, 'resolve']);

        // Cài đặt hệ thống
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index']);
        Route::post('/settings/batch', [\App\Http\Controllers\Admin\SettingController::class, 'updateBatch']);

        // Tự động hóa n8n
        Route::get('/automation/workflows', [\App\Http\Controllers\Admin\AutomationController::class, 'index']);
        Route::patch('/automation/workflows/{id}/toggle', [\App\Http\Controllers\Admin\AutomationController::class, 'toggle']);
    });

    // ===========================================================
    // PROVIDER ROUTES (Nhà cung cấp)
    // ===========================================================
    Route::prefix('provider')->middleware('role:provider')->group(function () {

        // --- Tự tạo ProviderProfile nếu chưa có (gọi lần đầu) ---
        Route::post('/setup-profile', function (\Illuminate\Http\Request $request) {
            $user = $request->input('user');
            $profile = \App\Models\ProviderProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => ($user->display_name ?? 'Nhà cung cấp') . "'s Business",
                    'status'        => 'pending',
                    'address'       => '',
                ]
            );
            return response()->json([
                'success' => true,
                'message' => 'Hồ sơ nhà cung cấp đã được khởi tạo. Vui lòng chờ Admin phê duyệt.',
                'data'    => $profile
            ]);
        });

        // --- Dashboard & Thống kê ---
        Route::get('/dashboard/stats', [\App\Http\Controllers\Provider\DashboardController::class, 'stats']);

        // --- Quản lý Dịch vụ (CRUD) ---
        Route::get('/services', [\App\Http\Controllers\Provider\ServiceController::class, 'index']);
        Route::post('/services', [\App\Http\Controllers\Provider\ServiceController::class, 'store']);
        Route::get('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'show']);
        Route::put('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'update']);
        Route::delete('/services/{id}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroy']);

        // --- Lịch trình dịch vụ (Tour) ---
        Route::get('/services/{id}/schedules', [\App\Http\Controllers\Provider\ServiceController::class, 'getSchedules']);
        Route::post('/services/{id}/schedules', [\App\Http\Controllers\Provider\ServiceController::class, 'storeSchedule']);
        Route::put('/services/{id}/schedules/{scheduleId}', [\App\Http\Controllers\Provider\ServiceController::class, 'updateSchedule']);
        Route::delete('/services/{id}/schedules/{scheduleId}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroySchedule']);

        // --- Tiện nghi / Bao gồm / Không bao gồm ---
        Route::put('/services/{id}/amenities', [\App\Http\Controllers\Provider\ServiceController::class, 'updateAmenities']);

        // --- Loại phòng (Hotel) ---
        Route::get('/services/{id}/room-types', [\App\Http\Controllers\Provider\ServiceController::class, 'getRoomTypes']);
        Route::post('/services/{id}/room-types', [\App\Http\Controllers\Provider\ServiceController::class, 'storeRoomType']);
        Route::put('/services/{id}/room-types/{roomTypeId}', [\App\Http\Controllers\Provider\ServiceController::class, 'updateRoomType']);
        Route::delete('/services/{id}/room-types/{roomTypeId}', [\App\Http\Controllers\Provider\ServiceController::class, 'destroyRoomType']);

        // --- Quản lý Đơn đặt chỗ ---
        Route::get('/bookings', [\App\Http\Controllers\Provider\BookingController::class, 'index']);
        Route::get('/bookings/{id}', [\App\Http\Controllers\Provider\BookingController::class, 'show']);
        Route::patch('/bookings/{id}/status', [\App\Http\Controllers\Provider\BookingController::class, 'updateStatus']);

        // --- Quản lý Đánh giá ---
        Route::get('/reviews', [\App\Http\Controllers\Provider\ReviewController::class, 'index']);
        Route::post('/reviews/{id}/reply', [\App\Http\Controllers\Provider\ReviewController::class, 'reply']);

        // --- Quản lý Ví tiền & Doanh thu ---
        Route::get('/wallet', [\App\Http\Controllers\Provider\WalletController::class, 'index']);
        Route::get('/wallet/report', [\App\Http\Controllers\Provider\WalletController::class, 'report']);

        // --- Cấu hình cửa hàng ---
        Route::get('/settings', [\App\Http\Controllers\Provider\SettingController::class, 'index']);
        Route::put('/settings', [\App\Http\Controllers\Provider\SettingController::class, 'update']);
    });
});

// ===========================================================
// N8N AUTOMATION ROUTES (Public for local dev)
// ===========================================================
Route::get('/n8n/users', function () {
    // Chỉ lấy những khách CÓ HOẠT ĐỘNG trong vòng 24h qua và chưa nhận email trong 24h qua
    $timeFrame = now()->subHours(24);

    $users = \App\Models\User::where('role', 'tourist')
        ->where('status', 'active')
        // 1. CHỐNG GỬI TRÙNG TRONG NGÀY: Nếu vừa gửi trong 24h thì không quét lại nữa
        ->where(function ($q) use ($timeFrame) {
            $q->whereNull('last_promo_sent_at')
              ->orWhere('last_promo_sent_at', '<', $timeFrame);
        })
        // 2. CHỈ LẤY ĐƠN HÀNG MỚI (Đã gỡ bỏ giới hạn 24h để phục vụ test)
        ->where(function ($q) {
            $q->whereNull('last_promo_sent_at')
              ->orWhereHas('bookings', function ($bq) {
                  $bq->where('payment_status', 'paid');
              });
        })
        ->withCount(['bookings' => function ($query) {
            $query->where('payment_status', 'paid');
        }])
        ->get()
        ->map(function($user) {
            $user->bookings_count = (int) $user->bookings_count;
            return $user;
        });
        
    return response()->json([
        'success' => true,
        'data' => $users
    ]);
});

// API Đánh dấu User đã được gửi Email
Route::post('/n8n/users/{id}/mark-emailed', function ($id) {
    if (!\Illuminate\Support\Str::isUuid($id)) {
        return response()->json(['success' => false, 'message' => 'Invalid UUID'], 400);
    }
    
    $user = \App\Models\User::find($id);
    if ($user) {
        $user->last_promo_sent_at = now();
        $user->save();
        return response()->json(['success' => true, 'message' => 'Đã đánh dấu báo cáo gửi email thành công.']);
    }
    return response()->json(['success' => false, 'message' => 'User not found'], 404);
});

// API DÀNH RIÊNG CHO DEV TEST: Xóa trạng thái đã gửi để test đi test lại
Route::get('/n8n/users/reset-testing', function () {
    \App\Models\User::whereNotNull('last_promo_sent_at')->update(['last_promo_sent_at' => null]);
    return response()->json(['success' => true, 'message' => 'Đã reset toàn bộ trạng thái email. Các user đã hiển thị lại!']);
});

Route::get('/n8n/bookings', [\App\Http\Controllers\Admin\BookingController::class, 'index']);
Route::get('/n8n/user-history/{userId}', function ($userId) {
    if (!\Illuminate\Support\Str::isUuid($userId)) {
        return response()->json(['success' => false, 'message' => 'Invalid UUID'], 400);
    }
    $bookings = \App\Models\Booking::where('user_id', $userId)->with('service.media')->get();
    $paidCount = \App\Models\Booking::where('user_id', $userId)->where('payment_status', 'paid')->count();
    $totalCount = $bookings->count();
    
    return response()->json([
        'success' => true,
        'paid_bookings_count' => $paidCount,
        'total_bookings_count' => $totalCount,
        'data' => $bookings
    ]);
});
Route::get('/n8n/services', function () {
    return response()->json([
        'success' => true,
        'data' => \App\Models\Service::with('media')->where('status', 'active')->get()
    ]);
});
Route::get('/n8n/hotels', function (\Illuminate\Http\Request $request) {
    $locationId = $request->query('location_id');
    $query = \App\Models\Service::with('media')
        ->where('type', 'hotel')
        ->where('status', 'active');
    
    if ($locationId) {
        $query->where('location_id', $locationId);
    }

    return response()->json([
        'success' => true,
        'data' => $query->get()
    ]);
});
Route::post('/social/post', [\App\Http\Controllers\Social\SocialController::class, 'createPost']);

// N8n tạo Voucher
Route::post('/n8n/coupons', function (\Illuminate\Http\Request $request) {
    $validated = $request->validate([
        'code' => 'required|string|max:50',
        'type' => 'required|in:percent,fixed',
        'discount_value' => 'required|numeric|min:0',
        'min_order_amount' => 'nullable|numeric|min:0',
        'usage_limit' => 'nullable|integer|min:1',
        'per_user_limit' => 'nullable|integer|min:1',
        'valid_from' => 'nullable|date',
        'valid_until' => 'nullable|date|after_or_equal:valid_from',
    ]);

    try {
        $coupon = \App\Models\Coupon::firstOrCreate(
            ['code' => $validated['code']],
            $validated
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Lấy/Tạo mã giảm giá từ n8n thành công',
            'data' => $coupon
        ], 201);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lỗi khi tạo mã giảm giá: ' . $e->getMessage()
        ], 500);
    }
});
