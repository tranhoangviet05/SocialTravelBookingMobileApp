import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ticket, X } from 'lucide-react-native';
import AppText from '../common/AppText';
import { Colors } from '../../constants/Colors';

const CouponSection = ({ couponCode, setCouponCode, onApply, applying, appliedCoupon, onRemove }) => {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>Mã giảm giá</AppText>
      <View style={styles.couponContainer}>
        <TextInput
          style={styles.couponInput}
          placeholder="Nhập mã ưu đãi"
          value={couponCode}
          onChangeText={setCouponCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity 
          style={[styles.applyButton, !couponCode.trim() && styles.applyButtonDisabled]}
          onPress={onApply}
          disabled={applying || !couponCode.trim()}
        >
          {applying ? <ActivityIndicator size="small" color="#fff" /> : <AppText style={styles.applyButtonText}>Áp dụng</AppText>}
        </TouchableOpacity>
      </View>
      {appliedCoupon && (
        <View style={styles.appliedCouponBadge}>
          <Ticket size={14} color={Colors.primary} />
          <AppText style={styles.appliedCouponText}>
            Đã áp dụng mã {appliedCoupon.code} (-{appliedCoupon.discount_amount.toLocaleString()}đ)
          </AppText>
          <TouchableOpacity onPress={onRemove}>
            <X size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  couponContainer: { flexDirection: 'row', gap: 10 },
  couponInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16,
    height: 48, borderWidth: 1, borderColor: '#F1F5F9', fontSize: 14
  },
  applyButton: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20,
    justifyContent: 'center', alignItems: 'center'
  },
  applyButtonDisabled: { backgroundColor: '#CBD5E1' },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  appliedCouponBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '10',
    padding: 10, borderRadius: 8, marginTop: 10, gap: 8
  },
  appliedCouponText: { flex: 1, fontSize: 12, color: Colors.primary, fontWeight: '500' },
});

export default CouponSection;
