import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CreditCard
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/src/components/common/AppText';
import { Colors } from '@/src/constants/theme';
import { bookingApi } from '@/src/api/bookingApi';
import { BASE_URL } from '@/src/api/apiClient';

const BookingDetailScreen = () => {
  const { width } = Dimensions.get('window');
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingApi.getBookingDetail(id);
      if (response.success) {
        setBooking(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể lấy thông tin đơn đặt chỗ');
        router.back();
      }
    } catch (error) {
      console.error('Fetch booking detail error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleCheckIn = async () => {
    Alert.alert(
      'Xác nhận Check-in',
      'Bạn muốn thực hiện check-in cho dịch vụ này ngay bây giờ?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Check-in',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await bookingApi.checkIn(id);
              if (res.success) {
                setBooking(res.data);
                Alert.alert('Thành công', 'Bạn đã check-in thành công!');
              } else {
                Alert.alert('Thất bại', res.message);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể thực hiện check-in');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCheckOut = async () => {
    Alert.alert(
      'Xác nhận Check-out',
      'Bạn muốn thực hiện check-out và hoàn thành dịch vụ?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Check-out',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await bookingApi.checkOut(id);
              if (res.success) {
                setBooking(res.data);
                Alert.alert('Thành công', 'Bạn đã check-out thành công. Cảm ơn bạn đã sử dụng dịch vụ!');
              } else {
                Alert.alert('Thất bại', res.message);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể thực hiện check-out');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'ongoing': return '#3B82F6';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xử lý';
      case 'ongoing': return 'Đang sử dụng';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const service = booking.service;
  const imageUrl = service?.media?.[0]?.url 
    ? (service.media[0].url.startsWith('http') ? service.media[0].url : `${BASE_URL}/${service.media[0].url}`)
    : 'https://via.placeholder.com/400x250';

  const isAccommodation = ['hotel', 'homestay'].includes(service?.type);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.headerImage} />
          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + 10 }]} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <AppText weight="bold" style={styles.statusText}>{getStatusLabel(booking.status)}</AppText>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Code */}
          <View style={styles.section}>
            <AppText weight="bold" style={styles.serviceName}>{service?.name}</AppText>
            <View style={styles.codeRow}>
              <AppText style={styles.codeLabel}>Mã đặt chỗ: </AppText>
              <AppText weight="bold" style={styles.bookingCode}>{booking.booking_code}</AppText>
            </View>
          </View>

          {/* Time & Dates */}
          <View style={styles.section}>
            <AppText weight="bold" style={styles.sectionTitle}>Thông tin thời gian</AppText>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Calendar size={18} color={Colors.primary} />
                <View style={styles.infoCol}>
                  <AppText style={styles.infoLabel}>{isAccommodation ? 'Ngày nhận phòng' : 'Ngày khởi hành'}</AppText>
                  <AppText weight="medium" style={styles.infoValue}>
                    {new Date(booking.check_in_date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </AppText>
                </View>
              </View>
              
              {isAccommodation && (
                <View style={[styles.infoRow, { marginTop: 15 }]}>
                  <Calendar size={18} color={Colors.primary} />
                  <View style={styles.infoCol}>
                    <AppText style={styles.infoLabel}>Ngày trả phòng</AppText>
                    <AppText weight="medium" style={styles.infoValue}>
                      {new Date(booking.check_out_date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </AppText>
                  </View>
                </View>
              )}

              {booking.checked_in_at && (
                <View style={[styles.infoRow, { marginTop: 15, borderTopWidth: 0.5, borderTopColor: '#EEE', paddingTop: 15 }]}>
                  <Clock size={18} color="#10B981" />
                  <View style={styles.infoCol}>
                    <AppText style={styles.infoLabel}>Check-in thực tế</AppText>
                    <AppText weight="medium" style={[styles.infoValue, { color: '#10B981' }]}>
                      {new Date(booking.checked_in_at).toLocaleString('vi-VN')}
                    </AppText>
                  </View>
                </View>
              )}

              {booking.checked_out_at && (
                <View style={[styles.infoRow, { marginTop: 10 }]}>
                  <Clock size={18} color="#6B7280" />
                  <View style={styles.infoCol}>
                    <AppText style={styles.infoLabel}>Check-out thực tế</AppText>
                    <AppText weight="medium" style={[styles.infoValue, { color: '#6B7280' }]}>
                      {new Date(booking.checked_out_at).toLocaleString('vi-VN')}
                    </AppText>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <AppText weight="bold" style={styles.sectionTitle}>Thông tin liên lạc</AppText>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <User size={18} color={Colors.textSecondary} />
                <AppText style={styles.contactText}>{booking.contact_name}</AppText>
              </View>
              <View style={[styles.infoRow, { marginTop: 10 }]}>
                <Phone size={18} color={Colors.textSecondary} />
                <AppText style={styles.contactText}>{booking.contact_phone}</AppText>
              </View>
              <View style={[styles.infoRow, { marginTop: 10 }]}>
                <Mail size={18} color={Colors.textSecondary} />
                <AppText style={styles.contactText}>{booking.contact_email}</AppText>
              </View>
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <AppText weight="bold" style={styles.sectionTitle}>Chi tiết thanh toán</AppText>
            <View style={styles.priceCard}>
              <View style={styles.priceRow}>
                <AppText style={styles.priceLabel}>Giá gốc</AppText>
                <AppText style={styles.priceValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.subtotal)}</AppText>
              </View>
              <View style={styles.priceRow}>
                <AppText style={styles.priceLabel}>Giảm giá</AppText>
                <AppText style={[styles.priceValue, { color: Colors.danger }]}>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.discount_amount)}</AppText>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <AppText weight="bold" style={styles.totalLabel}>Tổng cộng</AppText>
                <AppText weight="bold" style={styles.totalValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_amount)}</AppText>
              </View>
              <View style={styles.paymentMethodRow}>
                <CreditCard size={14} color={Colors.textSecondary} />
                <AppText style={styles.paymentMethodText}>Thanh toán qua {booking.payment_method.toUpperCase()}</AppText>
                <View style={[styles.paymentStatus, { backgroundColor: booking.payment_status === 'paid' ? '#E1F9F0' : '#FFF4E5' }]}>
                  <AppText style={{ fontSize: 10, color: booking.payment_status === 'paid' ? '#059669' : '#D97706' }}>
                    {booking.payment_status === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Help Note */}
          <View style={styles.helpBox}>
            <AlertCircle size={20} color={Colors.textSecondary} />
            <AppText style={styles.helpText}>
              Nếu bạn có bất kỳ thắc mắc nào về đơn đặt chỗ này, vui lòng liên hệ với nhà cung cấp hoặc hỗ trợ khách hàng của Social Travel.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Button */}
      {isAccommodation && booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {!booking.checked_in_at ? (
            <TouchableOpacity 
              style={[styles.primaryButton, actionLoading && { opacity: 0.7 }]} 
              onPress={handleCheckIn}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <CheckCircle2 size={20} color={Colors.white} />
                  <AppText weight="bold" style={styles.buttonText}>Check-in ngay</AppText>
                </>
              )}
            </TouchableOpacity>
          ) : !booking.checked_out_at ? (
            <TouchableOpacity 
              style={[styles.secondaryButton, actionLoading && { opacity: 0.7 }]} 
              onPress={handleCheckOut}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <XCircle size={20} color={Colors.primary} />
                  <AppText weight="bold" style={styles.secondaryButtonText}>Check-out</AppText>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: Dimensions.get('window').width,
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
  },
  content: {
    padding: 20,
    marginTop: -20,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  section: {
    marginBottom: 25,
  },
  serviceName: {
    fontSize: 22,
    color: Colors.text,
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bookingCode: {
    fontSize: 14,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
  },
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    color: Colors.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  helpBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
});

export default BookingDetailScreen;
