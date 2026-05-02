import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal, Trash2, MapPin, Briefcase, ExternalLink } from 'lucide-react';
import Avatar from '../../../components/common/Avatar';
import PostDetailModal from './PostDetailModal';
import socialApi from '../../../api/socialApi';
import { useNotification } from '../../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import echo from '../../../utils/echo';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocialData } from '../../../contexts/SocialDataContext';
import { formatCurrency } from '../../../utils/Helpers';
import { useBehaviorTracking } from '../../../hooks/useBehaviorTracking';

const Post = ({ post: initialPost }) => {
    const { currentUser } = useAuth();
    const { removePostFromState, updateFollowStatus } = useSocialData();
    const [post, setPost] = useState(initialPost);
    const [isLiked, setIsLiked] = useState(initialPost.is_liked > 0);
    const [showMenu, setShowMenu] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFollowingAction, setIsFollowingAction] = useState(false);
    const notification = useNotification();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const { trackAction } = useBehaviorTracking(currentUser);

    // Xử lý click ra ngoài để đóng menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lắng nghe Real-time Comment (likes được xử lý ở SocialDataContext)
    useEffect(() => {
        const postChannel = echo.channel(`post.${post.id}`)
            .listen('.comment.created', () => {
                setPost(prev => ({ ...prev, comments_count: prev.comments_count + 1 }));
            });

        return () => {
            postChannel.stopListening('.comment.created');
        };
    }, [post.id]);

    // Đồng bộ trạng thái từ Context (khi WebSocket hoặc các màn hình khác cập nhật dữ liệu gốc)
    useEffect(() => {
        setIsLiked(initialPost.is_liked);
        setPost(prev => ({
            ...prev,
            likes_count: initialPost.likes_count,
            is_liked: initialPost.is_liked,
            author: initialPost.author // Đồng bộ cả trạng thái follow nếu có
        }));
    }, [initialPost.is_liked, initialPost.likes_count, initialPost.author]);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (isLiking) return; // Khóa nếu đang xử lý

        const previousIsLiked = isLiked;
        const previousLikesCount = post.likes_count;

        try {
            setIsLiking(true);
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);

            // Cập nhật giao diện ngay lập tức (Optimistic)
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
                
                // TRACK BEHAVIOR: Like
                if (response.data.liked) {
                    trackAction('like_post', { 
                        post_id: post.id, 
                        location_id: post.location?.id,
                        service_type: post.service?.type || 'tour',
                        tags: post.hashtags?.map(h => h.id) || []
                    });
                }
            }
        } catch (error) {
            setIsLiked(previousIsLiked);
            setPost(prev => ({ ...prev, likes_count: previousLikesCount }));
        } finally {
            setIsLiking(false);
        }
    };

    const handleFollow = async (e) => {
        e.stopPropagation();
        if (isFollowingAction) return;

        const previousStatus = post.author?.is_following;
        const previousFollowersCount = post.author?.social_profile?.followers_count;

        try {
            setIsFollowingAction(true);
            const newStatus = !previousStatus;
            const newFollowersCount = newStatus
                ? (previousFollowersCount + 1)
                : Math.max(0, previousFollowersCount - 1);

            // Cập nhật Optimistic
            updateFollowStatus(post.user_id, newStatus, newFollowersCount);

            const response = await socialApi.toggleFollow(post.user_id);
            if (response.success) {
                // Đồng bộ lại với dữ liệu thật từ server
                updateFollowStatus(post.user_id, response.data.following, response.data.followers_count);
                notification.success(response.data.following ? "Đã theo dõi" : "Đã bỏ theo dõi");
            }
        } catch (error) {
            // Hoàn tác nếu lỗi
            updateFollowStatus(post.user_id, previousStatus, previousFollowersCount);
            notification.error("Lỗi khi thay đổi trạng thái theo dõi");
        } finally {
            setIsFollowingAction(true); // Giữ khóa thêm một chút để tránh spam click nhanh
            setTimeout(() => setIsFollowingAction(false), 500);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            try {
                const response = await socialApi.deletePost(post.id);
                if (response.success) {
                    notification.success("Đã xóa bài viết");
                    removePostFromState(post.id);
                }
            } catch (error) {
                notification.error("Lỗi khi xóa bài viết");
            }
        }
        setShowMenu(false);
    };

    const handleSearchTag = (e, tag) => {
        e.stopPropagation();
        navigate(`/newsfeed/search?tag=${tag}`);
    };

    const handleSearchLocation = (e, loc) => {
        e.stopPropagation();
        navigate(`/newsfeed/search?location_id=${loc.id}&location_name=${encodeURIComponent(loc.name)}`);
    };

    const formatTime = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
        } catch (e) {
            return "Vừa xong";
        }
    };

    return (
        <>
            <div
                className={`py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50/30 transition-colors ${post.isSending ? 'opacity-60' : ''}`}
                onClick={() => {
                    if (!post.isSending) {
                        setIsDetailOpen(true);
                        // TRACK BEHAVIOR: View Detail
                        trackAction('view_post', { 
                            post_id: post.id, 
                            location_id: post.location?.id,
                            service_type: post.service?.type || 'tour',
                            tags: post.hashtags?.map(h => h.id) || []
                        });
                    }
                }}
            >
                <div className="flex gap-3 px-1">
                    <div className="flex flex-col items-center">
                        <div className="relative group/avatar" onClick={(e) => e.stopPropagation()}>
                            <Avatar src={post.author?.avatar_url} alt={post.author?.display_name} />
                        </div>
                    </div>

                    <div className="flex-1 pb-2 overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    className="font-bold text-[15px] hover:underline cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/newsfeed/profile?id=${post.user_id}`, { state: { initialUser: post.author } });
                                    }}
                                >
                                    {post.author?.display_name || "Người dùng"}
                                </span>
                                {post.isSending && (
                                    <span className="text-[11px] text-sky-500 font-medium animate-pulse ml-2 bg-sky-50 px-2 py-0.5 rounded-full">Đang đăng...</span>
                                )}
                                {currentUser?.id !== post.user_id && !post.isSending && (
                                    <>
                                        <span className="text-gray-400">·</span>
                                        <button
                                            onClick={handleFollow}
                                            disabled={isFollowingAction}
                                            className={`text-[14px] font-bold transition-colors ${isFollowingAction ? 'opacity-50 cursor-not-allowed' : ''} ${post.author?.is_following ? 'text-gray-400 hover:text-red-500' : 'text-sky-500 hover:text-sky-700'}`}
                                        >
                                            {post.author?.is_following ? 'Đang theo dõi' : 'Theo dõi'}
                                        </button>
                                    </>
                                )}
                                <span className="text-gray-400 text-[13px] ml-1">{formatTime(post.created_at)}</span>
                                {post.location && (
                                    <span
                                        onClick={(e) => handleSearchLocation(e, post.location)}
                                        className="text-sky-500 text-[13px] flex items-center gap-0.5 hover:underline"
                                    >
                                        · <MapPin size={12} /> <span className="font-medium">{post.location.name}</span>
                                    </span>
                                )}
                            </div>

                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                    className="text-gray-400 hover:text-black transition-colors p-1"
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 shadow-xl rounded-xl py-1 z-10">
                                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                            Lưu bài viết
                                        </button>
                                        {currentUser?.id === post.user_id && (
                                            <button
                                                onClick={handleDelete}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                                            >
                                                <Trash2 size={16} /> Xóa bài viết
                                            </button>
                                        )}
                                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-500">
                                            Báo cáo
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-[15px] mt-1 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {post.tags.map(tag => (
                                    <span
                                        key={tag.id}
                                        onClick={(e) => handleSearchTag(e, tag.name)}
                                        className="text-[14px] text-sky-600 font-medium hover:underline cursor-pointer"
                                    >
                                        #{tag.display_name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {post.media && post.media.length > 0 && (
                            <div className="mt-3 w-full rounded-xl overflow-hidden border border-gray-100" onClick={(e) => e.stopPropagation()}>
                                {post.media.length === 1 ? (
                                    <img src={post.media[0].url} alt="" className="w-full h-auto max-h-[600px] object-cover" />
                                ) : (
                                    <div className="flex overflow-x-auto gap-2 snap-x snap-mandatory pb-2 px-2 pt-2"
                                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
                                    >
                                        {post.media.map((m, i) => (
                                            <img key={i} src={m.url} className="h-64 w-48 object-cover snap-center flex-shrink-0 rounded-lg" alt="" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Gắn link dịch vụ */}
                        {post.service && (
                            <div
                                onClick={(e) => { e.stopPropagation(); navigate(`/services/detail/${post.service.slug}`); }}
                                className="mt-3 flex items-center gap-3 p-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-2xl group transition-all"
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-emerald-50">
                                    <img src={post.service.media?.[0]?.url || post.service.thumbnail} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Dịch vụ được gắn thẻ</span>
                                    </div>
                                    <h4 className="text-[14px] font-bold text-slate-800 truncate group-hover:text-emerald-700">{post.service.name}</h4>
                                    <p className="text-[12px] text-emerald-600 font-bold">{formatCurrency(post.service.base_price)}</p>
                                </div>
                                <div className="p-2 text-emerald-400 group-hover:text-emerald-600">
                                    <ExternalLink size={18} />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-6 mt-4 text-gray-500">
                            <button onClick={handleLike} className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}>
                                <Heart size={19} fill={isLiked ? "currentColor" : "none"} />
                                <span className="text-sm">{post.likes_count}</span>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDetailOpen(true); }}
                                className="flex items-center gap-1.5 hover:text-sky-500 transition-colors"
                            >
                                <MessageCircle size={19} />
                                <span className="text-sm">{post.comments_count}</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-green-500"><Repeat2 size={19} /></button>
                            <button className="flex items-center gap-1.5 hover:text-sky-500"><Send size={19} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <PostDetailModal
                postId={post.id}
                postData={post}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </>
    );
};

export default Post;
