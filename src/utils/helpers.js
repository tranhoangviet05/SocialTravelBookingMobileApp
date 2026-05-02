/**
 * Chứa các hàm xử lý logic ở Mobile mà Backend thường không xử lý 
 * hoặc xử lý ở Client để tăng trải nghiệm người dùng.
 */

// 1. Định dạng tiền tệ (Ví dụ: 1000000 -> 1.000.000 đ)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// 2. Định dạng ngày tháng (Ví dụ: 2026-05-02 -> 02/05/2026)
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// 3. Kiểm tra Email hợp lệ
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// 4. Rút gọn văn bản (Truncate)
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 5. Lưu trữ local đơn giản (Wrapper cho AsyncStorage nếu cần dùng nhanh)
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  save: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to storage', e);
    }
  },
  get: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value != null ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Error getting from storage', e);
    }
  },
  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from storage', e);
    }
  }
};
