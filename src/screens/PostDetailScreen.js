import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import AppText from '../components/common/AppText';
import AppAvatar from '../components/common/AppAvatar';
import { formatCurrency } from '../utils/helpers';
import { SocialContext } from '../store/SocialContext';

const { width } = Dimensions.get('window');

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  const insets = useSafeAreaInsets();
  
  const { 
    comments, 
    loadingComments, 
    fetchComments 
  } = React.useContext(SocialContext);

  useEffect(() => {
    fetchComments(post.id);
  }, [post.id]);

  const onRefresh = () => {
    fetchComments(post.id);
  };

  const handleActionRestricted = () => {
    Alert.alert(
      'Yêu cầu ứng dụng',
      'Để tham gia bình luận và tương tác, vui lòng sử dụng ứng dụng Social Travel Network.',
      [{ text: 'Đóng', style: 'cancel' }]
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.postCard}>
        {/* User Info */}
        <View style={styles.postHeader}>
          <AppAvatar 
            src={post.user?.avatar_url} 
            name={post.user?.display_name} 
            size={40} 
          />
          <View style={styles.userInfo}>
            <AppText style={styles.userName}>{post.user.display_name}</AppText>
            <AppText style={styles.timeText}>Đăng 2 giờ trước</AppText>
          </View>
          <TouchableOpacity onPress={handleActionRestricted}>
            <MoreHorizontal size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.postContent}>
          <AppText style={styles.contentText}>{post.content}</AppText>
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <AppText key={tag.id ? `tag-detail-${tag.id}` : `tag-det-idx-${index}`} style={styles.tagText}>
                #{typeof tag === 'string' ? tag : tag.name}
              </AppText>
            ))}
          </View>
        </View>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.mediaContainer}>
            {post.media.map((item, idx) => (
              <Image key={idx} source={{ uri: item.url }} style={styles.postImage} />
            ))}
          </ScrollView>
        )}

        {/* Actions Count */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Heart size={16} color="#EF4444" fill="#EF4444" />
            <AppText style={styles.statText}>{post.likes_count} người thích</AppText>
          </View>
          <AppText style={styles.statText}>{post.comments_count} bình luận</AppText>
        </View>
      </View>

      <View style={styles.commentSectionTitle}>
        <AppText style={styles.sectionTitleText}>Bình luận</AppText>
      </View>
    </View>
  );

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <AppAvatar 
        src={item.user?.avatar_url} 
        name={item.user?.display_name} 
        size={32} 
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <AppText style={styles.commentUser}>{item.user.display_name}</AppText>
          <AppText style={styles.commentTime}>{item.created_at}</AppText>
        </View>
        <AppText style={styles.commentText}>{item.content}</AppText>
        <TouchableOpacity style={styles.commentLike} onPress={handleActionRestricted}>
          <Heart size={14} color={Colors.textSecondary} />
          <AppText style={styles.commentLikeText}>{item.likes_count > 0 ? item.likes_count : 'Thích'}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.navHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <AppText style={styles.navTitle}>Bài viết</AppText>
        <TouchableOpacity onPress={handleActionRestricted}>
          <Share2 color="#000" size={22} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        keyExtractor={item => item.id.toString()}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: 100 }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshing={loadingComments}
        onRefresh={onRefresh}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity 
          style={styles.compactBanner} 
          onPress={handleActionRestricted}
          activeOpacity={0.8}
        >
          <AppText style={styles.restrictedText}>Tải Social App để tham gia bình luận & tương tác</AppText>
          <View style={styles.miniBtn}>
            <AppText style={styles.miniBtnText}>Tải ngay</AppText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  navTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.text },

  postCard: { backgroundColor: '#fff', paddingBottom: 15 },
  postHeader: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  userAvatar: { width: 40, height: 40, borderRadius: 20 },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  timeText: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  postContent: { paddingHorizontal: 20, marginBottom: 15 },
  contentText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tagText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  mediaContainer: { width: width, height: 350 },
  postImage: { width: width, height: 350 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  commentSectionTitle: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  sectionTitleText: { fontSize: 16, fontWeight: 'bold', color: Colors.text },

  commentItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentContent: { flex: 1, marginLeft: 12 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentUser: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  commentTime: { fontSize: 11, color: Colors.textSecondary },
  commentText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  commentLike: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  commentLikeText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  compactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    gap: 10
  },
  restrictedText: { flex: 1, fontSize: 12, color: '#0369A1', fontWeight: '500' },
  miniBtn: {
    backgroundColor: '#0369A1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  miniBtnText: { fontSize: 11, color: '#fff', fontWeight: 'bold' }
});

export default PostDetailScreen;
