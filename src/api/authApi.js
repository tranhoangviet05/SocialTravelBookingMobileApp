import apiClient from './apiClient';

/**
 * Auth API Service
 * Chứa các phương thức gọi API liên quan đến xác thực và người dùng
 */
export const authApi = {
  // 1. Đăng nhập
  login: (email, password) => {
    return apiClient.post('/login', { email, password });
  },

  // 2. Đăng ký
  register: (userData) => {
    return apiClient.post('/register', userData);
  },

  // 3. Lấy thông tin cá nhân (Cần Token - đã được interceptor tự gắn)
  getProfile: () => {
    return apiClient.get('/user/profile');
  },

  // 4. Đăng xuất
  logout: () => {
    return apiClient.post('/logout');
  },

  // 5. Cập nhật thông tin
  updateProfile: (data) => {
    return apiClient.put('/user/profile', data);
  }
};

export default authApi;
