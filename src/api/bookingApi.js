import apiClient from './apiClient';

export const bookingApi = {
  createBooking: async (data) => {
    try {
      const response = await apiClient.post('/bookings', data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo đặt chỗ:', error);
      throw error;
    }
  },

  initiatePayment: async (bookingId, method = 'sepay') => {
    try {
      const response = await apiClient.post('/payment/initiate', {
        booking_id: bookingId,
        payment_method: method
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi khởi tạo thanh toán:', error);
      throw error;
    }
  },

  getPaymentStatus: async (bookingId) => {
    try {
      const response = await apiClient.get(`/payment/status/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
      throw error;
    }
  },

  applyCoupon: async (code, amount) => {
    try {
      const response = await apiClient.post('/coupons/apply', {
        code,
        order_amount: amount
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi áp dụng mã giảm giá:', error);
      throw error;
    }
  }
};
