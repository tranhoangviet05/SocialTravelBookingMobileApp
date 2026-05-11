import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import {
  Settings,
  Share2,
  MessageCircle,
  Grid,
  MoreHorizontal
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/src/components/common/AppText';
import AppAvatar from '@/src/components/common/AppAvatar';
import PostCard from '@/src/components/social/PostCard';
import PostSkeleton from '@/src/components/social/PostSkeleton';
import { Colors } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { socialApi } from '@/src/api/socialApi';
import { formatTimeAgo } from '@/src/utils/dateUtils';

const { width } = Dimensions.get('window');

const PROFILE_TABS = [
  { id: 'posts', label: 'Bài viết' },
  { id: 'replies', label: 'Câu trả lời' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const fetchProfileData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const profileRes = await socialApi.getMyProfile();
      if (profileRes.success) {
        const userData = profileRes.data;
        setProfile(userData);

        const [postsRes, repliesRes] = await Promise.all([
          socialApi.getUserPosts(userData.id),
          socialApi.getUserReplies(userData.id)
        ]);

        if (postsRes.success) setPosts(postsRes.data.data || []);
        if (repliesRes.success) setReplies(repliesRes.data.data || []);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Top Info */}
      <View style={styles.topInfoRow}>
        <View style={styles.nameContainer}>
          <AppText weight="bold" style={styles.displayName}>
            {profile?.display_name || user?.displayName}
          </AppText>
          <View style={styles.usernameRow}>
            <AppText style={styles.username}>
              {profile?.social_profile?.username || user?.email?.split('@')[0]}
            </AppText>
          </View>
        </View>
        <AppAvatar
          src={profile?.avatar_url}
          name={profile?.display_name || user?.displayName}
          size={72}
        />
      </View>

      {/* Bio */}
      <View style={styles.bioContainer}>
        <AppText style={styles.bioText}>
          {profile?.social_profile?.bio || 'Chưa có tiểu sử. Hãy chia sẻ gì đó về bản thân!'}
        </AppText>
      </View>

      {/* Followers & Following Count */}
      <TouchableOpacity style={styles.followersRow}>
        <AppText style={styles.followersCount}>
          {profile?.social_profile?.followers_count || 0} người theo dõi
          <AppText style={styles.dotSeparator}> • </AppText>
          {profile?.social_profile?.following_count || 0} đang theo dõi
        </AppText>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <AppText weight="bold" style={styles.actionBtnText}>Chỉnh sửa hồ sơ</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <AppText weight="bold" style={styles.actionBtnText}>Chia sẻ hồ sơ</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReplyItem = ({ item }) => (
    <View style={styles.replyItem}>
      <View style={styles.replyHeader}>
        <AppAvatar src={item.author?.avatar_url} name={item.author?.display_name} size={32} />
        <View style={styles.replyUserInfo}>
          <AppText weight="bold" style={styles.replyUserName}>{item.author?.display_name}</AppText>
          <AppText style={styles.replyTime}>{formatTimeAgo(item.created_at)}</AppText>
        </View>
      </View>
      <AppText style={styles.replyContent}>{item.content}</AppText>
      {item.post && (
        <View style={styles.originalPostSnippet}>
          <AppText numberOfLines={1} style={styles.originalPostText}>
            Phản hồi bài viết của {item.post.author?.display_name}: {item.post.content}
          </AppText>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Navbar and Header Skeleton */}
        <View style={styles.navbar}>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.topInfoRow}>
              <View style={styles.nameContainer}>
                <View style={[styles.skeletonLine, { width: '70%', height: 28, marginBottom: 10 }]} />
                <View style={[styles.skeletonLine, { width: '40%', height: 16 }]} />
              </View>
              <View style={[styles.skeletonAvatar, { width: 72, height: 72, borderRadius: 36 }]} />
            </View>
            <View style={[styles.skeletonLine, { width: '90%', height: 14, marginTop: 20 }]} />
            <View style={[styles.skeletonLine, { width: '60%', height: 14, marginTop: 8 }]} />
            <View style={[styles.actionRow, { marginTop: 25 }]}>
              <View style={[styles.skeletonLine, { flex: 1, height: 36, borderRadius: 10 }]} />
              <View style={[styles.skeletonLine, { flex: 1, height: 36, borderRadius: 10 }]} />
            </View>
          </View>
          <View style={{ marginTop: 20 }}>
            {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={{ width: 24 }} />
        <View style={styles.navbarRight}>
          <TouchableOpacity style={styles.navIcon}>
            <Share2 size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIcon}>
            <Settings size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile List */}
      <FlatList
        data={activeTab === 'posts' ? posts : replies}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {renderHeader()}
            <View style={styles.tabContainer}>
              {PROFILE_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <AppText
                    weight="bold"
                    style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
                  >
                    {tab.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          activeTab === 'posts' ? (
            <PostCard post={item} />
          ) : (
            renderReplyItem({ item })
          )
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>Chưa có {activeTab === 'posts' ? 'bài viết' : 'câu trả lời'} nào</AppText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 50,
  },
  navbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIcon: {
    marginLeft: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
    marginRight: 15,
  },
  displayName: {
    fontSize: 26,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  username: {
    fontSize: 15,
    color: Colors.text,
    marginRight: 8,
  },
  bioContainer: {
    marginTop: 15,
  },
  bioText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  followersRow: {
    marginTop: 15,
  },
  followersCount: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    color: Colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.text,
  },
  tabText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.text,
  },
  replyItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  replyUserInfo: {
    marginLeft: 10,
  },
  replyUserName: {
    fontSize: 14,
    color: Colors.text,
  },
  replyTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  replyContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  originalPostSnippet: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E2E8F0',
  },
  originalPostText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  skeletonLine: {
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  skeletonAvatar: {
    backgroundColor: '#F1F5F9',
  },
  dotSeparator: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginHorizontal: 4,
  },
});
