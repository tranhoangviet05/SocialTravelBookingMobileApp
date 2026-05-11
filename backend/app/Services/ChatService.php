<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Booking;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Support\Facades\DB;

class ChatService
{
    /**
     * Gửi tin nhắn tự động từ Provider tới Tourist khi đơn hàng được xác nhận
     */
    public function sendBookingConfirmedMessage(Booking $booking)
    {
        $booking->load(['user', 'service.provider.user']);

        $tourist = $booking->user;
        $providerUser = $booking->service->provider->user;

        if (!$tourist || !$providerUser) {
            return null;
        }

        $content = "🎉 Chào {$tourist->display_name}, đơn đặt dịch vụ **#{$booking->booking_code}** ({$booking->service->name}) của bạn đã được xác nhận thành công!\n\n" .
                   "📅 **Thông tin chi tiết:**\n" .
                   "- Thời gian: " . ($booking->start_date ? $booking->start_date->format('d/m/Y') : 'N/A') . "\n" .
                   "- Trạng thái: Đã thanh toán & Đã xác nhận\n\n" .
                   "Chúng tôi rất mong được phục vụ bạn. Hãy chú ý thời gian và chuẩn bị sẵn sàng cho chuyến đi nhé! Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại nhắn tin trực tiếp cho chúng tôi tại đây.";

        return $this->sendMessage($providerUser->id, $tourist->id, $content);
    }

    /**
     * Gửi tin nhắn từ Tourist tới Provider khi yêu cầu Check-in
     */
    public function sendCheckInRequestMessage(Booking $booking)
    {
        $booking->load(['user', 'service.provider.user']);
        $tourist = $booking->user;
        $providerUser = $booking->service->provider->user;

        if (!$tourist || !$providerUser) return null;

        $content = "🔔 **Yêu cầu Check-in:** Tôi đã có mặt tại địa điểm và muốn thực hiện check-in cho đơn hàng **#{$booking->booking_code}**. Vui lòng xác nhận giúp tôi!";

        return $this->sendMessage($tourist->id, $providerUser->id, $content);
    }

    /**
     * Gửi tin nhắn từ Provider tới Tourist khi xác nhận Check-in
     */
    public function sendCheckInConfirmedMessage(Booking $booking)
    {
        $booking->load(['user', 'service.provider.user']);
        $tourist = $booking->user;
        $providerUser = $booking->service->provider->user;

        if (!$tourist || !$providerUser) return null;

        $content = "✅ **Check-in thành công:** Chúng tôi đã xác nhận bạn đã check-in cho đơn hàng **#{$booking->booking_code}**. Chúc bạn có một trải nghiệm tuyệt vời!";

        return $this->sendMessage($providerUser->id, $tourist->id, $content);
    }

    /**
     * Gửi tin nhắn từ Tourist tới Provider khi hoàn tác Check-in
     */
    public function sendUndoCheckInMessage(Booking $booking)
    {
        $booking->load(['user', 'service.provider.user']);
        $tourist = $booking->user;
        $providerUser = $booking->service->provider->user;

        if (!$tourist || !$providerUser) return null;

        $content = "↩️ **Hoàn tác Check-in:** Tôi xin lỗi, tôi đã nhấn nhầm nút check-in cho đơn hàng **#{$booking->booking_code}**. Vui lòng bỏ qua yêu cầu trước đó.";

        return $this->sendMessage($tourist->id, $providerUser->id, $content);
    }

    /**
     * Gửi tin nhắn từ Tourist tới Provider khi Check-out
     */
    public function sendCheckOutMessage(Booking $booking)
    {
        $booking->load(['user', 'service.provider.user']);
        $tourist = $booking->user;
        $providerUser = $booking->service->provider->user;

        if (!$tourist || !$providerUser) return null;

        $content = "🏁 **Check-out:** Tôi đã hoàn thành việc sử dụng dịch vụ cho đơn hàng **#{$booking->booking_code}** và đã thực hiện check-out. Cảm ơn bạn rất nhiều!";

        return $this->sendMessage($tourist->id, $providerUser->id, $content);
    }

    /**
     * Gửi tin nhắn cơ bản giữa 2 user
     */
    public function sendMessage($senderId, $recipientId, $content)
    {
        return DB::transaction(function() use ($senderId, $recipientId, $content) {
            // Tìm hoặc tạo conversation
            $u1 = $senderId < $recipientId ? $senderId : $recipientId;
            $u2 = $senderId < $recipientId ? $recipientId : $senderId;

            $conversation = Conversation::firstOrCreate(
                ['user_one' => $u1, 'user_two' => $u2],
                ['last_message_at' => now()]
            );

            $conversation->last_message_at = now();
            $conversation->save();

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $senderId,
                'content' => $content,
                'is_read' => false,
            ]);

            // Broadcast event để cập nhật UI realtime
            broadcast(new MessageSent($message))->toOthers();

            return $message;
        });
    }
}
