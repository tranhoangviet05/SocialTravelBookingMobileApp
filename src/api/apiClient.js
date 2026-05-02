import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '../utils/helpers';

/**
 * Cấu hình Base URL cho Backend Laravel
 * - Android Emulator: 10.0.2.2
 * - iOS Simulator / Real Device: Local IP của máy tính
 */
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor cho Request: Tự động gắn Token vào Header nếu có
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.get('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý tập trung các mã trạng thái (Status Code)
apiClient.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu trực tiếp nếu thành công (2xx)
    return response.data;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Xử lý dựa trên mã trạng thái HTTP
      switch (response.status) {
        case 401:
          console.error('Unauthorized: Phiên làm việc hết hạn');
          // Có thể thêm logic tự động logout ở đây
          break;
        case 403:
          console.error('Forbidden: Bạn không có quyền truy cập');
          break;
        case 404:
          console.error('Not Found: Không tìm thấy tài nguyên');
          break;
        case 422:
          console.error('Validation Error: Dữ liệu gửi lên không hợp lệ', response.data.errors);
          break;
        case 500:
          console.error('Server Error: Lỗi hệ thống Backend');
          break;
        default:
          console.error(`Error ${response.status}:`, response.data.message || 'Đã có lỗi xảy ra');
      }
    } else {
      console.error('Network Error: Không thể kết nối đến Server');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
