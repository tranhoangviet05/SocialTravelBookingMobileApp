import React, { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, ChevronRight, RefreshCw, Users, MapPin, 
    Compass, Hotel, Settings, LogOut, Ticket, ShieldAlert, 
    Briefcase, Star, Zap, Tag
} from 'lucide-react';
import { useAdminData } from '../../contexts/AdminDataContext';
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

const AdminLayout = () => {
    const location = useLocation();
    const { currentUser, logout } = useAuth() || {};

    const getBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter((x) => x);
        return pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            let label = name.charAt(0).toUpperCase() + name.slice(1);
            if (name === 'admin') label = 'Quản trị';
            const map = {
                'users': 'Người dùng', 'providers': 'Nhà cung cấp', 'locations': 'Địa điểm',
                'categories': 'Danh mục', 'services': 'Dịch vụ', 'bookings': 'Đặt chỗ',
                'coupons': 'Mã giảm giá', 'reviews': 'Đánh giá', 'automation': 'Tự động hóa',
                'reports': 'Báo cáo', 'settings': 'Cài đặt', 'dashboard': 'Bảng điều khiển'
            };
            label = map[name] || label;
            return (
                <div key={routeTo} className="flex items-center">
                    <ChevronRight size={14} className="mx-2 text-slate-300" />
                    {isLast ? (
                        <span className="text-slate-900 font-bold text-sm">{label}</span>
                    ) : (
                        <Link to={routeTo} className="text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium">
                            {label}
                        </Link>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar tích hợp trực tiếp */}
            <aside className="w-64 bg-[#0f172a] text-white flex flex-col fixed inset-y-0 left-0 z-[100] shadow-2xl shadow-indigo-900/20">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Compass className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight leading-none">STB <span className="text-indigo-400 text-xs">ADMIN</span></h1>
                            <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Quản trị hệ thống</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar scroll-smooth">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.label} to={item.path} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/10 scale-[1.02]' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                                <item.icon size={16} className={`${isActive ? 'text-white' : 'text-slate-500'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 bg-[#0a101f]">
                    <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold border border-white/10">
                            {((currentUser?.displayName || currentUser?.email || 'A')[0]).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate text-gray-100 uppercase">{currentUser?.displayName || 'Admin'}</p>
                            <p className="text-[9px] text-indigo-400/60 truncate uppercase font-bold tracking-tighter">Administrator</p>
                        </div>
                    </div>
                    {logout && (
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-rose-400 hover:bg-rose-500/10 transition-all uppercase tracking-widest cursor-pointer">
                            <LogOut size={16} /> Đăng xuất
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col w-full relative">
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-[40]">
                    <div className="flex items-center">
                        <div className="flex items-center text-slate-400">
                            <LayoutDashboard size={18} className="text-indigo-500" />
                            {getBreadcrumbs()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-10 bg-[#F8FAFC]">
                    <Outlet />
                </main>
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                main { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default AdminLayout;
