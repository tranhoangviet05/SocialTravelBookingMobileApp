import axios from './axios';
import { API_ENDPOINTS } from '../utils/ConstantSystems';

const socialApi = {
    // Posts
    getFeed: (limit = 10, page = 1, params = {}) => axios.get(API_ENDPOINTS.SOCIAL_POSTS, { params: { limit, page, ...params } }),
    createPost: (data) => axios.post(API_ENDPOINTS.SOCIAL_POSTS, data),
    getPostDetail: (id) => axios.get(API_ENDPOINTS.SOCIAL_POSTS + '/' + id),
    deletePost: (id) => axios.delete(API_ENDPOINTS.SOCIAL_POSTS + '/' + id),
    searchUsers: (query) => axios.get('/social/users/search', { params: { q: query } }),
    getUserPosts: (userId) => axios.get(API_ENDPOINTS.SOCIAL_USER_POSTS(userId)),
    getUserReplies: (userId) => axios.get(API_ENDPOINTS.SOCIAL_USER_REPLIES(userId)),
    getUserProfile: (userId) => axios.get(API_ENDPOINTS.SOCIAL_USER_PROFILE(userId)),

    // Interactions
    toggleLike: (postId) => axios.post(API_ENDPOINTS.SOCIAL_LIKE(postId)),
    getComments: (postId) => axios.get(API_ENDPOINTS.SOCIAL_COMMENTS(postId)),
    addComment: (postId, content, serviceId = null) => axios.post(API_ENDPOINTS.SOCIAL_COMMENTS(postId), { 
        content, 
        service_id: serviceId 
    }),

    // Follows
    toggleFollow: (userId) => axios.post(API_ENDPOINTS.SOCIAL_FOLLOW(userId)),
    getFollowers: (userId) => axios.get(API_ENDPOINTS.SOCIAL_FOLLOWERS(userId)),
    getFollowing: (userId) => axios.get(API_ENDPOINTS.SOCIAL_FOLLOWING(userId)),
    getSuggestions: () => axios.get(API_ENDPOINTS.SOCIAL_SUGGESTIONS),

    // Tags
    getTagSuggestions: (query) => axios.get(`${API_ENDPOINTS.SOCIAL_TAG_SUGGESTIONS}?q=${query}`),

    // Notifications
    getNotifications: (type = 'all', page = 1) => axios.get('/social/notifications', { params: { type, page } }),
    markNotificationAsRead: (id) => axios.post(`/social/notifications/${id}/read`),
    markAllNotificationsAsRead: () => axios.post('/social/notifications/read-all'),
};

export default socialApi;
