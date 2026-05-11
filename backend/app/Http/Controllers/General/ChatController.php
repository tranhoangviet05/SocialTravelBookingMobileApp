<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Lấy số lượng tin nhắn chưa đọc
     */
    public function getUnreadCount(Request $request)
    {
        $userId = $request->user->id;
        
        // Đếm số tin nhắn chưa đọc mà người nhận là user hiện tại
        // Logic: Tìm các conversation của user, rồi đếm message trong đó mà sender_id != user_id và is_read = false
        $unreadCount = Message::whereHas('conversation', function($query) use ($userId) {
            $query->where('user_one', $userId)->orWhere('user_two', $userId);
        })
        ->where('sender_id', '!=', $userId)
        ->where('is_read', false)
        ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $unreadCount
            ]
        ]);
    }

    public function getConversations(Request $request)
    {
        $userId = $request->user->id;
        $conversations = Conversation::where('user_one', $userId)
            ->orWhere('user_two', $userId)
            ->with([
                'userOne:id,display_name,avatar_url', 
                'userOne.providerProfile:user_id,business_name',
                'userTwo:id,display_name,avatar_url', 
                'userTwo.providerProfile:user_id,business_name',
                'messages' => function($q) {
                    $q->latest()->limit(1);
                }
            ])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function($conv) use ($userId) {
                $otherUser = $conv->user_one === $userId ? $conv->userTwo : $conv->userOne;
                
                // Lấy business_name nếu là nhà cung cấp
                $businessName = $otherUser->providerProfile ? $otherUser->providerProfile->business_name : null;
                
                return [
                    'id' => $conv->id,
                    'other_user' => $otherUser,
                    'business_name' => $businessName,
                    'last_message' => $conv->messages->first(),
                    'last_message_at' => $conv->last_message_at
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $conversations
        ]);
    }

    /**
     * Lấy tin nhắn của một hội thoại
     */
    public function getMessages(Request $request, $conversationId)
    {
        $userId = $request->user->id;

        $conversation = Conversation::find($conversationId);
        if (!$conversation || ($conversation->user_one !== $userId && $conversation->user_two !== $userId)) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hội thoại'], 404);
        }

        // Đánh dấu đã đọc cho các tin nhắn từ người khác
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
            ]
        ]);
    }

    /**
     * Gửi tin nhắn hoặc bắt đầu hội thoại mới
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required_without:conversation_id|uuid',
            'conversation_id' => 'required_without:recipient_id|uuid',
            'content' => 'required|string'
        ]);

        $userId = $request->user->id;
        $content = $request->content;
        $conversationId = $request->conversation_id;

        return DB::transaction(function() use ($userId, $content, $conversationId, $request) {
            if (!$conversationId) {
                $recipientId = $request->recipient_id;
                if ($userId === $recipientId) {
                    return response()->json(['success' => false, 'message' => 'Không thể tự gửi tin nhắn cho bản thân'], 400);
                }

                // Tìm hoặc tạo conversation
                $u1 = $userId < $recipientId ? $userId : $recipientId;
                $u2 = $userId < $recipientId ? $recipientId : $userId;

                $conversation = Conversation::firstOrCreate(
                    ['user_one' => $u1, 'user_two' => $u2],
                    ['last_message_at' => now()]
                );
                $conversationId = $conversation->id;
            } else {
                $conversation = Conversation::find($conversationId);
                if (!$conversation) {
                    return response()->json(['success' => false, 'message' => 'Hội thoại không tồn tại'], 404);
                }
                $conversation->last_message_at = now();
                $conversation->save();
            }

            $message = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => $userId,
                'content' => $content,
            ]);

            // Broadcast event
            broadcast(new \App\Events\MessageSent($message))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $message
            ]);
        });
    }
}
