import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Users } from 'lucide-react-native';
import AppText from '../common/AppText';
import { Colors } from '../../constants/Colors';
import { BASE_URL } from '../../api/apiClient';

const ServiceSummaryCard = ({ service, bookingData, onEditDate, onUpdateGuests }) => {
  return (
    <View style={styles.card}>
      <View style={styles.serviceInfo}>
        <Image
          source={{ uri: service.media?.[0]?.url ? (service.media[0].url.startsWith('http') ? service.media[0].url : `${BASE_URL}/${service.media[0].url}`) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945' }}
          style={styles.serviceImage}
        />
        <View style={styles.serviceDetails}>
          <AppText style={styles.serviceType}>{service.type === 'tour' ? 'Tour' : service.type === 'hotel' ? 'Khách sạn' : service.type === 'homestay' ? 'Homestay' : 'Phương tiện'}</AppText>
          <AppText style={styles.serviceName} numberOfLines={2}>{service.name}</AppText>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <AppText style={styles.locationText}>{service.destination?.name || 'Việt Nam'}</AppText>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bookingMeta}>
        <TouchableOpacity style={styles.metaItem} onPress={onEditDate}>
          <Calendar size={18} color={Colors.primary} />
          <View style={styles.metaTextContainer}>
            <AppText style={styles.metaLabel}>Thời gian</AppText>
            <AppText style={styles.metaValue}>
              {bookingData.startDate.toLocaleDateString('vi-VN')}
              {bookingData.endDate ? ` - ${bookingData.endDate.toLocaleDateString('vi-VN')}` : ''}
            </AppText>
          </View>
        </TouchableOpacity>

        <View style={styles.metaItem}>
          <Users size={18} color={Colors.primary} />
          <View style={styles.metaTextContainer}>
            <AppText style={styles.metaLabel}>Số lượng khách</AppText>
            <View style={styles.guestCounter}>
              <TouchableOpacity onPress={() => onUpdateGuests('adults', -1)} style={styles.counterBtn}>
                <AppText style={styles.counterText}>-</AppText>
              </TouchableOpacity>
              <AppText style={styles.metaValue}>{bookingData.adults} NL</AppText>
              <TouchableOpacity onPress={() => onUpdateGuests('adults', 1)} style={styles.counterBtn}>
                <AppText style={styles.counterText}>+</AppText>
              </TouchableOpacity>

              <View style={{ width: 10 }} />

              <TouchableOpacity onPress={() => onUpdateGuests('children', -1)} style={styles.counterBtn}>
                <AppText style={styles.counterText}>-</AppText>
              </TouchableOpacity>
              <AppText style={styles.metaValue}>{bookingData.children} TE</AppText>
              <TouchableOpacity onPress={() => onUpdateGuests('children', 1)} style={styles.counterBtn}>
                <AppText style={styles.counterText}>+</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {bookingData.roomType && (
        <View style={styles.roomTypeInfo}>
          <AppText style={styles.roomTypeLabel}>Loại phòng: </AppText>
          <AppText style={styles.roomTypeValue}>{bookingData.roomType.name}</AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20
  },
  serviceInfo: { flexDirection: 'row', alignItems: 'center' },
  serviceImage: { width: 80, height: 80, borderRadius: 12 },
  serviceDetails: { flex: 1, marginLeft: 12 },
  serviceType: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  bookingMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  metaTextContainer: { marginLeft: 10 },
  metaLabel: { fontSize: 10, color: Colors.textSecondary },
  metaValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  roomTypeInfo: { marginTop: 12, flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
  roomTypeLabel: { fontSize: 12, color: Colors.textSecondary },
  roomTypeValue: { fontSize: 12, color: Colors.text, fontWeight: '600' },
  guestCounter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  counterBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
  counterText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
});

export default ServiceSummaryCard;
