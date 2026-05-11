import axiosInstance from './axios';

const chatApi = {
    // Lấy danh sách hội thoại
    getConversations: () => axiosInstance.get('/chat/conversations'),

    // Lấy tin nhắn của một hội thoại
    getMessages: (conversationId, page = 1) => axiosInstance.get(`/chat/conversations/${conversationId}/messages?page=${page}`),

    // Gửi tin nhắn mới
    sendMessage: (data) => axiosInstance.post('/chat/messages', data),

    // Lấy số lượng tin nhắn chưa đọc
    getUnreadCount: () => axiosInstance.get('/chat/unread-count'),
};

export default chatApi;
