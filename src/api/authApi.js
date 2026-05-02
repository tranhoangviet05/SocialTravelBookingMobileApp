import apiClient from './apiClient';

/**
 * Auth API Service
 * Chứa các phương thức gọi API liên quan đến xác thực và người dùng
 */
export const authApi = {
  /**
   * Đồng bộ người dùng Firebase vào PostgreSQL.
   * Gọi sau khi đăng nhập/đăng ký Firebase thành công.
   * Backend sẽ tự tạo hoặc cập nhật user trong DB.
   */
  syncUser: () => {
    return apiClient.post('/auth/post/sync');
  },

  // Lấy thông tin cá nhân
  getProfile: () => {
    return apiClient.get('/user/get/profile');
  },

  // Cập nhật thông tin
  updateProfile: (data) => {
    return apiClient.put('/user/profile', data);
  }
};

export default authApi;
