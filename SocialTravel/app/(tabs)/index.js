import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  StatusBar, 
  DeviceEventEmitter,
  Animated
} from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/src/components/common/AppText';
import AppAvatar from '@/src/components/common/AppAvatar';
import PostCard from '@/src/components/social/PostCard';
import PostSkeleton from '@/src/components/social/PostSkeleton';
import { useSocial } from '@/src/contexts/SocialContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors } from '@/src/constants/theme';
import echo from '@/src/utils/echo';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { feedPosts, loading, fetchFeed } = useSocial();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [optimisticPosts, setOptimisticPosts] = useState([]);

  useEffect(() => { 
    fetchFeed(); 
    
    // Lắng nghe khi có bài đăng mới của chính mình (đã lưu vào DB thành công)
    const subRefresh = DeviceEventEmitter.addListener('REFRESH_FEED', () => {
      setOptimisticPosts([]); // Xóa bài viết giả lập
      fetchFeed(true);
    });

    // Lắng nghe bài đăng giả lập (vừa nhấn nút Đăng)
    const subOptimistic = DeviceEventEmitter.addListener('OPTIMISTIC_POST', (post) => {
      setOptimisticPosts(prev => [post, ...prev]);
    });
    
    return () => {
      subRefresh.remove();
      subOptimistic.remove();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed(true);
    setOptimisticPosts([]);
    setRefreshing(false);
  };

  const handleOpenCreatePost = () => {
    DeviceEventEmitter.emit('OPEN_CREATE_POST');
  };

  const combinedPosts = [...optimisticPosts, ...feedPosts];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Centered Title */}
      <View style={[styles.titleBar, { paddingTop: insets.top + 10 }]}>
        <AppText weight="bold" style={styles.headerTitle}>Social Travel</AppText>
      </View>

      {/* "What's new?" Section */}
      <TouchableOpacity 
        activeOpacity={0.7} 
        style={styles.whatsNewSection}
        onPress={handleOpenCreatePost}
      >
        <AppAvatar src={user?.photoURL} name={user?.displayName} size={36} />
        <View style={styles.whatsNewInput}>
          <AppText style={styles.usernameText}>{user?.displayName || 'Người dùng'}</AppText>
          <AppText style={styles.placeholderText}>Có gì mới?</AppText>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      <FlatList
        data={combinedPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListEmptyComponent={
          loading
            ? <View style={{ paddingHorizontal: 16, paddingTop: 40 }}><PostSkeleton /><PostSkeleton /><PostSkeleton /></View>
            : <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>Chưa có bài viết nào</AppText>
              </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textSecondary}
            progressViewOffset={insets.top + 20}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  headerContainer: { backgroundColor: Colors.white },
  titleBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.black,
    letterSpacing: -0.5,
  },
  whatsNewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  whatsNewInput: {
    flex: 1,
    justifyContent: 'center',
  },
  usernameText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  placeholderText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 4,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  newPostAlert: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  alertText: {
    color: Colors.white,
    fontSize: 13,
  },
});
