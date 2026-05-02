import axiosClient from './axios';

/**
 * API Service cho Booking & Payment
 */
const bookingApi = {
    /**
     * Tạo đơn đặt chỗ mới
     * @param {object} data - { service_id, check_in_date, check_out_date, num_adults, num_children, contact_name, contact_email, contact_phone, special_requests, coupon_code, payment_method }
     */
    createBooking: (data) => axiosClient.post('/bookings', data),

    /**
     * Khởi tạo thanh toán
     * @param {string} bookingId - UUID của booking
     * @param {string} paymentMethod - 'sepay' | 'wallet'
     */
    initiatePayment: (bookingId, paymentMethod) =>
        axiosClient.post('/payment/initiate', {
            booking_id: bookingId,
            payment_method: paymentMethod,
        }),

    /**
     * Kiểm tra trạng thái thanh toán (dùng cho polling)
     * @param {string} bookingId
     */
    checkPaymentStatus: (bookingId) =>
        axiosClient.get(`/payment/status/${bookingId}`),

    /**
     * Lấy danh sách booking của user hiện tại
     */
    getMyBookings: () => axiosClient.get('/user/bookings'),
    cancelBooking: (id) => axiosClient.post(`/user/bookings/${id}/cancel`),

    /**
     * Lấy số dư ví
     */
    getWalletBalance: () => axiosClient.get('/wallet/balance'),

    /**
     * Áp dụng mã giảm giá
     * @param {string} code
     * @param {number} amount
     */
    applyCoupon: (code, amount) =>
        axiosClient.post('/coupons/apply', { code, order_amount: amount }),
};

export default bookingApi;
