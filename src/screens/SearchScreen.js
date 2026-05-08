import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet, View, ScrollView,
  TouchableOpacity, Image, FlatList,
  ActivityIndicator, Dimensions, RefreshControl,
  Animated, Pressable, Platform
} from 'react-native';
import AppText from '../components/common/AppText';
import AppTextInput from '../components/common/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, Search as SearchIcon, MapPin,
  Filter, Star, Calendar, Users, SlidersHorizontal,
  X
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import apiClient, { BASE_URL } from '../api/apiClient';
import Skeleton from '../components/common/Skeleton';
import CustomDatePicker from '../components/home/CustomDatePicker';
import GuestPicker from '../components/home/GuestPicker';

const { width, height } = Dimensions.get('window');

const SearchScreen = ({ route, navigation }) => {
  const { searchParams: initialParams } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [results, setResults] = useState([]);
  const [activeType, setActiveType] = useState('all');
  const [activeCategory, setActiveCategory] = useState(initialParams?.category || 'all');

  // Filter States
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    sortBy: 'newest', // newest, price_asc, price_desc, rating
    selectedTypes: [], // ['hotel', 'homestay', etc] - do người dùng chọn trong bộ lọc
    serviceType: initialParams?.type || '' // type từ trang chủ (vd: 'hotel,homestay')
  });

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [currentParams, setCurrentParams] = useState((initialParams && initialParams.guests) ? initialParams : {
    location: '',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    guests: { rooms: 1, adults: 2, children: 0 }
  });
  const [localLocation, setLocalLocation] = useState(currentParams?.location || '');

  // Animation Refs
  const modalAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const datePickerRef = useRef(null);
  const guestPickerRef = useRef(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const toggleSearchModal = (show) => {
    if (show) {
      setShowSearchModal(true);
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowSearchModal(false));
    }
  };

  const toggleFilterModal = (show) => {
    if (show) {
      setShowFilterModal(true);
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(filterAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowFilterModal(false));
    }
  };

  const fetchResults = useCallback(async (isRefresh = false, params = currentParams) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Ưu tiên: bộ lọc thủ công (selectedTypes) > type từ trang chủ (serviceType)
      const effectiveType = filters.selectedTypes.length > 0
        ? filters.selectedTypes.join(',')
        : (filters.serviceType || undefined);

      const queryParams = {
        keyword: params?.location || '',
        type: effectiveType,
        price_min: filters.priceMin || undefined,
        price_max: filters.priceMax || undefined,
        sort: filters.sortBy
      };

      const res = await apiClient.get('/general/get/services', { params: queryParams });
      if (res.success) {
        setResults(res.data || []);
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, filters, currentParams]);

  useEffect(() => {
    if (initialParams) {
      if (initialParams.category) {
        setActiveCategory(initialParams.category);
      }
      // Lưu type từ trang chủ vào filters để fetchResults có thể đọc ngay
      setFilters(prev => ({ ...prev, serviceType: initialParams.type || '' }));
      setCurrentParams(initialParams);
      setLocalLocation(initialParams.location || '');
    }
  }, [initialParams]);

  useEffect(() => {
    fetchResults();
  }, [filters]);

  const handleUpdateSearch = () => {
    const newParams = {
      ...currentParams,
      location: localLocation,
    };
    setCurrentParams(newParams);
    toggleSearchModal(false);
    fetchResults(false, newParams);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getImageUrl = (media) => {
    if (media && media.length > 0) {
      const url = media[0].url;
      return url.startsWith('http') ? url : `${BASE_URL}/${url}`;
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetail', { service: item })}
    >
      <Image source={{ uri: getImageUrl(item.media) }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <View style={styles.typeRow}>
          <AppText style={styles.serviceType}>{item.type?.toUpperCase()}</AppText>
          <View style={styles.ratingRow}>
            <Star color="#FFD700" size={12} fill="#FFD700" />
            <AppText style={styles.ratingText}>{item.rating_avg || '5.0'}</AppText>
          </View>
        </View>
        <AppText style={styles.serviceName} numberOfLines={2}>{item.name}</AppText>
        <View style={styles.locationRow}>
          <MapPin color={Colors.textSecondary} size={12} />
          <AppText style={styles.locationText} numberOfLines={1}>{item.address || item.location?.name || 'Việt Nam'}</AppText>
        </View>
        <View style={styles.priceRow}>
          <AppText style={styles.priceValue}>
            {Number(item.base_price).toLocaleString()}đ
            <AppText style={[styles.priceUnit, { color: Colors.primary, fontWeight: '700' }]}>
              {item.type?.toLowerCase() === 'tour' ? ' /người' : (item.type?.toLowerCase() === 'vehicle' ? ' /ngày' : ' /đêm')}
            </AppText>
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#000" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchSummary}
            onPress={() => toggleSearchModal(true)}
          >
            <AppText style={styles.summaryLocation}>{currentParams?.location || 'Mọi nơi'}</AppText>
            <AppText style={styles.summarySub}>
              {activeCategory === 'activity'
                ? formatDate(currentParams?.startDate)
                : `${formatDate(currentParams?.startDate)} - ${formatDate(currentParams?.endDate)}`}
              {activeCategory === 'stay' && ` • ${(currentParams?.guests?.adults || 0) + (currentParams?.guests?.children || 0)} khách`}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => toggleFilterModal(true)}
          >
            <SlidersHorizontal color={Colors.primary} size={20} />
            {filters.selectedTypes.length > 0 && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>


        {/* Results */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={{ padding: 20 }}>
              {[1, 2, 3].map(i => (
                <View key={i} style={{ marginBottom: 20 }}>
                  <Skeleton width={width - 40} height={200} borderRadius={20} />
                  <View style={{ marginTop: 15 }}>
                    <Skeleton width={200} height={20} />
                    <Skeleton width={150} height={15} style={{ marginTop: 8 }} />
                  </View>
                </View>
              ))}
            </View>
          ) : results.length === 0 ? (
            <View style={styles.emptyState}>
              <SearchIcon color={Colors.textSecondary} size={64} opacity={0.2} />
              <AppText style={styles.emptyText}>Không tìm thấy kết quả phù hợp</AppText>
              <TouchableOpacity style={styles.resetButton} onPress={() => toggleSearchModal(true)}>
                <AppText style={styles.resetButtonText}>Thay đổi tìm kiếm</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderServiceItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchResults(true)} />
              }
            />
          )}
        </View>
      </SafeAreaView>

      {/* Search Modal Overlay */}
      {showSearchModal && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={styles.backdrop}
            onPress={() => toggleSearchModal(false)}
          >
            <Animated.View style={[styles.backdropFill, { opacity: modalAnim }]} />
          </Pressable>

          <Animated.View style={[
            styles.searchModal,
            {
              transform: [{
                translateY: modalAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-300, 0]
                })
              }]
            }
          ]}>
            <SafeAreaView edges={['top']}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <AppText style={styles.modalTitle}>Chỉnh sửa tìm kiếm</AppText>
                  <TouchableOpacity onPress={() => toggleSearchModal(false)}>
                    <X color="#000" size={24} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalForm}>
                  <View style={styles.inputGroup}>
                    <MapPin color={Colors.primary} size={20} />
                    <AppTextInput
                      style={styles.modalInput}
                      value={localLocation}
                      onChangeText={setLocalLocation}
                      placeholder={activeCategory === 'car' ? "Địa điểm nhận xe" : "Nhập điểm đến"}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.inputGroup}
                    onPress={() => datePickerRef.current?.open()}
                  >
                    <Calendar color={Colors.primary} size={20} />
                    <AppText style={styles.modalInput}>
                      {activeCategory === 'activity'
                        ? formatDate(currentParams?.startDate)
                        : `${formatDate(currentParams?.startDate)} - ${formatDate(currentParams?.endDate)}`}
                    </AppText>
                  </TouchableOpacity>

                  {activeCategory === 'stay' && (
                    <TouchableOpacity
                      style={styles.inputGroup}
                      onPress={() => guestPickerRef.current?.open()}
                    >
                      <Users color={Colors.primary} size={20} />
                      <AppText style={styles.modalInput}>
                        {currentParams?.guests?.rooms || 1} phòng, {(currentParams?.guests?.adults || 0) + (currentParams?.guests?.children || 0)} khách
                      </AppText>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleUpdateSearch}
                  >
                    <AppText style={styles.applyButtonText}>Cập nhật tìm kiếm</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}

      {/* Filter Modal Overlay */}
      {showFilterModal && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={styles.backdrop}
            onPress={() => toggleFilterModal(false)}
          >
            <Animated.View style={[styles.backdropFill, { opacity: filterAnim }]} />
          </Pressable>

          <Animated.View style={[
            styles.filterModal,
            {
              transform: [{
                translateY: filterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0]
                })
              }]
            }
          ]}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <AppText style={styles.modalTitle}>Bộ lọc tìm kiếm</AppText>
                <TouchableOpacity onPress={() => toggleFilterModal(false)}>
                  <X color="#000" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.7 }}>
                {/* Sắp xếp */}
                <AppText style={styles.filterLabel}>Sắp xếp theo</AppText>
                <View style={styles.filterOptions}>
                  {[
                    { id: 'newest', label: 'Mới nhất' },
                    { id: 'price_asc', label: 'Giá thấp nhất' },
                    { id: 'price_desc', label: 'Giá cao nhất' },
                    { id: 'rating', label: 'Xếp hạng cao nhất' }
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.optionChip, filters.sortBy === opt.id && styles.activeOptionChip]}
                      onPress={() => setFilters({ ...filters, sortBy: opt.id })}
                    >
                      <AppText style={[styles.optionText, filters.sortBy === opt.id && styles.activeOptionText]}>{opt.label}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Loại hình */}
                <AppText style={styles.filterLabel}>Loại hình dịch vụ</AppText>
                <View style={styles.filterOptions}>
                  {[
                    { id: 'hotel', label: 'Khách sạn' },
                    { id: 'homestay', label: 'Homestay' },
                    { id: 'tour', label: 'Tour' },
                    { id: 'vehicle', label: 'Phương tiện' }
                  ].map(type => {
                    const isSelected = filters.selectedTypes.includes(type.id);
                    return (
                      <TouchableOpacity
                        key={type.id}
                        style={[styles.optionChip, isSelected && styles.activeOptionChip]}
                        onPress={() => {
                          const newTypes = isSelected
                            ? filters.selectedTypes.filter(t => t !== type.id)
                            : [...filters.selectedTypes, type.id];
                          setFilters({ ...filters, selectedTypes: newTypes });
                        }}
                      >
                        <AppText style={[styles.optionText, isSelected && styles.activeOptionText]}>{type.label}</AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Khoảng giá */}
                <AppText style={styles.filterLabel}>Khoảng giá (VNĐ)</AppText>
                <View style={styles.priceInputs}>
                  <AppTextInput
                    style={styles.priceInput}
                    placeholder="Tối thiểu"
                    keyboardType="numeric"
                    value={filters.priceMin}
                    onChangeText={text => setFilters({ ...filters, priceMin: text })}
                  />
                  <View style={styles.priceDash} />
                  <AppTextInput
                    style={styles.priceInput}
                    placeholder="Tối đa"
                    keyboardType="numeric"
                    value={filters.priceMax}
                    onChangeText={text => setFilters({ ...filters, priceMax: text })}
                  />
                </View>

                <View style={{ height: 30 }} />
              </ScrollView>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setFilters(prev => ({ priceMin: '', priceMax: '', sortBy: 'newest', selectedTypes: [], serviceType: prev.serviceType }))}
                >
                  <AppText style={styles.clearButtonText}>Thiết lập lại</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.applyButton, { flex: 2, marginTop: 0 }]}
                  onPress={() => {
                    toggleFilterModal(false);
                    fetchResults();
                  }}
                >
                  <AppText style={styles.applyButtonText}>Áp dụng bộ lọc</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Pickers */}
      <CustomDatePicker
        bottomSheetRef={datePickerRef}
        onSelectRange={(range) => setCurrentParams({ ...currentParams, ...range })}
      />
      <GuestPicker
        bottomSheetRef={guestPickerRef}
        guests={currentParams.guests}
        setGuests={(newGuestsOrCallback) => {
          // Xử lý cả trường hợp truyền hàm callback từ GuestPicker (prev => ...)
          if (typeof newGuestsOrCallback === 'function') {
            setCurrentParams(prev => ({ ...prev, guests: newGuestsOrCallback(prev.guests) }));
          } else {
            setCurrentParams({ ...currentParams, guests: newGuestsOrCallback });
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    zIndex: 10
  },
  backButton: { padding: 5 },
  searchSummary: {
    flex: 1,
    marginHorizontal: 15,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  summaryLocation: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  summarySub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  filterDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    backgroundColor: '#FB7185',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff'
  },
  categoryInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0F2FE'
  },
  categoryInfoText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary
  },
  filterSection: { paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  filterScroll: { paddingHorizontal: 15, gap: 10 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 25,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginRight: 8
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  filterChipText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  activeFilterChipText: { color: '#fff' },
  resultsContainer: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10 },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  serviceImage: { width: '100%', height: 220 },
  serviceInfo: { padding: 18 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceType: { fontSize: 11, fontWeight: 'bold', color: Colors.primary, letterSpacing: 1.2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF9E5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#B8860B' },
  serviceName: { fontSize: 17, fontWeight: 'bold', color: Colors.text, marginBottom: 10, lineHeight: 24 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  locationText: { fontSize: 13, color: Colors.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  priceValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  priceUnit: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  // Modal Styles
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  backdropFill: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  searchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 101,
    paddingBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20
  },
  filterModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 101,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  activeOptionChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  optionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  activeOptionText: {
    color: '#fff'
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text
  },
  priceDash: {
    width: 10,
    height: 2,
    backgroundColor: '#DDD'
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 10
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8'
  },
  clearButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: 'bold'
  },
  modalContent: { paddingHorizontal: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  modalForm: { gap: 15 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 16
  },
  modalInput: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '600' },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8
  },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { marginTop: 20, fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
  resetButton: { marginTop: 20, paddingHorizontal: 25, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 15 },
  resetButtonText: { color: '#fff', fontWeight: 'bold' }
});

export default SearchScreen;
