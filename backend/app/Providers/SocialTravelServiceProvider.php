<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class SocialTravelServiceProvider extends ServiceProvider
{
    /**
     * Nơi đăng ký các dịch vụ (Register)
     * Thường dùng để "Binding" các Interface với Implementation
     */
    public function register(): void
    {
        // Ví dụ: Bạn có thể đăng ký một dịch vụ thanh toán ở đây
        // $this->app->bind('PaymentGateway', function ($app) {
        //     return new VnPayService($app['config']['vnpay']);
        // });
    }

    /**
     * Nơi thiết lập các dịch vụ (Boot)
     * Thường dùng để chia sẻ dữ liệu chung cho toàn bộ App
     */
    public function boot(): void
    {
        // Ví dụ: Ép độ dài chuỗi mặc định cho database cũ (PostgreSQL thường không cần)
        Schema::defaultStringLength(191);

        // Ví dụ: Gắn thêm các "Macro" để tùy biến các chức năng của Laravel
        // \Illuminate\Support\Str::macro('toTravelId', function ($id) {
        //     return 'STB-' . $id;
        // });
    }
}
