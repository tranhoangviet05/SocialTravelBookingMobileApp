import axios from 'axios';
import { auth } from '../firebase/firebase.config';

// Khởi tạo instance của axios
const axiosClient = axios.create({
    // URL của Backend Laravel (Lấy từ .env)
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor: Tự động gắn Token vào mỗi yêu cầu
axiosClient.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Bạn có thể thêm interceptor tại đây để xử lý lỗi hoặc đính kèm Token khi đăng nhập
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Xử lý lỗi chung (ví dụ: 401 logout người dùng)
        return Promise.reject(error);
    }
);

export default axiosClient;