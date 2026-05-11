import React, { useState, useEffect } from 'react';
import { useLocation, Link, Outlet, Navigate } from 'react-router-dom';
import {
    LayoutDashboard, ChevronRight, RefreshCw, Loader2
} from 'lucide-react';
import ProviderSidebar from './ProviderSidebar';
import { useProviderData } from '../../contexts/ProviderDataContext';

const ProviderLayout = () => {
    const location = useLocation();
    const { stats, fetchStats, loadingStates } = useProviderData();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Đang tải thông tin quan trọng
    if (loadingStates.stats && !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-slate-400 font-bold text-sm">Đang xác thực hồ sơ...</p>
                </div>
            </div>
        );
    }

    const isSetupPage = location.pathname === '/provider/setup';
    const isWaitingPage = location.pathname === '/provider/waiting';

    // Luồng Logic Guard:
    // 1. Chưa có hồ sơ -> Bắt buộc vào /provider/setup
    if (stats && !stats.has_profile && !isSetupPage) {
        return <Navigate to="/provider/setup" replace />;
    }

    // 2. Có hồ sơ nhưng chưa được duyệt (pending/rejected/suspended) -> Vào /provider/waiting
    if (stats && stats.has_profile && stats.provider_status !== 'approved' && !isWaitingPage && !isSetupPage) {
        return <Navigate to="/provider/waiting" replace />;
    }

    // 3. Đã được duyệt mà vào lại trang setup/waiting -> Về dashboard
    if (stats && stats.provider_status === 'approved' && (isSetupPage || isWaitingPage)) {
        return <Navigate to="/provider/dashboard" replace />;
    }

    // Nếu là trang Onboarding (Setup/Waiting) -> Hiển thị Full Page (không sidebar)
    if (isSetupPage || isWaitingPage) {
        return <Outlet />;
    }

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
            if (name === 'messages') label = 'Tin nhắn';
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
