import React, { useState, useEffect } from 'react';
import {
    Instagram,
    BarChart2,
    Edit,
    UserPlus,
    Camera,
    Image as ImageIcon,
    MoreHorizontal,
    Heart,
    MessageCircle,
    Repeat2,
    Send,
    Loader2
} from 'lucide-react';
import Post from '../../../components/tourist/news_feed/Post';
import { useAuth } from '../../../contexts/AuthContext';
import socialApi from '../../../api/socialApi';
import { useNotification } from '../../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useSocialData } from '../../../contexts/SocialDataContext';
import Avatar from '../../../components/common/Avatar';
import { useSearchParams, useLocation } from 'react-router-dom';
import UserListModal from '../../../components/tourist/news_feed/UserListModal';

const Profile = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const initialUser = location.state?.initialUser;
    
    const targetUserId = searchParams.get('id') || currentUser?.id;

    const notification = useNotification();
    const { fetchUserProfile, profileCache, updateFollowStatus } = useSocialData();

    const [activeTab, setActiveTab] = useState('Bài đăng');
    const [profileUser, setProfileUser] = useState(initialUser || null);
    const [posts, setPosts] = useState([]);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(!initialUser); // Không hiện loading nếu đã có dữ liệu ban đầu

    const [userListModal, setUserListModal] = useState({ isOpen: false, tab: 'followers' });

    const socialProfile = profileUser?.social_profile;
    const displayName = profileUser?.display_name || 'Người dùng';
    const username = socialProfile?.username || profileUser?.email?.split('@')[0] || 'user';
    const bio = socialProfile?.bio || 'Chưa có giới thiệu.';
    const followersCount = socialProfile?.followers_count || 0;
    const followingCount = socialProfile?.following_count || 0;

    const handleFollow = async () => {
        if (!profileUser || targetUserId === currentUser?.id) return;
        try {
            const response = await socialApi.toggleFollow(targetUserId);
            if (response.success) {
                const isNowFollowing = response.data.following;
                setProfileUser(prev => ({
                    ...prev,
                    social_profile: { ...prev.social_profile, followers_count: response.data.followers_count },
                    is_following: isNowFollowing
                }));
                updateFollowStatus(targetUserId, isNowFollowing, response.data.followers_count);
                notification.success(isNowFollowing ? "Đã theo dõi" : "Đã bỏ theo dõi");
            }
        } catch (error) {
            notification.error("Lỗi khi theo dõi");
        }
    };

    const handleOpenFollowers = () => {
        setUserListModal({ isOpen: true, tab: 'followers' });
    };

    const handleOpenFollowing = () => {
        setUserListModal({ isOpen: true, tab: 'following' });
    };

    useEffect(() => {
        if (profileCache[targetUserId]) {
            setPosts(profileCache[targetUserId].posts);
            setReplies(profileCache[targetUserId].replies);
            if (profileCache[targetUserId].user) {
                setProfileUser(profileCache[targetUserId].user);
            }
        }
    }, [profileCache, targetUserId]);

    useEffect(() => {
        if (targetUserId === currentUser?.id && currentUser) {
            setProfileUser(currentUser);
        }
    }, [currentUser, targetUserId]);

    const fetchProfileData = async () => {
        if (!targetUserId) return;
        try {
            setLoading(true);

            const data = await fetchUserProfile(targetUserId);
            if (data) {
                setPosts(data.posts);
                setReplies(data.replies);
                if (data.user) {
                    setProfileUser(data.user);
                } else if (targetUserId === currentUser?.id) {
                    setProfileUser(currentUser);
                }
            }
        } catch (error) {
            notification.error("Không thể tải thông tin trang cá nhân");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [targetUserId]);

    const userMedia = posts.reduce((acc, p) => {
        if (p.media && p.media.length > 0) {
            return [...acc, ...p.media.map(m => m.url)];
        }
        return acc;
    }, []);

    const tabs = ['Bài đăng', 'Câu trả lời', 'File phương tiện', 'Bài đăng lại'];

    const renderTabContent = () => {
        if (loading && posts.length === 0) {
            return (
                <div className="flex flex-col gap-6 py-6">
                    {[1, 2].map(i => (
                        <div key={i} className="animate-pulse flex gap-3 px-1">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-24 bg-gray-100 rounded-xl w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        switch (activeTab) {
            case 'Bài đăng':
                return (
                    <div className="flex flex-col">
                        {posts.length > 0 ? (
                            posts.map(post => <Post key={post.id} post={post} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Edit size={48} className="mb-4 opacity-20" />
                                <p className="text-[15px] font-medium">Chưa có bài đăng nào</p>
                            </div>
                        )}
                    </div>
                );
            case 'Câu trả lời':
                return (
                    <div className="flex flex-col">
                        {replies.length > 0 ? (
                            replies.map(reply => (
                                <div key={reply.id} className="py-4 border-b border-gray-200">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-10 bg-gray-200 mt-2 mb-2"></div>
                                            <Avatar src={profileUser?.avatar_url} alt={displayName} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 p-3 rounded-2xl mb-2 border border-gray-100">
                                                <p className="text-[13px] text-gray-500 font-semibold mb-1">Đã trả lời {reply.post?.author?.display_name || 'ai đó'}</p>
                                                <p className="text-[14px] text-gray-400 line-clamp-1 italic">"{reply.post?.content || '...'}"</p>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-[15px]">{displayName}</span>
                                                    <span className="text-gray-400 text-[13px]">
                                                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: vi })}
                                                    </span>
                                                </div>
                                                <button className="text-gray-400"><MoreHorizontal size={18} /></button>
                                            </div>
                                            <p className="text-[15px] mt-1">{reply.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <MessageCircle size={48} className="mb-4 opacity-20" />
                                <p className="text-[15px] font-medium">Chưa bình luận bài viết nào</p>
                            </div>
                        )}
                    </div>
                );
            case 'File phương tiện':
                return (
                    <>
                        {userMedia.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1">
                                {userMedia.map((url, idx) => (
                                    <div key={idx} className="aspect-square relative group cursor-pointer overflow-hidden rounded-sm">
                                        <img src={url} alt="media" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ImageIcon className="text-white" size={24} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <ImageIcon size={48} className="mb-4 opacity-20" />
                                <p className="text-[15px] font-medium">Bạn chưa đăng ảnh/video nào</p>
                            </div>
                        )}
                    </>
                );
            case 'Bài đăng lại':
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Repeat2 size={48} className="mb-4 opacity-20" />
                        <p className="text-[15px] font-medium">Bạn chưa đăng lại bài viết nào</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full p-6 pt-10">
            {/* Profile Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    {loading && !profileUser ? (
                        <div className="space-y-3">
                            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
                            <div className="h-4 w-32 bg-gray-100 animate-pulse rounded-md"></div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold">{displayName}</h1>
                            <p className="text-[15px] mt-1 text-slate-600 font-medium">@{username}</p>
                        </>
                    )}
                </div>
                <div className="relative group">
                    {loading && !profileUser ? (
                        <div className="w-20 h-20 bg-gray-200 animate-pulse rounded-full"></div>
                    ) : (
                        <>
                            <Avatar src={profileUser?.avatar_url} alt={displayName} size="2xl" />
                            {targetUserId === currentUser?.id && (
                                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera size={20} className="text-white" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
                {loading && !profileUser ? (
                    <div className="h-4 w-full bg-gray-50 animate-pulse rounded"></div>
                ) : (
                    <p className="text-[15px] text-slate-800 whitespace-pre-wrap">{bio}</p>
                )}
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 text-[15px] text-gray-500 font-medium">
                    {loading && !profileUser ? (
                        <>
                            <div className="h-4 w-24 bg-gray-100 animate-pulse rounded"></div>
                            <div className="h-4 w-24 bg-gray-100 animate-pulse rounded"></div>
                        </>
                    ) : (
                        <>
                            <span 
                                onClick={handleOpenFollowers}
                                className="hover:underline cursor-pointer"
                            >
                                <span className="text-black font-bold">{followersCount}</span> người theo dõi
                            </span>
                            <span 
                                onClick={handleOpenFollowing}
                                className="hover:underline cursor-pointer"
                            >
                                <span className="text-black font-bold">{followingCount}</span> đang theo dõi
                            </span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Instagram size={22} className="text-slate-800" /></button>
                </div>
            </div>

            {targetUserId === currentUser?.id ? (
                <button className="w-full py-2.5 border border-gray-300 rounded-2xl font-bold text-[15px] mb-8 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50">
                    Chỉnh sửa trang cá nhân
                </button>
            ) : (
                <button
                    onClick={handleFollow}
                    disabled={loading && !profileUser}
                    className={`w-full py-2.5 rounded-2xl font-bold text-[15px] mb-8 transition-all active:scale-[0.98] disabled:opacity-50 ${profileUser?.is_following ? 'border border-gray-300 hover:bg-gray-50' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                    {loading && !profileUser ? '...' : (profileUser?.is_following ? 'Đang theo dõi' : 'Theo dõi')}
                </button>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-0">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 pb-3 text-[15px] font-bold transition-all relative ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black animate-in fade-in slide-in-from-bottom-1 duration-300" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mb-10 min-h-[300px]">
                {renderTabContent()}
            </div>

            <UserListModal 
                isOpen={userListModal.isOpen}
                onClose={() => setUserListModal(prev => ({ ...prev, isOpen: false }))}
                initialTab={userListModal.tab}
                userId={targetUserId}
            />
        </div>
    );
};

export default Profile;
