<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\ProviderProfile;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    private function getProvider(Request $request)
    {
        $user = $request->input('user');
        return ProviderProfile::where('user_id', $user->id)->first();
    }

    /**
     * Lấy trạng thái ví và lịch sử giao dịch
     */
    public function index(Request $request)
    {
        $user = $request->input('user');
        $provider = $this->getProvider($request);
        
        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ nhà cung cấp.'], 404);
        }

        // Lấy hoặc tạo ví nếu chưa có
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'locked_balance' => 0, 'currency' => 'VND']
        );

        // Lấy lịch sử giao dịch (nối với đơn hàng để biết thông tin dịch vụ)
        $transactions = WalletTransaction::where('wallet_id', $wallet->id)
            ->with('booking.service')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // Thống kê nhanh: Tổng doanh thu đã nhận
        $totalEarned = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', 'booking_payment')
            ->sum('amount');

        return response()->json([
            'success' => true,
            'data' => [
                'wallet' => $wallet,
                'transactions' => $transactions,
                'total_earned' => $totalEarned
            ]
        ]);
    }

    /**
     * Thống kê doanh thu theo tháng (cho biểu đồ)
     */
    public function report(Request $request)
    {
        $user = $request->input('user');
        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) return response()->json(['success' => true, 'data' => []]);

        // Lấy doanh thu 6 tháng gần nhất
        $report = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('type', 'booking_payment')
            ->select(
                DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
                DB::raw("SUM(amount) as total")
            )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }
}
