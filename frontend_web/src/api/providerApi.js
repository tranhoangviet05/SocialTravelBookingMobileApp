import axios from './axios';

const providerApi = {
    // Setup
    setupProfile: (data) => axios.post('/provider/setup-profile', data),

    // Dashboard
    getStats: () => axios.get('/provider/dashboard/stats'),

    // Dịch vụ
    getServices: (params) => axios.get('/provider/services', { params }),
    getService: (id) => axios.get(`/provider/services/${id}`),
    createService: (data) => axios.post('/provider/services', data),
    updateService: (id, data) => axios.put(`/provider/services/${id}`, data),
    deleteService: (id) => axios.delete(`/provider/services/${id}`),

    // Lịch trình
    getSchedules: (serviceId) => axios.get(`/provider/services/${serviceId}/schedules`),
    createSchedule: (serviceId, data) => axios.post(`/provider/services/${serviceId}/schedules`, data),
    updateSchedule: (serviceId, scheduleId, data) => axios.put(`/provider/services/${serviceId}/schedules/${scheduleId}`, data),
    deleteSchedule: (serviceId, scheduleId) => axios.delete(`/provider/services/${serviceId}/schedules/${scheduleId}`),

    // Tiện nghi / Bao gồm / Không bao gồm
    updateAmenities: (serviceId, data) => axios.put(`/provider/services/${serviceId}/amenities`, data),

    // Loại phòng (Hotel)
    getRoomTypes: (serviceId) => axios.get(`/provider/services/${serviceId}/room-types`),
    createRoomType: (serviceId, data) => axios.post(`/provider/services/${serviceId}/room-types`, data),
    updateRoomType: (serviceId, roomTypeId, data) => axios.put(`/provider/services/${serviceId}/room-types/${roomTypeId}`, data),
    deleteRoomType: (serviceId, roomTypeId) => axios.delete(`/provider/services/${serviceId}/room-types/${roomTypeId}`),
    
    // Trạng thái khả dụng
    getAvailability: (serviceId, params) => axios.get(`/provider/services/${serviceId}/availability`, { params }),
    updateAvailabilityBatch: (serviceId, data) => axios.post(`/provider/services/${serviceId}/availability/batch`, data),

    // Đặt chỗ
    getBookings: (status = 'all') => axios.get('/provider/bookings', { params: { status } }),
    getBooking: (id) => axios.get(`/provider/bookings/${id}`),
    updateBookingStatus: (id, status, cancelReason = '') =>
        axios.patch(`/provider/bookings/${id}/status`, { status, cancel_reason: cancelReason }),

    // Đánh giá
    getReviews: () => axios.get('/provider/reviews'),
    replyReview: (id, reply) => axios.post(`/provider/reviews/${id}/reply`, { reply }),

    // Hỗ trợ (Lấy dữ liệu hệ thống)
    getPublicLocations: () => axios.get('/general/get/locations', { params: { all: 1 } }),
    getPublicCategories: () => axios.get('/general/get/categories', { params: { all: 1 } }),
    
    uploadFiles: (files, folder = 'services') => {
        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));
        formData.append('folder', folder);
        return axios.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Ví tiền & Cài đặt
    getWallet: () => axios.get('/provider/wallet'),
    getWalletReport: () => axios.get('/provider/wallet/report'),
    getSettings: () => axios.get('/provider/settings'),
    updateSettings: (data) => axios.put('/provider/settings', data),
};

export default providerApi;
