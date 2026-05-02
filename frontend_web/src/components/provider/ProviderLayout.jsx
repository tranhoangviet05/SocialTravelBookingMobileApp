import React, { useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, ChevronRight, RefreshCw
} from 'lucide-react';
import ProviderSidebar from './ProviderSidebar';
import { useProviderData } from '../../contexts/ProviderDataContext';

const ProviderLayout = () => {
    const location = useLocation();
    const { reloadAll } = useProviderData();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await reloadAll();
        setIsRefreshing(false);
    };

    const getBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter((x) => x);
        return pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            let label = name.charAt(0).toUpperCase() + name.slice(1);
            if (name === 'provider') label = 'Nhà cung cấp';
            if (name === 'services') label = 'Dịch vụ của tôi';
            if (name === 'bookings') label = 'Lịch đặt chỗ';
            if (name === 'reviews') label = 'Đánh giá';
            if (name === 'wallet') label = 'Ví & Doanh thu';
            if (name === 'settings') label = 'Cài đặt cửa hàng';
            if (name === 'dashboard') label = 'Bảng điều khiển';
            return (
                <div key={routeTo} className="flex items-center">
                    <ChevronRight size={14} className="mx-2 text-slate-300" />
                    {isLast ? (
                        <span className="text-slate-900 font-bold text-sm">{label}</span>
                    ) : (
                        <Link to={routeTo} className="text-slate-400 hover:text-emerald-600 transition-colors text-sm font-medium">
                            {label}
                        </Link>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <ProviderSidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-[40]">
                    <div className="flex items-center">
                        <div className="flex items-center text-slate-400">
                            <LayoutDashboard size={18} />
                            {getBreadcrumbs()}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 ${isRefreshing ? 'cursor-not-allowed' : ''}`}
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'Đang tải...' : 'Làm mới dữ liệu'}
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-10 animate-[fadeIn_0.4s_ease-out]">
                    <Outlet />
                </main>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ProviderLayout;
