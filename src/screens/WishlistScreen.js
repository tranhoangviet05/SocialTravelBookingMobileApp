import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList,
  TouchableOpacity, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, MapPin, Star, Trash2, HeartCrack } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { BASE_URL } from '../api/apiClient';
import Skeleton from '../components/common/Skeleton';

const WishlistScreen = ({ navigation }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [])
  );

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải Wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      const newList = wishlist.filter(item => item.id !== id);
      setWishlist(newList);
      await AsyncStorage.setItem('wishlist', JSON.stringify(newList));
    } catch (error) {
      console.error('Lỗi khi xóa khỏi Wishlist:', error);
      Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích lúc này.');
    }
  };

  const getImageUrl = (media) => {
    if (media && media.length > 0) {
      const url = media[0].url;
      return url.startsWith('http') ? url : `${BASE_URL}/${url}`;
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
  };

  const renderItem = ({ item }) => {
    const isTour = item.type === 'tour';
    const isHotel = item.type === 'hotel';
    const isHomestay = item.type === 'homestay';
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ServiceDetail', { service: item })}
      >
        <Image source={{ uri: getImageUrl(item.media) }} style={styles.image} />
        
        <View style={styles.cardContent}>
          <Text style={styles.typeBadge}>
            {isTour ? '🗺️ Tour' : isHotel ? '🏨 Khách sạn' : isHomestay ? '🏡 Homestay' : '🚌 Dịch vụ'}
          </Text>
          <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.destination?.name || 'Việt Nam'}
            </Text>
          </View>
          
          <View style={styles.bottomRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Từ</Text>
              <Text style={styles.priceValue}>{Number(item.base_price || 0).toLocaleString()}đ</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Xóa khỏi Yêu thích',
                  'Bạn có chắc chắn muốn xóa dịch vụ này?',
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', onPress: () => removeFromWishlist(item.id), style: 'destructive' }
                  ]
                );
              }}
            >
              <Trash2 size={18} color="#F43F5E" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.listContainer}>
          {[1,2,3].map(i => (
            <View key={i} style={styles.card}>
              <Skeleton width={100} height={100} borderRadius={12} />
              <View style={styles.cardContent}>
                <Skeleton width={60} height={16} borderRadius={6} style={{ marginBottom: 6 }} />
                <Skeleton width={150} height={16} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width={100} height={12} borderRadius={4} style={{ marginBottom: 8 }} />
                <View style={[styles.bottomRow, { marginTop: 'auto' }]}>
                  <Skeleton width={80} height={16} borderRadius={4} />
                  <Skeleton width={30} height={30} borderRadius={8} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <HeartCrack size={50} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có dịch vụ nào</Text>
          <Text style={styles.emptyDesc}>Hãy thả tim những dịch vụ bạn quan tâm để dễ dàng xem lại nhé.</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  
  listContainer: { padding: 15, paddingBottom: 110 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  image: { width: 100, height: 100, borderRadius: 12 },
  cardContent: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  typeBadge: { 
    fontSize: 10, fontWeight: 'bold', color: Colors.primary, 
    backgroundColor: '#E0F2FE', alignSelf: 'flex-start', 
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, 
    marginBottom: 6 
  },
  title: { fontSize: 14, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { fontSize: 11, color: Colors.textSecondary, marginLeft: 4, flex: 1 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  priceLabel: { fontSize: 10, color: '#94A3B8', marginRight: 4 },
  priceValue: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  deleteButton: { padding: 6, backgroundColor: '#FFE4E6', borderRadius: 8 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  exploreButton: { backgroundColor: Colors.primary, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  exploreButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default WishlistScreen;
