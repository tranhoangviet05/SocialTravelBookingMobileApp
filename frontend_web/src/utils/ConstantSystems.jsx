/**
 * Lưu trữ các giá trị cố định để tránh việc gõ sai chuỗi (hard-coded strings).
 */

export const APP_NAME = "Social Travel Booking";

export const BOOKING_STATUS = {
    PENDING: 'pending',     // Đang chờ xử lý
    CONFIRMED: 'confirmed', // Đã xác nhận
    CANCELLED: 'cancelled', // Đã hủy
    COMPLETED: 'completed'  // Đã hoàn thành
};

export const STORAGE_KEYS = {
    USER_TOKEN: 'user_token',
    USER_INFO: 'user_info',
    THEME: 'app_theme'
};

export const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',

    // Admin
    LOCATIONS: '/locations',
    LOCATIONS_ADMIN: '/admin/locations',
    ADMIN_DASHBOARD: '/admin/dashboard',
    PROVIDER_DASHBOARD: '/provider/dashboard',
    USERS_ADMIN: '/admin/users',
    TOURS_ADMIN: '/admin/tours',
    CATEGORIES_ADMIN: '/admin/categories',
    HOTELS_ADMIN: '/admin/hotels',
    STATS_ADMIN: '/admin/stats',
    REVIEWS_ADMIN: '/admin/reviews',
    COUPONS_ADMIN: '/admin/coupons',
    BOOKINGS_ADMIN: '/admin/bookings',
    PROVIDERS_ADMIN: '/admin/providers',
    REPORTS_ADMIN: '/admin/reports',
    AUTOMATION_ADMIN: '/admin/automation',
    SERVICES_ADMIN: '/admin/services',
    SETTINGS_ADMIN: '/admin/settings',

    // Provider
    PROVIDER_SERVICES: '/provider/services',
    PROVIDER_BOOKINGS: '/provider/bookings',
    PROVIDER_REVIEWS: '/provider/reviews',
    PROVIDER_WALLET: '/provider/wallet',
    PROVIDER_SETTINGS: '/provider/settings',
    PROVIDER_MESSAGES: '/provider/messages',

    // Social
    SOCIAL_POSTS: '/social/posts',
    SOCIAL_LIKE: (postId) => `/social/posts/${postId}/like`,
    SOCIAL_COMMENTS: (postId) => `/social/posts/${postId}/comments`,
    SOCIAL_FOLLOW: (userId) => `/social/users/${userId}/follow`,
    SOCIAL_FOLLOWERS: (userId) => `/social/users/${userId}/followers`,
    SOCIAL_FOLLOWING: (userId) => `/social/users/${userId}/following`,
    SOCIAL_USER_POSTS: (userId) => `/social/users/${userId}/posts`,
    SOCIAL_USER_REPLIES: (userId) => `/social/users/${userId}/replies`,
    SOCIAL_USER_PROFILE: (userId) => `/social/users/${userId}/profile`,
    SOCIAL_SUGGESTIONS: '/social/suggestions/users',
    SOCIAL_TAG_SUGGESTIONS: '/social/tags/suggestions',
};