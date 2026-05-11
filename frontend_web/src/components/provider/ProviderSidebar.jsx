import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Compass,
    Hotel,
    Settings,
    LogOut,
    Ticket,
    Star,
    Wallet,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../utils/ConstantSystems';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: API_ENDPOINTS.PROVIDER_DASHBOARD },
    { icon: Compass, label: 'Dịch vụ của tôi', path: API_ENDPOINTS.PROVIDER_SERVICES },
    { icon: Calendar, label: 'Lịch đặt chỗ', path: API_ENDPOINTS.PROVIDER_BOOKINGS },
    { icon: Star, label: 'Đánh giá khách hàng', path: API_ENDPOINTS.PROVIDER_REVIEWS },
    { icon: Wallet, label: 'Ví tiền & Doanh thu', path: API_ENDPOINTS.PROVIDER_WALLET },
    { icon: MessageSquare, label: 'Tin nhắn', path: API_ENDPOINTS.PROVIDER_MESSAGES },
    { icon: Settings, label: 'Cài đặt cửa hàng', path: API_ENDPOINTS.PROVIDER_SETTINGS },
];

const ProviderSidebar = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    return (
        <aside className="w-64 bg-[#0f172a] text-white flex flex-col fixed inset-y-0 left-0 z-50">
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Hotel className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight leading-none">
                            <span className="text-emerald-400">STB</span> PARTNER
                        </h1>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Provider Portal</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar mt-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                                ${isActive
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile & Logout */}
            <div className="p-4 border-t border-white/5 bg-[#0a101f]">
                <div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-xl bg-white/5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                        {(currentUser?.displayName || currentUser?.email || 'P')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-gray-100">{currentUser?.displayName || 'Partner'}</p>
                        <p className="text-[10px] text-gray-500 truncate uppercase tracking-tight font-bold">Verified Provider</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all group"
                >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default ProviderSidebar;
