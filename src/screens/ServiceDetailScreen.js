import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Image, Linking, ActivityIndicator,
  Dimensions, Platform, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, MapPin, Star, Share2,
  Heart, Calendar, Users, Info, ExternalLink, CheckCircle2, Shield, Clock,
  Sun, BedDouble, CalendarDays, Moon
} from 'lucide-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { BASE_URL } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/common/Skeleton';

const { width } = Dimensions.get('window');

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.tabButton, active && styles.tabButtonActive]} 
    onPress={onPress}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
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

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    adults: 1,
    children: 0,
  });

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
        <Text style={styles.errorText}>Không tìm thấy thông tin dịch vụ này.</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: Colors.primary }}>Quay lại</Text>
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

  const isTour = serviceData.type === 'tour';
  const isHotel = serviceData.type === 'hotel';
  const isHomestay = serviceData.type === 'homestay';
  
  const price = selectedRoomType ? selectedRoomType.base_price : (serviceData.base_price ?? 0);
  const rating = serviceData.rating_avg ?? 0;
  const reviewCount = serviceData.total_reviews ?? serviceData.total_bookings ?? 0;
  const duration = (isTour && serviceData.duration_days)
        ? `${serviceData.duration_days} ngày ${serviceData.duration_nights ? serviceData.duration_nights + ' đêm' : ''}`
        : (isHotel ? 'Lưu trú' : 'Trong ngày');

  const amenities = serviceData.amenities || serviceData.tags || [];
  const includes = serviceData.includes || [];
  const excludes = serviceData.excludes || [];
  const schedules = serviceData.schedules || [];

  const mediaList = serviceData.media && serviceData.media.length > 0 ? serviceData.media : [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }];

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
              <Text style={styles.imageIndicatorText}>{currentImageIndex + 1} / {mediaList.length}</Text>
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
          <Text style={styles.typeBadge}>
            {isTour ? '🗺️ Tour du lịch' : isHotel ? '🏨 Khách sạn' : isHomestay ? '🏡 Homestay' : '🚌 Phương tiện'}
          </Text>
          <Text style={styles.title}>{serviceData.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingBox}>
              <Star color="#FFD700" size={16} fill="#FFD700" />
              <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>({reviewCount} đánh giá)</Text>
            </View>
            <Text style={styles.providerName}>{serviceData.provider?.business_name || 'Hệ thống'}</Text>
          </View>

          <TouchableOpacity style={styles.locationRow} onPress={handleOpenMaps}>
            <MapPin color={Colors.primary} size={18} />
            <Text style={styles.address} numberOfLines={2}>{serviceData.address}</Text>
            <ExternalLink color={Colors.primary} size={16} style={{ marginLeft: 5 }} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Quick Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickStats}>
            {isTour && (
              <View style={styles.statItem}>
                <Clock size={20} color={Colors.primary} />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>THỜI LƯỢNG</Text>
                  <Text style={styles.statValue}>{duration}</Text>
                </View>
              </View>
            )}
            {(isHotel || isHomestay) && (
              <View style={styles.statItem}>
                <BedDouble size={20} color="#8B5CF6" />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>LOẠI PHÒNG</Text>
                  <Text style={styles.statValue}>{selectedRoomType ? selectedRoomType.name : 'Standard'}</Text>
                </View>
              </View>
            )}
            {serviceData.max_guests && (
              <View style={styles.statItem}>
                <Users size={20} color="#10B981" />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>SỐ KHÁCH</Text>
                  <Text style={styles.statValue}>Tối đa {serviceData.max_guests}</Text>
                </View>
              </View>
            )}
            <View style={styles.statItem}>
              <Shield size={20} color="#F59E0B" />
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>CHÍNH SÁCH</Text>
                <Text style={styles.statValue}>Hủy miễn phí</Text>
              </View>
            </View>
          </ScrollView>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            <TabButton title="Tổng quan" active={activeTab === 'overview'} onPress={() => setActiveTab('overview')} />
            {isTour && <TabButton title={`Lịch trình (${schedules.length})`} active={activeTab === 'itinerary'} onPress={() => setActiveTab('itinerary')} />}
            {(isHotel || isHomestay) && <TabButton title={`Tiện nghi (${amenities.length})`} active={activeTab === 'amenities'} onPress={() => setActiveTab('amenities')} />}
            <TabButton title="Đánh giá" active={activeTab === 'reviews'} onPress={() => setActiveTab('reviews')} />
          </ScrollView>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'overview' && (
              <View>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Sun size={20} color="#F59E0B" />
                    <Text style={styles.sectionTitle}>Giới thiệu</Text>
                  </View>
                  <Text style={styles.description}>{serviceData.description || 'Chưa có mô tả.'}</Text>
                </View>

                {(isHotel || isHomestay) && serviceData.room_types?.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <BedDouble size={20} color="#8B5CF6" />
                      <Text style={styles.sectionTitle}>Chọn loại phòng</Text>
                    </View>
                    {serviceData.room_types.map(room => (
                      <TouchableOpacity 
                        key={room.id}
                        style={[styles.roomCard, selectedRoomType?.id === room.id && styles.roomCardSelected]}
                        onPress={() => setSelectedRoomType(room)}
                      >
                        <Image source={{ uri: room.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' }} style={styles.roomImage} />
                        <View style={styles.roomInfo}>
                          <Text style={styles.roomName}>{room.name}</Text>
                          <Text style={styles.roomPrice}>{Number(room.base_price).toLocaleString()}đ <Text style={{fontSize: 10, color: '#999'}}>/ đêm</Text></Text>
                          <Text style={styles.roomDesc} numberOfLines={2}>{room.description}</Text>
                          <View style={styles.roomMetaRow}>
                            <Users size={12} color="#666" />
                            <Text style={styles.roomMetaText}>{room.capacity_adults} NL</Text>
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

                {includes.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <CheckCircle2 size={20} color="#10B981" />
                      <Text style={styles.sectionTitle}>Bao gồm</Text>
                    </View>
                    {includes.map((item, i) => (
                      <View key={i} style={styles.listItem}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <Text style={styles.listItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {excludes.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Moon size={20} color="#F43F5E" />
                      <Text style={styles.sectionTitle}>Không bao gồm</Text>
                    </View>
                    {excludes.map((item, i) => (
                      <View key={i} style={styles.listItem}>
                        <View style={styles.minusIcon}><View style={styles.minusLine} /></View>
                        <Text style={styles.listItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'itinerary' && isTour && (
              <View style={styles.section}>
                {schedules.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#999', padding: 20 }}>Chưa có lịch trình chi tiết</Text>
                ) : (
                  schedules.map((item, idx) => (
                    <View key={idx} style={styles.scheduleItem}>
                      <View style={styles.scheduleDay}>
                        <Text style={styles.scheduleDayText}>{item.day_number}</Text>
                      </View>
                      <View style={styles.scheduleContent}>
                        <Text style={styles.scheduleTitle}>{item.title}</Text>
                        <Text style={styles.scheduleDesc}>{item.description}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'amenities' && (isHotel || isHomestay) && (
              <View style={styles.section}>
                {amenities.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#999', padding: 20 }}>Chưa có thông tin tiện nghi</Text>
                ) : (
                  <View style={styles.amenitiesGrid}>
                    {amenities.map((item, idx) => (
                      <View key={idx} style={styles.amenityBadge}>
                        <Text style={styles.amenityText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'reviews' && (
              <View style={styles.section}>
                <View style={styles.reviewOverview}>
                  <Text style={styles.reviewScore}>{Number(rating).toFixed(1)}</Text>
                  <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} color="#FFD700" fill={i <= Math.round(rating) ? "#FFD700" : "transparent"} />)}
                  </View>
                  <Text style={styles.reviewCountInfo}>{reviewCount} đánh giá</Text>
                </View>

                {/* Write Review Section */}
                <View style={styles.writeReviewContainer}>
                  <Text style={styles.writeReviewTitle}>Chia sẻ trải nghiệm của bạn</Text>
                  {user ? (
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ marginRight: 10, fontSize: 13, color: '#666' }}>Chất lượng:</Text>
                        <View style={{ flexDirection: 'row' }}>
                          {[1,2,3,4,5].map(i => (
                            <TouchableOpacity key={i} onPress={() => setReviewRating(i)}>
                              <Star size={24} color="#FFD700" fill={i <= reviewRating ? "#FFD700" : "transparent"} />
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      <TextInput
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
                        {submittingReview ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitReviewText}>Gửi đánh giá</Text>}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.loginPrompt}>
                      <Text style={styles.loginPromptText}>Bạn chưa đăng nhập?</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginPromptBtn}>
                        <Text style={styles.loginPromptBtnText}>Đăng nhập ngay</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Reviews List */}
                <Text style={styles.reviewListTitle}>Đánh giá từ cộng đồng ({reviews.length})</Text>
                {reviewsLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
                ) : reviews.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: '#999', fontSize: 14 }}>Chưa có đánh giá nào.</Text>
                  </View>
                ) : (
                  reviews.map((review, index) => (
                    <View key={review.id || index} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}>
                          {review.user?.avatar_url ? (
                            <Image source={{ uri: review.user.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                          ) : (
                            <Text style={styles.reviewAvatarText}>{(review.user?.display_name || "U")[0].toUpperCase()}</Text>
                          )}
                        </View>
                        <View>
                          <Text style={styles.reviewAuthor}>{review.user?.display_name || "Khách"}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            {[1,2,3,4,5].map(i => <Star key={i} size={10} color="#FFD700" fill={i <= review.rating ? "#FFD700" : "transparent"} />)}
                            <Text style={styles.reviewDate}>
                              {review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : ''}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.reviewContent}>{review.content}</Text>
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
          <Text style={styles.priceLabel}>{isHotel || isHomestay ? 'Giá / đêm' : isTour ? 'Giá / người' : 'Giá / chuyến'}</Text>
          <Text style={styles.priceValue}>{Number(price).toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => bottomSheetRef.current?.open()}>
          <Text style={styles.bookButtonText}>Đặt ngay</Text>
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
        <Text style={styles.sheetTitle}>Tùy chọn đặt dịch vụ</Text>
        
        <View style={styles.sheetRow}>
          <Text style={styles.sheetLabel}>{isTour ? 'Ngày khởi hành' : 'Ngày nhận phòng'}</Text>
          <TouchableOpacity style={styles.sheetInputBox}>
            <Text style={{fontWeight: 'bold', color: Colors.text}}>{bookingForm.date}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sheetGuestsRow}>
          <View style={styles.sheetGuestItem}>
            <Text style={styles.sheetLabel}>Người lớn</Text>
            <View style={styles.guestCounter}>
              <TouchableOpacity onPress={() => setBookingForm(p => ({...p, adults: Math.max(1, p.adults - 1)}))} style={styles.counterBtn}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
              <Text style={styles.counterText}>{bookingForm.adults}</Text>
              <TouchableOpacity onPress={() => setBookingForm(p => ({...p, adults: p.adults + 1}))} style={styles.counterBtn}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.sheetGuestItem}>
            <Text style={styles.sheetLabel}>Trẻ em</Text>
            <View style={styles.guestCounter}>
              <TouchableOpacity onPress={() => setBookingForm(p => ({...p, children: Math.max(0, p.children - 1)}))} style={styles.counterBtn}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
              <Text style={styles.counterText}>{bookingForm.children}</Text>
              <TouchableOpacity onPress={() => setBookingForm(p => ({...p, children: p.children + 1}))} style={styles.counterBtn}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sheetSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng tạm tính</Text>
            <Text style={styles.summaryPrice}>
              {Number(price * bookingForm.adults + price * 0.5 * bookingForm.children).toLocaleString()}đ
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmBookButton} onPress={handleBooking}>
          <Text style={styles.confirmBookText}>Xác nhận & Đặt ngay</Text>
        </TouchableOpacity>
      </RBSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorText: { fontSize: 16, color: '#666' },
  
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
  imageIndicatorText: {
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
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { fontWeight: 'bold', color: '#B8860B', fontSize: 16 },
  reviewCountText: { color: '#999', fontSize: 12 },
  providerName: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  address: { flex: 1, marginLeft: 8, color: Colors.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  
  quickStats: { flexDirection: 'row', marginBottom: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12, marginRight: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  statTextContainer: { marginLeft: 10 },
  statLabel: { fontSize: 9, fontWeight: 'bold', color: '#94A3B8', marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: 'bold', color: '#334155' },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 20 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8' },
  tabTextActive: { color: Colors.primary },

  tabContent: { paddingBottom: 40 },
  section: { marginBottom: 25, backgroundColor: '#fff', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  roomCard: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 10, marginBottom: 10, position: 'relative' },
  roomCardSelected: { borderColor: Colors.primary, backgroundColor: '#F0F9FF' },
  roomImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  roomInfo: { flex: 1 },
  roomName: { fontWeight: 'bold', fontSize: 14, color: Colors.text, marginBottom: 4 },
  roomPrice: { fontWeight: 'bold', fontSize: 14, color: Colors.primary, marginBottom: 4 },
  roomDesc: { fontSize: 11, color: '#64748B', marginBottom: 8 },
  roomMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roomMetaText: { fontSize: 10, fontWeight: 'bold', color: '#64748B' },
  checkIcon: { position: 'absolute', top: -5, right: -5, backgroundColor: Colors.primary, borderRadius: 10 },

  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  listItemText: { fontSize: 13, color: '#475569', flex: 1, lineHeight: 20 },
  minusIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFE4E6', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  minusLine: { width: 8, height: 2, backgroundColor: '#F43F5E', borderRadius: 1 },

  scheduleItem: { flexDirection: 'row', marginBottom: 20 },
  scheduleDay: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  scheduleDayText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  scheduleContent: { flex: 1, paddingLeft: 15, paddingBottom: 20, borderLeftWidth: 2, borderLeftColor: '#E0F2FE', marginLeft: -16, paddingTop: 5 },
  scheduleTitle: { fontWeight: 'bold', fontSize: 14, color: Colors.text, marginBottom: 5 },
  scheduleDesc: { fontSize: 13, color: '#64748B', lineHeight: 20 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityBadge: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  amenityText: { fontSize: 12, fontWeight: '500', color: '#475569' },

  reviewOverview: { alignItems: 'center', paddingVertical: 20 },
  reviewScore: { fontSize: 40, fontWeight: 'black', color: Colors.text },
  reviewCountInfo: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold' },

  // Reviews Styles
  writeReviewContainer: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, marginBottom: 20 },
  writeReviewTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },
  reviewInput: { backgroundColor: '#fff', borderRadius: 12, padding: 15, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  submitReviewBtn: { backgroundColor: Colors.primary, padding: 12, borderRadius: 12, alignItems: 'center' },
  submitReviewText: { color: '#fff', fontWeight: 'bold' },
  loginPrompt: { alignItems: 'center', padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
  loginPromptText: { color: '#64748B', marginBottom: 10, fontWeight: 'bold' },
  loginPromptBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  loginPromptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  
  reviewListTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 15, marginBottom: 15 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  reviewAvatarText: { color: Colors.primary, fontWeight: 'black', fontSize: 16 },
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
  bookButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 20, textAlign: 'center' },
  sheetRow: { marginBottom: 20 },
  sheetLabel: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 },
  sheetInputBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15 },
  sheetGuestsRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  sheetGuestItem: { flex: 1 },
  guestCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 10 },
  counterBtn: { width: 30, height: 30, backgroundColor: '#F8FAFC', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  counterText: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  
  sheetSummary: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  summaryPrice: { fontSize: 18, fontWeight: 'black', color: Colors.primary },
  
  confirmBookButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 16, alignItems: 'center' },
  confirmBookText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ServiceDetailScreen;
