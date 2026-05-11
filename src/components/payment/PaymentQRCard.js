import React from 'react';
import { StyleSheet, View, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import AppText from '../common/AppText';

const PaymentQRCard = ({ qrUrl, onShare }) => {
  return (
    <View style={styles.qrCard}>
      <AppText style={styles.qrHeader}>Quét mã VietQR để thanh toán</AppText>
      <View style={styles.qrWrapper}>
        {qrUrl ? (
          <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
        ) : (
          <ActivityIndicator size="large" color={Colors.primary} />
        )}
      </View>
      <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
        <Share2 size={18} color={Colors.primary} />
        <AppText style={styles.shareBtnText}>Lưu hoặc Chia sẻ mã QR</AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default PaymentQRCard;
