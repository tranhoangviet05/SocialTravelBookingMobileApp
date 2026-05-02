import axios from 'axios';
import { auth } from '../config/firebase';

/**
 * CẤU HÌNH KẾT NỐI SERVER (CHO ĐIỆN THOẠI THẬT)
 * - Đảm bảo điện thoại và máy tính dùng chung một mạng WiFi.
 * - Đổi IP_LAN bên dưới thành địa chỉ IPv4 của máy tính bạn.
 */
const IP_LAN = '192.168.1.14';

const apiClient = axios.create({
  baseURL: `http://${IP_LAN}:8000/api`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor cho Request: Tự động lấy Token từ Firebase
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho Response: Xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;
    if (response) {
      console.error(`API Error ${response.status}:`, response.data.message || 'Lỗi không xác định');
    } else {
      console.error('Network Error: Không thể kết nối đến Server. Hãy kiểm tra lệnh php -S 0.0.0.0:8000');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
