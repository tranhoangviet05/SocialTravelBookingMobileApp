import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, ChevronRight, Ticket, RotateCcw, CheckCircle2, XCircle, Star } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import AppText from '../common/AppText';
import { formatCurrency } from '../../utils/helpers';
import StatusBadge from './StatusBadge';

const BookingCard = ({ booking, onPress, onAction }) => {
  const service = booking.service || {};
  const isPendingPayment = booking.payment_status === 'pending' && booking.status !== 'cancelled';
  const isAccommodation = ['hotel', 'homestay'].includes(service.type);

  const renderActionButton = () => {
    if (isPendingPayment) {
      return (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => onPress(booking, 'pay')}
        >
          <AppText style={styles.payButtonText}>Thanh toán ngay</AppText>
        </TouchableOpacity>
      );
    }

    if (isAccommodation && booking.status !== 'cancelled' && booking.status !== 'completed') {
      // Logic Check-in / Undo / Check-out
      if (!booking.tourist_check_in_at) {
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={() => onAction(booking, 'checkin')}
          >
            <CheckCircle2 size={16} color="#fff" />
            <AppText style={styles.actionButtonText}>Check-in</AppText>
          </TouchableOpacity>
        );
      }

      if (booking.tourist_check_in_at && !booking.is_checked_in) {
        return (
          <View style={{ alignItems: 'flex-end' }}>
            <AppText style={styles.waitingText}>Đang chờ xác nhận...</AppText>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#F1F5F9', marginTop: 4 }]}
              onPress={() => onAction(booking, 'undo-checkin')}
            >
              <RotateCcw size={16} color={Colors.textSecondary} />
              <AppText style={[styles.actionButtonText, { color: Colors.textSecondary }]}>Hoàn tác</AppText>
            </TouchableOpacity>
          </View>
        );
      }

      if (booking.is_checked_in && !booking.checked_out_at) {
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF4757' }]}
            onPress={() => onAction(booking, 'checkout')}
          >
            <XCircle size={16} color="#fff" />
            <AppText style={styles.actionButtonText}>Check-out</AppText>
          </TouchableOpacity>
        );
      }
    }

    // Nút Đánh giá nếu đã checkout hoặc hoàn thành
    if (booking.checked_out_at || booking.status === 'completed') {
       return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#FF8C00' }]}
          onPress={() => onPress(booking, 'review')}
        >
          <Star size={16} color="#fff" fill="#fff" />
          <AppText style={styles.actionButtonText}>Đánh giá</AppText>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.detailBtn}>
        <AppText style={styles.detailBtnText}>Chi tiết</AppText>
        <ChevronRight size={16} color={Colors.primary} />
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(booking)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: service.image || 'https://via.placeholder.com/150' }} 
          style={styles.serviceImage} 
        />
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <AppText style={styles.serviceName} numberOfLines={1}>{service.name}</AppText>
            <StatusBadge status={booking.status} paymentStatus={booking.payment_status} />
          </View>
          <View style={styles.infoRow}>
            <MapPin size={14} color={Colors.textSecondary} />
            <AppText style={styles.infoText} numberOfLines={1}>
              {service.type === 'hotel' ? 'Khách sạn' : service.type === 'homestay' ? 'Homestay' : 'Tour du lịch'}
            </AppText>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={14} color={Colors.textSecondary} />
            <AppText style={styles.infoText}>
              {new Date(booking.check_in_date).toLocaleDateString('vi-VN')}
              {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString('vi-VN')}`}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View>
          <AppText style={styles.priceLabel}>Tổng thanh toán</AppText>
          <AppText style={styles.priceValue}>{formatCurrency(booking.total_amount)}</AppText>
        </View>
        
        {renderActionButton()}
      </View>
      
      <View style={styles.bookingCodeContainer}>
        <Ticket size={12} color={Colors.textSecondary} style={{ opacity: 0.5 }} />
        <AppText style={styles.bookingCodeText}>Mã: {booking.booking_code}</AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row' },
  serviceImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F1F5F9' },
  headerInfo: { flex: 1, marginLeft: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: Colors.text, flex: 1, marginRight: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoText: { fontSize: 13, color: Colors.textSecondary },
  
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 11, color: Colors.textSecondary },
  priceValue: { fontSize: 17, fontWeight: 'bold', color: Colors.primary },
  
  payButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  payButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  waitingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  
  bookingCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  bookingCodeText: { fontSize: 10, color: Colors.textSecondary, letterSpacing: 0.5 },
});

export default BookingCard;
