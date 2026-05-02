import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, MoreHorizontal, ChevronLeft, ChevronRight, Smile, Briefcase, ExternalLink } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Avatar from '../../../components/common/Avatar';
import socialApi from '../../../api/socialApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { useSocialData } from '../../../contexts/SocialDataContext';
import serviceApi from '../../../api/serviceApi';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../utils/Helpers';
import { useBehaviorTracking } from '../../../hooks/useBehaviorTracking';

const PostDetailModal = ({ postId, postData, isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { updatePostInState } = useSocialData();
    const notification = useNotification();
    const [post, setPost] = useState(postData || null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(!postData);
    const [loadingComments, setLoadingComments] = useState(true);
    const [isLiked, setIsLiked] = useState(postData ? postData.is_liked > 0 : false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [showServiceSearch, setShowServiceSearch] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [serviceSearchValue, setServiceSearchValue] = useState('');
    const [suggestedServices, setSuggestedServices] = useState([]);
    const [isSearchingService, setIsSearchingService] = useState(false);
    const navigate = useNavigate();
    const { trackAction } = useBehaviorTracking(currentUser);

    useEffect(() => {
        if (isOpen && postId) {
            setCurrentMediaIndex(0);
            fetchPostDetails();
        }
    }, [isOpen, postId]);

    // Gợi ý Dịch vụ
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (serviceSearchValue.trim().length > 1) {
                try {
                    setIsSearchingService(true);
                    const response = await serviceApi.getServices({ keyword: serviceSearchValue, limit: 5 });
                    if (response.success) {
                        const data = response.data.data || response.data;
                        setSuggestedServices(Array.isArray(data) ? data : []);
                    }
                } catch (e) {
                    console.error("Service suggestion error:", e);
                } finally {
                    setIsSearchingService(false);
                }
            } else {
                setSuggestedServices([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [serviceSearchValue]);

    const fetchPostDetails = async () => {
        try {
            // Nếu đã có dữ liệu ban đầu, không hiện màn hình loading xoay vòng to nữa
            if (!postData) setLoading(true);
            setLoadingComments(true);

            // Tải song song cả Chi tiết bài viết và Bình luận để tiết kiệm thời gian
            const [postRes, commRes] = await Promise.all([
                socialApi.getPostDetail(postId),
                socialApi.getComments(postId)
            ]);

            if (postRes.success) {
                setPost(postRes.data);
                setIsLiked(postRes.data.is_liked > 0);
            }
            if (commRes.success) {
                setComments(commRes.data);
            }
        } catch (error) {
            if (!postData) {
                notification.error("Không thể tải chi tiết bài viết");
                onClose();
            }
        } finally {
            setLoading(false);
            setLoadingComments(false);
        }
    };

    const handleLike = async () => {
        if (!post || isLiking) return;
        
        const previousIsLiked = isLiked;
        const previousLikesCount = post.likes_count;

        try {
            setIsLiking(true);
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            
            // Optimistic UI update
            setPost(prev => ({ 
                ...prev, 
                likes_count: newIsLiked 
                    ? prev.likes_count + 1 
                    : Math.max(0, prev.likes_count - 1) 
            }));

            const response = await socialApi.toggleLike(post.id);
            if (response.success) {
                setPost(prev => ({ ...prev, likes_count: response.data.likes_count }));
                setIsLiked(response.data.liked);
                
                // ĐỒNG BỘ VỀ CONTEXT
                updatePostInState(post.id, { 
                    likes_count: response.data.likes_count, 
                    is_liked: response.data.liked 
                });
            }
        } catch (error) {
            setIsLiked(previousIsLiked);
            setPost(prev => ({ ...prev, likes_count: previousLikesCount }));
            notification.error("Lỗi khi like");
        } finally {
            setIsLiking(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isPosting) return;

        const commentContent = newComment.trim();
        const tempId = `temp-${Date.now()}`;
        
        // Optimistic UI: Thêm bình luận tạm thời
        const tempComment = {
            id: tempId,
            content: commentContent,
            created_at: new Date().toISOString(),
            author: currentUser,
            service: selectedService,
            isSending: true
        };

        setNewComment('');
        setShowEmojiPicker(false);
        setComments(prev => [tempComment, ...prev]);
        setPost(prev => ({ ...prev, comments_count: prev.comments_count + 1 }));
        setIsPosting(true);

        try {
            const response = await socialApi.addComment(post.id, commentContent, selectedService?.id);
            if (response.success) {
                // Thay thế bình luận tạm thời bằng bình luận thật từ API
                setComments(prev => prev.map(c => c.id === tempId ? response.data : c));
                
                // ĐỒNG BỘ VỀ CONTEXT (Cập nhật số lượng bình luận ở feed)
                updatePostInState(post.id, { 
                    comments_count: post.comments_count + 1 
                });

                // TRACK BEHAVIOR: Comment
                trackAction('comment_post', {
                    post_id: post.id,
                    location_id: post.location?.id,
                    service_type: post.service?.type || 'tour',
                    comment_text: commentContent,
                    tags: post.hashtags?.map(h => h.id) || []
                });
            } else {
                throw new Error("API Error");
            }
        } catch (error) {
            // Hoàn tác nếu lỗi
            setComments(prev => prev.filter(c => c.id !== tempId));
            setPost(prev => ({ ...prev, comments_count: prev.comments_count - 1 }));
            setNewComment(commentContent); // Trả lại nội dung cũ để user sửa
            notification.error("Lỗi khi gửi bình luận. Vui lòng thử lại.");
        } finally {
            setIsPosting(false);
            setSelectedService(null);
            setServiceSearchValue('');
        }
    };

    const onEmojiClick = (emojiData) => {
        setNewComment(prev => prev + emojiData.emoji);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            {/* Nút đóng di chuyển ra ngoài box trắng và to hơn */}
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-6 right-6 z-[510] p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
                title="Đóng (Esc)"
            >
                <X size={28} />
            </button>

            <div 
                className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng modal khi click vào bên trong
            >


                {loading && !post ? (
                    <div className="flex-1 flex flex-col md:flex-row animate-pulse">
                        <div className="flex-1 bg-gray-200 h-full"></div>
                        <div className="w-full md:w-[400px] p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-gray-100 rounded"></div>
                                <div className="h-4 w-full bg-gray-100 rounded"></div>
                                <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                            </div>
                            <div className="pt-10 space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                                    <div className="h-10 flex-1 bg-gray-50 rounded-xl"></div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                                    <div className="h-10 flex-1 bg-gray-50 rounded-xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : post ? (
                    <>
                        {/* Media Section (Left) - Chỉ hiện khi có ảnh */}
                        {post.media && post.media.length > 0 && (
                            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
                                <img
                                    src={post.media[currentMediaIndex].url}
                                    alt={`Ảnh ${currentMediaIndex + 1}`}
                                    className="max-w-full max-h-full object-contain transition-opacity duration-200"
                                />

                                {/* Nút chuyển ảnh - chỉ hiện khi có nhiều hơn 1 ảnh */}
                                {post.media.length > 1 && (
                                    <>
                                        {/* Nút Trước */}
                                        <button
                                            onClick={() => setCurrentMediaIndex(i => Math.max(0, i - 1))}
                                            disabled={currentMediaIndex === 0}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={22} />
                                        </button>

                                        {/* Nút Tiếp theo */}
                                        <button
                                            onClick={() => setCurrentMediaIndex(i => Math.min(post.media.length - 1, i + 1))}
                                            disabled={currentMediaIndex === post.media.length - 1}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={22} />
                                        </button>

                                        {/* Chỉ số ảnh & Dots */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                                            <div className="flex gap-1.5">
                                                {post.media.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentMediaIndex(i)}
                                                        className={`rounded-full transition-all ${
                                                            i === currentMediaIndex
                                                                ? 'w-5 h-2 bg-white'
                                                                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-white/70 text-xs font-medium bg-black/30 px-2 py-0.5 rounded-full">
                                                {currentMediaIndex + 1} / {post.media.length}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Content Section - Chiếm toàn bộ nếu không có ảnh */}
                        <div className={`${post.media && post.media.length > 0 ? 'w-full md:w-[400px]' : 'w-full'} flex flex-col bg-white border-l border-gray-100`}>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar src={post.author?.avatar_url} alt={post.author?.display_name} size="sm" />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[14px]">{post.author?.display_name}</span>
                                        <span className="text-[12px] text-gray-500">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: vi })}
                                        </span>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-black"><MoreHorizontal size={20} /></button>
                            </div>

                            {/* Post Content & Comments */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
                                <div className="pb-4 border-b border-gray-50">
                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {post.tags.map(tag => (
                                                <span key={tag.id} className="text-sky-600 font-medium hover:underline cursor-pointer text-sm">
                                                    #{tag.display_name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {post.service && (
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); navigate(`/services/detail/${post.service.slug}`); }}
                                            className="mt-4 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-all group shadow-sm"
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm">
                                                <img src={post.service.media?.[0]?.url || post.service.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Dịch vụ đề xuất</span>
                                                </div>
                                                <h4 className="text-[14px] font-bold text-slate-800 truncate group-hover:text-emerald-700">{post.service.name}</h4>
                                                <p className="text-[12px] text-emerald-600 font-bold">{formatCurrency(post.service.base_price)}</p>
                                            </div>
                                            <div className="p-2 text-emerald-400 group-hover:text-emerald-600">
                                                <ExternalLink size={18} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Comments List */}
                                <div className="space-y-5">
                                    {loadingComments ? (
                                        // Skeleton Loading
                                        [...Array(3)].map((_, i) => (
                                            <div key={i} className="flex gap-3 animate-pulse">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                                                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div key={comment.id} className={`flex gap-3 group ${comment.isSending ? 'opacity-60' : ''}`}>
                                                <div className="flex-shrink-0 mt-1">
                                                    <Avatar src={comment.author?.avatar_url || comment.author?.photoURL} alt={comment.author?.display_name || comment.author?.displayName} size="xs" />
                                                </div>
                                                <div className="flex-1 flex flex-col min-w-0">
                                                    <div className="relative group-hover:bg-gray-50 transition-colors p-2 -m-2 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-bold text-[13px] text-gray-900 truncate">
                                                                {comment.author?.display_name || comment.author?.displayName}
                                                            </span>
                                                            {comment.isSending && (
                                                                <span className="text-[10px] text-gray-400 animate-pulse">Đang đăng...</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[14px] text-gray-700 leading-relaxed break-words">
                                                            {comment.content}
                                                        </p>

                                                        {comment.service && (
                                                            <div 
                                                                onClick={(e) => { e.stopPropagation(); navigate(`/services/detail/${comment.service.slug}`); }}
                                                                className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-100 rounded-xl cursor-pointer hover:bg-emerald-100 transition-all group"
                                                            >
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                                                                    <img src={comment.service.media?.[0]?.url || comment.service.thumbnail} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h5 className="text-[12px] font-bold text-slate-800 truncate group-hover:text-emerald-700">{comment.service.name}</h5>
                                                                    <p className="text-[11px] text-emerald-600 font-bold">{formatCurrency(comment.service.base_price)}</p>
                                                                </div>
                                                                <ExternalLink size={14} className="text-emerald-400 group-hover:text-emerald-600 mr-1" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5 ml-0.5">
                                                        <span className="text-[11px] text-gray-400 font-medium">
                                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: vi })}
                                                        </span>
                                                        {!comment.isSending && (
                                                            <>
                                                                <button className="text-[11px] text-gray-500 font-bold hover:text-black transition-colors">Thích</button>
                                                                <button className="text-[11px] text-gray-500 font-bold hover:text-black transition-colors">Trả lời</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                                            <MessageCircle size={40} strokeWidth={1} className="mb-2 opacity-20" />
                                            <span className="text-sm italic">Chưa có bình luận nào</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions & Input */}
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex items-center gap-4 mb-3">
                                    <button onClick={handleLike} className={`${isLiked ? 'text-red-500' : 'text-black'}`}>
                                        <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                                    </button>
                                    <MessageCircle size={24} />
                                    <Send size={24} />
                                </div>
                                <div className="text-[14px] font-bold mb-3">{post.likes_count} lượt thích</div>

                                {selectedService && (
                                    <div className="mb-3 flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-100 rounded-xl relative group">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={selectedService.media?.[0]?.url || selectedService.thumbnail} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-bold text-gray-800 truncate">{selectedService.name}</p>
                                            <p className="text-[11px] text-emerald-600 font-medium">{formatCurrency(selectedService.base_price)}</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedService(null)}
                                            className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleComment} className="flex gap-2 relative">
                                    <button 
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="text-gray-500 hover:text-yellow-500 transition-colors"
                                    >
                                        <Smile size={24} />
                                    </button>

                                    {showEmojiPicker && (
                                        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 z-[520] shadow-2xl">
                                            <div className="fixed inset-0 bg-transparent" onClick={() => setShowEmojiPicker(false)}></div>
                                            <div className="relative">
                                                <EmojiPicker 
                                                    onEmojiClick={onEmojiClick}
                                                    autoFocusSearch={false}
                                                    theme="light"
                                                    width={300}
                                                    height={400}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        type="text"
                                        placeholder="Thêm bình luận..."
                                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[14px] outline-none focus:ring-1 focus:ring-gray-300"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />

                                    <div className="relative flex items-center">
                                        <button 
                                            type="button"
                                            onClick={() => setShowServiceSearch(!showServiceSearch)}
                                            className={`p-1.5 rounded-full transition-all ${selectedService ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                            title="Gắn link dịch vụ"
                                        >
                                            <Briefcase size={20} />
                                        </button>

                                        {showServiceSearch && (
                                            <div className="absolute bottom-full right-0 mb-4 w-72 bg-white shadow-2xl rounded-2xl p-4 border border-gray-100 z-[530] animate-in slide-in-from-bottom-2 duration-200">
                                                <div className="fixed inset-0" onClick={() => setShowServiceSearch(false)}></div>
                                                <div className="relative">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[12px] font-bold text-gray-800">Gắn link dịch vụ</span>
                                                        {isSearchingService && <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
                                                    </div>
                                                    <input 
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Tìm dịch vụ..."
                                                        value={serviceSearchValue}
                                                        onChange={(e) => setServiceSearchValue(e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border-none rounded-xl text-[13px] outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
                                                    />
                                                    <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                                                        {suggestedServices.length > 0 ? (
                                                            suggestedServices.map(svc => (
                                                                <div 
                                                                    key={svc.id} 
                                                                    onClick={() => { setSelectedService(svc); setShowServiceSearch(false); setServiceSearchValue(''); }} 
                                                                    className="flex items-center gap-2 p-2 hover:bg-emerald-50 rounded-xl cursor-pointer transition-colors group"
                                                                >
                                                                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                                        <img src={svc.media?.[0]?.url || svc.thumbnail} className="w-full h-full object-cover" alt="" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 text-left">
                                                                        <p className="text-[13px] font-bold text-gray-700 truncate group-hover:text-emerald-600">{svc.name}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-center py-4 text-[11px] text-gray-400 italic">Nhập từ khóa tìm dịch vụ...</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isPosting}
                                        className="text-sky-500 font-bold text-[14px] disabled:opacity-50 hover:text-sky-600 transition-colors"
                                    >
                                        {isPosting ? '...' : 'Đăng'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default PostDetailModal;
