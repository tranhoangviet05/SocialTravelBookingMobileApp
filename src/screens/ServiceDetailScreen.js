import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, ScrollView,
  TouchableOpacity, Image, Linking, ActivityIndicator,
  Dimensions, Alert
} from 'react-native';
import AppText from '../components/common/AppText';
import AppTextInput from '../components/common/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, MapPin, Star, Share2,
  Heart, Calendar, Users, Info, ExternalLink, CheckCircle2, Shield, Clock,
  Sun, BedDouble, CalendarDays, Moon, X, ChevronDown, ChevronUp, Wifi,
  Coffee, Car, Snowflake, Bath, Wind, Zap, Navigation
} from 'lucide-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { BASE_URL } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/common/Skeleton';
import CustomDatePicker from '../components/home/CustomDatePicker';

const { width } = Dimensions.get('window');

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <AppText style={[styles.tabAppText, active && styles.tabAppTextActive]}>{title}</AppText>
  </TouchableOpacity>
);

const ServiceDetailScreen = ({ route, navigation }) => {
  const { service: initialService } = route.params || {};
  const { user, token } = useAuth();

  const [serviceData, setServiceData] = useState(initialService || null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, itinerary, amenities, reviews
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  const bottomSheetRef = useRef(null);

  // Favorite State
  const [isFavorite, setIsFavorite] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Xem thêm/thu gọn mô tả
  const [descExpanded, setDescExpanded] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});

  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }));
  };
  const DESC_LIMIT = 180; // ký tự

  // Room Detail Sheet (bottom sheet)
  const roomDetailSheetRef = useRef(null);
  const [modalRoom, setModalRoom] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const handleModalScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== modalImageIndex) {
      setModalImageIndex(slide);
    }
  };

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    adults: 1,
    children: 0,
  });

  const datePickerRef = useRef(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const idOrSlug = initialService?.slug || initialService?.id;
        if (!idOrSlug) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${BASE_URL}/api/general/get/services/detail/${idOrSlug}`);
        if (response.data.success) {
          const data = response.data.data;
          setServiceData(data);
          if (data.room_types && data.room_types.length > 0) {
            setSelectedRoomType(data.room_types[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết dịch vụ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [initialService]);

  // Check Favorite Status
  useEffect(() => {
    const checkFavorite = async () => {
      if (serviceData) {
        try {
          const stored = await AsyncStorage.getItem('wishlist');
          if (stored) {
            const list = JSON.parse(stored);
            const exists = list.find(item => item.id === serviceData.id);
            if (exists) setIsFavorite(true);
          }
        } catch (e) {
          console.error('Lỗi check wishlist:', e);
        }
      }
    };
    checkFavorite();
  }, [serviceData]);

  const toggleFavorite = async () => {
    if (!serviceData) return;
    try {
      const stored = await AsyncStorage.getItem('wishlist');
      let list = stored ? JSON.parse(stored) : [];

      if (isFavorite) {
        list = list.filter(item => item.id !== serviceData.id);
        setIsFavorite(false);
      } else {
        list.push(serviceData);
        setIsFavorite(true);
      }
      await AsyncStorage.setItem('wishlist', JSON.stringify(list));
    } catch (e) {
      console.error('Lỗi update wishlist:', e);
    }
  };

  // Fetch Reviews when tab changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (serviceData && activeTab === 'reviews') {
        setReviewsLoading(true);
        try {
          const res = await axios.get(`${BASE_URL}/api/general/get/services/${serviceData.id}/feedbacks`);
          if (res.data.success) {
            setReviews(res.data.data);
          }
        } catch (err) {
          console.error('Lỗi fetch reviews:', err);
        } finally {
          setReviewsLoading(false);
        }
      }
    };
    fetchReviews();
  }, [serviceData, activeTab]);

  const handleSubmitReview = async () => {
    if (!reviewContent.trim() || submittingReview) return;
    if (!user || !token) {
      Alert.alert('Chưa đăng nhập', 'Bạn cần đăng nhập để gửi đánh giá.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/services/${serviceData.id}/feedbacks`,
        { content: reviewContent, rating: reviewRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setReviewContent('');
        setReviewRating(5);
        setReviews([res.data.data, ...reviews]);
        Alert.alert('Thành công', 'Đã gửi đánh giá của bạn.');
      }
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá lúc này.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Header Image Skeleton */}
          <Skeleton width={width} height={300} borderRadius={0} />

          <View style={styles.content}>
            {/* Type Badge */}
            <Skeleton width={100} height={20} borderRadius={10} style={{ marginBottom: 10 }} />
            {/* Title */}
            <Skeleton width={width - 40} height={30} borderRadius={8} style={{ marginBottom: 10 }} />
            <Skeleton width={width * 0.6} height={30} borderRadius={8} style={{ marginBottom: 15 }} />

            {/* Rating Row */}
            <View style={styles.ratingRow}>
              <Skeleton width={120} height={20} borderRadius={4} />
              <Skeleton width={80} height={20} borderRadius={4} />
            </View>

            {/* Location Row */}
            <Skeleton width={width - 40} height={20} borderRadius={4} style={{ marginBottom: 20 }} />

            <View style={styles.divider} />

            {/* Quick Stats */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <Skeleton width={100} height={50} borderRadius={12} style={{ marginRight: 15 }} />
              <Skeleton width={100} height={50} borderRadius={12} style={{ marginRight: 15 }} />
              <Skeleton width={100} height={50} borderRadius={12} />
            </View>

            {/* Tabs */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <Skeleton width={80} height={30} borderRadius={8} style={{ marginRight: 15 }} />
              <Skeleton width={80} height={30} borderRadius={8} style={{ marginRight: 15 }} />
              <Skeleton width={80} height={30} borderRadius={8} />
            </View>

            {/* Section Content */}
            <Skeleton width={150} height={24} borderRadius={8} style={{ marginBottom: 15 }} />
            <Skeleton width={width - 40} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width={width - 40} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width={width - 40} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width={width * 0.8} height={16} borderRadius={4} />
          </View>
        </ScrollView>
        {/* Bottom Bar Skeleton */}
        <View style={styles.bottomBar}>
          <View>
            <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 5 }} />
            <Skeleton width={120} height={24} borderRadius={4} />
          </View>
          <Skeleton width={120} height={45} borderRadius={15} />
        </View>
      </SafeAreaView>
    );
  }

  if (!serviceData) {
    return (
      <View style={styles.centerContainer}>
        <AppText style={styles.errorAppText}>Không tìm thấy thông tin dịch vụ này.</AppText>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
          <AppText style={{ color: Colors.primary }}>Quay lại</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const handleOpenMaps = () => {
    const fullAddress = encodeURIComponent(`${serviceData.name} ${serviceData.address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${fullAddress}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else alert('Không thể mở ứng dụng bản đồ.');
    });
  };

  const getImageUrl = (mediaItem) => {
    if (mediaItem && mediaItem.url) {
      const url = mediaItem.url;
      return url.startsWith('http') ? url : `${BASE_URL}/${url}`;
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  };

  const handleScroll = (event) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== currentImageIndex) {
      setCurrentImageIndex(slide);
    }
  };

  const handleBooking = () => {
    bottomSheetRef.current?.close();
    // TODO: Mở trang checkout với data thực tế
    alert('Tính năng Checkout đang được cập nhật!');
  };

  const isTour = serviceData.type?.toLowerCase() === 'tour';
  const isHotel = serviceData.type?.toLowerCase() === 'hotel';
  const isHomestay = serviceData.type?.toLowerCase() === 'homestay';

  const price = selectedRoomType ? selectedRoomType.base_price : (serviceData.base_price ?? 0);
  const rating = serviceData.rating_avg ?? 0;
  const reviewCount = serviceData.total_reviews ?? serviceData.total_bookings ?? 0;
  const duration = (isTour && serviceData.duration_days)
    ? `${serviceData.duration_days} ngày ${serviceData.duration_nights ? serviceData.duration_nights + ' đêm' : ''}`
    : (isHotel ? 'Lưu trú' : 'Trong ngày');

  const amenities = serviceData.amenities || [];
  const tags = serviceData.tags || [];
  const includes = serviceData.includes || [];
  const excludes = serviceData.excludes || [];
  const schedules = serviceData.schedules || [];

  const mediaList = serviceData.media && serviceData.media.length > 0 ? serviceData.media : [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }];

  const getPriceUnit = () => {
    const type = serviceData.type?.toLowerCase();
    if (type === 'tour') return ' /người';
    if (type === 'vehicle') return ' /ngày';
    return ' /đêm';
  };

  const getRoomAvailability = (room) => {
    if (!room) return { remaining: '—', price: 0 };

    const isTourType = serviceData.type?.toLowerCase() === 'tour';

    // Nếu là Tour -> Lấy slot theo ngày từ service_availability
    if (isTourType) {
      const targetDate = bookingForm.date;
      const availability = room.availabilities?.find(a => a.date === targetDate);

      if (availability) {
        return {
          remaining: availability.remaining,
          price: availability.price_override || room.base_price
        };
      }
      return {
        remaining: room.inventory ?? 'Hết chỗ',
        price: room.base_price
      };
    }

    // Nếu là Chỗ ở hoặc loại khác -> Lấy inventory tổng từ bảng room_types
    return {
      remaining: room.inventory ?? '—',
      price: room.base_price
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {mediaList.map((item, index) => (
              <Image
                key={index}
                source={{ uri: getImageUrl(item) }}
                style={[styles.image, { width: width }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Image Index Indicator */}
          {mediaList.length > 1 && (
            <View style={styles.imageIndicator}>
              <AppText style={styles.imageIndicatorAppText}>{currentImageIndex + 1} / {mediaList.length}</AppText>
            </View>
          )}

          <TouchableOpacity style={[styles.iconButton, { position: 'absolute', top: 50, left: 20 }]} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#000" size={24} />
          </TouchableOpacity>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
              <Heart color={isFavorite ? "#F43F5E" : "#000"} size={20} fill={isFavorite ? "#F43F5E" : "transparent"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Main Info */}
          <AppText style={styles.typeBadge}>
            {isTour ? 'Tour du lịch' : isHotel ? 'Khách sạn' : isHomestay ? 'Homestay' : 'Phương tiện'}
          </AppText>
          <AppText style={styles.title}>{serviceData.name}</AppText>

          {/* Tags Display */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <AppText style={styles.tagAppText}>{tag}</AppText>
                </View>
              ))}
            </View>
          )}

          <View style={styles.ratingRow}>
            <View style={styles.ratingBox}>
              <Star color="#FFD700" size={16} fill="#FFD700" />
              <AppText style={styles.ratingAppText}>{Number(rating).toFixed(1)}</AppText>
              <AppText style={styles.reviewCountAppText}>({reviewCount} đánh giá)</AppText>
            </View>
            <AppText style={styles.providerName}>{serviceData.provider?.business_name || 'Hệ thống'}</AppText>
          </View>

          {!isTour && (
            <TouchableOpacity style={styles.locationRow} onPress={handleOpenMaps}>
              <MapPin color={Colors.primary} size={18} />
              <AppText style={styles.address} numberOfLines={2}>{serviceData.address}</AppText>
              <ExternalLink color={Colors.primary} size={16} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* Quick Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickStats}>
            {isTour && (
              <View style={styles.statItem}>
                <Clock size={20} color={Colors.primary} />
                <View style={styles.statAppTextContainer}>
                  <AppText style={styles.statLabel}>THỜI LƯỢNG</AppText>
                  <AppText style={styles.statValue}>{duration}</AppText>
                </View>
              </View>
            )}
            {(isHotel || isHomestay) && (
              <View style={styles.statItem}>
                <BedDouble size={20} color="#8B5CF6" />
                <View style={styles.statAppTextContainer}>
                  <AppText style={styles.statLabel}>LOẠI PHÒNG</AppText>
                  <AppText style={styles.statValue}>{selectedRoomType ? selectedRoomType.name : 'Standard'}</AppText>
                </View>
              </View>
            )}
            {serviceData.max_guests && (
              <View style={styles.statItem}>
                <Users size={20} color="#10B981" />
                <View style={styles.statAppTextContainer}>
                  <AppText style={styles.statLabel}>SỐ KHÁCH</AppText>
                  <AppText style={styles.statValue}>Tối đa {serviceData.max_guests}</AppText>
                </View>
              </View>
            )}
            <View style={styles.statItem}>
              <Shield size={20} color="#F59E0B" />
              <View style={styles.statAppTextContainer}>
                <AppText style={styles.statLabel}>CHÍNH SÁCH</AppText>
                <AppText style={styles.statValue}>Hủy miễn phí</AppText>
              </View>
            </View>
          </ScrollView>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            <TabButton title="Tổng quan" active={activeTab === 'overview'} onPress={() => setActiveTab('overview')} />
            {isTour && <TabButton title={`Lịch trình (${schedules.length})`} active={activeTab === 'itinerary'} onPress={() => setActiveTab('itinerary')} />}
            <TabButton title={`Tiện ích (${amenities.length})`} active={activeTab === 'amenities'} onPress={() => setActiveTab('amenities')} />
            <TabButton title="Đánh giá" active={activeTab === 'reviews'} onPress={() => setActiveTab('reviews')} />
          </ScrollView>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'overview' && (
              <View>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Sun size={20} color="#F59E0B" />
                    <AppText style={styles.sectionTitle}>Giới thiệu</AppText>
                  </View>
                  {(() => {
                    const desc = serviceData.description || 'Chưa có mô tả.';
                    const isLong = desc.length > DESC_LIMIT;
                    const shown = (!isLong || descExpanded) ? desc : desc.slice(0, DESC_LIMIT) + '...';
                    return (
                      <View>
                        <AppText style={styles.description}>{shown}</AppText>
                        {isLong && (
                          <TouchableOpacity
                            style={styles.seeMoreBtn}
                            onPress={() => setDescExpanded(v => !v)}
                          >
                            {descExpanded
                              ? <><ChevronUp size={14} color={Colors.primary} /><AppText style={styles.seeMoreAppText}> Thu gọn</AppText></>
                              : <><ChevronDown size={14} color={Colors.primary} /><AppText style={styles.seeMoreAppText}> Xem thêm</AppText></>
                            }
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })()}
                </View>

                {(isHotel || isHomestay) && serviceData.room_types?.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <BedDouble size={20} color="#8B5CF6" />
                      <AppText style={styles.sectionTitle}>Chọn loại phòng</AppText>
                    </View>
                    {serviceData.room_types.map(room => (
                      <TouchableOpacity
                        key={room.id}
                        style={[styles.roomCard, selectedRoomType?.id === room.id && styles.roomCardSelected]}
                        onPress={() => setSelectedRoomType(room)}
                      >
                        <Image source={{ uri: room.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' }} style={styles.roomImage} />
                        <View style={styles.roomInfo}>
                          <AppText style={styles.roomName}>{room.name}</AppText>
                          <AppText style={styles.roomPrice}>{Number(getRoomAvailability(room).price).toLocaleString()}đ <AppText style={{ fontSize: 10, color: '#999' }}>{getPriceUnit()}</AppText></AppText>
                          <AppText style={styles.roomDesc} numberOfLines={2}>{room.description}</AppText>
                          <View style={styles.roomMetaRow}>
                            <Users size={12} color="#666" />
                            <AppText style={styles.roomMetaAppText}>{room.capacity_adults} NL</AppText>
                            <TouchableOpacity
                              style={styles.roomDetailBtn}
                              onPress={() => { setModalRoom(room); setModalImageIndex(0); roomDetailSheetRef.current?.open(); }}
                            >
                              <AppText style={styles.roomDetailBtnAppText}>Xem chi tiết</AppText>
                            </TouchableOpacity>
                          </View>
                        </View>
                        {selectedRoomType?.id === room.id && (
                          <View style={styles.checkIcon}>
                            <CheckCircle2 size={20} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Includes & Excludes giờ nằm trong tab Tiện nghi */}
              </View>
            )}

            {activeTab === 'itinerary' && isTour && (
              <View style={styles.itineraryContainer}>
                {schedules.length === 0 ? (
                  <AppText style={styles.emptyItinerary}>Chưa có lịch trình chi tiết cho tour này.</AppText>
                ) : (
                  schedules.map((item, idx) => {
                    const isExpanded = expandedDays[item.day_number];
                    return (
                      <View key={idx} style={styles.itineraryItem}>
                        {/* Timeline Line */}
                        <View style={styles.timelineContainer}>
                          <View style={styles.timelineDot}>
                            <AppText style={styles.timelineDayAppText}>{item.day_number}</AppText>
                          </View>
                          {idx !== schedules.length - 1 && <View style={styles.timelineLine} />}
                        </View>

                        {/* Content */}
                        <View style={styles.itineraryContent}>
                          <View style={styles.itineraryHeader}>
                            <Navigation size={18} color={Colors.primary} />
                            <AppText style={styles.itineraryTitle}>{item.title}</AppText>
                          </View>

                          <AppText style={styles.itineraryDesc} numberOfLines={isExpanded ? undefined : 2}>
                            {item.description}
                          </AppText>

                          {/* Toggle Button */}
                          <TouchableOpacity
                            style={styles.itineraryToggleBtn}
                            onPress={() => toggleDay(item.day_number)}
                          >
                            <AppText style={styles.itineraryToggleAppText}>
                              {isExpanded ? 'Thu gọn' : 'Xem lịch trình chi tiết'}
                            </AppText>
                            {isExpanded ? <ChevronUp size={14} color={Colors.primary} /> : <ChevronDown size={14} color={Colors.primary} />}
                          </TouchableOpacity>

                          {/* Activities Chips */}
                          {isExpanded && item.activities && item.activities.length > 0 && (
                            <View style={styles.itineraryActivities}>
                              {item.activities.map((act, i) => (
                                <View key={i} style={styles.activityChip}>
                                  <MapPin size={12} color={Colors.textSecondary} />
                                  <AppText style={styles.activityChipAppText}>{act}</AppText>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {activeTab === 'amenities' && (
              <View>
                {/* Tiện nghi - Ẩn đối với Tour nếu không có dữ liệu */}
                {!isTour && amenities.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Wifi size={20} color={Colors.primary} />
                      <AppText style={styles.sectionTitle}>Tiện nghi</AppText>
                    </View>
                    <View style={styles.amenitiesGrid}>
                      {amenities.map((item, idx) => (
                        <View key={idx} style={styles.amenityBadge}>
                          <AppText style={styles.amenityAppText}>{item}</AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Bao gồm */}
                {includes.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <CheckCircle2 size={20} color="#10B981" />
                      <AppText style={styles.sectionTitle}>Bao gồm</AppText>
                    </View>
                    {includes.map((item, i) => (
                      <View key={i} style={styles.listItem}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <AppText style={styles.listItemAppText}>{item}</AppText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Không bao gồm */}
                {excludes.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Moon size={20} color="#F43F5E" />
                      <AppText style={styles.sectionTitle}>Không bao gồm</AppText>
                    </View>
                    {excludes.map((item, i) => (
                      <View key={i} style={styles.listItem}>
                        <View style={styles.minusIcon}><View style={styles.minusLine} /></View>
                        <AppText style={styles.listItemAppText}>{item}</AppText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'reviews' && (
              <View style={styles.section}>
                <View style={styles.reviewOverview}>
                  <AppText style={styles.reviewScore}>{Number(rating).toFixed(1)}</AppText>
                  <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} color="#FFD700" fill={i <= Math.round(rating) ? "#FFD700" : "transparent"} />)}
                  </View>
                  <AppText style={styles.reviewCountInfo}>{reviewCount} đánh giá</AppText>
                </View>

                {/* Write Review Section */}
                <View style={styles.writeReviewContainer}>
                  <AppText style={styles.writeReviewTitle}>Chia sẻ trải nghiệm của bạn</AppText>
                  {user ? (
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <AppText style={{ marginRight: 10, fontSize: 13, color: '#666' }}>Chất lượng:</AppText>
                        <View style={{ flexDirection: 'row' }}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <TouchableOpacity key={i} onPress={() => setReviewRating(i)}>
                              <Star size={24} color="#FFD700" fill={i <= reviewRating ? "#FFD700" : "transparent"} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      <AppTextInput
                        style={styles.reviewInput}
                        placeholder="Trải nghiệm của bạn thế nào?"
                        multiline
                        value={reviewContent}
                        onChangeText={setReviewContent}
                      />
                      <TouchableOpacity
                        style={[styles.submitReviewBtn, submittingReview && { opacity: 0.7 }]}
                        onPress={handleSubmitReview}
                        disabled={submittingReview || !reviewContent.trim()}
                      >
                        {submittingReview ? <ActivityIndicator size="small" color="#fff" /> : <AppText style={styles.submitReviewAppText}>Gửi đánh giá</AppText>}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.loginPrompt}>
                      <AppText style={styles.loginPromptAppText}>Bạn chưa đăng nhập?</AppText>
                      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginPromptBtn}>
                        <AppText style={styles.loginPromptBtnAppText}>Đăng nhập ngay</AppText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Reviews List */}
                <AppText style={styles.reviewListTitle}>Đánh giá từ cộng đồng ({reviews.length})</AppText>
                {reviewsLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
                ) : reviews.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <AppText style={{ color: '#999', fontSize: 14 }}>Chưa có đánh giá nào.</AppText>
                  </View>
                ) : (
                  reviews.map((review, index) => (
                    <View key={review.id || index} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}>
                          {review.user?.avatar_url ? (
                            <Image source={{ uri: review.user.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                          ) : (
                            <AppText style={styles.reviewAvatarAppText}>{(review.user?.display_name || "U")[0].toUpperCase()}</AppText>
                          )}
                        </View>
                        <View>
                          <AppText style={styles.reviewAuthor}>{review.user?.display_name || "Khách"}</AppText>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} color="#FFD700" fill={i <= review.rating ? "#FFD700" : "transparent"} />)}
                            <AppText style={styles.reviewDate}>
                              {review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : ''}
                            </AppText>
                          </View>
                        </View>
                      </View>
                      <AppText style={styles.reviewContent}>{review.content}</AppText>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <AppText style={styles.priceLabel}>{isHotel || isHomestay ? 'Giá phòng' : isTour ? 'Giá tour' : 'Giá dịch vụ'}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText style={styles.priceValue}>
              {Number(price).toLocaleString()}đ
              <AppText style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '600' }}> {getPriceUnit()}</AppText>
            </AppText>
          </View>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => bottomSheetRef.current?.open()}>
          <AppText style={styles.bookButtonAppText}>Đặt ngay</AppText>
        </TouchableOpacity>
      </View>

      {/* Booking Bottom Sheet */}
      <RBSheet
        ref={bottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={450}
        customStyles={{
          wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
          draggableIcon: { backgroundColor: "#ccc" },
          container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 20 }
        }}
      >
        <AppText style={styles.sheetTitle}>Tùy chọn đặt dịch vụ</AppText>

        <View style={styles.sheetRow}>
          <AppText style={styles.sheetLabel}>{isTour ? 'Ngày khởi hành' : 'Ngày nhận phòng'}</AppText>
          <TouchableOpacity
            style={styles.sheetInputBox}
            onPress={() => datePickerRef.current?.open()}
          >
            <Calendar size={18} color={Colors.primary} style={{ marginRight: 8 }} />
            <AppText style={{ fontWeight: 'bold', color: Colors.text }}>
              {new Date(bookingForm.date).toLocaleDateString('vi-VN')}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.sheetGuestsRow}>
          <View style={styles.sheetGuestItem}>
            <AppText style={styles.sheetLabel}>Người lớn</AppText>
            <View style={styles.guestCounter}>
              <TouchableOpacity onPress={() => setBookingForm(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} style={styles.counterBtn}><AppText style={styles.counterBtnAppText}>-</AppText></TouchableOpacity>
              <AppText style={styles.counterAppText}>{bookingForm.adults}</AppText>
              <TouchableOpacity onPress={() => setBookingForm(p => ({ ...p, adults: p.adults + 1 }))} style={styles.counterBtn}><AppText style={styles.counterBtnAppText}>+</AppText></TouchableOpacity>
            </View>
          </View>

          <View style={styles.sheetGuestItem}>
            <AppText style={styles.sheetLabel}>Trẻ em</AppText>
            <View style={styles.guestCounter}>
              <TouchableOpacity onPress={() => setBookingForm(p => ({ ...p, children: Math.max(0, p.children - 1) }))} style={styles.counterBtn}><AppText style={styles.counterBtnAppText}>-</AppText></TouchableOpacity>
              <AppText style={styles.counterAppText}>{bookingForm.children}</AppText>
              <TouchableOpacity onPress={() => setBookingForm(p => ({ ...p, children: p.children + 1 }))} style={styles.counterBtn}><AppText style={styles.counterBtnAppText}>+</AppText></TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sheetSummary}>
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>Tổng tạm tính</AppText>
            <AppText style={styles.summaryPrice}>
              {Number(price * bookingForm.adults + price * 0.5 * bookingForm.children).toLocaleString()}đ
            </AppText>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmBookButton} onPress={handleBooking}>
          <AppText style={styles.confirmBookAppText}>Xác nhận & Đặt ngay</AppText>
        </TouchableOpacity>
      </RBSheet>
      {/* Room Detail Bottom Sheet */}
      <RBSheet
        ref={roomDetailSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={Math.round(Dimensions.get('window').height * 0.88)}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.45)' },
          draggableIcon: { backgroundColor: '#CBD5E1', width: 40 },
          container: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: 'hidden',
            backgroundColor: '#fff', // Khắc phục khoảng trắng khi kéo xuống
          },
        }}
      >
        {/* Handle bar đã có từ draggableIcon */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{ backgroundColor: '#fff' }} // Khắc phục khoảng trắng khi kéo xuống
        >
          {/* Room Images */}
          <View style={{ height: 200 }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleModalScroll}
              scrollEventThrottle={16}
              bounces={false}
            >
              {modalRoom?.images?.length > 0 ? (
                modalRoom.images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: img }}
                    style={[styles.rdImage, { width: Dimensions.get('window').width }]}
                    resizeMode="cover"
                  />
                ))
              ) : (
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' }}
                  style={[styles.rdImage, { width: Dimensions.get('window').width }]}
                  resizeMode="cover"
                />
              )}
            </ScrollView>

            {/* Image Indicator */}
            {modalRoom?.images?.length > 1 && (
              <View style={{ position: 'absolute', bottom: 10, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <AppText style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{modalImageIndex + 1} / {modalRoom.images.length}</AppText>
              </View>
            )}
          </View>

          <View style={styles.rdContent}>
            {/* Tên -> Rank -> Giá/Đơn vị */}
            <View style={styles.rdTitleRow}>
              <AppText style={styles.rdRoomName}>{modalRoom?.name}</AppText>
              <AppText style={styles.rdRank}>
                {modalRoom?.rank === 'standard' ? '⭐ Standard' : modalRoom?.rank === 'premium' ? '⭐⭐ Premium' : '👑 VIP'}
              </AppText>

              <View style={styles.rdPriceContainer}>
                <AppText style={[styles.rdPrice, { textAlign: 'right' }]}>
                  {Number(getRoomAvailability(modalRoom).price).toLocaleString()}đ{'\n'}
                  <AppText style={styles.rdPriceUnit}>{getPriceUnit()}</AppText>
                </AppText>
              </View>
            </View>

            {/* Thông số nhanh */}
            <View style={styles.rdStatsRow}>
              <View style={styles.rdStatItem}>
                <Users size={18} color={Colors.primary} />
                <AppText style={styles.rdStatLabel}>Sức chứa</AppText>
                <AppText style={styles.rdStatValue}>{modalRoom?.capacity_adults} NL{modalRoom?.capacity_children > 0 ? ` + ${modalRoom?.capacity_children} TE` : ''}</AppText>
              </View>
              <View style={styles.rdStatDivider} />
              <View style={styles.rdStatItem}>
                <BedDouble size={18} color="#8B5CF6" />
                <AppText style={styles.rdStatLabel}>Tổng phòng</AppText>
                <AppText style={styles.rdStatValue}>{modalRoom?.total_rooms} phòng</AppText>
              </View>
              <View style={styles.rdStatDivider} />
              <View style={styles.rdStatItem}>
                <Shield size={18} color="#10B981" />
                <AppText style={styles.rdStatLabel}>Còn lại</AppText>
                <AppText style={styles.rdStatValue}>{getRoomAvailability(modalRoom).remaining}</AppText>
              </View>
            </View>

            {/* Mô tả */}
            {modalRoom?.description ? (
              <View style={styles.rdSection}>
                <AppText style={styles.rdSectionTitle}>Mô tả phòng</AppText>
                <AppText style={styles.rdDesc}>{modalRoom.description}</AppText>
              </View>
            ) : null}

            {/* Tiện nghi phòng */}
            {modalRoom?.amenities?.length > 0 && (
              <View style={styles.rdSection}>
                <AppText style={styles.rdSectionTitle}>Tiện nghi phòng</AppText>
                <View style={styles.amenitiesGrid}>
                  {modalRoom.amenities.map((a, i) => (
                    <View key={i} style={styles.amenityBadge}>
                      <AppText style={styles.amenityAppText}>{a}</AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <View style={{ height: 10 }} />

            {/* Nút chọn phòng */}
            <TouchableOpacity
              style={styles.rdSelectBtn}
              onPress={() => {
                setSelectedRoomType(modalRoom);
                roomDetailSheetRef.current?.close();
              }}
            >
              <AppText style={styles.rdSelectBtnAppText}>Chọn phòng này</AppText>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </View>
        </ScrollView>
      </RBSheet>

      <CustomDatePicker
        bottomSheetRef={datePickerRef}
        onSelectRange={(range) => {
          if (range.startDate) {
            const yyyy = range.startDate.getFullYear();
            const mm = String(range.startDate.getMonth() + 1).padStart(2, '0');
            const dd = String(range.startDate.getDate()).padStart(2, '0');
            setBookingForm(prev => ({ ...prev, date: `${yyyy}-${mm}-${dd}` }));
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorAppText: { fontSize: 16, color: '#666' },

  imageContainer: { width: '100%', height: 300, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageIndicator: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  imageIndicatorAppText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 40, height: 40, backgroundColor: '#fff',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
  },
  headerRightButtons: { position: 'absolute', top: 50, right: 20, flexDirection: 'row', gap: 10 },

  content: { padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  typeBadge: { fontSize: 10, fontWeight: 'bold', color: Colors.primary, backgroundColor: '#E0F2FE', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 24, fontFamily: 'Quicksand_700Bold', color: Colors.text, marginBottom: 10 },

  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingAppText: { fontWeight: 'bold', color: '#B8860B', fontSize: 16 },
  reviewCountAppText: { color: '#999', fontSize: 12 },
  providerName: { fontSize: 12, fontWeight: 'bold', color: '#666' },

  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  address: { flex: 1, marginLeft: 8, color: Colors.textSecondary, fontSize: 14, textDecorationLine: 'underline' },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },

  quickStats: { flexDirection: 'row', marginBottom: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12, marginRight: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  statAppTextContainer: { marginLeft: 10 },
  statLabel: { fontSize: 9, fontWeight: 'bold', color: '#94A3B8', marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: 'bold', color: '#334155' },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 20 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: Colors.primary },
  tabAppText: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8' },
  tabAppTextActive: { color: Colors.primary },

  tabContent: { paddingBottom: 40 },
  section: { marginBottom: 25, backgroundColor: '#fff', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  roomCard: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 10, marginBottom: 10, position: 'relative' },
  roomCardSelected: { borderColor: Colors.primary, backgroundColor: '#F0F9FF' },
  roomImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  roomInfo: { flex: 1 },
  roomName: { fontFamily: 'Quicksand_700Bold', fontSize: 14, color: Colors.text, marginBottom: 4 },
  roomPrice: { fontWeight: 'bold', fontSize: 14, color: Colors.primary, marginBottom: 4 },
  roomDesc: { fontSize: 11, color: '#64748B', marginBottom: 8 },
  roomMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roomMetaAppText: { fontSize: 10, fontWeight: 'bold', color: '#64748B' },
  checkIcon: { position: 'absolute', top: -5, right: -5, backgroundColor: Colors.primary, borderRadius: 10 },

  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  listItemAppText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 20 },
  minusIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFE4E6', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  minusLine: { width: 8, height: 2, backgroundColor: '#F43F5E', borderRadius: 1 },

  scheduleItem: { flexDirection: 'row', marginBottom: 20 },
  scheduleDay: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  scheduleDayAppText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  scheduleContent: { flex: 1, paddingLeft: 15, paddingBottom: 20, borderLeftWidth: 2, borderLeftColor: '#E0F2FE', marginLeft: -16, paddingTop: 5 },
  scheduleTitle: { fontWeight: 'bold', fontSize: 14, color: Colors.text, marginBottom: 5 },
  scheduleDesc: { fontSize: 13, color: '#64748B', lineHeight: 20 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityBadge: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  amenityAppText: { fontSize: 12, fontWeight: '500', color: '#475569' },

  reviewOverview: { alignItems: 'center', paddingVertical: 20 },
  reviewScore: { fontSize: 40, fontWeight: 'black', color: Colors.text },
  reviewCountInfo: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold' },

  // Reviews Styles
  writeReviewContainer: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, marginBottom: 20 },
  writeReviewTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },
  reviewInput: { backgroundColor: '#fff', borderRadius: 12, padding: 15, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  submitReviewBtn: { backgroundColor: Colors.primary, padding: 12, borderRadius: 12, alignItems: 'center' },
  submitReviewAppText: { color: '#fff', fontWeight: 'bold' },
  loginPrompt: { alignItems: 'center', padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
  loginPromptAppText: { color: '#64748B', marginBottom: 10, fontWeight: 'bold' },
  loginPromptBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  loginPromptBtnAppText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  reviewListTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 15, marginBottom: 15 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  reviewAvatarAppText: { color: Colors.primary, fontWeight: 'black', fontSize: 16 },
  reviewAuthor: { fontWeight: 'bold', fontSize: 14, color: Colors.text },
  reviewDate: { fontSize: 10, color: '#94A3B8', marginLeft: 6, fontWeight: 'bold' },
  reviewContent: { fontSize: 14, color: '#475569', lineHeight: 22, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginTop: 5 },

  bottomBar: {
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  priceLabel: { fontSize: 12, color: Colors.textSecondary },
  priceValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  bookButton: { backgroundColor: Colors.primary, paddingHorizontal: 40, paddingVertical: 12, borderRadius: 15 },
  bookButtonAppText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 20, textAlign: 'center' },
  sheetRow: { marginBottom: 20 },
  sheetLabel: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 },
  sheetInputBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15 },
  sheetGuestsRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  sheetGuestItem: { flex: 1 },
  guestCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 10 },
  counterBtn: { width: 30, height: 30, backgroundColor: '#F8FAFC', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  counterBtnAppText: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  counterAppText: { fontSize: 16, fontWeight: 'bold', color: Colors.text },

  sheetSummary: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  summaryPrice: { fontSize: 18, fontWeight: 'black', color: Colors.primary },

  confirmBookButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 16, alignItems: 'center' },
  confirmBookAppText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // ── Xem thêm ──
  seeMoreBtn: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8, alignSelf: 'flex-start',
    paddingVertical: 4, paddingHorizontal: 2,
  },
  seeMoreAppText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  // ── Room Detail Btn (trong room card) ──
  roomDetailBtn: {
    marginLeft: 'auto',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  roomDetailBtnAppText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },

  // ── Room Detail Modal styles (rdHeader, rdCloseBtn, rdHeaderTitle, rdBottomBar đã xóa - dùng RBSheet)
  rdImage: { width: '100%', height: 200 },
  rdContent: { padding: 20 },

  rdTitleRow: { marginBottom: 16 },
  rdRoomName: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  rdRank: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  rdPriceContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  rdPrice: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  rdPriceUnit: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginLeft: 4 },

  rdStatsRow: {
    flexDirection: 'row', backgroundColor: '#F8FAFC',
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  rdStatItem: { flex: 1, alignItems: 'center', gap: 4 },
  rdStatDivider: { width: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },
  rdStatLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  rdStatValue: { fontSize: 13, fontWeight: '700', color: Colors.text },

  rdSection: { marginBottom: 20 },
  rdSectionTitle: {
    fontSize: 15, fontWeight: '700', color: Colors.text,
    marginBottom: 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  rdDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  rdIconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  rdIconItem: { width: '30%', alignItems: 'center', gap: 6 },
  rdIconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  rdIconLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },

  rdBottomBar: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  rdSelectBtn: {
    backgroundColor: Colors.primary, padding: 16,
    borderRadius: 16, alignItems: 'center',
  },
  // ── ITINERARY TIMELINE STYLES ──
  itineraryContainer: { paddingVertical: 10 },
  emptyItinerary: { textAlign: 'center', color: '#999', padding: 40, fontSize: 14 },
  itineraryItem: { flexDirection: 'row', marginBottom: 5 },
  timelineContainer: { alignItems: 'center', marginRight: 15, width: 40 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  timelineDayAppText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: '#F1F5F9',
    marginVertical: 4, borderRadius: 1,
  },
  itineraryContent: {
    flex: 1, backgroundColor: '#F8FAFC',
    borderRadius: 20, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9',
  },
  itineraryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  itineraryTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  itineraryDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 8 },
  itineraryToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, marginBottom: 8,
  },
  itineraryToggleAppText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  itineraryActivities: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  activityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  activityChipAppText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  activityChipAppText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  // ── TAGS STYLES ──
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagAppText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },

  rdSelectBtnAppText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ServiceDetailScreen;
