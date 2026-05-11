import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertCircle, XCircle, CheckCircle2, Clock } from 'lucide-react-native';
import AppText from '../common/AppText';

const StatusBadge = ({ status, paymentStatus }) => {
  let config = {
    label: 'Không xác định',
    color: '#64748B',
    bgColor: '#F1F5F9',
    icon: AlertCircle
  };

  if (status === 'cancelled') {
    config = { label: 'Đã hủy', color: '#EF4444', bgColor: '#FEF2F2', icon: XCircle };
  } else if (status === 'completed') {
    config = { label: 'Hoàn thành', color: '#10B981', bgColor: '#ECFDF5', icon: CheckCircle2 };
  } else if (status === 'confirmed') {
    config = { label: 'Đã xác nhận', color: '#3B82F6', bgColor: '#EFF6FF', icon: CheckCircle2 };
  } else if (paymentStatus === 'pending') {
    config = { label: 'Chờ thanh toán', color: '#F59E0B', bgColor: '#FFFBEB', icon: Clock };
  } else if (status === 'pending') {
    config = { label: 'Chờ xử lý', color: '#8B5CF6', bgColor: '#F5F3FF', icon: Clock };
  }

  const Icon = config.icon;

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Icon size={12} color={config.color} />
      <AppText style={[styles.badgeText, { color: config.color }]}>{config.label}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
});

export default StatusBadge;
