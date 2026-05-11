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
  CreditCard,
  RotateCcw,
  Ticket
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../components/common/AppText';
import AppAvatar from '../components/common/AppAvatar';
import { Colors } from '../constants/Colors';
import { bookingApi } from '../api/bookingApi';
import { BASE_URL } from '../api/apiClient';
import Skeleton from '../components/common/Skeleton';

const DetailSkeleton = () => {
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <Skeleton width={width} height={350} />
      <View style={[styles.content, { marginTop: -30, minHeight: height - 320 }]}>
        <View style={styles.section}>
          <Skeleton width={width * 0.7} height={28} borderRadius={8} />
          <View style={{ marginTop: 10 }}>
            <Skeleton width={150} height={16} borderRadius={4} />
          </View>
        </View>
        <View style={styles.section}>
          <Skeleton width={120} height={20} borderRadius={4} style={{ marginBottom: 12 }} />
          <View style={styles.infoCard}>
            <View style={{ gap: 15 }}>
              <Skeleton width={width - 70} height={50} borderRadius={12} />
              <Skeleton width={width - 70} height={50} borderRadius={12} />
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Skeleton width={120} height={20} borderRadius={4} style={{ marginBottom: 12 }} />
          <View style={styles.infoCard}>
            <View style={{ gap: 10 }}>
              <Skeleton width={200} height={16} borderRadius={4} />
              <Skeleton width={180} height={16} borderRadius={4} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const BookingDetailScreen = ({ route, navigation }) => {
  const { id, bookingId } = route.params || {};
  const actualId = id || bookingId;
  const insets = useSafeAreaInsets();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!actualId) {
      Alert.alert('Lỗi', 'Không tìm thấy mã đơn đặt chỗ');
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const response = await bookingApi.getBookingDetail(actualId);
      if (response.success) {
        setBooking(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể lấy thông tin đơn đặt chỗ');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Fetch booking detail error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi kết nối máy chủ');
    } finally {
      // Giả lập loading thêm một chút để thấy skeleton mượt hơn
      setTimeout(() => setLoading(false), 800);
    }
  }, [actualId, navigation]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleCheckIn = async () => {
    Alert.alert(
      'Xác nhận Check-in',
      'Bạn muốn gửi yêu cầu check-in cho dịch vụ này ngay bây giờ?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi yêu cầu',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await bookingApi.checkIn(actualId);
              if (res.success) {
                setBooking(res.data);
                Alert.alert('Thành công', 'Đã gửi yêu cầu check-in! Vui lòng chờ nhà cung cấp xác nhận.');
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

  const handleUndoCheckIn = async () => {
    Alert.alert(
      'Hoàn tác Check-in',
      'Bạn muốn hủy yêu cầu check-in này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await bookingApi.undoCheckIn(actualId);
              if (res.success) {
                setBooking(res.data);
                Alert.alert('Thành công', 'Đã hoàn tác yêu cầu check-in.');
              } else {
                Alert.alert('Thất bại', res.message);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hoàn tác');
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
              const res = await bookingApi.checkOut(actualId);
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
      case 'completed': return '#6366F1';
      case 'cancelled': return '#EF4444';
      default: return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xử lý';
      case 'ongoing': return 'Đang sử dụng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  const service = booking.service;
  const imageUrl = service?.media?.[0]?.url
    ? (service.media[0].url.startsWith('http') ? service.media[0].url : `${BASE_URL}/${service.media[0].url}`)
    : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop';

  const isAccommodation = ['hotel', 'homestay'].includes(service?.type);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Immersive Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.headerImage} />
          <View style={styles.imageOverlay} />
          
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
              <AppText weight="bold" style={styles.statusText}>{getStatusLabel(booking.status)}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Main Title Section */}
          <View style={styles.section}>
            <AppText weight="bold" style={styles.serviceName}>{service?.name}</AppText>
            <View style={styles.codeContainer}>
              <Ticket size={14} color={Colors.primary} />
              <AppText style={styles.codeLabel}>Mã: </AppText>
              <AppText weight="bold" style={styles.bookingCode}>{booking.booking_code}</AppText>
            </View>
          </View>

          {/* Time & Dates Immersive Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={18} color={Colors.text} />
              <AppText weight="bold" style={styles.sectionTitle}>Thời gian & Trạng thái</AppText>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <Calendar size={18} color="#0369A1" />
                </View>
                <View style={styles.infoCol}>
                  <AppText style={styles.infoLabel}>{isAccommodation ? 'Ngày nhận phòng' : 'Ngày khởi hành'}</AppText>
                  <AppText weight="bold" style={styles.infoValue}>
                    {new Date(booking.check_in_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </AppText>
                </View>
              </View>

              {isAccommodation && (
                <View style={[styles.infoRow, { marginTop: 15 }]}>
                   <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
                    <Calendar size={18} color="#0EA5E9" />
                  </View>
                  <View style={styles.infoCol}>
                    <AppText style={styles.infoLabel}>Ngày trả phòng</AppText>
                    <AppText weight="bold" style={styles.infoValue}>
                      {new Date(booking.check_out_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </AppText>
                  </View>
                </View>
              )}

              {booking.tourist_check_in_at && (
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
                    <View style={styles.timelineContent}>
                      <AppText style={styles.timelineLabel}>Yêu cầu Check-in lúc:</AppText>
                      <AppText weight="medium" style={styles.timelineTime}>
                        {new Date(booking.tourist_check_in_at).toLocaleString('vi-VN')}
                      </AppText>
                    </View>
                  </View>
                  
                  {booking.is_checked_in && (
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: '#3B82F6' }]} />
                      <View style={styles.timelineContent}>
                        <AppText style={styles.timelineLabel}>Nhà cung cấp xác nhận:</AppText>
                        <AppText weight="medium" style={styles.timelineTime}>
                          {new Date(booking.checked_in_at).toLocaleString('vi-VN')}
                        </AppText>
                      </View>
                    </View>
                  )}

                  {booking.checked_out_at && (
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: '#6B7280' }]} />
                      <View style={styles.timelineContent}>
                        <AppText style={styles.timelineLabel}>Đã Check-out lúc:</AppText>
                        <AppText weight="medium" style={styles.timelineTime}>
                          {new Date(booking.checked_out_at).toLocaleString('vi-VN')}
                        </AppText>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={18} color={Colors.text} />
              <AppText weight="bold" style={styles.sectionTitle}>Người đặt chỗ</AppText>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.contactItem}>
                <AppAvatar size={45} name={booking.contact_name} />
                <View style={styles.contactInfo}>
                  <AppText weight="bold" style={styles.contactName}>{booking.contact_name}</AppText>
                  <AppText style={styles.contactSub}>{booking.contact_phone} • {booking.contact_email}</AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Payment Card */}
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
              <CreditCard size={18} color={Colors.text} />
              <AppText weight="bold" style={styles.sectionTitle}>Thanh toán</AppText>
            </View>
            <View style={styles.paymentCard}>
              <View style={styles.priceLine}>
                <AppText style={styles.priceLabel}>Tạm tính</AppText>
                <AppText style={styles.priceValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.subtotal)}</AppText>
              </View>
              <View style={styles.priceLine}>
                <AppText style={styles.priceLabel}>Khuyến mãi</AppText>
                <AppText style={[styles.priceValue, { color: '#EF4444' }]}>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.discount_amount)}</AppText>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.totalLine}>
                <AppText weight="bold" style={styles.totalLabel}>Tổng cộng</AppText>
                <AppText weight="black" style={styles.totalValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_amount)}</AppText>
              </View>
              
              <View style={styles.paymentFooter}>
                <View style={[styles.payMethodBadge]}>
                  <AppText style={styles.payMethodText}>{booking.payment_method?.toUpperCase()}</AppText>
                </View>
                <View style={[styles.paymentStatus, { backgroundColor: booking.payment_status === 'paid' ? '#DCFCE7' : '#FEF3C7' }]}>
                  <AppText weight="bold" style={{ fontSize: 10, color: booking.payment_status === 'paid' ? '#166534' : '#92400E' }}>
                    {booking.payment_status === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.helpBox}>
            <AlertCircle size={20} color="#64748B" />
            <AppText style={styles.helpText}>
              Cần hỗ trợ? Vui lòng liên hệ với nhà cung cấp hoặc CSKH Social Travel Booking.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Modern Fixed Action Button */}
      {isAccommodation && booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {!booking.tourist_check_in_at ? (
            <TouchableOpacity
              style={[styles.primaryButton, actionLoading && { opacity: 0.7 }]}
              onPress={handleCheckIn}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <CheckCircle2 size={20} color="#fff" />
                  <AppText weight="bold" style={styles.buttonText}>Check-in ngay</AppText>
                </>
              )}
            </TouchableOpacity>
          ) : !booking.is_checked_in ? (
            <View>
              <View style={styles.waitingNotice}>
                <Clock size={14} color="#D97706" />
                <AppText style={styles.detailWaitingText}>Đang chờ nhà cung cấp xác nhận...</AppText>
              </View>
              <TouchableOpacity
                style={[styles.undoButton, actionLoading && { opacity: 0.7 }]}
                onPress={handleUndoCheckIn}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={Colors.textSecondary} />
                ) : (
                  <>
                    <RotateCcw size={20} color={Colors.textSecondary} />
                    <AppText weight="bold" style={styles.undoButtonText}>Hoàn tác Check-in</AppText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : !booking.checked_out_at ? (
            <TouchableOpacity
              style={[styles.checkoutButton, actionLoading && { opacity: 0.7 }]}
              onPress={handleCheckOut}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <XCircle size={20} color="#fff" />
                  <AppText weight="bold" style={styles.buttonText}>Check-out</AppText>
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
  imageContainer: {
    width: Dimensions.get('window').width,
    height: 350,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 45,
    left: 20,
    right: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    padding: 20,
    marginTop: -30,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: Dimensions.get('window').height - 320,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 24,
    color: '#0F172A',
    lineHeight: 32,
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  codeLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  bookingCode: {
    fontSize: 13,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1E293B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
  },
  timelineContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  timelineTime: {
    fontSize: 13,
    color: '#334155',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    color: '#1E293B',
  },
  contactSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 20,
    color: Colors.primary,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  payMethodBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  payMethodText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  paymentStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  helpBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  waitingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  detailWaitingText: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '500',
  },
  undoButton: {
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  undoButtonText: {
    color: '#475569',
    fontSize: 16,
  },
  checkoutButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
});

export default BookingDetailScreen;
