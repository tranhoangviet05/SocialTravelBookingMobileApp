import React, { useState, useEffect } from 'react';
import {
    Users,
    Briefcase,
    Compass,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Clock,
    Loader2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import AdminMetricCard from '../../components/admin/AdminMetricCard';
import AdminTable from '../../components/admin/AdminTable';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useAuth } from '../../contexts/AuthContext';

const DashboardManagement = () => {
    const auth = useAuth();
    const currentUser = auth ? auth.currentUser : null;
    const {
        stats: dashboardData, fetchStats, loadingStates
    } = useAdminData();

    const loading = loadingStates.stats && !dashboardData;
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Format số lớn thành dạng đọc được (ví dụ: 1200000 → 1.2M₫)
    const formatRevenue = (value) => {
        if (!value || value === 0) return '0₫';
        if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B₫';
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M₫';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K₫';
        return value.toLocaleString() + '₫';
    };

    const formatGrowth = (value) => {
        if (value > 0) return `+${value}%`;
        if (value < 0) return `${value}%`;
        return '0%';
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'confirmed': return 'bg-sky-50 text-sky-600 border-sky-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Hoàn thành';
            case 'confirmed': return 'Đã xác nhận';
            case 'pending': return 'Chờ xử lý';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    // Lấy giờ hiện tại để chào
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Đang tải dữ liệu Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6">
                    <BarChart3 size={40} />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Không thể tải Dashboard</h2>
                <p className="text-gray-500 font-medium mb-6">{error}</p>
                <button
                    onClick={fetchStats}
                    className="bg-sky-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all cursor-pointer"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    const { stats, revenue_chart, recent_bookings, revenue_sources } = dashboardData || {};

    const statCards = [
        {
            label: 'Tổng người dùng',
            value: stats?.total_users?.toLocaleString() || '0',
            icon: Users,
            change: formatGrowth(stats?.user_growth || 0),
            trend: (stats?.user_growth || 0) >= 0 ? 'up' : 'down',
            color: 'sky'
        },
        {
            label: 'Nhà cung cấp',
            value: stats?.total_providers?.toLocaleString() || '0',
            icon: Briefcase,
            change: `${stats?.pending_providers || 0} chờ duyệt`,
            trend: 'up',
            color: 'indigo'
        },
        {
            label: 'Tổng doanh thu',
            value: formatRevenue(stats?.total_revenue || 0),
            icon: BarChart3,
            change: formatGrowth(stats?.revenue_growth || 0),
            trend: (stats?.revenue_growth || 0) >= 0 ? 'up' : 'down',
            color: 'emerald'
        },
        {
            label: 'Booking hôm nay',
            value: stats?.new_bookings_today?.toLocaleString() || '0',
            icon: Clock,
            change: `${stats?.bookings_this_month || 0} tháng này`,
            trend: 'up',
            color: 'amber'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header info */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">{getGreeting()}, {currentUser?.full_name || 'Admin'}!</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">
                        Hệ thống có {stats?.total_services || 0} dịch vụ đang hoạt động
                        {stats?.pending_services > 0 && ` • ${stats.pending_services} dịch vụ chờ duyệt`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchStats(true)}
                        className="bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                        Làm mới dữ liệu
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <AdminMetricCard key={idx} {...stat} />
                ))}
            </div>

            {/* Revenue Chart Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Phân tích Doanh thu</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Dữ liệu 6 tháng gần nhất (Triệu VND)</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${(stats?.revenue_growth || 0) >= 0
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        {(stats?.revenue_growth || 0) >= 0
                            ? <TrendingUp size={16} />
                            : <TrendingDown size={16} />
                        }
                        <span className="text-sm font-black">{formatGrowth(stats?.revenue_growth || 0)} so với tháng trước</span>
                    </div>
                </div>

                <div className="h-96 w-full">
                    {revenue_chart && revenue_chart.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={revenue_chart}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#0ea5e9', strokeWidth: 2 }}
                                    formatter={(value, name) => [
                                        name === 'revenue' ? `${value}M₫` : value,
                                        name === 'revenue' ? 'Doanh thu' : 'Bookings'
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0ea5e9"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 font-bold">
                            Chưa có dữ liệu doanh thu
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings Table */}
                <div className="lg:col-span-2">
                    <AdminTable
                        title="Giao dịch mới nhất"
                        description={`${recent_bookings?.length || 0} đơn đặt chỗ gần đây nhất từ hệ thống.`}
                        headers={['Mã', 'Khách hàng', 'Dịch vụ', 'Giá trị', 'Trạng thái']}
                    >
                        {recent_bookings && recent_bookings.length > 0 ? (
                            recent_bookings.map((bk, idx) => (
                                <tr key={bk.id || idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-4 font-mono text-xs font-bold text-gray-400">{bk.booking_code}</td>
                                    <td className="px-8 py-4">
                                        <span className="text-sm font-bold text-slate-700">{bk.customer}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-sm text-gray-600 block max-w-[200px] truncate">{bk.service}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-sm font-black text-slate-900">{bk.amount}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(bk.status)}`}>
                                            {getStatusLabel(bk.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold">
                                    Chưa có đơn đặt chỗ nào
                                </td>
                            </tr>
                        )}
                    </AdminTable>
                </div>

                {/* Revenue Source + CTA */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Nguồn doanh thu</h3>
                        <div className="space-y-6">
                            {(revenue_sources || []).map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                                        <span className="text-sm font-black text-slate-900">{item.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: item.value }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0f172a] rounded-3xl p-8 shadow-xl text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <Compass className="text-sky-400 mb-4" size={32} />
                            <h3 className="text-lg font-bold mb-2">Tổng quan nhanh</h3>
                            <p className="text-gray-400 text-sm mb-6 font-medium leading-relaxed">
                                {stats?.pending_providers > 0
                                    ? `Có ${stats.pending_providers} nhà cung cấp đang chờ phê duyệt.`
                                    : `Hệ thống có ${stats?.total_services || 0} dịch vụ và ${stats?.total_reviews || 0} đánh giá (⭐ ${stats?.avg_rating || 0}).`
                                }
                            </p>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardManagement;
