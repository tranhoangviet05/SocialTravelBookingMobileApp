import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Image, Dimensions,
  TextInput, ImageBackground, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, MapPin, Users, Calendar as CalendarIcon, 
  ChevronRight, Star, ShieldCheck, Headphones, 
  Zap, Gift, Sparkles, Lightbulb, Navigation 
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import HomeHeader from '../components/home/HomeHeader';
import CustomDatePicker from '../components/home/CustomDatePicker';
import GuestPicker from '../components/home/GuestPicker';
import apiClient, { BASE_URL } from '../api/apiClient';

const HEADER_DARK = '#0077B6';
const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState('stay');
  const [selectedRange, setSelectedRange] = useState({ startDate: null, endDate: null });
  const [guests, setGuests] = useState({ rooms: 1, adults: 2, children: 0 });
  
  // State for dynamic data
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const datePickerRef = useRef(null);
  const guestPickerRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Gọi song song các API
      const [locationsRes, couponsRes] = await Promise.all([
        apiClient.get('/general/get/locations?is_popular=true'),
        apiClient.get('/general/get/coupons')
      ]);

      if (locationsRes.success) {
        setTrendingDestinations(locationsRes.data);
      }
      if (couponsRes.success) {
        setOffers(couponsRes.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu trang chủ:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const whyChooseUsData = [
    { id: 1, title: 'Uy tín hàng đầu', desc: 'Hơn 1000 đối tác tin cậy toàn cầu.', Icon: Star, color: '#FFD700' },
    { id: 2, title: 'Bảo mật 100%', desc: 'Thanh toán an toàn, bảo mật dữ liệu.', Icon: ShieldCheck, color: '#4CAF50' },
    { id: 3, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ hỗ trợ tận tâm mọi lúc.', Icon: Headphones, color: '#2196F3' },
    { id: 4, title: 'Giá tốt nhất', desc: 'Cam kết mức giá cạnh tranh nhất.', Icon: Zap, color: '#FF5722' },
  ];

  // Helper function to get random gradient for offers
  const getOfferGradient = (index) => {
    const gradients = [
      ['#FF9A8B', '#FF6A88'],
      ['#A18CD1', '#FBC2EB'],
      ['#84FAB0', '#8FD3F4'],
      ['#FAD0C4', '#FFD1FF'],
    ];
    return gradients[index % gradients.length];
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://vcdn1-dulich.vnecdn.net/2022/10/18/3-1666085449.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Zf0C_T-7k6eUjW-1-4gCag';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}/${url}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <HomeHeader activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={{ backgroundColor: '#fff' }}
      >
        {/* Search Section */}
        <LinearGradient
          colors={[HEADER_DARK, Colors.primary, '#80D4F7', '#fff']}
          locations={[0, 0.3, 0.65, 1]}
          style={styles.searchGradient}
        >
          <View style={styles.searchCard}>
            <TouchableOpacity style={styles.searchInputRow}>
              <MapPin color={Colors.primary} size={20} />
              <TextInput
                style={styles.textInput}
                placeholder="Nhập điểm đến"
                placeholderTextColor={Colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchInputRow}
              onPress={() => datePickerRef.current?.open()}
            >
              <CalendarIcon color={Colors.primary} size={20} />
              <Text style={[styles.textInput, !selectedRange.startDate && { color: Colors.textSecondary }]}>
                {selectedRange.startDate
                  ? `${formatDate(selectedRange.startDate)} - ${formatDate(selectedRange.endDate)}`
                  : 'Nhập ngày đi - về'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchInputRow}
              onPress={() => guestPickerRef.current?.open()}
            >
              <Users color={Colors.primary} size={20} />
              <Text style={styles.textInput}>
                {guests.rooms} phòng, {guests.adults} người lớn, {guests.children} trẻ em
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 1. Trending Destinations (Large Carousel) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Điểm đến đang thịnh hành</Text>
        </View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ margin: 50 }} />
          ) : (
            trendingDestinations.map(dest => (
              <TouchableOpacity key={dest.id} style={styles.featuredCard}>
                <ImageBackground
                  source={{ uri: getImageUrl(dest.image_url) }}
                  style={styles.featuredImage}
                  imageStyle={{ borderRadius: 20 }}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.featuredOverlay}
                  >
                    <Text style={styles.featuredLocation}>{dest.name?.toUpperCase()}</Text>
                    <View style={styles.featuredTag}>
                      <MapPin color="#fff" size={14} />
                      <Text style={styles.featuredTagText}>{dest.parent?.name || 'Việt Nam'}</Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* 2. Offers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đi nhiều hơn, trả ít hơn</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginLeft: 20 }} />
          ) : (
            offers.map((item, index) => (
              <LinearGradient
                key={item.id}
                colors={getOfferGradient(index)}
                style={styles.offerCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.offerContent}>
                  <Gift color="#fff" size={24} style={{ marginBottom: 8 }} />
                  <Text style={styles.offerTitle} numberOfLines={1}>{item.code}</Text>
                  <Text style={styles.offerSubtitle} numberOfLines={2}>
                    {item.type === 'percent' ? `Giảm ${item.discount_value}%` : `Giảm ${item.discount_value}đ`}
                  </Text>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoText}>MIN: {item.min_order_amount?.toLocaleString()}đ</Text>
                  </View>
                </View>
              </LinearGradient>
            ))
          )}
        </ScrollView>

        {/* 3. Why Choose Us Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vì sao chọn Social Travel</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {whyChooseUsData.map(item => (
            <View key={item.id} style={styles.whyCard}>
              <View style={[styles.whyIconContainer, { backgroundColor: item.color + '15' }]}>
                <item.Icon color={item.color} size={24} />
              </View>
              <Text style={styles.whyTitle}>{item.title}</Text>
              <Text style={styles.whyDesc}>{item.desc}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 4. AI Help Section */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiCard}
        >
          <View style={styles.aiContent}>
            <View style={styles.aiHeader}>
              <Lightbulb color="#fff" size={28} />
              <Text style={styles.aiTitle}>Trợ giúp từ Social Travel Booking</Text>
            </View>
            <Text style={styles.aiDesc}>
              Để Social Travel Booking giúp bạn xây dựng một hành trình du lịch hoàn hảo dựa trên sở thích cá nhân chỉ trong vài giây.
            </Text>
            <TouchableOpacity style={styles.aiButton}>
              <Sparkles color="#4F46E5" size={18} />
              <Text style={styles.aiButtonText}>Xây dựng hành trình cho tôi</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.aiIconFloating}>
            <Navigation color="rgba(255,255,255,0.2)" size={100} />
          </View>
        </LinearGradient>

        {/* 5. Suggestion Management (Restored) */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeIconBox}>
            <Sparkles color={Colors.primary} size={24} />
          </View>
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Quản lý gợi ý</Text>
            <Text style={styles.noticeDesc}>
              Chúng tôi cung cấp gợi ý dựa trên hoạt động của bạn để mang lại trải nghiệm tốt nhất.
            </Text>
            <TouchableOpacity style={styles.noticeLink}>
              <Text style={styles.noticeLinkText}>Tìm hiểu thêm</Text>
              <ChevronRight color={Colors.primary} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <CustomDatePicker
        bottomSheetRef={datePickerRef}
        onSelectRange={setSelectedRange}
      />

      <GuestPicker
        bottomSheetRef={guestPickerRef}
        guests={guests}
        setGuests={setGuests}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0077B6' },
  searchGradient: {
    paddingHorizontal: Typography.spacing.md,
    paddingTop: 20,
    paddingBottom: 28,
  },
  searchCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  textInput: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Typography.spacing.md,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: Typography.spacing.md,
  },
  
  // Trending Section
  featuredScroll: {
    paddingLeft: Typography.spacing.md,
    paddingRight: Typography.spacing.md - 15,
  },
  featuredCard: {
    width: width - 40,
    marginRight: 15,
  },
  featuredImage: {
    width: '100%',
    height: 250,
  },
  featuredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    borderRadius: 20,
  },
  featuredLocation: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 1 },
  featuredTag: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  featuredTagText: { color: '#fff', fontSize: 14, marginLeft: 4, opacity: 0.9 },

  // Offers Section
  offerCard: {
    width: width * 0.6,
    height: 150,
    marginRight: 15,
    borderRadius: 20,
    padding: 16,
  },
  offerContent: { flex: 1, justifyContent: 'center' },
  offerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  offerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginBottom: 10 },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  promoText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Why Choose Us
  whyCard: {
    width: width * 0.45,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  whyIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  whyTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  whyDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  
  // AI Section
  aiCard: {
    margin: Typography.spacing.md,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    marginTop: 30,
  },
  aiContent: { zIndex: 1 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  aiDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20, marginBottom: 20, width: '80%' },
  aiButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  aiButtonText: { color: '#4F46E5', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
  aiIconFloating: { position: 'absolute', right: -20, bottom: -20 },

  // Notice Section
  noticeCard: {
    margin: Typography.spacing.md,
    padding: 20,
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  noticeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  noticeContent: { flex: 1 },
  noticeTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  noticeDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  noticeLink: { flexDirection: 'row', alignItems: 'center' },
  noticeLinkText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginRight: 5 },
});

export default HomeScreen;
