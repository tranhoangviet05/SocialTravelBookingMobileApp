import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Dimensions,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Star, 
  CheckCheck,
  BellOff,
  ChevronRight
} from 'lucide-react-native';
import AppText from '@/src/components/common/AppText';
import AppAvatar from '@/src/components/common/AppAvatar';
import { Colors, Shadow } from '@/src/constants/theme';
import { socialApi } from '@/src/api/socialApi';
import { formatTimeAgo } from '@/src/utils/dateUtils';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const NOTIFICATION_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'follow', label: 'Theo dõi' },
  { id: 'reply', label: 'Bình luận' },
  { id: 'like', label: 'Lượt thích' },
];

const SkeletonNotification = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonItem}>
      <Animated.View style={[styles.skeletonAvatar, { opacity }]} />
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonLine, { width: '80%', opacity }]} />
        <Animated.View style={[styles.skeletonLine, { width: '30%', height: 10, marginTop: 8, opacity }]} />
      </View>
    </View>
  );
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async (type = activeTab, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await socialApi.getNotifications(type);
      if (response.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications(activeTab, true);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await socialApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await socialApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Mark all read error:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    handleMarkAsRead(notification.id);
    if (notification.post_id) {
      router.push({ pathname: '/post/[id]', params: { id: notification.post_id } });
    } else if (notification.type === 'follow') {
      // Navigate to sender profile
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={14} color="#fff" fill="#fff" />;
      case 'comment': return <MessageCircle size={14} color="#fff" fill="#fff" />;
      case 'follow': return <UserPlus size={14} color="#fff" />;
      default: return <Star size={14} color="#fff" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'like': return '#F43F5E';
      case 'comment': return '#3B82F6';
      case 'follow': return '#10B981';
      default: return Colors.primary;
    }
  };

  const getNotificationMessage = (item) => {
    switch (item.type) {
      case 'like': return 'đã thích bài viết của bạn';
      case 'comment': return `đã bình luận: "${item.data?.comment_body || '...'}"`;
      case 'follow': return 'đã bắt đầu theo dõi bạn';
      default: return 'đã tương tác với bạn';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <AppAvatar 
          src={item.sender?.avatar_url} 
          name={item.sender?.display_name} 
          size={52} 
        />
        <View style={[styles.typeBadge, { backgroundColor: getIconBg(item.type) }]}>
          {getIcon(item.type)}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <AppText style={styles.messageText} numberOfLines={3}>
          <AppText weight="bold" style={styles.senderName}>{item.sender?.display_name}</AppText>
          {' '}{getNotificationMessage(item)}
        </AppText>
        <AppText style={styles.timeText}>{formatTimeAgo(item.created_at)}</AppText>
      </View>

      {!item.is_read && <View style={styles.unreadDot} />}
      <ChevronRight size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <BellOff size={32} color={Colors.textSecondary} />
      </View>
      <AppText weight="bold" style={styles.emptyTitle}>Chưa có thông báo nào</AppText>
      <AppText style={styles.emptySubtitle}>
        Các tương tác của mọi người với bạn sẽ được hiển thị tại đây.
      </AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <AppText weight="bold" style={styles.headerTitle}>Hoạt động</AppText>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <CheckCheck size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {NOTIFICATION_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <AppText 
                  weight={activeTab === tab.id ? "bold" : "medium"}
                  style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={i => i.toString()}
          renderItem={() => <SkeletonNotification />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    color: Colors.text,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 30,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  unreadItem: {
    backgroundColor: '#F8FAFC',
  },
  avatarContainer: {
    position: 'relative',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  senderName: {
    fontSize: 15,
    color: Colors.text,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: 50,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  skeletonItem: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 16,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
});
