import apiClient from './apiClient';

export const bookingApi = {
  createBooking: async (data) => {
    try {
      const response = await apiClient.post('/bookings', data);
      return response;
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
      return response;
    } catch (error) {
      console.error('Lỗi khi khởi tạo thanh toán:', error);
      throw error;
    }
  },

  getPaymentStatus: async (bookingId) => {
    try {
      const response = await apiClient.get(`/payment/status/${bookingId}`);
      return response;
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
      return response;
    } catch (error) {
      console.error('Lỗi khi áp dụng mã giảm giá:', error);
      throw error;
    }
  },

  getMyBookings: async () => {
    try {
      const response = await apiClient.get('/user/bookings');
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
      throw error;
    }
  },

  cancelBooking: async (bookingId, reason = 'Người dùng hủy') => {
    try {
      const response = await apiClient.post(`/user/bookings/${bookingId}/cancel`, {
        cancel_reason: reason
      });
      return response;
    } catch (error) {
      console.error('Lỗi khi hủy đặt chỗ:', error);
      throw error;
    }
  },

  getBookingDetail: async (id) => {
    try {
      const response = await apiClient.get(`/user/bookings/${id}`);
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đặt chỗ:', error);
      throw error;
    }
  },

  checkIn: async (id) => {
    try {
      const response = await apiClient.post(`/user/bookings/${id}/check-in`);
      return response;
    } catch (error) {
      console.error('Lỗi khi check-in:', error);
      throw error;
    }
  },

  undoCheckIn: async (id) => {
    try {
      const response = await apiClient.post(`/user/bookings/${id}/undo-check-in`);
      return response;
    } catch (error) {
      console.error('Lỗi khi hoàn tác check-in:', error);
      throw error;
    }
  },

  checkOut: async (id) => {
    try {
      const response = await apiClient.post(`/user/bookings/${id}/check-out`);
      return response;
    } catch (error) {
      console.error('Lỗi khi check-out:', error);
      throw error;
    }
  }
};
