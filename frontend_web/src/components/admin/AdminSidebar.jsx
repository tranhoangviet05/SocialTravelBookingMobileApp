import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    MapPin,
    Compass,
    Hotel,
    Settings,
    LogOut,
    Ticket,
    ShieldAlert,
    Briefcase,
    Star,
    Zap,
    Tag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../utils/ConstantSystems';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: API_ENDPOINTS.ADMIN_DASHBOARD },
    { icon: Users, label: 'Người dùng', path: API_ENDPOINTS.USERS_ADMIN },
    { icon: Briefcase, label: 'Nhà cung cấp', path: API_ENDPOINTS.PROVIDERS_ADMIN },
    { icon: Tag, label: 'Danh mục', path: API_ENDPOINTS.CATEGORIES_ADMIN },
    { icon: MapPin, label: 'Địa điểm', path: API_ENDPOINTS.LOCATIONS_ADMIN },
    { icon: Compass, label: 'Dịch vụ & Tours', path: API_ENDPOINTS.SERVICES_ADMIN },
    { icon: Hotel, label: 'Đặt chỗ', path: API_ENDPOINTS.BOOKINGS_ADMIN },
    { icon: Ticket, label: 'Mã giảm giá', path: API_ENDPOINTS.COUPONS_ADMIN },
    { icon: Star, label: 'Đánh giá', path: API_ENDPOINTS.REVIEWS_ADMIN },
    { icon: Zap, label: 'Tự động hóa', path: API_ENDPOINTS.AUTOMATION_ADMIN },
    { icon: ShieldAlert, label: 'Báo cáo', path: API_ENDPOINTS.REPORTS_ADMIN },
    { icon: Settings, label: 'Cài đặt', path: API_ENDPOINTS.SETTINGS_ADMIN },
];

const AdminSidebar = () => {
    const auth = useAuth() || {}; // Lấy an toàn, tránh lỗi crash
    const { currentUser, logout } = auth;
    const location = useLocation();

    return (
        <aside className="w-64 bg-[#0f172a] text-white flex flex-col fixed inset-y-0 left-0 z-[100] shadow-2xl">
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                        <Compass className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight leading-none">
                            <span className="text-sky-400">STB</span> ADMIN
                        </h1>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">System Manager</p>
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
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
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
                    <div className="w-9 h-9 min-w-[36px] rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                        {((currentUser?.displayName || currentUser?.email || 'A')[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-gray-100">{currentUser?.displayName || currentUser?.email || 'Administrator'}</p>
                        <p className="text-[10px] text-gray-500 truncate uppercase tracking-tight font-bold">Admin Level 1</p>
                    </div>
                </div>
                {logout && (
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all group cursor-pointer"
                    >
                        <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        Đăng xuất
                    </button>
                )}
            </div>
        </aside>
    );
};

export default AdminSidebar;
