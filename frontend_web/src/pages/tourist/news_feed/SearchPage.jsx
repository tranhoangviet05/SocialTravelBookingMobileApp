import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Hash, User as UserIcon } from 'lucide-react';
import Avatar from '../../../components/common/Avatar';
import socialApi from '../../../api/socialApi';
import Post from '../../../components/tourist/news_feed/Post';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';

const SearchFeed = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const notification = useNotification();
    
    const queryParam = searchParams.get('q') || '';
    const tagParam = searchParams.get('tag') || '';
    const locationParam = searchParams.get('location_id') || '';
    const locationNameParam = searchParams.get('location_name') || '';

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('posts');
    const [results, setResults] = useState({ posts: [], users: [] });
    const [loading, setLoading] = useState(false);

    // Đồng bộ thanh tìm kiếm với URL params
    useEffect(() => {
        if (tagParam) {
            setSearchTerm(`#${tagParam}`);
            setActiveTab('posts');
        } else if (locationNameParam) {
            setSearchTerm(locationNameParam);
            setActiveTab('posts');
        } else if (queryParam) {
            setSearchTerm(queryParam);
        }
    }, [tagParam, locationParam, queryParam, locationNameParam]);

    useEffect(() => {
        handleSearch();
    }, [searchParams]);

    const handleSearch = async () => {
        if (!queryParam && !tagParam && !locationParam) return;

        try {
            setLoading(true);
            setResults({ posts: [], users: [] });

            // Search Posts
            const postsRes = await socialApi.getFeed(15, 1, { 
                q: queryParam, 
                tag: tagParam, 
                location_id: locationParam 
            });
            
            // Search Users (chỉ khi có query string)
            let usersRes = { success: true, data: { data: [] } };
            if (queryParam) {
                usersRes = await socialApi.searchUsers(queryParam);
            }

            setResults({
                posts: postsRes.success ? postsRes.data.data : [],
                users: usersRes.success ? usersRes.data.data : []
            });

            // Auto-switch tab if only one type of result or specific search
            if (tagParam || locationParam) setActiveTab('posts');
            else if (queryParam && results.users.length > 0) setActiveTab('users');

        } catch (error) {
            notification.error("Lỗi khi tìm kiếm");
        } finally {
            setLoading(false);
        }
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (!term) return;
        // Nếu người dùng gõ #tag thì tìm theo hashtag
        if (term.startsWith('#')) {
            setSearchParams({ tag: term.slice(1) });
        } else {
            setSearchParams({ q: term });
        }
    };

    const clearFilter = () => {
        setSearchTerm('');
        setSearchParams({});
        setResults({ posts: [], users: [] });
    };

    return (
        <div className="w-full flex flex-col min-h-screen bg-white">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 p-4 border-b border-gray-100">
                <form onSubmit={onSearchSubmit} className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm người, bài viết, #hashtag..."
                        className="w-full bg-gray-100 rounded-2xl py-3 pl-12 pr-16 outline-none focus:ring-1 focus:ring-gray-300 transition-all text-[15px]"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-500 font-bold text-sm">Tìm</button>
                </form>

                {/* Chip bộ lọc đang hoạt động */}
                {(tagParam || locationParam) && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-[13px] text-gray-500">Đang lọc:</span>
                        {tagParam && (
                            <span className="flex items-center gap-1.5 bg-sky-50 text-sky-600 font-semibold text-[13px] px-3 py-1 rounded-full border border-sky-100">
                                <Hash size={13} />
                                {tagParam}
                                <button onClick={clearFilter} className="ml-1 text-sky-400 hover:text-sky-700 font-bold text-base leading-none">×</button>
                            </span>
                        )}
                        {locationParam && locationNameParam && (
                            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 font-semibold text-[13px] px-3 py-1 rounded-full border border-emerald-100">
                                <MapPin size={13} />
                                {locationNameParam}
                                <button onClick={clearFilter} className="ml-1 text-emerald-400 hover:text-emerald-700 font-bold text-base leading-none">×</button>
                            </span>
                        )}
                    </div>
                )}

                <div className="flex border-b border-gray-50">
                    <button 
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-3 text-[15px] font-bold transition-colors relative ${activeTab === 'posts' ? 'text-black' : 'text-gray-400'}`}
                    >
                        Bài viết
                        {activeTab === 'posts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-black rounded-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-3 text-[15px] font-bold transition-colors relative ${activeTab === 'users' ? 'text-black' : 'text-gray-400'}`}
                    >
                        Mọi người
                        {activeTab === 'users' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-black rounded-full"></div>}
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : (
                    <div className="px-1">
                        {activeTab === 'posts' ? (
                            results.posts.length > 0 ? (
                                results.posts.map(post => <Post key={post.id} post={post} />)
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="p-4 bg-gray-50 rounded-full text-gray-300"><Hash size={40} /></div>
                                    <p className="text-gray-500">Không tìm thấy bài viết nào</p>
                                </div>
                            )
                        ) : (
                            results.users.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {results.users.map(u => (
                                        <div 
                                            key={u.id} 
                                            className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/newsfeed/profile?id=${u.id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar src={u.avatar_url} alt={u.display_name} size="lg" />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[15px]">{u.display_name}</span>
                                                    <span className="text-gray-500 text-[14px]">@{u.social_profile?.username}</span>
                                                </div>
                                            </div>
                                            <button className="px-4 py-1.5 bg-black text-white rounded-xl text-sm font-bold">Xem hồ sơ</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="p-4 bg-gray-50 rounded-full text-gray-300"><UserIcon size={40} /></div>
                                    <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchFeed;
