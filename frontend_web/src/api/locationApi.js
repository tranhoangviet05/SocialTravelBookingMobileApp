import axiosClient from './axios';

const locationApi = {
    /**
     * Lấy danh sách địa điểm (Công khai)
     */
    getAll: (params) => {
        return axiosClient.get('/locations', { params });
    },

    /**
     * Lấy chi tiết địa điểm
     */
    getById: (id) => {
        return axiosClient.get(`/locations/${id}`);
    },

    /**
     * Thêm địa điểm mới (Admin)
     */
    create: (data) => {
        return axiosClient.post('/admin/locations', data);
    },

    /**
     * Cập nhật địa điểm (Admin)
     */
    update: (id, data) => {
        return axiosClient.put(`/admin/locations/${id}`, data);
    },

    /**
     * Xóa địa điểm (Admin)
     */
    delete: (id) => {
        return axiosClient.delete(`/admin/locations/${id}`);
    }
};

export default locationApi;
