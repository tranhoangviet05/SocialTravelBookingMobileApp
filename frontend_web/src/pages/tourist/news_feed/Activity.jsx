import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import socialApi from '../../../api/socialApi';
import ActivityItem from '../../../components/tourist/news_feed/ActivityItem';
import { toast } from 'react-hot-toast';

const Activity = () => {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, hasMore: false });

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'follow', label: 'Theo dõi' },
        { id: 'reply', label: 'Trả lời' },
        { id: 'like', label: 'Lượt thích' }
    ];

    const fetchNotifications = useCallback(async (type = 'all', page = 1, append = false) => {
        try {
            setLoading(true);
            const response = await socialApi.getNotifications(type, page);
            if (response.success) {
                const { data, current_page, last_page } = response.data;
                setNotifications(prev => append ? [...prev, ...data] : data);
                setPagination({
                    currentPage: current_page,
                    hasMore: current_page < last_page
                });
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
            toast.error("Không thể tải thông báo");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(activeTab, 1, false);
    }, [activeTab, fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            const response = await socialApi.markNotificationAsRead(id);
            if (response.success) {
                setNotifications(prev => prev.map(n => 
                    n.id === id ? { ...n, is_read: true } : n
                ));
            }
        } catch (error) {
            console.error("Mark as read error:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await socialApi.markAllNotificationsAsRead();
            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                toast.success("Đã đánh dấu tất cả là đã đọc");
            }
        } catch (error) {
            console.error("Mark all as read error:", error);
        }
    };

    return (
        <div className="w-full min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
                <div className="px-6 pt-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Hoạt động</h1>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => fetchNotifications(activeTab, 1, false)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                title="Làm mới"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                title="Đánh dấu tất cả đã đọc"
                            >
                                <CheckCheck size={20} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap mb-2 ${
                                    activeTab === tab.id 
                                    ? 'bg-black text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="pb-20">
                {loading && notifications.length === 0 ? (
                    <div className="p-6 space-y-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        <div className="divide-y divide-gray-50">
                            {notifications.map(notification => (
                                <ActivityItem 
                                    key={notification.id} 
                                    notification={notification} 
                                    onRead={handleMarkAsRead}
                                />
                            ))}
                        </div>
                        
                        {pagination.hasMore && (
                            <div className="p-4 flex justify-center">
                                <button 
                                    onClick={() => fetchNotifications(activeTab, pagination.currentPage + 1, true)}
                                    disabled={loading}
                                    className="px-6 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {loading ? 'Đang tải...' : 'Xem thêm'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4 text-gray-400">
                        <div className="p-6 bg-gray-50 rounded-full">
                            <Bell size={48} strokeWidth={1} />
                        </div>
                        <p className="font-medium">Chưa có hoạt động nào</p>
                        <p className="text-sm max-w-[240px]">Khi có người tương tác với bạn, thông báo sẽ xuất hiện ở đây.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activity;
