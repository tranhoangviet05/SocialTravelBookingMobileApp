import axios from './axios';

const adminApi = {
    // Dashboard
    getDashboardStats: () => axios.get('/admin/dashboard/stats'),

    // Quản lý người dùng
    getAllUsers: (params = {}) => axios.get('/admin/users', { params }),
    updateUserRole: (id, role) => axios.patch(`/admin/users/${id}/role`, { role }),
    updateUserStatus: (id, status) => axios.patch(`/admin/users/${id}/status`, { status }),

    // Quản lý địa điểm
    getAllLocations: (params = {}) => axios.get('/general/get/locations', { params }),
    createLocation: (data) => axios.post('/admin/locations', data),
    updateLocation: (id, data) => axios.put(`/admin/locations/${id}`, data),
    deleteLocation: (id) => axios.delete(`/admin/locations/${id}`),

    // Quản lý danh mục
    getAllCategories: (params = {}) => axios.get('/general/get/categories', { params }),
    createCategory: (data) => axios.post('/admin/categories', data),
    updateCategory: (id, data) => axios.put(`/admin/categories/${id}`, data),
    deleteCategory: (id) => axios.delete(`/admin/categories/${id}`),

    // Quản lý dịch vụ
    getAllServices: (params = {}) => axios.get('/admin/services', { params }),
    getServiceDetail: (id) => axios.get(`/admin/services/${id}`),
    createService: (data) => axios.post('/admin/services', data),
    updateService: (id, data) => axios.put(`/admin/services/${id}`, data),
    updateServiceStatus: (id, status, rejectionReason = null) =>
        axios.patch(`/admin/services/${id}/status`, { status, rejection_reason: rejectionReason }),
    deleteService: (id) => axios.delete(`/admin/services/${id}`),

    // Quản lý đặt chỗ
    getAllBookings: (params = {}) => axios.get('/admin/bookings', { params }),
    getBookingDetail: (id) => axios.get(`/admin/bookings/${id}`),
    updateBookingStatus: (id, status, cancelReason = null) =>
        axios.patch(`/admin/bookings/${id}/status`, { status, cancel_reason: cancelReason }),

    // Quản lý nhà cung cấp
    getAllProviders: (params = {}) => axios.get('/admin/providers', { params }),
    getProviderDetail: (id) => axios.get(`/admin/providers/${id}`),
    updateProviderStatus: (id, status, rejectionReason = null) =>
        axios.patch(`/admin/providers/${id}/status`, { status, rejection_reason: rejectionReason }),

    // Quản lý đánh giá
    getAllReviews: (params = {}) => axios.get('/admin/reviews', { params }),
    replyToReview: (id, reply) => axios.post(`/admin/reviews/${id}/reply`, { reply }),
    deleteReview: (id) => axios.delete(`/admin/reviews/${id}`),

    // Quản lý mã giảm giá
    getAllCoupons: (params = {}) => axios.get('/admin/coupons', { params }),
    createCoupon: (data) => axios.post('/admin/coupons', data),
    updateCoupon: (id, data) => axios.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id) => axios.delete(`/admin/coupons/${id}`),

    // Quản lý báo cáo vi phạm
    getAllReports: (params = {}) => axios.get('/admin/reports', { params }),
    getReportDetail: (id) => axios.get(`/admin/reports/${id}`),
    resolveReport: (id, data) => axios.patch(`/admin/reports/${id}/resolve`, data),

    // Cài đặt hệ thống
    getSettings: () => axios.get('/admin/settings'),
    updateSettings: (settings) => axios.post('/admin/settings/batch', { settings }),

    // Tự động hóa n8n
    getAutomationWorkflows: () => axios.get('/admin/automation/workflows'),
    toggleAutomationWorkflow: (id) => axios.patch(`/admin/automation/workflows/${id}/toggle`),
};

export default adminApi;
