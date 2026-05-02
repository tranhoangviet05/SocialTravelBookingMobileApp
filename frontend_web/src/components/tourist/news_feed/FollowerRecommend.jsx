import React, { useState, useEffect } from 'react';
import socialApi from '../../../api/socialApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import Avatar from '../../../components/common/Avatar';
import { useNavigate } from 'react-router-dom';
import { useSocialData } from '../../../contexts/SocialDataContext';

const FollowerRecommend = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { updateFollowStatus } = useSocialData();
    const notification = useNotification();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followingIds, setFollowingIds] = useState(new Set());

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const response = await socialApi.getSuggestions();
            if (response.success) {
                setSuggestions(response.data);
            }
        } catch (error) {
            console.error("Fetch suggestions error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleFollow = async (userId) => {
        if (followingIds.has(userId)) return;

        const suggestion = suggestions.find(s => s.id === userId);
        if (!suggestion) return;

        const previousStatus = suggestion.is_following;

        try {
            setFollowingIds(prev => new Set(prev).add(userId));
            const newStatus = !previousStatus;

            // Optimistic update local suggestions
            setSuggestions(prev => prev.map(s => s.id === userId ? { ...s, is_following: newStatus } : s));
            
            // Optimistic update global feed
            updateFollowStatus(userId, newStatus);

            const response = await socialApi.toggleFollow(userId);
            if (response.success) {
                const isFollowing = response.data.following;
                setSuggestions(prev => prev.map(s => s.id === userId ? { ...s, is_following: isFollowing } : s));
                updateFollowStatus(userId, isFollowing, response.data.followers_count);
                notification.success(isFollowing ? "Đã theo dõi" : "Đã bỏ theo dõi");
            }
        } catch (error) {
            // Rollback
            setSuggestions(prev => prev.map(s => s.id === userId ? { ...s, is_following: previousStatus } : s));
            updateFollowStatus(userId, previousStatus);
            notification.error("Lỗi khi thay đổi trạng thái theo dõi");
        } finally {
            setTimeout(() => {
                setFollowingIds(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            }, 500);
        }
    };

    return (
        <div className="hidden lg:block w-[350px] sticky top-4 h-fit px-4 pt-12">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <h2 className="font-bold text-[18px] mb-4">Gợi ý cho bạn</h2>
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="h-3 w-24 bg-gray-100 rounded"></div>
                                            <div className="h-2 w-16 bg-gray-50 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map(suggestion => (
                            <div key={suggestion.id} className="flex items-center justify-between group">
                                <div 
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => navigate(`/newsfeed/profile?id=${suggestion.id}`, { state: { initialUser: suggestion } })}
                                >
                                    <Avatar src={suggestion.avatar_url} alt={suggestion.display_name} size="md" />
                                    <div className="flex flex-col overflow-hidden max-w-[140px]">
                                        <span className="font-bold text-[14px] leading-tight hover:underline truncate">
                                            {suggestion.display_name}
                                        </span>
                                        <span className="text-gray-500 text-[13px] truncate">@{suggestion.social_profile?.username}</span>
                                    </div>
                                </div>
                                <button
                                     onClick={() => handleFollow(suggestion.id)}
                                     disabled={followingIds.has(suggestion.id)}
                                     className={`text-sm font-bold transition-all px-2 py-1 rounded-lg ${followingIds.has(suggestion.id) ? 'opacity-50 cursor-not-allowed' : ''} ${suggestion.is_following ? 'text-gray-400 hover:text-red-500' : 'text-sky-500 hover:text-sky-700 hover:bg-sky-50'}`}
                                 >
                                     {suggestion.is_following ? 'Đang theo dõi' : 'Theo dõi'}
                                 </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm italic py-4">Không có gợi ý mới</p>
                    )}
                </div>
            </div>

            <div className="mt-8 text-[12px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1 px-2">
                <a href="#" className="hover:underline">Giới thiệu</a>
                <a href="#" className="hover:underline">Hỗ trợ</a>
                <a href="#" className="hover:underline">Điều khoản</a>
                <a href="#" className="hover:underline">Bảo mật</a>
            </div>
            <p className="mt-4 text-[12px] text-gray-400 font-semibold px-2 uppercase tracking-tight">© 2026 Social Travel Booking</p>
        </div>
    );
};

export default FollowerRecommend;
