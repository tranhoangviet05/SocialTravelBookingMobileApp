import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { socialApi } from '../api/socialApi';
import echo from '../utils/echo';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../api/apiClient';

const SocialContext = createContext({
  feedPosts: [],
  loading: false,
  fetchFeed: async () => {},
  updatePostInState: () => {},
  formatData: (item) => item,
});

export const useSocial = () => useContext(SocialContext);

export const SocialProvider = ({ children }) => {
  const { user } = useAuth();
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatData = useCallback((item) => {
    const author = item.author || item.user || {};
    let avatarUrl = author.avatar_url;
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      avatarUrl = `${BASE_URL}/${avatarUrl}`;
    }
    const media = item.media?.map((m) => ({
      ...m,
      url: m.url?.startsWith('http') ? m.url : `${BASE_URL}/${m.url}`
    })) || [];
    
    // Lấy ảnh dịch vụ từ media của nó nếu có
    let serviceImage = item.service?.image || item.service?.thumbnail;
    if (!serviceImage && item.service?.media && item.service.media.length > 0) {
      serviceImage = item.service.media[0].url;
    }

    if (serviceImage && !serviceImage.startsWith('http')) {
      serviceImage = `${BASE_URL}/${serviceImage}`;
    }

    return {
      ...item,
      user: { ...author, avatar_url: avatarUrl },
      media,
      service: item.service ? { ...item.service, image: serviceImage } : null,
      tags: item.hashtags || item.tags || []
    };
  }, []);

  const fetchFeed = useCallback(async (force = false) => {
    if (loading && !force) return;
    setLoading(true);
    try {
      const response = await socialApi.getFeed();
      if (response.success) {
        const rawPosts = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setFeedPosts(rawPosts.map(formatData));
      }
    } catch (error) {
      console.error('Fetch feed error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, formatData]);

  const updatePostInState = useCallback((postId, newData) => {
    setFeedPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, ...newData } : p
    ));
  }, []);

  useEffect(() => {
    const interactionChannel = echo.channel('social-interactions');
    interactionChannel.listen('.post.liked', (e) => {
      const updates = { likes_count: e.likesCount };
      // Nếu chính user này like/unlike từ thiết bị khác (web)
      if (user && e.likedBy === user.dbId) {
        updates.is_liked = !!e.liked;
      }
      updatePostInState(e.postId, updates);
    });
    interactionChannel.listen('.post.commented', (e) => {
      updatePostInState(Number(e.postId) || e.postId, { comments_count: e.commentsCount });
    });
    return () => {
      interactionChannel.stopListening('.post.liked');
      interactionChannel.stopListening('.post.commented');
    };
  }, [updatePostInState, user]);

  const toggleLikePost = useCallback(async (postId) => {
    // Optimistic Update
    let originalPost = null;
    setFeedPosts(prev => prev.map(p => {
      if (p.id === postId) {
        originalPost = { ...p };
        const newIsLiked = !p.is_liked;
        return { 
          ...p, 
          is_liked: newIsLiked,
          likes_count: newIsLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1)
        };
      }
      return p;
    }));

    try {
      const response = await socialApi.toggleLike(postId);
      // Backend returns actual counts, we can sync if needed
      if (response.success) {
        updatePostInState(postId, { 
          likes_count: response.data?.likes_count,
          is_liked: response.data?.liked
        });
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      // Revert if failed
      if (originalPost) {
        setFeedPosts(prev => prev.map(p => p.id === postId ? originalPost : p));
      }
    }
  }, [updatePostInState]);

  return (
    <SocialContext.Provider value={{
      feedPosts,
      loading,
      fetchFeed,
      updatePostInState,
      toggleLikePost,
      formatData
    }}>
      {children}
    </SocialContext.Provider>
  );
};
