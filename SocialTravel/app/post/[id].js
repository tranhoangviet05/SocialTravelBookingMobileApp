import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/src/components/common/AppText';
import AppAvatar from '@/src/components/common/AppAvatar';
import Skeleton from '@/src/components/common/Skeleton';
import PostCard from '@/src/components/social/PostCard';
import { Colors } from '@/src/constants/theme';
import { socialApi } from '@/src/api/socialApi';
import { useSocial } from '@/src/contexts/SocialContext';
import { useAuth } from '@/src/contexts/AuthContext';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { feedPosts, formatData, updatePostInState } = useSocial();
  const { user } = useAuth();
  
  // Local state for full post data (including content not in feed)
  const [postDetail, setPostDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Find this post in global state to get real-time like/counts
  const postInFeed = feedPosts.find(p => p.id === id || p.id === Number(id));
  const post = postInFeed || postDetail;

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        socialApi.getPostDetail(id),
        socialApi.getComments(id)
      ]);
      if (postRes.success) {
        const formattedPost = formatData(postRes.data);
        setPostDetail(formattedPost);
        // Sync to global state if not already there
        updatePostInState(id, formattedPost);
      }
      if (commentsRes.success) {
        const rawComments = Array.isArray(commentsRes.data) ? commentsRes.data : (commentsRes.data?.data || []);
        setComments(rawComments.map(formatData));
      }
    } catch (error) { console.error('Fetch post detail error:', error); }
    finally { setLoading(false); }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || submitting) return;
    
    const text = commentText.trim();
    setCommentText('');
    
    // Optimistic UI
    const tempId = 'temp-' + Date.now();
    const optimisticComment = {
      id: tempId,
      content: text,
      user: {
        display_name: user?.displayName || 'Tôi',
        avatar_url: user?.photoURL
      },
      status: 'posting',
      created_at: new Date().toISOString()
    };
    
    setComments(prev => [optimisticComment, ...prev]);

    try {
      const response = await socialApi.comment(id, text);
      if (response.success) {
        const newComment = formatData(response.data);
        // Thay thế bài đăng tạm bằng bài đăng thật từ server
        setComments(prev => prev.map(c => c.id === tempId ? newComment : c));
        
        // Cập nhật số lượng bình luận trên toàn cục (trang chủ)
        updatePostInState(id, { 
          comments_count: (post?.comments_count || 0) + 1 
        });
      } else {
        setComments(prev => prev.filter(c => c.id !== tempId));
      }
    } catch (error) { 
      console.error('Send comment error:', error);
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentContainer, item.status === 'posting' && { opacity: 0.6 }]}>
      <AppAvatar src={item.user?.avatar_url} name={item.user?.display_name} size={36} />
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <View style={styles.commentHeader}>
            <AppText weight="bold" style={styles.commentUser}>{item.user?.display_name}</AppText>
            {item.status === 'posting' && <ActivityIndicator size="tiny" color={Colors.textSecondary} />}
          </View>
          <AppText style={styles.commentText}>{item.content}</AppText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <AppText weight="bold" style={styles.headerTitle}>Bài viết</AppText>
        <View style={{ width: 32 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComment}
          ListHeaderComponent={
            loading ? (
              <View style={{ padding: 16 }}><Skeleton width="100%" height={200} borderRadius={20} /></View>
            ) : (
              post ? (
                <>
                  <PostCard post={post} />
                  <View style={styles.sectionSeparator} />
                  <View style={styles.commentsHeader}>
                    <AppText weight="bold" style={styles.commentsTitle}>Bình luận</AppText>
                  </View>
                </>
              ) : null
            )
          }
          ListEmptyComponent={!loading ? <View style={styles.emptyComments}><AppText style={styles.emptyText}>Chưa có bình luận nào.</AppText></View> : null}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <AppAvatar src={user?.photoURL} name={user?.displayName} size={36} />
          <View style={styles.textInputWrapper}>
            <TextInput 
              style={styles.textInput} 
              placeholder="Viết bình luận..." 
              value={commentText} 
              onChangeText={setCommentText} 
              multiline 
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !commentText.trim() && { opacity: 0.3 }]} 
              onPress={handleSendComment} 
              disabled={!commentText.trim()}
            >
              <Send size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingBottom: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#f0f0f0', 
    backgroundColor: '#fff' 
  },
  backBtn: { padding: 4 }, 
  headerTitle: { fontSize: 16, color: Colors.text },
  sectionSeparator: {
    height: 8,
    backgroundColor: '#F8F9FA',
    width: '100%',
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  commentsTitle: {
    fontSize: 16,
    color: Colors.text,
  },
  commentContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 },
  commentContent: { flex: 1, marginLeft: 10 },
  commentBubble: { backgroundColor: '#F2F3F5', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  commentUser: { fontSize: 13, color: Colors.text },
  commentText: { fontSize: 14, color: Colors.text, lineHeight: 18 },
  emptyComments: { padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', fontSize: 14 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12, 
    paddingHorizontal: 16, 
    borderTopWidth: 0.5, 
    borderTopColor: '#f0f0f0', 
    backgroundColor: '#fff' 
  },
  textInputWrapper: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    backgroundColor: '#F2F3F5', 
    borderRadius: 22, 
    marginLeft: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 6,
    minHeight: 40 
  },
  textInput: { 
    flex: 1, 
    fontSize: 15, 
    color: Colors.text, 
    paddingVertical: 4,
    maxHeight: 100 
  },
  sendBtn: { padding: 6, marginLeft: 4 },
});
