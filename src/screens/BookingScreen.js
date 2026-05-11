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
  Dimensions,
  ScrollView,
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
import BookingCard from '../components/booking/BookingCard';
import Skeleton from '../components/common/Skeleton';
import { BookingContext } from '../store/BookingContext';

const { width } = Dimensions.get('window');

const BookingSkeleton = () => (
  <View style={styles.cardSkeleton}>
    <View style={styles.skeletonHeader}>
      <Skeleton width={80} height={80} borderRadius={12} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonTitleRow}>
          <Skeleton width={width * 0.4} height={18} borderRadius={4} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </View>
        <View style={{ marginTop: 8, gap: 6 }}>
          <Skeleton width={width * 0.3} height={14} borderRadius={4} />
          <Skeleton width={width * 0.5} height={14} borderRadius={4} />
        </View>
      </View>
    </View>
    <View style={styles.skeletonDivider} />
    <View style={styles.skeletonFooter}>
      <View>
        <Skeleton width={80} height={12} borderRadius={4} />
        <View style={{ marginTop: 5 }}>
          <Skeleton width={120} height={22} borderRadius={4} />
        </View>
      </View>
      <Skeleton width={110} height={38} borderRadius={12} />
    </View>
    <View style={styles.skeletonCode}>
      <Skeleton width={100} height={12} borderRadius={4} />
    </View>
  </View>
);

const BookingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { 
    filteredBookings, 
    loading, 
    activeTab, 
    setActiveTab, 
    fetchBookings 
  } = React.useContext(BookingContext);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings(false);
    setRefreshing(false);
  };

  const handleBookingPress = (booking, type = 'detail') => {
    if (type === 'pay') {
      navigation.navigate('Payment', { bookingId: booking.id });
    } else {
      navigation.navigate('BookingDetail', { bookingId: booking.id });
    }
  };

  const handleAction = async (booking, actionType) => {
    try {
      let response;
      if (actionType === 'checkin') {
        response = await bookingApi.checkIn(booking.id);
      } else if (actionType === 'undo-checkin') {
        response = await bookingApi.undoCheckIn(booking.id);
      } else if (actionType === 'checkout') {
        response = await bookingApi.checkOut(booking.id);
      }

      if (response && response.success) {
        Alert.alert('Thành công', response.message);
        fetchBookings(false); // Reload list
      } else {
        Alert.alert('Thất bại', response?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error(`Action ${actionType} error:`, error);
      Alert.alert('Lỗi', 'Không thể thực hiện hành động này');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ticket size={40} color={Colors.textSecondary} />
      </View>
      <AppText style={styles.emptyTitle}>Chưa có đơn đặt chỗ nào</AppText>
      <AppText style={styles.emptySubtitle}>
        Bạn chưa thực hiện đặt chỗ nào cho trạng thái này. Khám phá các tour và khách sạn ngay!
      </AppText>
      <TouchableOpacity 
        style={styles.exploreBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <AppText style={styles.exploreBtnText}>Khám phá ngay</AppText>
      </TouchableOpacity>
    </View>
  );

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ thanh toán' },
    { id: 'paid', label: 'Đã thanh toán' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <AppText style={styles.headerTitle}>Chuyến đi của tôi</AppText>
        <AppText style={styles.headerSubtitle}>Quản lý các dịch vụ bạn đã đặt</AppText>
      </View>

      {/* Tabs */}
      <View style={styles.tabWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabList}
        >
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
              onPress={() => setActiveTab(tab.id)}
            >
              <AppText style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
                {tab.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.listContent}>
          <BookingSkeleton />
          <BookingSkeleton />
          <BookingSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <BookingCard 
              booking={item} 
              onPress={handleBookingPress} 
              onAction={handleAction}
            />
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

  // Skeleton Styles
  cardSkeleton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  skeletonHeader: { flexDirection: 'row' },
  skeletonInfo: { flex: 1, marginLeft: 16 },
  skeletonTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skeletonDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  skeletonFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skeletonCode: { 
    marginTop: 10, 
    paddingTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: '#F8FAFC' 
  },
});

export default BookingScreen;
