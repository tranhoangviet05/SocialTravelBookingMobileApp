import React, { createContext, useState, useCallback, useMemo } from 'react';
import { bookingApi } from '../api/bookingApi';

export const BookingContext = createContext({});

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await bookingApi.getMyBookings();
      if (response.success) {
        setBookings(response.data || []);
        return { success: true, data: response.data };
      }
      return { success: false, message: 'Không thể tải danh sách đặt chỗ' };
    } catch (error) {
      console.error('BookingStore: fetchBookings error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc dữ liệu dựa trên Tab (Di chuyển từ Screen vào Store)
  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return bookings;
    
    return bookings.filter(item => {
      switch (activeTab) {
        case 'pending':
          return item.payment_status === 'pending' && item.status !== 'cancelled';
        case 'paid':
          return item.payment_status === 'paid' && item.status !== 'cancelled';
        case 'completed':
          return item.status === 'completed';
        case 'cancelled':
          return item.status === 'cancelled';
        default:
          return true;
      }
    });
  }, [bookings, activeTab]);

  return (
    <BookingContext.Provider value={{
      bookings,
      filteredBookings,
      loading,
      activeTab,
      setActiveTab,
      fetchBookings
    }}>
      {children}
    </BookingContext.Provider>
  );
};
