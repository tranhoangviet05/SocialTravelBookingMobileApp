import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Post from '../../../components/tourist/news_feed/Post';
import Avatar from '../../../components/common/Avatar';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocialData } from '../../../contexts/SocialDataContext';
import { Repeat2 } from 'lucide-react';

const Home = () => {
    const { openCreateModal, refreshTrigger } = useOutletContext();
    const { currentUser } = useAuth();
    const { feedPosts, fetchFeed, fetchMoreFeed, feedPagination, loading, loadingMore, feedMode, setFeedMode } = useSocialData();
    const navigate = useNavigate();

    const handleTabChange = (mode) => {
        if (mode === feedMode) return;
        fetchFeed(true, mode);
    };

    useEffect(() => {
        // Force refresh nếu có trigger (vừa đăng bài) hoặc khi component mount
        fetchFeed(refreshTrigger > 0);
    }, [fetchFeed, refreshTrigger]);

    // Infinite scroll logic
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && feedPagination.hasMore && !loadingMore && !loading) {
                fetchMoreFeed();
            }
        }, { threshold: 0.1 });

        const target = document.getElementById('feed-end-trigger');
        if (target) observer.observe(target);

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [feedPagination.hasMore, loadingMore, loading, fetchMoreFeed]);

    return (
        <div className="w-full">
            {/* Top Navigation */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 pt-6">
                <div className="flex justify-center gap-6 pb-4 font-semibold text-[15px]">
                    <button 
                        onClick={() => handleTabChange('all')}
                        className={`transition-all pb-1 ${feedMode === 'all' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                        Dành cho bạn
                    </button>
                    <button 
                        onClick={() => handleTabChange('following')}
                        className={`transition-all pb-1 ${feedMode === 'following' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                        Đang theo dõi
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div
                    className="flex items-center gap-4 pb-4 border-b border-gray-200 mb-4 cursor-pointer group"
                    onClick={openCreateModal}
                >
                    <div onClick={(e) => { e.stopPropagation(); navigate('/newsfeed/profile'); }}>
                        <Avatar src={currentUser?.avatar_url} alt={currentUser?.display_name} size="md" />
                    </div>
                    <div className="flex-1 text-gray-400 text-[15px]">Có gì mới?</div>
                    <button className="px-5 py-1.5 border border-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">Đăng</button>
                </div>

                {/* Post Feed */}
                <div className="px-2 md:px-0">
                    {loading && feedPosts.length === 0 ? (
                        <div className="flex flex-col gap-6 py-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse flex gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-20 bg-gray-100 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : feedPosts.length > 0 ? (
                        <>
                            {feedPosts.map((post) => (
                                <Post key={post.id} post={post} />
                            ))}
                            
                            {/* Loader for more posts */}
                            <div id="feed-end-trigger" className="h-20 flex items-center justify-center py-8">
                                {loadingMore && (
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                )}
                                {!feedPagination.hasMore && feedPosts.length > 5 && (
                                    <p className="text-gray-400 text-sm italic">Bạn đã xem hết bài viết</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-50 rounded-full">
                                <Repeat2 size={32} className="text-gray-300" />
                            </div>
                            {feedMode === 'following' && (currentUser?.social_profile?.following_count === 0) ? (
                                <p className="text-gray-500 font-medium px-10">Hãy theo dõi mọi người để tiếp tục khám phá những điều thú vị!</p>
                            ) : (
                                <p className="text-gray-500 font-medium px-10">Chưa có bài viết nào ở đây. Hãy quay lại sau nhé!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
