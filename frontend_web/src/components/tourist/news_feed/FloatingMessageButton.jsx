import React, { useState } from 'react';
import { MessageCircle, Send, X, Search, User, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../../../pages/tourist/news_feed/mockData';

const FloatingMessageButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    
    // Mock danh sách người theo dõi (Followers)
    // Trong thực tế sẽ lấy từ API
    const followers = MOCK_USERS.slice(0, 0); // Giả sử chưa có ai theo dõi

    const handleStartSearch = () => {
        setIsOpen(false);
        navigate('/newsfeed/search');
    };

    return (
        <>
            {/* Chat Window Popup */}
            {isOpen && (
                <div className="fixed bottom-24 right-8 w-full max-w-[380px] h-[550px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden z-[60] animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#00AEEF] rounded-full flex items-center justify-center text-white">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Tin nhắn</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    <span className="text-[11px] text-gray-500 font-medium">Đang hoạt động</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                        {followers.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-2 mb-3">Người theo dõi</p>
                                {followers.map(user => (
                                    <button 
                                        key={user.id}
                                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-sky-50 transition-all cursor-pointer group"
                                    >
                                        <div className="relative">
                                            <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100" alt="" />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">Nhấn để bắt đầu trò chuyện</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <User size={32} className="text-gray-300" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Chưa có cuộc hội thoại nào</h4>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                                    Bắt đầu theo dõi ai đó để tiếp tục trò chuyện cùng cộng đồng Social Travel
                                </p>
                                <button 
                                    onClick={handleStartSearch}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-lg shadow-gray-200"
                                >
                                    <Search size={18} />
                                    Bắt đầu ngay
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer / Search Bar */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm bạn bè..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#00AEEF] outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 right-8 px-6 h-14 ${isOpen ? 'bg-slate-800 shadow-xl' : 'bg-[#00AEEF] shadow-[0_8px_30px_rgba(14,165,233,0.3)]'} text-white rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-all z-[40] group cursor-pointer`}
            >
                {isOpen ? <X size={22} className="animate-in spin-in-90 duration-300" /> : <Send size={22} className="rotate-[-15deg] group-hover:rotate-0 transition-transform" />}
                <span className="font-bold text-[15px]">{isOpen ? 'Đóng' : 'Tin nhắn'}</span>
            </button>
        </>
    );
};

export default FloatingMessageButton;