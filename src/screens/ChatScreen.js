import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, FlatList,
  TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
  ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send } from 'lucide-react-native';
import AppText from '../components/common/AppText';
import { Colors } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/apiClient';
import Skeleton from '../components/common/Skeleton';
import echo from '../utils/echo';

const ChatScreen = ({ route, navigation }) => {
  const { conversationId, otherUser, recipientId, businessName } = route.params || {};
  const { user, token } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  // Real-time listener
  useEffect(() => {
    if (!currentConversationId) return;

    const channel = echo.channel(`chat.${currentConversationId}`);
    
    channel.listen('.MessageSent', (e) => {
      // e là dữ liệu từ broadcastWith()
      const newMessage = e;
      
      // Nếu không phải mình gửi (vì mình đã add local sau khi post)
      if (newMessage.sender_id !== user.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    });

    return () => {
      channel.stopListening('.MessageSent');
    };
  }, [currentConversationId]);

  const SUGGESTIONS = [
    "Dịch vụ này còn chỗ không ạ?",
    "Tôi muốn hỏi về chính sách hủy đơn",
    "Giá này đã bao gồm thuế phí chưa?",
    "Bạn có thể gửi thêm ảnh thực tế không?",
    "Tôi có thể thanh toán trực tiếp được không?"
  ];

  const flatListRef = useRef();

  useEffect(() => {
    if (currentConversationId) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [currentConversationId]);

  const fetchMessages = async () => {
    try {
      const response = await apiClient.get(`/chat/conversations/${currentConversationId}/messages`);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    setSending(true);
    const content = inputText.trim();
    setInputText('');

    try {
      const payload = currentConversationId 
        ? { conversation_id: currentConversationId, content }
        : { recipient_id: recipientId, content };

      const response = await apiClient.post('/chat/messages', payload);

      if (response.success) {
        const newMessage = response.data;
        setMessages(prev => [...prev, newMessage]);
        if (!currentConversationId) {
          setCurrentConversationId(newMessage.conversation_id);
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === user.id;
    return (
      <View style={[
        styles.messageWrapper,
        isMe ? styles.myMessageWrapper : styles.theirMessageWrapper
      ]}>
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          <AppText style={[
            styles.messageAppText,
            isMe ? styles.myMessageAppText : styles.theirMessageAppText
          ]}>
            {item.content}
          </AppText>
        </View>
        <AppText style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#000" size={26} />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <AppText style={styles.avatarInitial}>
                  {(businessName || otherUser?.display_name || "U")[0].toUpperCase()}
                </AppText>
              </View>
            </View>
            <View>
              <AppText style={styles.userName} numberOfLines={1}>
                {businessName || otherUser?.display_name || "Người dùng"}
              </AppText>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <AppText style={styles.userStatus}>Đang trực tuyến</AppText>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Messages List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.messagesList}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <View key={i} style={[
                styles.messageWrapper,
                i % 2 === 0 ? styles.myMessageWrapper : styles.theirMessageWrapper
              ]}>
                <Skeleton 
                  width={i % 3 === 0 ? 200 : 150} 
                  height={45} 
                  borderRadius={20} 
                />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <AppText style={styles.emptyTitle}>Bắt đầu cuộc trò chuyện</AppText>
                <AppText style={styles.emptySubtitle}>Hãy gửi tin nhắn để bắt đầu trao đổi với nhà cung cấp</AppText>
                
                <View style={styles.suggestionsContainer}>
                  {SUGGESTIONS.map((text, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.suggestionItem}
                      onPress={() => setInputText(text)}
                    >
                      <AppText style={styles.suggestionAppText}>{text}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSafeArea: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 18,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1D1E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  userStatus: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  messagesList: {
    padding: 15,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '82%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageAppText: {
    fontSize: 15,
    lineHeight: 22,
  },
  myMessageAppText: {
    color: '#fff',
  },
  theirMessageAppText: {
    color: '#1A1D1E',
  },
  messageTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1D1E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 12,
  },
  suggestionItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionAppText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  // Input
  inputSafeArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    fontSize: 15,
    color: '#1A1D1E',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default ChatScreen;
