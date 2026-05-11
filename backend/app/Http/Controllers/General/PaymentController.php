<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Khởi tạo thanh toán - trả về thông tin cần thiết
     * POST /api/payment/initiate
     * Body: { booking_id, payment_method: 'sepay'|'wallet' }
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'booking_id'      => 'required|uuid|exists:bookings,id',
            'payment_method'  => 'required|in:sepay',
        ]);

        $userId  = $request->user->id;
        $booking = Booking::where('id', $request->booking_id)
            ->where('user_id', $userId)
            ->where('payment_status', 'pending')
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn đặt chỗ hoặc đơn đã được thanh toán.',
            ], 404);
        }

        // SePay QR payment
        return $this->initiateSepayPayment($booking);
    }


    /**
     * Tạo thông tin thanh toán SePay QR
     * SePay dùng chuyển khoản ngân hàng + nội dung tự động matching
     */
    private function initiateSepayPayment(Booking $booking)
    {
        // SePay dùng quy ước: nội dung chuyển khoản = booking_code
        // QR Code STIipe: https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=CONTENT
        $bankAccount = config('services.sepay.account_number', env('SEPAY_ACCOUNT_NUMBER', '0123456789'));
        $bankCode    = config('services.sepay.bank_code', env('SEPAY_BANK_CODE', 'MB'));
        $amount      = (int) $booking->total_amount;
        $content     = 'THANHTOAN ' . $booking->booking_code; // Nội dung matching

        // URL QR SePay công khai (không cần API key cho static QR)
        $qrUrl = "https://qr.sepay.vn/img?acc={$bankAccount}&bank={$bankCode}&amount={$amount}&des=" . urlencode($content) . "&template=compact2&download=false";

        return response()->json([
            'success' => true,
            'message' => 'Vui lòng quét mã QR để hoàn tất thanh toán.',
            'data'    => [
                'booking_id'     => $booking->id,
                'booking_code'   => $booking->booking_code,
                'total_amount'   => $booking->total_amount,
                'payment_method' => 'sepay',
                'bank_account'   => $bankAccount,
                'bank_code'      => $bankCode,
                'transfer_content' => $content,
                'qr_url'         => $qrUrl,
                'expires_at'     => now()->addMinutes(15)->toISOString(),
            ],
        ]);
    }

    /**
     * Webhook từ SePay khi nhận được thanh toán
     * POST /api/payment/sepay/webhook
     * (Không cần auth, dùng token bí mật từ header)
     */
    public function sepayWebhook(Request $request)
    {
        // Ghi log ngay lập tức để debug
        Log::info('--- SEPAY WEBHOOK START ---');
        Log::info('Headers:', $request->headers->all());
        Log::info('Payload:', $request->all());

        $data = $request->all();

        // Xác thực token bí mật từ SePay
        $webhookToken = env('SEPAY_WEBHOOK_TOKEN', '');
        $authHeader = $request->header('Authorization');

        if ($webhookToken) {
            if (!$authHeader || str_replace('Apikey ', '', $authHeader) !== $webhookToken) {
                Log::warning('SePay webhook: Unauthorized - Invalid token or header');
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }
        }

        // SePay gửi: transferAmount, transferContent, transactionDate, referenceCode, ...
        $content      = $data['transferContent'] ?? $data['content'] ?? '';
        $amount       = (float) ($data['transferAmount'] ?? $data['amount'] ?? 0);

        // Tìm booking từ nội dung chuyển khoản
        // Regex linh hoạt: tìm chuỗi bắt đầu bằng BK, theo sau là chữ cái và số (có thể có hoặc không có dấu gạch ngang)
        preg_match('/BK-?[A-Z0-9]+-?\d+/i', $content, $matches);
        $rawBookingCode = $matches[0] ?? null;

        if (!$rawBookingCode) {
            Log::info('SePay webhook: No booking code found in content: ' . $content);
            return response()->json(['success' => true, 'message' => 'Không tìm thấy mã đặt chỗ']);
        }

        // Tìm đơn hàng: thử khớp chính xác trước, nếu không được thì thử xóa dấu gạch ngang
        $booking = Booking::where('booking_code', $rawBookingCode)
            ->where('payment_status', 'pending')
            ->first();

        if (!$booking) {
            // Thử tìm bằng cách xóa dấu gạch ngang (dành cho trường hợp ngân hàng tự xóa dấu -)
            $normalizedCode = str_replace('-', '', $rawBookingCode);
            $booking = Booking::whereRaw("REPLACE(booking_code, '-', '') = ?", [$normalizedCode])
                ->where('payment_status', 'pending')
                ->first();
        }

        if (!$booking) {
            Log::info('SePay webhook: Booking not found or already paid: ' . $rawBookingCode);
            return response()->json(['success' => true, 'message' => 'Đã xử lý hoặc không tìm thấy']);
        }

        // Kiểm tra số tiền (cho phép sai lệch 1000 VND)
        if (abs($amount - $booking->total_amount) > 1000) {
            Log::warning("SePay webhook: Amount mismatch. Expected {$booking->total_amount}, got {$amount}");
            // Vẫn confirm nếu đủ tiền (có thể hơn)
            if ($amount < $booking->total_amount - 1000) {
                return response()->json(['success' => true, 'message' => 'Số tiền không khớp']);
            }
        }

        // Cập nhật trạng thái booking
        DB::transaction(function () use ($booking, $data) {
            $booking->payment_method = 'sepay';
            $booking->payment_status = 'paid';
            $booking->paid_at        = now();
            $booking->status         = 'confirmed';
            $booking->save();

            // Gửi tin nhắn tự động xác nhận qua Chat
            try {
                $chatService = app(\App\Services\ChatService::class);
                $chatService->sendBookingConfirmedMessage($booking);
            } catch (\Exception $e) {
                Log::error("Error sending automated chat message: " . $e->getMessage());
            }

            // Ghi log transaction vào wallet của provider (escrow)
            Log::info("Booking {$booking->booking_code} confirmed via SePay");
        });

        return response()->json(['success' => true, 'message' => 'Xác nhận thanh toán thành công']);
    }

    /**
     * Kiểm tra trạng thái thanh toán (Polling từ frontend)
     * GET /api/payment/status/{booking_id}
     */
    public function checkStatus(Request $request, string $bookingId)
    {
        $userId  = $request->user->id;
        $booking = Booking::where('id', $bookingId)
            ->where('user_id', $userId)
            ->select(['id', 'booking_code', 'payment_status', 'status', 'paid_at', 'total_amount'])
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'booking_id'     => $booking->id,
                'booking_code'   => $booking->booking_code,
                'payment_status' => $booking->payment_status,
                'status'         => $booking->status,
                'paid_at'        => $booking->paid_at,
                'total_amount'   => $booking->total_amount,
            ],
        ]);
    }

    /**
     * Lấy số dư ví hiện tại của user
     * GET /api/wallet/balance
     */
    public function walletBalance(Request $request)
    {
        $userId = $request->user->id;
        $wallet = Wallet::where('user_id', $userId)->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'balance'        => $wallet?->balance ?? 0,
                'locked_balance' => $wallet?->locked_balance ?? 0,
                'currency'       => $wallet?->currency ?? 'VND',
            ],
        ]);
    }
}
