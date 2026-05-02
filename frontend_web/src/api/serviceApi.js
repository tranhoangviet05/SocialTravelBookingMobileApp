import axiosClient from './axios';

const serviceApi = {
    // Lấy danh sách dịch vụ (tour + accommodation) với filter
    getServices: (params = {}) => {
        return axiosClient.get('/general/get/services', { params });
    },

    // Lấy chi tiết 1 dịch vụ
    getService: (id) => {
        return axiosClient.get(`/general/get/services/detail/${id}`);
    },

    // Lấy danh sách loại dịch vụ (tour / accommodation)
    getCategories: () => {
        return axiosClient.get('/service-categories');
    },

    // Lấy địa điểm nổi bật
    getLocations: () => {
        return axiosClient.get('/locations');
    },

    // Tạo đặt chỗ (booking)
    createBooking: (serviceId, bookingData) => {
        return axiosClient.post('/bookings', {
            service_id: serviceId,
            ...bookingData,
        });
    },

    // Lấy đánh giá của 1 dịch vụ
    getReviews: (serviceId, page = 1) => {
        return axiosClient.get(`/services/${serviceId}/reviews`, {
            params: { page }
        });
    },

    // Gửi đánh giá
    createReview: (serviceId, reviewData) => {
        return axiosClient.post(`/services/${serviceId}/reviews`, reviewData);
    },

    // Tìm kiếm dịch vụ (search)
    search: (query, filters = {}) => {
        return axiosClient.get('/general/get/services', {
            params: { q: query, ...filters }
        });
    },
};

export default serviceApi;