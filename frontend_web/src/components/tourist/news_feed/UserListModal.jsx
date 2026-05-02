import React, { useState, useEffect } from 'react';
import { X, MessageCircle, UserPlus, UserMinus, ChevronLeft } from 'lucide-react';
import Avatar from '../../common/Avatar';
import { useNavigate } from 'react-router-dom';
import socialApi from '../../../api/socialApi';
import { useNotification } from '../../../contexts/NotificationContext';
import FullProfileModal from './FullProfileModal';

const UserListModal = ({ isOpen, onClose, initialTab = 'followers', userId }) => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = activeTab === 'followers'
                    ? await socialApi.getFollowers(userId)
                    : await socialApi.getFollowing(userId);

                if (response.success && isMounted) {
                    setUsers(response.data.data);
                }
            } catch (error) {
                if (isMounted) {
                    notification.error("Không thể tải danh sách");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (isOpen && userId) {
            fetchUsers();
        } else {
            setUsers([]);
            setSelectedUser(null);
        }

        return () => {
            isMounted = false;
        };
    }, [isOpen, activeTab, userId]);

    // Tách riêng hàm refresh để dùng cho các action
    const refreshUsers = async () => {
        try {
            const response = activeTab === 'followers'
                ? await socialApi.getFollowers(userId)
                : await socialApi.getFollowing(userId);

            if (response.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Refresh failed", error);
        }
    };

    const handleAction = async (e, targetUserId, action) => {
        e.stopPropagation();
        try {
            const response = await socialApi.toggleFollow(targetUserId);
            if (response.success) {
                notification.success(response.data.following ? "Đã theo dõi" : "Đã bỏ theo dõi");
                refreshUsers(); // Dùng hàm refresh riêng thay vì fetchUsers gốc
            }
        } catch (error) {
            notification.error("Thao tác thất bại");
        }
    };

    if (!isOpen) return null;

    const renderSkeleton = () => (
        <div className="flex flex-col gap-4 p-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-20 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                    <div className="h-8 w-20 bg-gray-100 rounded-xl"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white w-full max-w-[450px] h-[600px] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Back button for Mini Profile */}
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-4">
                    {selectedUser ? (
                        <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                    ) : (
                        <div className="flex-1 flex justify-center gap-8 font-bold text-[15px]">
                            <button
                                onClick={() => setActiveTab('followers')}
                                className={`pb-2 transition-all border-b-2 ${activeTab === 'followers' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                            >
                                Người theo dõi
                            </button>
                            <button
                                onClick={() => setActiveTab('following')}
                                className={`pb-2 transition-all border-b-2 ${activeTab === 'following' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                            >
                                Đang theo dõi
                            </button>
                        </div>
                    )}
                    {!selectedUser && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full ml-auto">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* User List View */}
                    {loading ? renderSkeleton() : users.length > 0 ? (
                        <div className="flex flex-col">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between transition-all cursor-pointer group"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar src={user.avatar_url} alt={user.display_name} size="lg" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[15px] group-hover:underline">{user.display_name}</span>
                                            <span className="text-sm text-gray-500 truncate max-w-[150px]">
                                                @{user.social_profile?.username || 'user'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {activeTab === 'following' ? (
                                            <button
                                                onClick={(e) => handleAction(e, user.id, 'unfollow')}
                                                className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded-xl font-bold text-[13px] hover:bg-red-50 hover:text-red-600 transition-all"
                                            >
                                                Đang theo dõi
                                            </button>
                                        ) : (
                                            user.is_following ? (
                                                <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                                                    <MessageCircle size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleAction(e, user.id, 'follow')}
                                                    className="px-4 py-1.5 bg-sky-50 text-sky-600 rounded-xl font-bold text-[13px] hover:bg-sky-100 transition-all"
                                                >
                                                    Theo dõi lại
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                            <div className="p-6 bg-gray-50 rounded-full">
                                <UserPlus size={40} className="text-gray-200" />
                            </div>
                            <p className="font-medium">Chưa có ai trong danh sách này</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Full Profile Modal */}
            <FullProfileModal
                isOpen={!!selectedUser}
                onClose={() => {
                    setSelectedUser(null);
                    refreshUsers(); // Refresh parent list to update follow status if changed in modal
                }}
                userId={selectedUser?.id}
            />
        </div>
    );
};

export default UserListModal;
