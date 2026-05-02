<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    /**
     * Tên bảng đặc thù
     */
    protected $table = 'wallet_transactions';

    use HasFactory, HasUuids;

    protected $guarded = [];

    public $timestamps = false; // Schema chỉ có created_at

    // --- QUAN HỆ ---

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
