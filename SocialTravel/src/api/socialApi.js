import apiClient from './apiClient';

export const socialApi = {
  // Đồng bộ người dùng với hệ thống
  syncUser: async () => {
    return await apiClient.post('/auth/post/sync');
  },

  // Upload file
  uploadFiles: async (formData) => {
    return await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Láº¥y báº£ng tin (News Feed)
  getFeed: async (limit = 10, page = 1, options = {}) => {
    return await apiClient.get('/social/posts', {
      params: { limit, page, ...options }
    });
  },

  // Kiểm tra hồ sơ mạng xã hội
  checkProfile: async () => {
    return await apiClient.get('/user/get/social-status');
  },

  // Khởi tạo hồ sơ mạng xã hội
  createProfile: async (data) => {
    return await apiClient.post('/auth/post/sync-social-profile', data);
  },

  // Chi tiáº¿t bÃ i viáº¿t
  getPostDetail: async (postId) => {
    return await apiClient.get(`/social/posts/${postId}`);
  },

  // Láº¥y bÃ¬nh luáº­n
  getComments: async (postId) => {
    return await apiClient.get(`/social/posts/${postId}/comments`);
  },

  // TÆ°Æ¡ng tÃ¡c (Like/Unlike)
  toggleLike: async (postId) => {
    return await apiClient.post(`/social/posts/${postId}/like`);
  },

  // Gá»­i bÃ¬nh luáº­n
  comment: async (postId, content) => {
    return await apiClient.post(`/social/posts/${postId}/comments`, { content });
  },

  // Theo dÃµi ngÆ°á»i dÃ¹ng
  toggleFollow: async (userId) => {
    return await apiClient.post(`/social/users/${userId}/follow`);
  },

  // Há»“ sÆ¡ ngÆ°á» i dÃ¹ng
  getUserProfile: async (userId) => {
    return await apiClient.get(`/social/users/${userId}/profile`);
  },

  getMyProfile: async () => {
    return await apiClient.get('/social/profile/me');
  },

  // BÃ i viáº¿t cá»§a ngÆ°á» i dÃ¹ng
  getUserPosts: async (userId) => {
    return await apiClient.get(`/social/users/${userId}/posts`);
  },

  // Câu trả lời của người dùng
  getUserReplies: async (userId) => {
    return await apiClient.get(`/social/users/${userId}/replies`);
  },

  // Táº¡o bÃ i viáº¿t má»›i
  createPost: async (data) => {
    return await apiClient.post('/social/posts', data);
  },

  // Tìm kiếm bài viết
  searchPosts: async (q, options = {}) => {
    return await apiClient.get('/social/posts', {
      params: { q, ...options }
    });
  },

  // Tìm kiếm người dùng
  searchUsers: async (q, limit = 20) => {
    return await apiClient.get('/social/users/search', {
      params: { q, limit }
    });
  },

  // Tìm kiếm tổng hợp
  searchAll: async (q) => {
    return await apiClient.get('/social/search/all', {
      params: { q }
    });
  },

  // Gợi ý người dùng
  getSuggestedUsers: async () => {
    return await apiClient.get('/social/suggestions/users');
  },

  // Ä á»‹a Ä‘iá»ƒm vÃ  Dá»‹ch vá»¥
  getLocations: () => apiClient.get('/general/get/locations'),
  getServices: (query = '') => apiClient.get(`/general/get/services${query ? `?keyword=${query}` : ''}`),
  getTagsSuggestions: () => apiClient.get('/social/tags/suggestions'),

  // Thông báo
  getNotifications: async (type = 'all') => {
    return await apiClient.get('/social/notifications', {
      params: { type }
    });
  },

  markAsRead: async (id) => {
    return await apiClient.post(`/social/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return await apiClient.post('/social/notifications/read-all');
  },
};

export default socialApi;
