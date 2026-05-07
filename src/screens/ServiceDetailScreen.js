import React from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Image, Linking, Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, MapPin, Star, Share2,
  Heart, Calendar, Users, Info, ExternalLink
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { BASE_URL } from '../api/apiClient';

const { width } = Dimensions.get('window');

const ServiceDetailScreen = ({ route, navigation }) => {
  // Giả định dữ liệu được truyền qua route params
  const { service } = route.params || {
    service: {
      name: 'Khách sạn Sample',
      address: '123 Đường Lê Lợi, Quận 1, TP. HCM',
      latitude: 10.7769,
      longitude: 106.7009,
      base_price: 1500000,
      rating_avg: 4.8,
      total_reviews: 120,
      description: 'Mô tả chi tiết về dịch vụ này...',
      media: []
    }
  };

  const handleOpenMaps = () => {
    if (!service.latitude || !service.longitude) {
      alert('Dịch vụ này chưa có tọa độ chính xác.');
      return;
    }

    const fullAddress = encodeURIComponent(`${service.name} ${service.address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${fullAddress}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        alert('Không thể mở ứng dụng bản đồ.');
      }
    });
  };

  const getImageUrl = (media) => {
    if (media && media.length > 0) {
      const url = media[0].url;
      return url.startsWith('http') ? url : `${BASE_URL}/${url}`;
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: getImageUrl(service.media) }} style={styles.image} />
          
          <TouchableOpacity 
            style={[styles.headerButton, { left: 20 }]} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#000" size={24} />
          </TouchableOpacity>

          <View style={styles.headerRightButtons}>
            <TouchableOpacity style={styles.headerButton}><Share2 color="#000" size={20} /></TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}><Heart color="#000" size={20} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{service.name}</Text>
            <View style={styles.ratingBox}>
              <Star color="#FFD700" size={16} fill="#FFD700" />
              <Text style={styles.ratingText}>{service.rating_avg}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.locationRow} onPress={handleOpenMaps}>
            <MapPin color={Colors.primary} size={18} />
            <Text style={styles.address} numberOfLines={2}>{service.address}</Text>
            <ExternalLink color={Colors.primary} size={16} style={{ marginLeft: 5 }} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Quick Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Calendar color={Colors.textSecondary} size={20} />
              <Text style={styles.infoLabel}>Thời gian</Text>
              <Text style={styles.infoValue}>Linh hoạt</Text>
            </View>
            <View style={styles.infoItem}>
              <Users color={Colors.textSecondary} size={20} />
              <Text style={styles.infoLabel}>Sức chứa</Text>
              <Text style={styles.infoValue}>{service.max_guests || 'N/A'} người</Text>
            </View>
            <View style={styles.infoItem}>
              <Info color={Colors.textSecondary} size={20} />
              <Text style={styles.infoLabel}>Loại hình</Text>
              <Text style={styles.infoValue}>{service.type?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.description}>{service.description || 'Chưa có mô tả chi tiết.'}</Text>

          {/* Map Preview Placeholder */}
          {service.latitude && (
            <TouchableOpacity style={styles.mapPreview} onPress={handleOpenMaps}>
              <View style={styles.mapPlaceholder}>
                <MapPin color={Colors.primary} size={32} />
                <Text style={styles.viewMapText}>Bấm để xem trên Google Maps</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Giá từ</Text>
          <Text style={styles.priceValue}>{Number(service.base_price).toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: '100%', height: 300, position: 'relative' },
  image: { width: '100%', height: '100%' },
  headerButton: {
    position: 'absolute',
    top: 50,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headerRightButtons: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 10
  },
  content: { padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, flex: 1, marginRight: 10 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF9E5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  ratingText: { fontWeight: 'bold', color: '#B8860B' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  address: { flex: 1, marginLeft: 8, color: Colors.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: Colors.text, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24 },
  mapPreview: { marginTop: 20, borderRadius: 20, overflow: 'hidden', height: 150, backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#E0F2FE' },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyCenter: 'center', gap: 10, paddingTop: 40 },
  viewMapText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceLabel: { fontSize: 12, color: Colors.textSecondary },
  priceValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  bookButton: { backgroundColor: Colors.primary, paddingHorizontal: 40, paddingVertical: 12, borderRadius: 15 },
  bookButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ServiceDetailScreen;
