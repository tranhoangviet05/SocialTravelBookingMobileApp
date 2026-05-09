import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Ticket
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { bookingApi } from '../api/bookingApi';
import AppText from '../components/common/AppText';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const StatusBadge = ({ status, paymentStatus }) => {
  let config = {
    label: 'Không xác định',
    color: '#64748B',
    bgColor: '#F1F5F9',
    icon: AlertCircle
  };

  if (status === 'cancelled') {
    config = { label: 'Đã hủy', color: '#EF4444', bgColor: '#FEF2F2', icon: XCircle };
  } else if (status === 'completed') {
    config = { label: 'Hoàn thành', color: '#10B981', bgColor: '#ECFDF5', icon: CheckCircle2 };
  } else if (status === 'confirmed') {
    config = { label: 'Đã xác nhận', color: '#3B82F6', bgColor: '#EFF6FF', icon: CheckCircle2 };
  } else if (paymentStatus === 'pending') {
    config = { label: 'Chờ thanh toán', color: '#F59E0B', bgColor: '#FFFBEB', icon: Clock };
  } else if (status === 'pending') {
    config = { label: 'Chờ xử lý', color: '#8B5CF6', bgColor: '#F5F3FF', icon: Clock };
  }

  const Icon = config.icon;

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Icon size={12} color={config.color} />
      <AppText style={[styles.badgeText, { color: config.color }]}>{config.label}</AppText>
    </View>
  );
};

const BookingCard = ({ booking, onPress }) => {
  const service = booking.service || {};
  const isPendingPayment = booking.payment_status === 'pending' && booking.status !== 'cancelled';

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(booking)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: service.image || 'https://via.placeholder.com/150' }} 
          style={styles.serviceImage} 
        />
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <AppText style={styles.serviceName} numberOfLines={1}>{service.name}</AppText>
            <StatusBadge status={booking.status} paymentStatus={booking.payment_status} />
          </View>
          <View style={styles.infoRow}>
            <MapPin size={14} color={Colors.textSecondary} />
            <AppText style={styles.infoText} numberOfLines={1}>{service.type === 'hotel' ? 'Khách sạn' : 'Tour du lịch'}</AppText>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={14} color={Colors.textSecondary} />
            <AppText style={styles.infoText}>
              {new Date(booking.check_in_date).toLocaleDateString('vi-VN')}
              {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString('vi-VN')}`}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View>
          <AppText style={styles.priceLabel}>Tổng thanh toán</AppText>
          <AppText style={styles.priceValue}>{booking.total_amount?.toLocaleString()}đ</AppText>
        </View>
        
        {isPendingPayment ? (
          <TouchableOpacity 
            style={styles.payButton}
            onPress={(e) => {
              // Prevent parent onPress
              onPress(booking, true);
            }}
          >
            <AppText style={styles.payButtonText}>Thanh toán ngay</AppText>
          </TouchableOpacity>
        ) : (
          <View style={styles.detailBtn}>
            <AppText style={styles.detailBtnText}>Chi tiết</AppText>
            <ChevronRight size={16} color={Colors.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.bookingCodeContainer}>
        <Ticket size={12} color={Colors.textSecondary} style={{ opacity: 0.5 }} />
        <AppText style={styles.bookingCodeText}>Mã: {booking.booking_code}</AppText>
      </View>
    </TouchableOpacity>
  );
};

const BookingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await bookingApi.getMyBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredBookings(bookings);
    } else if (activeTab === 'pending') {
      setFilteredBookings(bookings.filter(b => b.status === 'pending' || b.payment_status === 'pending'));
    } else {
      setFilteredBookings(bookings.filter(b => b.status === activeTab));
    }
  }, [activeTab, bookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings(false);
  }, []);

  const handleBookingPress = async (booking, isPayAction = false) => {
    if (isPayAction || (booking.payment_status === 'pending' && booking.status !== 'cancelled')) {
      try {
        setLoading(true);
        const payResponse = await bookingApi.initiatePayment(booking.id, 'sepay');
        setLoading(false);

        // Xác định dữ liệu thanh toán (linh hoạt cấu trúc như ở CheckoutScreen)
        const paymentData = (payResponse.data && (payResponse.data.qr_url || payResponse.data.payment_info)) 
                            ? payResponse.data 
                            : (payResponse.qr_url ? payResponse : null);

        if (paymentData) {
          navigation.navigate('Payment', {
            bookingId: booking.id,
            paymentInfo: paymentData.payment_info || paymentData,
            totalAmount: booking.total_amount
          });
        } else {
          Alert.alert('Lỗi', 'Không thể lấy thông tin thanh toán.');
        }
      } catch (error) {
        setLoading(false);
        console.error('Lỗi khởi tạo thanh toán:', error);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi chuẩn bị thanh toán.');
      }
    } else {
      // Navigate to detailed booking view (to be implemented)
      // For now just show alert or stay here
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Calendar size={48} color={Colors.textSecondary} />
      </View>
      <AppText style={styles.emptyTitle}>Chưa có đặt chỗ nào</AppText>
      <AppText style={styles.emptySubtitle}>
        Các chuyến đi và dịch vụ bạn đặt sẽ xuất hiện tại đây.
      </AppText>
      <TouchableOpacity 
        style={styles.exploreBtn}
        onPress={() => navigation.navigate('Tìm kiếm')}
      >
        <AppText style={styles.exploreBtnText}>Khám phá ngay</AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <AppText style={styles.headerTitle}>Chuyến đi của tôi</AppText>
        <AppText style={styles.headerSubtitle}>Quản lý các dịch vụ đã đặt</AppText>
      </View>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === item.id && styles.activeTabItem
              ]}
              onPress={() => setActiveTab(item.id)}
            >
              <AppText 
                style={[
                  styles.tabLabel,
                  activeTab === item.id && styles.activeTabLabel
                ]}
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <AppText style={styles.loadingText}>Đang tải danh sách...</AppText>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={handleBookingPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={Colors.primary} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  headerSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  
  tabWrapper: { backgroundColor: '#fff' },
  tabList: { paddingHorizontal: 15, paddingVertical: 12 },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#F1F5F9',
  },
  activeTabItem: { backgroundColor: Colors.primary },
  tabLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  activeTabLabel: { color: '#fff' },

  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row' },
  serviceImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F1F5F9' },
  headerInfo: { flex: 1, marginLeft: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: Colors.text, flex: 1, marginRight: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoText: { fontSize: 13, color: Colors.textSecondary },
  
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 11, color: Colors.textSecondary },
  priceValue: { fontSize: 17, fontWeight: 'bold', color: Colors.primary },
  
  payButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  payButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  
  bookingCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  bookingCodeText: { fontSize: 10, color: Colors.textSecondary, letterSpacing: 0.5 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIconBg: { 
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', 
    alignItems: 'center', justifyContent: 'center', marginBottom: 24 
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  exploreBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  exploreBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default BookingScreen;
