import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Dimensions, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldCheck, CheckCircle2, Smartphone } from 'lucide-react-native';
import AppText from '../components/common/AppText';
import { Colors } from '../constants/Colors';
import { bookingApi } from '../api/bookingApi';
import { profileApi } from '../api/profileApi';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/common/Skeleton';
import { formatCurrency } from '../utils/helpers';

// Components
import ServiceSummaryCard from '../components/checkout/ServiceSummaryCard';
import ContactInfoSection from '../components/checkout/ContactInfoSection';
import CouponSection from '../components/checkout/CouponSection';
import PriceBreakdownCard from '../components/checkout/PriceBreakdownCard';
import CustomDatePicker from '../components/home/CustomDatePicker';

const CheckoutScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { service, bookingData: initialBookingData } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('sepay');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Local state cho thông tin liên hệ (sửa tại chỗ)
  const [localContactName, setLocalContactName] = useState('');
  const [localContactPhone, setLocalContactPhone] = useState('');

  // State cho dữ liệu đặt chỗ có thể chỉnh sửa
  const [bookingData, setBookingData] = useState({
    ...initialBookingData,
    startDate: new Date(initialBookingData.startDate),
    endDate: initialBookingData.endDate ? new Date(initialBookingData.endDate) : null,
    quantity: 1 // Mặc định đặt 1 chỗ/phòng
  });

  const qrSheetRef = useRef(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    if (service.type?.toLowerCase() === 'tour') {
      autoSelectFirstAvailableTourDate();
    }
  }, []);

  const getLocalDateString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const autoSelectFirstAvailableTourDate = () => {
    const availabilities = service.availabilities || [];
    const todayStr = getLocalDateString(new Date());

    // Tìm ngày gần nhất trong availabilities tính từ hôm nay mà có remaining > 0
    const firstAvailable = availabilities
      .filter(a => a.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .find(a => a.remaining > 0);

    if (firstAvailable) {
      setBookingData(prev => ({
        ...prev,
        startDate: new Date(firstAvailable.date)
      }));
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.success) {
        setProfile(response.data);
        setLocalContactName(response.data.name || user?.displayName || '');
        setLocalContactPhone(response.data.phone_number || '');

        if (!profileApi.checkCompletion(response.data)) {
          Alert.alert(
            'Thông tin chưa đầy đủ',
            'Vui lòng cập nhật đầy đủ thông tin khách du lịch trước khi thanh toán.',
            [
              { text: 'Hủy', style: 'cancel', onPress: () => navigation.goBack() },
              { text: 'Cập nhật ngay', onPress: () => navigation.navigate('EditProfile') }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Lỗi tải profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGuests = (type, delta) => {
    setBookingData(prev => {
      const newAdults = type === 'adults' ? Math.max(1, prev.adults + delta) : prev.adults;
      const newChildren = type === 'children' ? Math.max(0, prev.children + delta) : prev.children;
      
      // Tính sức chứa tối đa dựa trên quantity
      if (prev.roomType) {
        const maxPerRoom = (prev.roomType.capacity_adults || 0) + (prev.roomType.capacity_children || 0);
        const totalCapacity = maxPerRoom * (prev.quantity || 1);
        
        if (newAdults + newChildren > totalCapacity) {
          Alert.alert('Vượt quá sức chứa', `Tổng số khách (${newAdults + newChildren}) vượt quá sức chứa tối đa của ${prev.quantity} phòng (${totalCapacity} người).`);
          return prev;
        }
      }
      
      return { ...prev, adults: newAdults, children: newChildren };
    });
  };

  const updateQuantity = (delta) => {
    setBookingData(prev => {
      const newQty = Math.max(1, (prev.quantity || 1) + delta);
      const isTour = service.type?.toLowerCase() === 'tour';

      if (isTour && prev.startDate) {
        // Kiểm tra slot thực tế của ngày đang chọn cho Tour
        const dateStr = getLocalDateString(prev.startDate);
        const availabilities = service.availabilities || [];
        const dayAvail = availabilities.find(a => a.date === dateStr);
        
        const remaining = dayAvail ? dayAvail.remaining : 0;
        if (newQty > remaining) {
          Alert.alert('Hết chỗ', `Ngày này chỉ còn ${remaining} chỗ trống cho tour.`);
          return prev;
        }
      } else {
        // Kiểm tra kho tĩnh cho Khách sạn/Homestay
        const inventory = prev.roomType?.inventory || service.inventory || 10;
        if (newQty > inventory) {
          Alert.alert('Hết chỗ', `Chỉ còn lại ${inventory} chỗ/phòng trống.`);
          return prev;
        }
      }

      return { ...prev, quantity: newQty };
    });
  };

  const onSelectDate = (range) => {
    if (range.startDate) {
      const isAccommodation = ['hotel', 'homestay'].includes(service.type?.toLowerCase());
      
      setBookingData(prev => {
        // Ưu tiên endDate từ Picker, nếu không có mới tính toán mặc định cho khách sạn
        let finalEndDate = range.endDate;
        if (!finalEndDate && isAccommodation) {
          finalEndDate = new Date(range.startDate.getTime() + 86400000);
        }

        // Tính toán lại số đêm nếu là khách sạn
        let nights = prev.nights || 1;
        if (isAccommodation && finalEndDate) {
          const diffTime = Math.abs(finalEndDate - range.startDate);
          nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        }

        return {
          ...prev,
          startDate: new Date(range.startDate),
          endDate: finalEndDate ? new Date(finalEndDate) : null,
          nights: nights
        };
      });
    }
  };

  const calculateSubtotal = () => {
    const basePrice = bookingData.roomType?.base_price || service.base_price || service.price || 0;
    const adults = bookingData.adults || 1;
    const children = bookingData.children || 0;
    const quantity = bookingData.quantity || 1;
    const isTour = service.type?.toLowerCase() === 'tour';

    if (isTour) {
      // Đối với Tour theo yêu cầu mới: Tính theo số lượng vé
      return basePrice * quantity;
    } else if (['hotel', 'homestay'].includes(service.type?.toLowerCase())) {
      const nights = bookingData.nights || 1;
      return basePrice * nights * quantity;
    } else {
      return (basePrice * adults + (basePrice * 0.5 * children)) * quantity;
    }
  };

  const subtotal = calculateSubtotal();
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const totalAmount = subtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const response = await bookingApi.applyCoupon(couponCode, subtotal);
      if (response.success) {
        setAppliedCoupon(response.data);
        Alert.alert('Thành công', 'Mã giảm giá đã được áp dụng!');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Mã giảm giá không hợp lệ.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    const isTour = service.type?.toLowerCase() === 'tour';
    try {
      const bookingPayload = {
        service_id: service.id,
        check_in_date: bookingData.startDate instanceof Date ? bookingData.startDate.toLocaleDateString('en-CA') : bookingData.startDate,
        check_out_date: bookingData.endDate instanceof Date ? bookingData.endDate.toLocaleDateString('en-CA') : (bookingData.endDate || bookingData.startDate),
        num_adults: isTour ? bookingData.quantity : bookingData.adults,
        num_children: isTour ? 0 : bookingData.children,
        quantity: isTour ? 1 : bookingData.quantity, // Với Tour quantity thực chất là số vé (num_adults)
        contact_name: localContactName || profile?.name || user?.displayName,
        contact_email: user?.email,
        contact_phone: localContactPhone || profile?.phone_number,
        special_requests: specialRequests,
        coupon_code: appliedCoupon?.code,
        payment_method: paymentMethod,
        room_type_id: bookingData.roomType?.id
      };

      const response = await bookingApi.createBooking(bookingPayload);
      console.log('Create Booking Full Response Keys:', Object.keys(response));

      // Xác định đối tượng booking (linh hoạt giữa response.data hoặc chính response)
      const booking = (response.data && response.data.id) ? response.data : (response.id ? response : null);

      if (booking && booking.id) {
        console.log('Proceeding to initiate payment for booking:', booking.id);
        
        try {
          const payResponse = await bookingApi.initiatePayment(booking.id, paymentMethod);
          console.log('Initiate Payment Response Keys:', Object.keys(payResponse));

          // Xác định dữ liệu thanh toán (linh hoạt cấu trúc)
          const paymentData = (payResponse.data && (payResponse.data.qr_url || payResponse.data.payment_info)) 
                              ? payResponse.data 
                              : (payResponse.qr_url ? payResponse : null);

          if (paymentData) {
            setSubmitting(false);
            navigation.navigate('Payment', {
              bookingId: booking.id,
              paymentInfo: paymentData.payment_info || paymentData,
              totalAmount: totalAmount
            });
          } else {
            setSubmitting(false);
            Alert.alert('Lỗi thanh toán', payResponse.message || 'Không thể lấy thông tin thanh toán.');
          }
        } catch (payError) {
          console.error('Error in initiatePayment phase:', payError);
          setSubmitting(false);
          Alert.alert('Lỗi khởi tạo thanh toán', 'Đã tạo đơn hàng thành công nhưng gặp lỗi khi lấy thông tin thanh toán.');
        }
      } else {
        setSubmitting(false);
        Alert.alert('Lỗi', response.message || 'Không thể tạo đơn hàng hoặc phản hồi từ máy chủ không đúng định dạng.');
      }
    } catch (error) {
      console.error('Lỗi đặt chỗ:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentInfo) return;

    try {
      const response = await bookingApi.getPaymentStatus(paymentInfo.booking_id);
      if (response.success && response.data.payment_status === 'paid') {
        qrSheetRef.current?.close();
        Alert.alert(
          'Thành công',
          'Thanh toán thành công! Chuyến đi của bạn đã được xác nhận.',
          [{ text: 'Xem đơn đặt', onPress: () => navigation.navigate('Đặt chỗ') }]
        );
      } else {
        Alert.alert('Thông báo', 'Chúng tôi chưa nhận được thanh toán. Vui lòng thử lại sau vài giây.');
      }
    } catch (error) {
      console.error('Lỗi check status:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Skeleton width={24} height={24} borderRadius={12} />
          <Skeleton width={180} height={24} borderRadius={8} />
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.scrollContent}>
          <Skeleton width="100%" height={150} borderRadius={20} style={{ marginBottom: 20 }} />
          <Skeleton width="40%" height={20} borderRadius={6} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={120} borderRadius={16} style={{ marginBottom: 24 }} />
          <Skeleton width="40%" height={20} borderRadius={6} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={80} borderRadius={16} style={{ marginBottom: 24 }} />
          <Skeleton width="100%" height={180} borderRadius={16} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header tràn lên phía trên */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Xác nhận & Thanh toán</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Service Summary */}
        <View>
          <ServiceSummaryCard
            service={service}
            bookingData={bookingData}
            onEditDate={() => datePickerRef.current?.open()}
            onUpdateGuests={updateGuests}
            onUpdateQuantity={updateQuantity}
            setBookingData={setBookingData}
          />
        </View>

        {/* Contact Info (Sửa tại chỗ) */}
        <ContactInfoSection
          localContactName={localContactName}
          setLocalContactName={setLocalContactName}
          localContactPhone={localContactPhone}
          setLocalContactPhone={setLocalContactPhone}
          user={user}
        />

        {/* Special Requests */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Yêu cầu đặc biệt</AppText>
          <TextInput
            style={styles.textArea}
            placeholder="Ví dụ: Phòng không hút thuốc, check-in sớm..."
            multiline
            numberOfLines={3}
            value={specialRequests}
            onChangeText={setSpecialRequests}
          />
        </View>

        {/* Coupon */}
        <CouponSection
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          onApply={handleApplyCoupon}
          applying={applyingCoupon}
          appliedCoupon={appliedCoupon}
          onRemove={() => { setAppliedCoupon(null); setCouponCode(''); }}
        />

        {/* Payment Method */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Phương thức thanh toán</AppText>
          <TouchableOpacity
            style={[styles.paymentMethodCard, paymentMethod === 'sepay' && styles.paymentMethodActive]}
            onPress={() => setPaymentMethod('sepay')}
          >
            <View style={styles.paymentIconBox}>
              <Smartphone color={Colors.primary} size={20} />
            </View>
            <View style={styles.paymentContent}>
              <AppText style={styles.paymentName}>Thanh toán Online (SePay)</AppText>
              <AppText style={styles.paymentDesc}>Chuyển khoản QR, xác nhận tức thì</AppText>
            </View>
            {paymentMethod === 'sepay' ? (
              <CheckCircle2 color={Colors.primary} size={20} />
            ) : (
              <View style={styles.radioCircle} />
            )}
          </TouchableOpacity>
        </View>

        {/* Price Summary */}
        <PriceBreakdownCard
          subtotal={subtotal}
          discountAmount={discountAmount}
          totalAmount={totalAmount}
        />

        <View style={styles.securityNote}>
          <ShieldCheck size={16} color="#64748B" />
          <AppText style={styles.securityText}>Thanh toán của bạn được bảo mật tuyệt đối</AppText>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <AppText style={styles.footerLabel}>Tổng thanh toán</AppText>
          <AppText style={styles.footerValue}>{formatCurrency(totalAmount || 0)}</AppText>
        </View>
        <TouchableOpacity
          style={[styles.payButton, submitting && { opacity: 0.8 }]}
          onPress={handleConfirmBooking}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.payButtonText}>Đặt chỗ & Thanh toán</AppText>
          )}
        </TouchableOpacity>
      </View>

      <CustomDatePicker
        bottomSheetRef={datePickerRef}
        onSelectRange={onSelectDate}
        initialStartDate={bookingData.startDate}
        initialEndDate={bookingData.endDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    zIndex: 10
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  scrollContent: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  textArea: {
    backgroundColor: '#fff', borderRadius: 16, padding: 12, height: 80,
    borderWidth: 1, borderColor: '#F1F5F9', textAlignVertical: 'top', fontSize: 14
  },
  paymentMethodCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', gap: 12
  },
  paymentMethodActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '05' },
  paymentIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
  paymentContent: { flex: 1 },
  paymentName: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  paymentDesc: { fontSize: 12, color: Colors.textSecondary },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E2E8F0' },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  securityText: { fontSize: 12, color: '#64748B' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 34,
    flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9'
  },
  footerPrice: { flex: 1 },
  footerLabel: { fontSize: 12, color: Colors.textSecondary },
  footerValue: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  payButton: {
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 14, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

export default CheckoutScreen;
