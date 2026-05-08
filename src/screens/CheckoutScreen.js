import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldCheck, CheckCircle2, Smartphone } from 'lucide-react-native';
import AppText from '../components/common/AppText';
import { Colors } from '../constants/Colors';
import { bookingApi } from '../api/bookingApi';
import { profileApi } from '../api/profileApi';
import { useAuth } from '../hooks/useAuth';

// Components
import ServiceSummaryCard from '../components/checkout/ServiceSummaryCard';
import ContactInfoSection from '../components/checkout/ContactInfoSection';
import CouponSection from '../components/checkout/CouponSection';
import PriceBreakdownCard from '../components/checkout/PriceBreakdownCard';
import PaymentQRSheet from '../components/checkout/PaymentQRSheet';
import CustomDatePicker from '../components/home/CustomDatePicker';

const CheckoutScreen = ({ route, navigation }) => {
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

  // State cho dữ liệu đặt chỗ có thể chỉnh sửa
  const [bookingData, setBookingData] = useState({
    ...initialBookingData,
    startDate: new Date(initialBookingData.startDate),
    endDate: initialBookingData.endDate ? new Date(initialBookingData.endDate) : null
  });

  const qrSheetRef = useRef(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Lỗi tải profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGuests = (type, delta) => {
    setBookingData(prev => ({
      ...prev,
      [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + delta)
    }));
  };

  const onSelectDate = (range) => {
    if (range.startDate) {
      setBookingData(prev => ({
        ...prev,
        startDate: range.startDate,
        endDate: service.type === 'hotel' || service.type === 'homestay'
          ? new Date(range.startDate.getTime() + 86400000)
          : null
      }));
    }
  };

  const calculateSubtotal = () => {
    const basePrice = bookingData.roomType?.base_price || service.base_price || service.price || 0;
    const adults = bookingData.adults || 1;
    const children = bookingData.children || 0;

    if (['hotel', 'homestay'].includes(service.type)) {
      const nights = bookingData.nights || 1;
      return basePrice * nights;
    } else {
      return (basePrice * adults + (basePrice * 0.5 * children)) || 0;
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
    try {
      const bookingPayload = {
        service_id: service.id,
        check_in_date: bookingData.startDate.toISOString().split('T')[0],
        check_out_date: bookingData.endDate?.toISOString().split('T')[0],
        num_adults: bookingData.adults,
        num_children: bookingData.children,
        contact_name: profile?.name || user?.displayName,
        contact_email: user?.email,
        contact_phone: profile?.phone_number,
        special_requests: specialRequests,
        coupon_code: appliedCoupon?.code,
        payment_method: paymentMethod,
        room_type_id: bookingData.roomType?.id
      };

      const response = await bookingApi.createBooking(bookingPayload);

      if (response.success) {
        const bookingId = response.data.id;
        const payResponse = await bookingApi.initiatePayment(bookingId, paymentMethod);

        if (payResponse.success) {
          setPaymentInfo(payResponse.data);
          qrSheetRef.current?.open();
        }
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Xác nhận đặt dịch vụ</AppText>
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
          />
        </View>

        {/* Contact Info */}
        <ContactInfoSection
          profile={profile}
          user={user}
          onEdit={() => navigation.navigate('EditProfile')}
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
          <AppText style={styles.footerValue}>{(totalAmount || 0).toLocaleString()}đ</AppText>
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

      <PaymentQRSheet
        sheetRef={qrSheetRef}
        paymentInfo={paymentInfo}
        totalAmount={totalAmount}
        onCheckStatus={checkPaymentStatus}
      />

      <CustomDatePicker
        bottomSheetRef={datePickerRef}
        onSelectRange={onSelectDate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
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
