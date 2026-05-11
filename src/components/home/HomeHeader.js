import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Bell, Bed, MapPin, Car } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { BASE_URL } from '../../api/apiClient';

const HEADER_DARK = '#0077B6';

const HomeHeader = ({ activeCategory, setActiveCategory }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (token) {
      fetchUnreadCount();
    }
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUnreadCount(response.data.data.unread_count);
      }
    } catch (error) {
      console.error("Lỗi khi lấy số lượng tin nhắn chưa đọc:", error);
    }
  };

  const categories = [
    { id: 'stay', label: 'Lưu trú', icon: Bed },
    { id: 'activity', label: 'Hoạt động', icon: MapPin },
    { id: 'car', label: 'Thuê xe', icon: Car },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar — nội dung nằm dưới tai thỏ */}
      <View style={styles.topBar}>
        <View style={styles.sideColumn}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
            <Heart color="rgba(255,255,255,0.9)" size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerColumn}>
          <Text style={styles.logoText} numberOfLines={1}>Social Travel Booking</Text>
        </View>

        <View style={styles.sideColumn}>
          <View style={styles.rightIcons}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => navigation.navigate('ConversationList')}
            >
              <View>
                <MessageCircle color="rgba(255,255,255,0.9)" size={22} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell color="rgba(255,255,255,0.9)" size={22} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Category Menu */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryItem,
              activeCategory === cat.id && styles.activeCategoryItem,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <cat.icon
              color={activeCategory === cat.id ? HEADER_DARK : 'rgba(255,255,255,0.8)'}
              size={18}
            />
            <Text style={[
              styles.categoryLabel,
              activeCategory === cat.id && styles.activeCategoryLabel,
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: HEADER_DARK, // Xanh đậm đặc hoàn toàn
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Typography.spacing.sm,
    height: 56,
  },
  sideColumn: {
    width: 80,
    alignItems: 'flex-start',
  },
  centerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 8,
  },
  categoryContainer: {
    paddingHorizontal: Typography.spacing.md,
    paddingVertical: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activeCategoryItem: {
    backgroundColor: '#fff',
  },
  categoryLabel: {
    marginLeft: 7,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  activeCategoryLabel: {
    color: HEADER_DARK,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: HEADER_DARK,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HomeHeader;
