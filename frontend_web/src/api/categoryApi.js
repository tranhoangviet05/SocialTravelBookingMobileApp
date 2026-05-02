import axiosClient from './axios';

const categoryApi = {
    /**
     * Lấy danh sách danh mục (Công khai)
     */
    getAll: () => {
        return axiosClient.get('/general/get/categories');
    },

    /**
     * Lấy chi tiết danh mục
     */
    getBySlug: (slug, params) => {
        return axiosClient.get(`/general/get/categories/${slug}`, { params });
    },

    /**
     * Thêm danh mục mới (Admin)
     */
    create: (data) => {
        return axiosClient.post('/admin/categories', data);
    },

    /**
     * Cập nhật danh mục (Admin)
     */
    update: (id, data) => {
        return axiosClient.put(`/admin/categories/${id}`, data);
    },

    /**
     * Xóa danh mục (Admin)
     */
    delete: (id) => {
        return axiosClient.delete(`/admin/categories/${id}`);
    }
};

export default categoryApi;
