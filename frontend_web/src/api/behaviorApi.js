import axiosClient from './axios';
import { getCurrentUser } from '../firebase/services/authService';

/**
 * Service xử lý các API hành vi và gợi ý
 */
const behaviorApi = {
    /**
     * Gửi dữ liệu hành vi về backend
     */
    track: async (data) => {
        const url = '/track-behavior';
        return axiosClient.post(url, data);
    },
    
    /**
     * Lấy danh sách gợi ý cho user hiện tại
     */
    getRecommendations: async () => {
        const url = '/recommendations';
        return axiosClient.get(url);
    }
};

export default behaviorApi;
