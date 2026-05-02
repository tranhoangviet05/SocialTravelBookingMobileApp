<?php
namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Services\SocialService;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    protected $socialService;

    public function __construct(SocialService $socialService)
    {
        $this->socialService = $socialService;
    }

    /**
     * Like / Unlike bài viết
     */
    public function toggleLike(Request $request, string $postId)
    {
        $user = $request->attributes->get('userModel');
        $result = $this->socialService->toggleLike($user, $postId);

        return response()->json([
            'success' => true,
            'data'    => $result
        ]);
    }

    /**
     * Lấy bình luận của bài viết
     */
    public function getComments(string $postId)
    {
        $comments = \App\Models\Comment::with(['author', 'service.media'])
                                       ->where('post_id', $postId)
                                       ->orderBy('created_at', 'asc')
                                       ->get();
        return response()->json([
            'success' => true,
            'data'    => $comments
        ]);
    }

    /**
     * Gửi bình luận
     */
    public function storeComment(Request $request, string $postId)
    {
        try {
            $request->validate([
                'content' => 'required|string',
                'service_id' => 'nullable|uuid'
            ]);
            $user = $request->attributes->get('userModel');

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại hoặc chưa xác thực (User Model missing)',
                ], 401);
            }
            
            $comment = $this->socialService->addComment($user, $postId, $request->content, $request->service_id);

            return response()->json([
                'success' => true,
                'data'    => $comment
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('InteractionController@storeComment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lưu bình luận: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách bình luận của người dùng (Replies)
     */
    public function userReplies(Request $request, string $userId)
    {
        try {
            $replies = $this->socialService->getUserComments($userId, $request->get('limit', 15));

            return response()->json([
                'success' => true,
                'data'    => $replies
            ]);
        } catch (\Throwable $e) {
            \Log::error('InteractionController@userReplies error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải câu trả lời của người dùng'
            ], 500);
        }
    }
}
