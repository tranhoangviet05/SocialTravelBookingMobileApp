import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const CommunityFeed = () => {
    const posts = [
        {
            id: 1,
            user: "Linh Nguyễn",
            time: "2 giờ trước tại Cao Bằng",
            avatar: "https://i.pravatar.cc/150?u=linh",
            content: "Lần đầu trải nghiệm săn mây tại Cửa Đất thực sự tuyệt vời. Một bầu trời mây dạt sẵn như là đang ở nơi xa xăm nào đó...",
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
            likes: "1.2k",
            comments: 88
        },
        {
            id: 2,
            user: "Minh Hoàng",
            time: "Hôm qua tại Sapa",
            avatar: "https://i.pravatar.cc/150?u=minh",
            content: "Chuyến đi Fansipan sáng nay nắng đẹp. Thật may mắn khi thực sự đứng ở đỉnh núi xanh mát...",
            image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop",
            likes: "2.5k",
            comments: 152
        },
        {
            id: 3,
            user: "Mai Vy",
            time: "3 giờ trước tại Hội An",
            avatar: "https://i.pravatar.cc/150?u=vy",
            content: "Mùa thu Hội An đang rất 'tình'. Cảm giác đi bộ dạo quanh phố cổ khi không khí thoảng nhẹ mát lạnh...",
            image: "https://images.unsplash.com/photo-1555432329-1983e979f829?q=80&w=800&auto=format&fit=crop",
            likes: "2.8k",
            comments: 201
        }
    ];

    return (
        <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-10">
                    <p className="text-sky-500 font-bold text-xs uppercase tracking-widest mb-2">Cộng đồng</p>
                    <h2 className="text-3xl font-black text-slate-900">Khoảnh khắc chia sẻ</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <img src={post.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-50" alt="" />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm">{post.user}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{post.time}</p>
                                    </div>
                                </div>
                                <button className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-sky-500 transition-colors">...</button>
                            </div>
                            <div className="px-6 pb-4">
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 font-medium">{post.content}</p>
                            </div>
                            <div className="px-6 h-72">
                                <div className="w-full h-full overflow-hidden rounded-[2rem]">
                                    <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                                </div>
                            </div>
                            <div className="p-6 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center space-x-8">
                                    <button className="flex items-center gap-2 text-xs text-slate-500 font-black hover:text-rose-500 transition-colors">
                                        <Heart size={18} className="group-hover:animate-pulse" /> {post.likes}
                                    </button>
                                    <button className="flex items-center gap-2 text-xs text-slate-500 font-black hover:text-sky-500 transition-colors">
                                        <MessageCircle size={18} /> {post.comments}
                                    </button>
                                </div>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-white hover:text-sky-500 hover:shadow-md transition-all">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CommunityFeed;
