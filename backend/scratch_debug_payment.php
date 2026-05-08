<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Booking;

$booking = Booking::latest()->first();
if (!$booking) {
    echo "No booking found";
    exit;
}

$bankAccount = env('SEPAY_ACCOUNT_NUMBER', '0123456789');
$bankCode    = env('SEPAY_BANK_CODE', 'MB');
$amount      = (int) $booking->total_amount;
$content     = 'THANHTOAN ' . $booking->booking_code;

$qrUrl = "https://qr.sepay.vn/img?acc={$bankAccount}&bank={$bankCode}&amount={$amount}&des=" . urlencode($content) . "&template=compact2&download=false";

echo "Booking ID: " . $booking->id . "\n";
echo "Booking Code: " . $booking->booking_code . "\n";
echo "Amount: " . $amount . "\n";
echo "Account: " . $bankAccount . "\n";
echo "Bank: " . $bankCode . "\n";
echo "QR URL: " . $qrUrl . "\n";
