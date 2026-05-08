import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, Calendar, Users, Home, Info, CheckCircle2, BedDouble, ShieldCheck, Ticket } from 'lucide-react-native';
import AppText from '../common/AppText';
import { Colors } from '../../constants/Colors';
import { BASE_URL } from '../../api/apiClient';

const ServiceSummaryCard = ({ service, bookingData, onEditDate, onUpdateGuests, onUpdateQuantity, setBookingData }) => {
  const isTour = service.type?.toLowerCase() === 'tour';
  const isHotelOrHomestay = ['hotel', 'homestay'].includes(service.type?.toLowerCase());

  // Helper để lấy chuỗi YYYY-MM-DD theo giờ địa phương
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Lấy danh sách 7 ngày tới
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days;
  };

  const next7Days = getNext7Days();

  // Tìm thông tin availability cho một ngày cụ thể (Chỉ lấy từ service)
  const getAvailabilityForDate = (date) => {
    const dateStr = getLocalDateString(date);
    const availabilities = service.availabilities || [];
    return availabilities.find(a => a.date === dateStr);
  };

  const handleSelectTourDate = (date, availability) => {
    if (!availability || availability.remaining < (bookingData.quantity || 1)) return;
    
    setBookingData(prev => ({
      ...prev,
      startDate: new Date(date),
      endDate: null
    }));
  };

  return (
    <View style={styles.card}>
      {/* Thông tin dịch vụ chính */}
      <View style={styles.serviceInfo}>
        <Image
          source={{ uri: service.media?.[0]?.url ? (service.media[0].url.startsWith('http') ? service.media[0].url : `${BASE_URL}/${service.media[0].url}`) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945' }}
          style={styles.serviceImage}
        />
        <View style={styles.serviceDetails}>
          <AppText style={styles.serviceType}>{isTour ? 'Tour du lịch' : isHotelOrHomestay ? 'Chỗ ở' : 'Dịch vụ'}</AppText>
          <AppText style={styles.serviceName} numberOfLines={2}>{service.name}</AppText>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <AppText style={styles.locationText}>{service.location?.name || service.destination?.name || 'Việt Nam'}</AppText>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* GIAO DIỆN DÀNH RIÊNG CHO TOUR */}
      {isTour ? (
        <View style={styles.tourConfig}>
          {/* Số lượng vé */}
          <View style={styles.ticketSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
                <Ticket size={18} color="#EA580C" />
              </View>
              <AppText style={styles.sectionTitle}>Số lượng vé</AppText>
            </View>
            <View style={styles.counterRowLarge}>
              <TouchableOpacity onPress={() => onUpdateQuantity(-1)} style={styles.largeCounterBtn}>
                <AppText style={styles.largeCounterText}>-</AppText>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <AppText style={styles.quantityValue}>{bookingData.quantity || 1}</AppText>
                <AppText style={styles.quantityUnit}>Vé</AppText>
              </View>
              <TouchableOpacity onPress={() => onUpdateQuantity(1)} style={styles.largeCounterBtn}>
                <AppText style={styles.largeCounterText}>+</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Danh sách ngày khởi hành 7 ngày tới */}
          <View style={styles.dateListSection}>
            <AppText style={styles.subTitle}>Ngày khởi hành (7 ngày tới)</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
              {next7Days.map((date, idx) => {
                const availability = getAvailabilityForDate(date);
                const dateStr = getLocalDateString(date);
                const selectedDateStr = bookingData.startDate ? getLocalDateString(bookingData.startDate) : '';
                const isSelected = selectedDateStr === dateStr;
                
                const remaining = availability?.remaining || 0;
                const isDisabled = !availability || remaining < (bookingData.quantity || 1);

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCard,
                      isSelected && styles.dayCardSelected,
                      isDisabled && styles.dayCardDisabled
                    ]}
                    onPress={() => handleSelectTourDate(date, availability)}
                    disabled={isDisabled}
                  >
                    <AppText style={[styles.dayOfWeek, isSelected && styles.textWhite, isDisabled && styles.textDisabled]}>
                      {idx === 0 ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </AppText>
                    <AppText style={[styles.dayMonth, isSelected && styles.textWhite, isDisabled && styles.textDisabled]}>
                      {date.getDate()}/{date.getMonth() + 1}
                    </AppText>
                    <View style={[styles.slotBadge, isSelected && styles.slotBadgeSelected, isDisabled && styles.slotBadgeDisabled]}>
                      <AppText style={[styles.slotText, isSelected && styles.textPrimary]}>
                        {remaining > 0 ? `${remaining} chỗ` : 'Hết chỗ'}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : (
        /* GIAO DIỆN CHO KHÁCH SẠN / HOMESTAY */
        <View style={styles.bookingMeta}>
          {/* Giữ nguyên logic cũ */}
          <TouchableOpacity style={styles.metaRow} onPress={onEditDate}>
            <View style={styles.iconCircle}>
              <Calendar size={18} color={Colors.primary} />
            </View>
            <View style={styles.metaContent}>
              <AppText style={styles.metaLabel}>Thời gian sử dụng</AppText>
              <AppText style={styles.metaValue}>
                {bookingData.startDate instanceof Date ? bookingData.startDate.toLocaleDateString('vi-VN') : bookingData.startDate}
                {bookingData.endDate ? ` - ${bookingData.endDate instanceof Date ? bookingData.endDate.toLocaleDateString('vi-VN') : bookingData.endDate}` : ''}
              </AppText>
            </View>
            <AppText style={styles.editBtn}>Sửa</AppText>
          </TouchableOpacity>

          <View style={styles.metaRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
              <Home size={18} color="#0EA5E9" />
            </View>
            <View style={styles.metaContent}>
              <AppText style={styles.metaLabel}>Số lượng phòng</AppText>
              <View style={styles.counterRow}>
                <TouchableOpacity onPress={() => onUpdateQuantity(-1)} style={styles.miniCounterBtn}>
                  <AppText style={styles.miniCounterText}>-</AppText>
                </TouchableOpacity>
                <AppText style={styles.counterValueText}>{bookingData.quantity || 1}</AppText>
                <TouchableOpacity onPress={() => onUpdateQuantity(1)} style={styles.miniCounterBtn}>
                  <AppText style={styles.miniCounterText}>+</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Chi tiết loại phòng / Tour Option */}
      {bookingData.roomType && (
        <View style={styles.roomDetailCard}>
          <View style={styles.roomHeader}>
            <BedDouble size={16} color={Colors.primary} />
            <AppText style={styles.roomName}>{bookingData.roomType.name}</AppText>
            <View style={styles.rankBadge}>
              <AppText style={styles.rankText}>{isTour ? 'TOUR OPTION' : (bookingData.roomType.rank?.toUpperCase() || 'STANDARD')}</AppText>
            </View>
          </View>
          
          {!isTour && (
            <View style={styles.roomStatsGrid}>
              <View style={styles.roomStat}>
                <AppText style={styles.roomStatLabel}>Sức chứa</AppText>
                <AppText style={styles.roomStatValue}>
                  {bookingData.roomType.capacity_adults} NL {bookingData.roomType.capacity_children > 0 ? `+ ${bookingData.roomType.capacity_children} TE` : ''}
                </AppText>
              </View>
              <View style={styles.roomStat}>
                <AppText style={styles.roomStatLabel}>Tối đa khách</AppText>
                <AppText style={[styles.roomStatValue, { color: Colors.primary }]}>
                  {(bookingData.roomType.capacity_adults + bookingData.roomType.capacity_children) * (bookingData.quantity || 1)} người
                </AppText>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 15, elevation: 5, marginBottom: 20,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  serviceInfo: { flexDirection: 'row', alignItems: 'center' },
  serviceImage: { width: 70, height: 70, borderRadius: 16 },
  serviceDetails: { flex: 1, marginLeft: 16 },
  serviceType: { fontSize: 11, color: Colors.primary, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  serviceName: { fontSize: 17, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 13, color: Colors.textSecondary, marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 18 },
  
  tourConfig: { gap: 20 },
  ticketSection: { backgroundColor: '#FFF7ED', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#FFEDD5' },
  counterRowLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 30 },
  largeCounterBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  largeCounterText: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
  quantityDisplay: { alignItems: 'center' },
  quantityValue: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  quantityUnit: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  
  dateListSection: { marginTop: 10 },
  subTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' },
  daysScroll: { paddingBottom: 5 },
  dayCard: { width: 85, height: 100, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 12, gap: 4 },
  dayCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayCardDisabled: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9', opacity: 0.5 },
  dayOfWeek: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  dayMonth: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  slotBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.primary + '10', marginTop: 4 },
  slotBadgeSelected: { backgroundColor: '#fff' },
  slotBadgeDisabled: { backgroundColor: '#E2E8F0' },
  slotText: { fontSize: 10, fontWeight: 'bold', color: Colors.primary },
  textWhite: { color: '#fff' },
  textPrimary: { color: Colors.primary },
  textDisabled: { color: '#94A3B8' },

  bookingMeta: { gap: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' },
  metaContent: { flex: 1, marginLeft: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  metaLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: '700', color: Colors.text },
  editBtn: { fontSize: 12, color: Colors.primary, fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 5 },
  counterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  miniCounterBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  miniCounterText: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  counterValueText: { fontSize: 14, fontWeight: 'bold', color: Colors.text, paddingHorizontal: 12, minWidth: 100 },
  
  roomDetailCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 15, marginTop: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  roomHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  roomName: { fontSize: 15, fontWeight: 'bold', color: Colors.text, marginLeft: 8, flex: 1 },
  rankBadge: { backgroundColor: Colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rankText: { fontSize: 9, fontWeight: 'bold', color: Colors.primary },
  roomStatsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  roomStat: { flex: 1 },
  roomStatLabel: { fontSize: 10, color: Colors.textSecondary, marginBottom: 2 },
  roomStatValue: { fontSize: 12, fontWeight: 'bold', color: Colors.text },
});

export default ServiceSummaryCard;


