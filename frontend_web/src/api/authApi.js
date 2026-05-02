import { data } from 'react-router-dom';
import axiosClient from './axios';

/**
 * Service xử lý các API xác thực với Backend Laravel
 */
const authApi = {
    /**
     * Đồng bộ người dùng từ Firebase về Postgres
     * @param {string} idToken - Firebase ID Token
     * @param {object} data - Dữ liệu bổ sung (displayName, ...)
     * @returns {Promise} - Kết quả từ Backend
     */
    syncUser: (idToken, data = {}) => {
        const url = '/auth/post/sync';
        return axiosClient.post(url, data, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
    },

    /**
     * Lấy profile người dùng hiện tại từ Backend
     * @param {string} idToken - Firebase ID Token
     * @returns {Promise}
     */
    getProfile: (idToken) => {
        const url = '/user/get/profile';
        return axiosClient.get(url, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
    },

    checkSocialStatus: (idToken) => {
        const url = '/user/get/social-status';
        return axiosClient.get(url, {
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
    },

    getSocialProfile: (idToken) => {
        const url = '/user/get/social-profile';
        return axiosClient.get(url, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
    },

    syncSocialProfile: (idToken, data) => {
        const url = '/auth/post/sync-social-profile';
        return axiosClient.post(url, data, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        });
    }
};

export default authApi;
