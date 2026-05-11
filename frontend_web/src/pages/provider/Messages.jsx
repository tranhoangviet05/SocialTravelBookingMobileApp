import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Search, Send, MoreVertical, Phone, Video, 
    Image as ImageIcon, Paperclip, Smile, Loader2,
    CheckCircle2, Clock, MapPin, User, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import chatApi from '../../api/chatApi';
import echo from '../../utils/echo';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Messages = () => {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = useCallback(async () => {
        try {
            const response = await chatApi.getConversations();
            if (response.success) {
                setConversations(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách hội thoại:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const fetchMessages = async (conversationId) => {
        setMessagesLoading(true);
        try {
            const response = await chatApi.getMessages(conversationId);
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy tin nhắn:', error);
        } finally {
            setMessagesLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchConversations();
        }
    }, [currentUser, fetchConversations]);

    // Real-time listener for new messages
    useEffect(() => {
        if (!currentUser || !activeConversation) return;

        // Lắng nghe Channel của hội thoại cụ thể (public channel - giống social features)
        const channel = echo.channel(`chat.${activeConversation.id}`);
        
        const messageListener = (e) => {
            // e là dữ liệu từ broadcastWith() trong MessageSent event
            const receivedMessage = e;
            
            // Chỉ thêm vào danh sách nếu không phải là tin nhắn tạm (vì tin nhắn gửi đi đã được add vào list)
            // Hoặc check sender_id !== currentUser.id
            if (receivedMessage.sender_id !== currentUser.id) {
                setMessages(prev => {
                    // Tránh trùng lặp tin nhắn
                    if (prev.some(m => m.id === receivedMessage.id)) return prev;
                    return [...prev, receivedMessage];
                });
                setTimeout(scrollToBottom, 100);
            }

            // Luôn fetch lại danh sách hội thoại để cập nhật preview tin nhắn cuối và unread badge
            fetchConversations();
        };

        channel.listen('.MessageSent', messageListener);

        return () => {
            channel.stopListening('.MessageSent');
        };
    }, [currentUser, activeConversation, fetchConversations]);

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        fetchMessages(conv.id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const tempMessage = {
            id: Date.now(),
            content: newMessage,
            sender_id: currentUser.id,
            created_at: new Date().toISOString(),
            is_temp: true
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        setTimeout(scrollToBottom, 100);

        try {
            const response = await chatApi.sendMessage({
                conversation_id: activeConversation.id,
                content: tempMessage.content
            });

            if (response.success) {
                // Thay thế tin nhắn tạm bằng tin nhắn thực từ server
                setMessages(prev => prev.map(m => m.id === tempMessage.id ? response.data : m));
                fetchConversations(); // Cập nhật lại list hội thoại
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            // Có thể đánh dấu tin nhắn là lỗi để gửi lại
        }
    };

    const filteredConversations = conversations.filter(conv => 
        conv.other_user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderMessageContent = (message) => {
        const content = message.content;
        
        // Kiểm tra xem có phải tin nhắn tự động không (Dựa vào markdown/emoji đặc trưng)
        const isAuto = content.includes('**#BK-') || content.includes('🔔 **Yêu cầu Check-in:**') || content.includes('✅ **Check-in thành công:**');

        if (isAuto) {
            return (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 my-2 max-w-[90%]">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                            <Clock className="text-white w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="text-emerald-900 text-sm font-medium whitespace-pre-wrap leading-relaxed">
                                {content.split('\n').map((line, i) => (
                                    <p key={i} className={line.startsWith('📅') || line.startsWith('🔔') ? 'font-bold mt-2' : ''}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                ${message.sender_id === currentUser.id 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}
            >
                {content}
                <div className={`text-[10px] mt-1 opacity-60 flex justify-end`}>
                    {format(new Date(message.created_at), 'HH:mm')}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-160px)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-160px)] flex bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 animate-in fade-in duration-500">
            {/* Sidebar Hội thoại */}
            <div className="w-80 border-r border-slate-50 flex flex-col bg-slate-50/30">
                <div className="p-6">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        Tin nhắn
                        <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {conversations.length}
                        </span>
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm hội thoại..." 
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => {
                            const lastMsg = conv.last_message;
                            const isActive = activeConversation?.id === conv.id;
                            const isUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id !== currentUser.id;

                            return (
                                <button 
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group
                                        ${isActive 
                                            ? 'bg-white shadow-lg shadow-emerald-500/5 scale-[1.02] border border-emerald-100' 
                                            : 'hover:bg-white/60 border border-transparent'}`}
                                >
                                    <div className="relative shrink-0">
                                        {conv.other_user?.avatar_url ? (
                                            <img src={conv.other_user.avatar_url} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white">
                                                {(conv.other_user?.display_name || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white 
                                            ${conv.other_user?.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className={`text-sm font-bold truncate ${isActive ? 'text-emerald-900' : 'text-slate-700'}`}>
                                                {conv.other_user?.display_name || 'Khách du lịch'}
                                            </span>
                                            {conv.last_message_at && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {format(new Date(conv.last_message_at), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <p className={`text-xs truncate flex-1 ${isUnread ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
                                                {lastMsg ? lastMsg.content : 'Bắt đầu cuộc trò chuyện...'}
                                            </p>
                                            {isUnread && (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="text-slate-300" size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-500">Không tìm thấy hội thoại</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Khu vực Chat chính */}
            <div className="flex-1 flex flex-col bg-slate-50/20">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 px-8 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {activeConversation.other_user?.avatar_url ? (
                                        <img src={activeConversation.other_user.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                            {(activeConversation.other_user?.display_name || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white 
                                        ${activeConversation.other_user?.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} 
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight">
                                        {activeConversation.other_user?.display_name}
                                    </h3>
                                    <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">
                                        {activeConversation.other_user?.is_online ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                    <Video size={20} />
                                </button>
                                <button className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tin nhắn */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
                            {messagesLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                </div>
                            ) : messages.length > 0 ? (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender_id === currentUser.id;
                                    const showTime = index === 0 || 
                                        new Date(msg.created_at).getTime() - new Date(messages[index-1].created_at).getTime() > 10 * 60 * 1000;

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showTime && (
                                                <div className="flex justify-center my-4">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-3 py-1 rounded-full">
                                                        {format(new Date(msg.created_at), 'dd MMM, HH:mm', { locale: vi })}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                                <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    {!isMe && (
                                                        <div className="shrink-0 mt-auto">
                                                            {activeConversation.other_user?.avatar_url ? (
                                                                <img src={activeConversation.other_user.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                                    {(activeConversation.other_user?.display_name || 'U')[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {renderMessageContent(msg)}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-10">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                        <MessageSquare className="text-emerald-500" size={32} />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 mb-2">Bắt đầu cuộc hội thoại</h4>
                                    <p className="text-sm text-slate-400 max-w-[240px]">Hãy gửi một lời chào để bắt đầu trò chuyện với khách du lịch này.</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Nhập tin nhắn */}
                        <div className="p-8 pt-4">
                            <form 
                                onSubmit={handleSendMessage}
                                className="bg-white border border-slate-100 rounded-2xl p-2 flex items-center gap-2 shadow-xl shadow-slate-200/50 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all"
                            >
                                <button type="button" className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                    <Paperclip size={20} />
                                </button>
                                <input 
                                    type="text" 
                                    placeholder="Nhập nội dung tin nhắn..." 
                                    className="flex-1 py-3 px-2 bg-transparent text-sm focus:outline-none font-medium"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="button" className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                    <Smile size={20} />
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim()}
                                    className="bg-emerald-500 text-white p-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                            <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">
                                Hệ thống tin nhắn được mã hóa bảo mật đầu cuối
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 relative">
                            <MessageSquare className="text-slate-200" size={48} />
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                                <Send size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3">Trung tâm Tin nhắn Đối tác</h3>
                        <p className="text-slate-400 max-w-sm font-medium leading-relaxed mb-8">
                            Chào mừng bạn đến với kênh giao tiếp trực tiếp với khách du lịch. Hãy chọn một hội thoại để bắt đầu hỗ trợ và chăm sóc khách hàng của bạn.
                        </p>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
                                <CheckCircle2 className="text-emerald-500 mb-3" size={24} />
                                <h4 className="text-sm font-black text-slate-800 mb-1">Xác nhận nhanh</h4>
                                <p className="text-[11px] text-slate-400 leading-normal">Nhận thông báo và phản hồi yêu cầu đặt chỗ tức thì qua tin nhắn realtime.</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
                                <Clock className="text-emerald-500 mb-3" size={24} />
                                <h4 className="text-sm font-black text-slate-800 mb-1">Theo dõi Check-in</h4>
                                <p className="text-[11px] text-slate-400 leading-normal">Tự động nhận tin nhắn khi khách hàng check-in tại địa điểm của bạn.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Messages;
