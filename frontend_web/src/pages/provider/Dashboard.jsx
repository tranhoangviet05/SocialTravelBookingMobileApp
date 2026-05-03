import React, { useState, useEffect } from 'react';
import {
    CalendarCheck, Bell, Wallet, Star, Plus, Loader2, Package, AlertCircle, ArrowRight, RotateCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProviderData } from '../../contexts/ProviderDataContext';

const ProviderDashboard = () => {
    const { stats, fetchStats, loadingStates } = useProviderData();
    const loading = loadingStates.stats && !stats;
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading || !stats) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Đang tải dữ liệu...</p>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Dịch vụ hoạt động',
            value: stats?.active_services || 0,
            color: 'from-blue-500 to-sky-400',
            icon: Package,
            onClick: () => navigate('/provider/services')
        },
        {
            label: 'Tổng đặt chỗ',
            value: stats?.total_bookings || 0,
            color: 'from-violet-600 to-purple-400',
            icon: CalendarCheck,
            onClick: () => navigate('/provider/bookings')
        },
        {
            label: 'Chờ xác nhận',
            value: stats?.pending_bookings || 0,
            color: 'from-amber-500 to-orange-400',
            icon: Bell,
            onClick: () => navigate('/provider/bookings')
        },
        {
            label: 'Doanh thu (VNĐ)',
            value: Number(stats?.revenue || 0).toLocaleString('vi-VN'),
            color: 'from-emerald-600 to-teal-400',
            icon: Wallet,
            onClick: null
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bảng điều khiển</h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Chào mừng <span className="text-emerald-600 font-black">{stats?.business_name || 'Nhà cung cấp'}</span>, đây là hiệu suất kinh doanh của bạn!
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchStats()}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer">
                        <RotateCw size={20} />
                    </button>
                    <button
                        onClick={() => navigate('/provider/services')}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={18} /> Thêm dịch vụ
                    </button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={stat.onClick}
                        className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group ${stat.onClick ? 'cursor-pointer' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={26} className="text-white" />
                            </div>
                            {stat.onClick && (
                                <ArrowRight size={16} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                            )}
                        </div>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Đánh giá trung bình */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Tổng quan đánh giá</h3>
                            <p className="text-slate-400 text-sm font-medium">Điểm đánh giá từ khách hàng</p>
                        </div>
                        <button
                            onClick={() => navigate('/provider/reviews')}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
                        >
                            Xem tất cả <ArrowRight size={14} />
                        </button>
                    </div>
                    {stats?.total_reviews > 0 ? (
                        <div className="flex items-center gap-8 py-4">
                            <div className="text-center flex-shrink-0">
                                <div className="text-6xl font-black text-emerald-600">{stats?.avg_rating || '—'}</div>
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={18} className={i <= Math.round(stats?.avg_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400 font-bold mt-2">{stats?.total_reviews || 0} đánh giá</p>
                            </div>
                            <div className="flex-1 border-l border-slate-100 pl-8">
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400 w-4">{star}</span>
                                            <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-400 rounded-full"
                                                    style={{ width: star === Math.round(stats?.avg_rating || 0) ? '60%' : `${Math.max(10, (6 - star) * 10)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
                            <Star size={40} className="text-slate-200 mb-3" />
                            <p className="text-slate-400 font-bold">Chưa có đánh giá nào</p>
                            <p className="text-slate-300 text-sm mt-1">Đánh giá sẽ hiện khi khách hàng hoàn thành dịch vụ</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-900/10">
                    <h3 className="text-xl font-black mb-2 tracking-tight">Thao tác nhanh</h3>
                    <p className="text-emerald-100/80 text-sm font-medium mb-8 leading-relaxed">
                        Quản lý dịch vụ và đơn hàng của bạn ngay tại đây.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/provider/services')}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-sm font-black transition-all border border-white/20 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Thêm dịch vụ mới
                        </button>
                        <button
                            onClick={() => navigate('/provider/bookings')}
                            className="w-full py-4 bg-white text-emerald-700 rounded-2xl text-sm font-black shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <CalendarCheck size={18} />
                            Quản lý đặt chỗ
                            {stats?.pending_bookings > 0 && (
                                <span className="bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {stats.pending_bookings}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/provider/reviews')}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-sm font-bold transition-all border border-white/20 flex items-center justify-center gap-2"
                        >
                            <Star size={16} /> Xem đánh giá ({stats?.total_reviews || 0})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
