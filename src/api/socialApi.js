import apiClient from './apiClient';

export const socialApi = {
  // Lấy danh sách bài viết cho News Feed
  getPosts: async (page = 1) => {
    return await apiClient.get(`/social/posts?page=${page}`);
  },

  // Lấy chi tiết một bài viết và bình luận
  getPostDetail: async (postId) => {
    return await apiClient.get(`/social/posts/${postId}`);
  },

  // Lấy danh sách bình luận của bài viết
  getComments: async (postId) => {
    return await apiClient.get(`/social/posts/${postId}/comments`);
  },

  // (Optional) Các API khác nếu cần cho tương lai
  getLikedPosts: async () => {
    return await apiClient.get('/social/posts/liked');
  }
};
