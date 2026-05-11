import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Download
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import AppText from '../components/common/AppText';
import PostCard from '../components/explore/PostCard';
import SocialBanner from '../components/explore/SocialBanner';
import Skeleton from '../components/common/Skeleton';
import { SocialContext } from '../store/SocialContext';

const { width } = Dimensions.get('window');

const PostSkeleton = () => (
  <View style={styles.postSkeleton}>
    <View style={styles.skeletonHeader}>
      <Skeleton width={45} height={45} borderRadius={22.5} />
      <View style={styles.skeletonUserInfo}>
        <Skeleton width={width * 0.4} height={16} borderRadius={4} />
        <View style={{ marginTop: 6 }}>
          <Skeleton width={width * 0.2} height={12} borderRadius={4} />
        </View>
      </View>
    </View>
    <View style={styles.skeletonContent}>
      <Skeleton width={width - 40} height={14} borderRadius={4} />
      <View style={{ marginTop: 8 }}>
        <Skeleton width={width * 0.6} height={14} borderRadius={4} />
      </View>
    </View>
    <Skeleton width={width} height={350} />
    <View style={styles.skeletonActions}>
      <Skeleton width={60} height={20} borderRadius={10} />
      <Skeleton width={60} height={20} borderRadius={10} />
    </View>
  </View>
);

const ExploreScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { posts, loadingPosts, fetchPosts } = React.useContext(SocialContext);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(false);
    setRefreshing(false);
  };

  const handleActionRestricted = () => {
    Alert.alert(
      'Tính năng giới hạn',
      'Để tham gia thảo luận, đăng bài và tương tác cùng cộng đồng, vui lòng tải ứng dụng Social Travel Network chuyên biệt.',
      [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Tải ứng dụng', onPress: () => console.log('Link to App Store') }
      ]
    );
  };

  const handleCommentPress = (post) => {
    // Cho phép xem chi tiết bài đăng và bình luận
    navigation.navigate('PostDetail', { post });
  };

  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetail', { service });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <AppText style={styles.headerTitle}>Khám phá</AppText>
          <AppText style={styles.headerSubtitle}>Cảm hứng cho chuyến đi tiếp theo</AppText>
        </View>
        <TouchableOpacity style={styles.appNotifyBtn} onPress={handleActionRestricted}>
          <Download size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onCommentPress={handleCommentPress}
            onServicePress={handleServicePress}
            onActionRestricted={handleActionRestricted}
          />
        )}
        ListHeaderComponent={
          <SocialBanner 
            onPress={() => console.log('Download App')} 
          />
        }
        ListEmptyComponent={
          loadingPosts ? (
            <View>
              <PostSkeleton />
              <PostSkeleton />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>Chưa có bài viết nào</AppText>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

// Import LinearGradient giả lập nếu chưa cài expo-linear-gradient
const LinearGradient = ({ colors, children, style }) => (
  <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  appNotifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    paddingTop: 0,
  },

  postSkeleton: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  skeletonHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center'
  },
  skeletonUserInfo: {
    marginLeft: 12
  },
  skeletonContent: {
    paddingHorizontal: 20,
    marginBottom: 15
  },
  skeletonActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 20
  },

  bannerContainer: { padding: 20 },
  socialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8
  },
  bannerText: { flex: 1, marginRight: 15 },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bannerDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 12, lineHeight: 18 },
  bannerBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bannerBtnText: { color: '#059669', fontSize: 13, fontWeight: 'bold' },

  listContent: { paddingTop: 0 },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  postHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12
  },
  userAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F1F5F9' },
  userInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  followingTag: { fontSize: 13, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  timeText: { fontSize: 12, color: Colors.textSecondary },
  locationTag: { flexDirection: 'row', alignItems: 'center' },
  metaDivider: { color: Colors.textSecondary, fontSize: 12 },
  locationName: { fontSize: 12, color: Colors.primary, fontWeight: '500' },

  postContent: { paddingHorizontal: 20, marginBottom: 12 },
  contentText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tagText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  mediaContainer: { width: width, height: 400, marginBottom: 12, position: 'relative' },
  postImage: { width: width, height: 400 },
  imageBadge: {
    position: 'absolute', top: 15, right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12
  },
  imageBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  serviceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  serviceThumb: { width: 60, height: 60, borderRadius: 12 },
  serviceInfo: { flex: 1, marginLeft: 12 },
  serviceTagLabel: { fontSize: 10, fontWeight: 'bold', color: '#16A34A', letterSpacing: 1, marginBottom: 2 },
  serviceName: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  servicePrice: { fontSize: 13, color: '#16A34A', fontWeight: 'bold', marginTop: 2 },

  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 25,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12
  },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' }
});

export default ExploreScreen;
