import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MapPin, MoreHorizontal, ExternalLink, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import AppText from '../common/AppText';
import { formatCurrency } from '../../utils/helpers';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onCommentPress, onServicePress, onActionRestricted }) => {
  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: post.user.avatar_url }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <AppText style={styles.userName}>{post.user.display_name}</AppText>
            {post.user.is_following && (
              <AppText style={styles.followingTag}> • Đang theo dõi</AppText>
            )}
          </View>
          <View style={styles.metaRow}>
            <AppText style={styles.timeText}>2 giờ trước</AppText>
            {post.location && (
              <View style={styles.locationTag}>
                <AppText style={styles.metaDivider}> • </AppText>
                <MapPin size={12} color={Colors.primary} />
                <AppText style={styles.locationName}>{post.location.name}</AppText>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onActionRestricted}>
          <MoreHorizontal size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <AppText style={styles.contentText}>{post.content}</AppText>

        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <AppText key={tag.id ? `tag-${tag.id}` : `tag-idx-${index}`} style={styles.tagText}>
                #{typeof tag === 'string' ? tag : tag.name}
              </AppText>
            ))}
          </View>
        )}
      </View>

      {/* Post Media */}
      {post.media && post.media.length > 0 && (
        <View style={styles.mediaContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {post.media.map((item, idx) => (
              <Image
                key={idx}
                source={{ uri: item.url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {post.media.length > 1 && (
            <View style={styles.imageBadge}>
              <AppText style={styles.imageBadgeText}>1/{post.media.length}</AppText>
            </View>
          )}
        </View>
      )}

      {/* Tagged Service */}
      {post.service && (
        <TouchableOpacity
          style={styles.serviceLink}
          onPress={() => onServicePress(post.service)}
        >
          <Image source={{ uri: post.service.image }} style={styles.serviceThumb} />
          <View style={styles.serviceInfo}>
            <AppText style={styles.serviceTagLabel}>DỊCH VỤ ĐƯỢC GẮN THẺ</AppText>
            <AppText style={styles.serviceName} numberOfLines={1}>{post.service.name}</AppText>
            <AppText style={styles.servicePrice}>{formatCurrency(post.service.base_price)}</AppText>
          </View>
          <ExternalLink size={18} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionItem} onPress={onActionRestricted}>
          <Heart size={22} color={Colors.textSecondary} />
          <AppText style={styles.actionText}>{post.likes_count}</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={() => onCommentPress(post)}>
          <MessageCircle size={22} color={Colors.textSecondary} />
          <AppText style={styles.actionText}>{post.comments_count}</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={onActionRestricted}>
          <Share2 size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default PostCard;
