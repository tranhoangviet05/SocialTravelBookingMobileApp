import apiClient from './apiClient';

/**
 * API quản lý hồ sơ khách du lịch
 */
export const profileApi = {
  /**
   * Lấy thông tin hồ sơ
   */
  getProfile: async () => {
    return apiClient.get('/user/tourist-profile');
  },

  /**
   * Cập nhật hồ sơ
   * @param {Object} data { name, phone_number, gender, date_of_birth, nationality }
   */
  updateProfile: async (data) => {
    return apiClient.put('/user/tourist-profile', data);
  },

  /**
   * Kiểm tra xem hồ sơ đã đầy đủ chưa
   */
  checkCompletion: (profile) => {
    if (!profile) return false;
    
    const requiredFields = ['name', 'phone_number', 'gender', 'date_of_birth', 'nationality'];
    return requiredFields.every(field => profile[field] && profile[field] !== '');
  }
};
