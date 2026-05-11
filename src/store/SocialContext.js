import React, { createContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { socialApi } from '../api/socialApi';
import { BASE_URL } from '../api/apiClient';

export const SocialContext = createContext({});

export const SocialProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Helper: Chuẩn hóa dữ liệu bài viết/bình luận (Avatar, Media, Service)
  const formatSocialData = useCallback((item) => {
    const author = item.author || item.user || {};
    
    // Xử lý Avatar
    let avatarUrl = author.avatar_url;
    if (!avatarUrl) {
      const name = author.display_name || 'User';
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
    } else if (!avatarUrl.startsWith('http')) {
      avatarUrl = `${BASE_URL}/${avatarUrl}`;
    }

    // Xử lý ảnh dịch vụ gắn kèm (nếu có)
    let serviceImage = item.service?.image;
    if (serviceImage && !serviceImage.startsWith('http')) {
      serviceImage = `${BASE_URL}/${serviceImage}`;
    }

    return {
      ...item,
      user: {
        ...author,
        avatar_url: avatarUrl
      },
      tags: item.hashtags || item.tags || [],
      media: item.media?.map(m => ({
        ...m,
        url: m.url?.startsWith('http') ? m.url : `${BASE_URL}/${m.url}`
      })) || [],
      service: item.service ? {
        ...item.service,
        image: serviceImage
      } : null
    };
  }, []);

  const fetchPosts = async (showLoading = true) => {
    if (showLoading) setLoadingPosts(true);
    try {
      const response = await socialApi.getPosts();
      if (response.success) {
        const rawPosts = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        const formattedPosts = rawPosts.map(formatSocialData);
        setPosts(formattedPosts);
        return { success: true, data: formattedPosts };
      }
      return { success: false, message: 'Không thể tải bài viết' };
    } catch (error) {
      console.error('SocialStore: fetchPosts error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchComments = async (postId) => {
    setLoadingComments(true);
    try {
      const response = await socialApi.getComments(postId);
      if (response.success) {
        const formattedComments = (response.data || []).map(formatSocialData);
        setComments(formattedComments);
        return { success: true, data: formattedComments };
      }
      return { success: false, message: 'Không thể tải bình luận' };
    } catch (error) {
      console.error('SocialStore: fetchComments error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoadingComments(false);
    }
  };

  return (
    <SocialContext.Provider value={{
      posts,
      loadingPosts,
      comments,
      loadingComments,
      fetchPosts,
      fetchComments,
      formatSocialData
    }}>
      {children}
    </SocialContext.Provider>
  );
};
