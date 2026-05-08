import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../common/AppText';
import { Colors } from '../../constants/Colors';

const PriceBreakdownCard = ({ subtotal, discountAmount, totalAmount }) => {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>Chi tiết thanh toán</AppText>
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <AppText style={styles.priceLabel}>Tạm tính</AppText>
          <AppText style={styles.priceValue}>{(subtotal || 0).toLocaleString()}đ</AppText>
        </View>
        {discountAmount > 0 && (
          <View style={styles.priceRow}>
            <AppText style={styles.priceLabel}>Giảm giá</AppText>
            <AppText style={[styles.priceValue, { color: '#10B981' }]}>-{(discountAmount || 0).toLocaleString()}đ</AppText>
          </View>
        )}
        <View style={styles.priceRow}>
          <AppText style={styles.priceLabel}>Phí dịch vụ</AppText>
          <AppText style={styles.priceValue}>Miễn phí</AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <AppText style={styles.totalLabel}>Tổng cộng</AppText>
          <AppText style={styles.totalValue}>{(totalAmount || 0).toLocaleString()}đ</AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  priceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: Colors.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
});

export default PriceBreakdownCard;
