import React, { useState, useEffect } from 'react';
import { X, MapPin, Link as LinkIcon, Calendar, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import Avatar from '../../common/Avatar';
import socialApi from '../../../api/socialApi';
import { useNotification } from '../../../contexts/NotificationContext';
import Post from './Post';

const FullProfileModal = ({ isOpen, onClose, userId }) => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const notification = useNotification();

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
            fetchPosts();
        }
    }, [isOpen, userId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await socialApi.getUserProfile(userId);
            if (response.success) {
                setUser(response.data);
            }
        } catch (error) {
            notification.error("Không thể tải thông tin cá nhân");
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        setPostsLoading(true);
        try {
            const response = await socialApi.getUserPosts(userId);
            if (response.success) {
                setPosts(response.data.data);
            }
        } catch (error) {
            notification.error("Không thể tải bài viết");
        } finally {
            setPostsLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            const response = await socialApi.toggleFollow(userId);
            if (response.success) {
                setUser(prev => ({ ...prev, is_following: response.data.following }));
                notification.success(response.data.following ? "Đã theo dõi" : "Đã bỏ theo dõi");
            }
        } catch (error) {
            notification.error("Thao tác thất bại");
        }
    };

    if (!isOpen) return null;

    const ProfileSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-32 bg-gray-100 rounded-t-3xl"></div>
            <div className="px-6 -mt-12 flex justify-between items-end mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-xl mb-2"></div>
            </div>
            <div className="px-6 space-y-3">
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-100 rounded"></div>
                <div className="h-16 w-full bg-gray-50 rounded-xl mt-4"></div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-2xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Container */}
                <div className="relative overflow-y-auto custom-scrollbar flex-1">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {loading ? <ProfileSkeleton /> : user && (
                        <>
                            {/* Cover & Avatar Area */}
                            <div className="h-40 bg-gradient-to-r from-sky-400 to-indigo-500"></div>
                            <div className="px-6 -mt-12 flex justify-between items-end mb-6">
                                <div className="relative">
                                    <Avatar src={user.avatar_url} size="2xl" className="border-4 border-white shadow-lg" />
                                </div>
                                <div className="flex gap-2 mb-2">
                                    {user.is_following ? (
                                        <>
                                            <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                                                <MessageCircle size={20} />
                                            </button>
                                            <button 
                                                onClick={handleFollow}
                                                className="px-6 py-2 bg-gray-100 text-gray-800 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                            >
                                                Đang theo dõi
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={handleFollow}
                                            className="px-8 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
                                        >
                                            Theo dõi
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="px-6 mb-6">
                                <h2 className="text-2xl font-black text-gray-900">{user.display_name}</h2>
                                <p className="text-gray-500 font-medium">@{user.social_profile?.username || 'user'}</p>
                                
                                {user.social_profile?.bio && (
                                    <p className="mt-4 text-[15px] text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl italic">
                                        "{user.social_profile.bio}"
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        <span>Tham gia {new Date(user.created_at).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    {user.social_profile?.website_url && (
                                        <a href={user.social_profile.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sky-500 hover:underline">
                                            <LinkIcon size={16} />
                                            <span className="truncate max-w-[200px]">{user.social_profile.website_url.replace(/^https?:\/\//, '')}</span>
                                        </a>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex gap-6 mt-6 border-y border-gray-50 py-4">
                                    <div className="flex gap-1 items-baseline">
                                        <span className="font-black text-lg">{user.social_profile?.following_count || 0}</span>
                                        <span className="text-gray-500 text-sm">Đang theo dõi</span>
                                    </div>
                                    <div className="flex gap-1 items-baseline">
                                        <span className="font-black text-lg">{user.social_profile?.followers_count || 0}</span>
                                        <span className="text-gray-500 text-sm">Người theo dõi</span>
                                    </div>
                                    <div className="flex gap-1 items-baseline">
                                        <span className="font-black text-lg">{user.social_profile?.posts_count || 0}</span>
                                        <span className="text-gray-500 text-sm">Bài viết</span>
                                    </div>
                                </div>
                            </div>

                            {/* Posts Section */}
                            <div className="px-6 pb-6">
                                <h3 className="font-black text-lg mb-4 sticky top-0 bg-white/80 backdrop-blur-md py-2 z-10">Bài viết</h3>
                                <div className="flex flex-col gap-6">
                                    {postsLoading ? (
                                        [1, 2].map(i => (
                                            <div key={i} className="animate-pulse flex flex-col gap-4">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                        <div className="h-3 w-20 bg-gray-100 rounded"></div>
                                                    </div>
                                                </div>
                                                <div className="h-40 w-full bg-gray-50 rounded-2xl"></div>
                                            </div>
                                        ))
                                    ) : posts.length > 0 ? (
                                        posts.map(post => <Post key={post.id} post={post} />)
                                    ) : (
                                        <div className="py-12 text-center text-gray-400 italic">
                                            Chưa có bài viết nào
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FullProfileModal;
