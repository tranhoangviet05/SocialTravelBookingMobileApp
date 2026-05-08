import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { AlertCircle } from 'lucide-react-native';
import AppText from '../common/AppText';
import { Colors } from '../../constants/Colors';

const PaymentQRSheet = ({ sheetRef, paymentInfo, totalAmount, onCheckStatus }) => {
  return (
    <RBSheet
      ref={sheetRef}
      height={600}
      closeOnDragDown={true}
      customStyles={{
        container: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 }
      }}
    >
      <View style={styles.qrSheetContent}>
        <AppText style={styles.qrTitle}>Thanh toán qua QR Code</AppText>
        <AppText style={styles.qrSubtitle}>Sử dụng ứng dụng Ngân hàng của bạn để quét mã QR bên dưới</AppText>
        
        <View style={styles.qrWrapper}>
          {paymentInfo?.qr_url ? (
            <Image source={{ uri: paymentInfo.qr_url }} style={styles.qrImage} />
          ) : (
            <ActivityIndicator size="large" color={Colors.primary} />
          )}
        </View>
        
        <View style={styles.transferDetails}>
          <View style={styles.transferItem}>
            <AppText style={styles.transferLabel}>Số tiền:</AppText>
            <AppText style={styles.transferValue}>{(totalAmount || 0).toLocaleString()}đ</AppText>
          </View>
          <View style={styles.transferItem}>
            <AppText style={styles.transferLabel}>Nội dung:</AppText>
            <AppText style={[styles.transferValue, { color: Colors.primary }]}>{paymentInfo?.transfer_content}</AppText>
          </View>
        </View>
        
        <View style={styles.alertBox}>
          <AlertCircle size={16} color="#B45309" />
          <AppText style={styles.alertText}>Vui lòng giữ đúng nội dung chuyển khoản để hệ thống tự động xác nhận đơn.</AppText>
        </View>
        
        <TouchableOpacity 
          style={styles.checkPaymentBtn}
          onPress={onCheckStatus}
        >
          <AppText style={styles.checkPaymentBtnText}>Tôi đã thanh toán</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelPaymentBtn}
          onPress={() => sheetRef.current?.close()}
        >
          <AppText style={styles.cancelPaymentBtnText}>Đóng</AppText>
        </TouchableOpacity>
      </View>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  qrSheetContent: { alignItems: 'center' },
  qrTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  qrSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  qrWrapper: { 
    width: 220, height: 220, backgroundColor: '#fff', borderRadius: 20, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  qrImage: { width: 200, height: 200 },
  transferDetails: { width: '100%', marginTop: 24, gap: 12 },
  transferItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  transferLabel: { fontSize: 14, color: Colors.textSecondary },
  transferValue: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  alertBox: { 
    flexDirection: 'row', gap: 10, backgroundColor: '#FFFBEB', 
    padding: 12, borderRadius: 12, marginTop: 16, alignItems: 'center' 
  },
  alertText: { flex: 1, fontSize: 12, color: '#B45309' },
  checkPaymentBtn: { 
    width: '100%', backgroundColor: Colors.primary, paddingVertical: 16, 
    borderRadius: 16, alignItems: 'center', marginTop: 24 
  },
  checkPaymentBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelPaymentBtn: { width: '100%', paddingVertical: 14, alignItems: 'center' },
  cancelPaymentBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' }
});

export default PaymentQRSheet;
