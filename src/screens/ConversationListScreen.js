import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, FlatList,
  TouchableOpacity, Image,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MessageSquare } from 'lucide-react-native';
import AppText from '../components/common/AppText';
import { Colors } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/apiClient';
import { useFocusEffect } from '@react-navigation/native';
import Skeleton from '../components/common/Skeleton';

const ConversationListScreen = ({ navigation }) => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get('/chat/conversations');
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hội thoại:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const renderConversation = ({ item }) => {
    const lastMsg = item.last_message;
    const isUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id !== user.id;

    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', { 
          conversationId: item.id,
          otherUser: item.other_user,
          businessName: item.business_name
        })}
      >
        <View style={styles.avatarContainer}>
          {item.other_user?.avatar_url ? (
            <Image source={{ uri: item.other_user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <AppText style={styles.avatarInitial}>
                {(item.business_name || item.other_user?.display_name || "U")[0].toUpperCase()}
              </AppText>
            </View>
          )}
          {isUnread && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.convContent}>
          <View style={styles.convHeader}>
            <AppText style={[styles.userName, isUnread && styles.unreadText]}>
              {item.business_name || item.other_user?.display_name || "Người dùng"}
            </AppText>
            {item.last_message_at && (
              <AppText style={styles.timeText}>
                {new Date(item.last_message_at).toLocaleDateString()}
              </AppText>
            )}
          </View>
          <AppText 
            style={[styles.lastMessage, isUnread && styles.unreadLastMsg]} 
            numberOfLines={1}
          >
            {lastMsg ? lastMsg.content : "Bắt đầu cuộc trò chuyện..."}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Tin nhắn</AppText>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <View key={i} style={styles.conversationItem}>
              <Skeleton width={56} height={56} borderRadius={28} />
              <View style={[styles.convContent, { marginLeft: 15 }]}>
                <Skeleton width={120} height={18} borderRadius={4} marginBottom={8} />
                <Skeleton width={200} height={14} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MessageSquare size={64} color="#CBD5E1" />
              <AppText style={styles.emptyTitle}>Chưa có tin nhắn nào</AppText>
              <AppText style={styles.emptySubtitle}>Khi bạn liên hệ với nhà cung cấp, cuộc trò chuyện sẽ hiện ở đây.</AppText>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1D1E',
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  placeholderAvatar: {
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  avatarInitial: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 20,
  },
  unreadDot: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  convContent: {
    flex: 1,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1E',
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
  },
  unreadLastMsg: {
    color: '#1A1D1E',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1D1E',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConversationListScreen;
