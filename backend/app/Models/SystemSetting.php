<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    /**
     * Tên bảng đặc thù
     */
    protected $table = 'system_settings';

    use HasFactory;

    /**
     * Bảng này dùng 'key' làm khóa chính thay vì ID số
     */
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];

    public $timestamps = false; // Dùng updated_at riêng biệt

    // --- QUAN HỆ ---

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
