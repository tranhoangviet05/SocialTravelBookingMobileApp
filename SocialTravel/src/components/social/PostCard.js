import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Briefcase, ChevronRight } from 'lucide-react-native';
import AppText from '../common/AppText';
import AppAvatar from '../common/AppAvatar';
import { Colors } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { useSocial } from '../../contexts/SocialContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatTimeAgo } from '../../utils/dateUtils';
import { socialApi } from '../../api/socialApi';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onComment }) => {
  const router = useRouter();
  const { toggleLikePost } = useSocial();
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(post.created_at));
  const [isFollowing, setIsFollowing] = useState(post.author?.is_following || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeAgo(formatTimeAgo(post.created_at));
    }, 60000);

    return () => clearInterval(timer);
  }, [post.created_at]);

  const isPosting = post.status === 'posting';
  const hasMedia = post.media && post.media.length > 0;
  const service = post.service;
  const { user: currentUser } = useAuth();
  const author = post.author || post.user;
  const isOwnPost = currentUser?.dbId === author?.id;

  const handleFollowToggle = async () => {
    if (isFollowLoading || !author?.id) return;
    setIsFollowLoading(true);
    try {
      const response = await socialApi.toggleFollow(author.id);
      if (response.success) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation?.();
    if (isPosting) return;
    toggleLikePost(post.id);
  };

  const navigateToDetail = () => {
    if (isPosting) return;
    router.push({ pathname: '/post/[id]', params: { id: post.id } });
  };

  return (
    <View style={[styles.container, isPosting && styles.postingContainer]}>
      <View style={styles.mainRow}>
        {/* Cột trái: Ảnh đại diện */}
        <View style={styles.leftColumn}>
          <TouchableOpacity onPress={navigateToDetail}>
            <AppAvatar src={author?.avatar_url} name={author?.display_name} size={40} />
          </TouchableOpacity>
        </View>

        {/* Cột phải: Nội dung chính */}
        <View style={styles.rightColumn}>
          {/* Header & Content (Clickable) */}
          <TouchableOpacity activeOpacity={0.7} onPress={navigateToDetail}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.authorRow}>
                  <AppText weight="bold" style={styles.userName}>
                    {author?.social_profile?.username ? `${author.social_profile.username}` : author?.display_name}
                  </AppText>
                  
                  {!isOwnPost && author?.id && (
                    <>
                      <AppText style={styles.dotSeparator}> • </AppText>
                      <TouchableOpacity 
                        style={styles.miniFollowBtn}
                        onPress={handleFollowToggle}
                        disabled={isFollowLoading}
                      >
                        {isFollowLoading ? (
                          <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                          <AppText 
                            weight="bold" 
                            style={[styles.miniFollowText, isFollowing && styles.miniFollowTextActive]}
                          >
                            {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                          </AppText>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                <View style={styles.headerRight}>
                  {isPosting ? (
                    <ActivityIndicator size="small" color={Colors.textSecondary} />
                  ) : (
                    <AppText style={styles.timeText}>{timeAgo}</AppText>
                  )}
                  <MoreHorizontal size={16} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
                </View>
              </View>

              {post.location && (
                <View style={styles.locationRow}>
                  <MapPin size={10} color={Colors.textSecondary} />
                  <AppText style={styles.locationText}>
                    {typeof post.location === 'object' ? post.location.name : post.location}
                  </AppText>
                </View>
              )}
            </View>

            <View style={styles.content}>
              <AppText style={styles.contentText}>{post.content}</AppText>
            </View>
          </TouchableOpacity>

          {/* Media ScrollView (Độc lập để vuốt) */}
          {hasMedia && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.mediaScroll}
              contentContainerStyle={styles.mediaScrollContent}
              decelerationRate="fast"
              scrollEventThrottle={16}
            >
              {post.media.map((item, index) => {
                const ratio = (item.width && item.height) ? item.width / item.height : 1.5;
                const itemWidth = Math.max(150, 280 * ratio);
                return (
                  <View key={index} style={[styles.mediaItem, { width: itemWidth }]}>
                    <Image source={{ uri: item.url }} style={styles.mainImage} resizeMode="cover" />
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <AppText style={styles.tagsText}>
              {post.tags.map(tag => `#${typeof tag === 'object' ? tag.name : tag}`).join(' ')}
            </AppText>
          )}

          {/* Dịch vụ đi kèm */}
          {service && service.name && (
            <TouchableOpacity
              style={styles.serviceCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/service/${service.id}`)}
            >
              <View style={styles.serviceIcon}>
                {service.image ? (
                  <Image source={{ uri: service.image }} style={styles.serviceImg} />
                ) : (
                  <Briefcase size={18} color={Colors.primary} />
                )}
              </View>
              <View style={styles.serviceInfo}>
                <AppText weight="bold" style={styles.serviceName} numberOfLines={1}>{service.name}</AppText>
                <AppText style={styles.serviceMeta}>
                  {service.type?.toUpperCase() || 'DỊCH VỤ'} • {
                    service.base_price
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.base_price)
                      : 'Liên hệ'
                  }
                </AppText>
              </View>
              <ChevronRight size={16} color="#999" />
            </TouchableOpacity>
          )}

          {/* Các nút tương tác */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike} disabled={isPosting}>
              <Heart
                size={20}
                color={post.is_liked ? Colors.danger : Colors.text}
                fill={post.is_liked ? Colors.danger : 'transparent'}
              />
              {(post.likes_count > 0 || post.likes_count === 0) && (
                <AppText style={styles.actionLabel}>{post.likes_count}</AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={navigateToDetail}
              disabled={isPosting}
            >
              <MessageCircle size={20} color={Colors.text} />
              {(post.comments_count > 0 || post.comments_count === 0) && (
                <AppText style={styles.actionLabel}>{post.comments_count}</AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} disabled={isPosting}>
              <Share2 size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postingContainer: {
    opacity: 0.6,
  },
  mainRow: {
    flexDirection: 'row',
  },
  leftColumn: {
    marginRight: 12,
    alignItems: 'center',
  },
  rightColumn: {
    flex: 1,
  },
  header: {
    marginBottom: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    color: Colors.text,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotSeparator: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  miniFollowBtn: {
    marginLeft: 0,
  },
  miniFollowText: {
    fontSize: 13,
    color: Colors.primary,
  },
  miniFollowTextActive: {
    color: Colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  content: {
    marginBottom: 8,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  tagsText: {
    color: Colors.primary,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  mediaScroll: {
    marginVertical: 8,
    marginRight: -16, // Cho phép ảnh tràn lề phải
  },
  mediaScrollContent: {
    paddingRight: 16,
  },
  mediaItem: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: '#EEEEEE',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#F0F0F0',
  },
  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  serviceImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    color: Colors.text,
  },
  serviceMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    marginTop: 4,
    paddingTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

export default PostCard;
