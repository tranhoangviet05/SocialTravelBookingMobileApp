import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert, Share, Modal, StatusBar } from 'react-native';
import { ChevronLeft, Copy, CheckCircle2, Clock, AlertCircle, Share2, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import AppText from '../components/common/AppText';
import { Colors } from '../constants/Colors';
import { bookingApi } from '../api/bookingApi';

const PaymentScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { bookingId, paymentInfo, totalAmount } = route.params;

  const [timeLeft, setTimeLeft] = useState(600); // 10 phút
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, success, failed
  const [pollingActive, setPollingActive] = useState(true);

  // Bộ đếm ngược
  useEffect(() => {
    if (timeLeft <= 0 || status === 'success') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  // Polling kiểm tra trạng thái mỗi 10s
  useEffect(() => {
    let interval;
    if (pollingActive && status === 'pending') {
      interval = setInterval(() => {
        checkPaymentStatus(true);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [pollingActive, status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Đã sao chép', `Đã sao chép ${label} vào bộ nhớ tạm.`);
  };

  const checkPaymentStatus = async (isSilent = false) => {
    if (!isSilent) setChecking(true);
    try {
      const res = await bookingApi.getPaymentStatus(bookingId);
      // Dữ liệu nằm trong res.data
      const bookingData = res.data || res;

      if (bookingData.payment_status === 'paid' || bookingData.status === 'confirmed') {
        setStatus('success');
        setPollingActive(false);
        // Tự động chuyển trang sau 3 giây nếu muốn (tùy chọn)
        /* 
        setTimeout(() => {
          navigation.navigate('Main', { screen: 'Đặt chỗ' });
        }, 3000);
        */
      } else if (bookingData.status === 'failed' || bookingData.status === 'cancelled') {
        setStatus('failed');
        setPollingActive(false);
      } else if (!isSilent) {
        Alert.alert('Chưa nhận được thanh toán', 'Hệ thống chưa ghi nhận thanh toán của bạn. Vui lòng chờ vài phút hoặc kiểm tra lại nội dung chuyển khoản.');
      }
    } catch (error) {
      console.error('Lỗi check status:', error);
    } finally {
      if (!isSilent) setChecking(false);
    }
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const CANCEL_REASONS = [
    'Thay đổi kế hoạch du lịch',
    'Thông tin đơn hàng bị sai',
    'Tìm thấy dịch vụ khác tốt hơn',
    'Gặp lỗi khi thanh toán',
    'Lý do khác'
  ];

  const handleCancelBooking = async () => {
    if (!selectedReason) {
      Alert.alert('Thông báo', 'Vui lòng chọn lý do hủy.');
      return;
    }

    setCancelling(true);
    try {
      const res = await bookingApi.cancelBooking(bookingId, selectedReason);
      if (res.success) {
        setShowCancelModal(false);
        Alert.alert('Thành công', 'Đơn hàng của bạn đã được hủy.', [
          { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Đặt chỗ' }) }
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi hủy đơn:', error);
      Alert.alert('Lỗi', 'Không thể hủy đơn hàng lúc này.');
    } finally {
      setCancelling(false);
    }
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `Thanh toán đơn hàng ${bookingId}. Nội dung: ${paymentInfo.transfer_content}. Số tiền: ${totalAmount.toLocaleString()}đ`,
        url: paymentInfo.qr_url,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  if (status === 'success') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <View>
            <CheckCircle2 size={100} color="#10B981" />
          </View>
          <AppText style={styles.successTitle}>Thanh toán thành công!</AppText>
          <AppText style={styles.successDesc}>Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ gửi thông tin chi tiết qua email.</AppText>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('Main', { screen: 'Đặt chỗ' })}
          >
            <AppText style={styles.doneButtonText}>Xem đơn hàng của tôi</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Thanh toán QR</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Countdown Timer */}
        <View style={styles.timerSection}>
          <Clock size={20} color={timeLeft < 60 ? '#EF4444' : Colors.primary} />
          <AppText style={[styles.timerText, timeLeft < 60 && { color: '#EF4444' }]}>
            Vui lòng thanh toán trong: {formatTime(timeLeft)}
          </AppText>
        </View>

        {/* QR Card */}
        <View style={styles.qrCard}>
          <AppText style={styles.qrHeader}>Quét mã VietQR để thanh toán</AppText>
          <View style={styles.qrWrapper}>
            {paymentInfo?.qr_url ? (
              <Image source={{ uri: paymentInfo.qr_url }} style={styles.qrImage} resizeMode="contain" />
            ) : (
              <ActivityIndicator size="large" color={Colors.primary} />
            )}
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareQR}>
            <Share2 size={18} color={Colors.primary} />
            <AppText style={styles.shareBtnText}>Lưu hoặc Chia sẻ mã QR</AppText>
          </TouchableOpacity>
        </View>

        {/* Transfer Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View>
              <AppText style={styles.infoLabel}>Số tiền cần thanh toán</AppText>
              <AppText style={styles.infoValueLarge}>{totalAmount?.toLocaleString()}đ</AppText>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(totalAmount.toString(), 'Số tiền')}>
              <Copy size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.infoLabel}>Nội dung chuyển khoản</AppText>
              <AppText style={[styles.infoValue, { color: Colors.primary }]}>{paymentInfo?.transfer_content}</AppText>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(paymentInfo?.transfer_content, 'Nội dung')}>
              <Copy size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.infoLabel}>Số tài khoản thụ hưởng</AppText>
              <AppText style={styles.infoValue}>{paymentInfo?.bank_account || '0123456789'}</AppText>
              <AppText style={styles.bankName}>{paymentInfo?.bank_code === 'MB' ? 'MB Bank - Ngân hàng Quân Đội' : (paymentInfo?.bank_code || 'Ngân hàng thụ hưởng')}</AppText>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(paymentInfo?.bank_account, 'Số tài khoản')}>
              <Copy size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <AlertCircle size={20} color="#B45309" />
          <View style={{ flex: 1 }}>
            <AppText style={styles.warningTitle}>Lưu ý quan trọng</AppText>
            <AppText style={styles.warningText}>
              Vui lòng chuyển <AppText style={{ fontWeight: 'bold' }}>CHÍNH XÁC</AppText> nội dung chuyển khoản để hệ thống tự động xác nhận đơn hàng của bạn.
              Hành động này không thể hoàn tác! Nếu có bất kì lỗi nào hãy báo ngay cho chúng tôi
            </AppText>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.checkBtn, checking && { opacity: 0.8 }]}
          onPress={() => checkPaymentStatus(false)}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <AppText style={styles.checkBtnText}>Tôi đã thanh toán</AppText>
              <ShieldCheck size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowCancelModal(true)}
        >
          <AppText style={styles.cancelBtnText}>Hủy giao dịch</AppText>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal chọn lý do hủy */}
      <View>
        <StatusBar barStyle={showCancelModal ? "light-content" : "dark-content"} />
        <Modal
          visible={showCancelModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalDismiss} 
              activeOpacity={1} 
              onPress={() => setShowCancelModal(false)} 
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <AppText style={styles.modalTitle}>Lý do hủy đơn hàng</AppText>
                <AppText style={styles.modalSubtitle}>Vui lòng cho chúng tôi biết tại sao bạn muốn hủy</AppText>
              </View>

              <View style={styles.reasonsList}>
                {CANCEL_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonItem,
                      selectedReason === reason && styles.selectedReasonItem
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <AppText style={[
                      styles.reasonText,
                      selectedReason === reason && styles.selectedReasonText
                    ]}>
                      {reason}
                    </AppText>
                    <View style={[
                      styles.radioCircle,
                      selectedReason === reason && styles.selectedRadioCircle
                    ]}>
                      {selectedReason === reason && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelModalBtn}
                  onPress={() => setShowCancelModal(false)}
                >
                  <AppText style={styles.cancelModalBtnText}>Quay lại</AppText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.confirmModalBtn,
                    (!selectedReason || cancelling) && { opacity: 0.5 }
                  ]}
                  onPress={handleCancelBooking}
                  disabled={!selectedReason || cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <AppText style={styles.confirmModalBtnText}>Xác nhận hủy</AppText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', zIndex: 10
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  scrollContent: { padding: 20, paddingBottom: 40 },

  timerSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', paddingVertical: 12, borderRadius: 16,
    marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#F1F5F9'
  },
  timerText: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },

  qrCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 15, elevation: 3
  },
  qrHeader: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 20 },
  qrWrapper: {
    width: 240, height: 240, backgroundColor: '#fff', borderRadius: 20,
    padding: 10, borderWidth: 1, borderColor: '#F1F5F9'
  },
  qrImage: { width: '100%', height: '100%' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  shareBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  infoSection: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  infoValueLarge: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  bankName: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  warningBox: {
    flexDirection: 'row', gap: 12, backgroundColor: '#FFFBEB',
    padding: 16, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#FEF3C7'
  },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400E', marginBottom: 2 },
  warningText: { fontSize: 13, color: '#B45309', lineHeight: 18 },

  checkBtn: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 18,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  checkBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },

  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginTop: 24, marginBottom: 12 },
  successDesc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  doneButton: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 30, paddingVertical: 16, borderRadius: 16
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 400,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reasonsList: {
    marginBottom: 32,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedReasonItem: {
    borderBottomColor: Colors.primary + '33',
  },
  reasonText: {
    fontSize: 15,
    color: Colors.text,
  },
  selectedReasonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioCircle: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelModalBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  confirmModalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  confirmModalBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PaymentScreen;
