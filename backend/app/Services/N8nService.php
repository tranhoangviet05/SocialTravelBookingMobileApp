<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class N8nService
{
    protected $baseUrl;
    protected $webhookToken;

    public function __construct()
    {
        // Tạm thời để trống hoặc lấy từ config nếu có
        $this->baseUrl = config('services.n8n.url', 'http://localhost:5678');
    }

    /**
     * Gửi dữ liệu sang n8n Webhook
     */
    public function triggerWebhook($path, $data)
    {
        try {
            $response = Http::post("{$this->baseUrl}/{$path}", $data);
            return $response->successful();
        } catch (\Exception $e) {
            Log::error("N8n Webhook Error: " . $e->getMessage());
            return false;
        }
    }
}
