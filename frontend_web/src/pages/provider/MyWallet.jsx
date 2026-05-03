import React, { useState, useEffect } from 'react';
import { useProviderData } from '../../contexts/ProviderDataContext';
import { 
    Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, 
    TrendingUp, Calendar, History, Loader2, DollarSign,
    ArrowRightLeft, BadgeCheck, RotateCw
} from 'lucide-react';
const MyWallet = () => {
    const { 
        wallet, walletReport: report, fetchWallet, fetchWalletReport, loadingStates 
    } = useProviderData();

    const loading = (loadingStates.wallet && !wallet) || (loadingStates.walletReport && report.length === 0);

    useEffect(() => {
        fetchWallet();
        fetchWalletReport();
    }, [fetchWallet, fetchWalletReport]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'booking_payment': return <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowUpRight size={20} /></div>;
            case 'commission': return <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><ArrowDownLeft size={20} /></div>;
            case 'refund': return <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><ArrowRightLeft size={20} /></div>;
            default: return <div className="p-2 bg-slate-50 text-slate-600 rounded-xl"><DollarSign size={20} /></div>;
        }
    };

    const getTransactionLabel = (type) => {
        const labels = {
            'booking_payment': 'Nhận tiền đặt chỗ',
            'commission': 'Khấu trừ hoa hồng (10%)',
            'refund': 'Hoàn trả tiền cho khách',
            'deposit': 'Nạp tiền vào ví'
        };
        return labels[type] || 'Giao dịch khác';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Đang tải dữ liệu tài chính...</p>
            </div>
        );
    }

    const walletObj = wallet?.wallet || { balance: 0, locked_balance: 0 };

    return (
        <>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ví tiền & Doanh thu</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Theo dõi thu nhập và quản lý dòng tiền của bạn.</p>
                    </div>
                    <button onClick={() => { fetchWallet(); fetchWalletReport(); }}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer">
                        <RotateCw size={20} />
                    </button>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary Balance Card */}
                    <div className="md:col-span-2 relative overflow-hidden bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-600/20 group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                        <WalletIcon size={20} />
                                    </div>
                                    <span className="text-sm font-bold tracking-widest uppercase opacity-80">Số dư khả dụng</span>
                                </div>
                                <BadgeCheck className="text-white/40 group-hover:text-white/100 transition-all" size={24} />
                            </div>
                            <h3 className="text-5xl font-black mb-1 font-mono tracking-tighter">
                                {formatPrice(walletObj.balance)}
                            </h3>
                            <div className="flex items-center gap-3 text-white/70 mt-6 pt-6 border-t border-white/10">
                                <TrendingUp size={16} />
                                <p className="text-sm font-medium">Tổng doanh thu thực nhận: <span className="text-white font-bold ml-1">{formatPrice(wallet?.total_earned || 0)}</span></p>
                            </div>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
                    </div>

                    {/* Secondary Stat Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-4">Đang đóng băng</span>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{formatPrice(walletObj.locked_balance)}</h4>
                            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Tiền từ các đơn đang xử lý hoặc chưa hoàn thành chuyến đi. Sẽ được giải ngân sau khi đơn hàng kết thúc.</p>
                        </div>
                        <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                            Rút tiền về NH
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    {/* Transaction History */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <History className="text-emerald-500" size={20} />
                                <h3 className="font-black text-slate-900">Lịch sử giao dịch</h3>
                            </div>
                        </div>

                        {!wallet?.transactions || wallet.transactions.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 py-20 flex flex-col items-center">
                                <ArrowRightLeft size={40} className="text-slate-200 mb-3" />
                                <p className="text-slate-400 font-bold">Chưa có giao dịch nào phát sinh</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
                                {wallet.transactions.map((t, idx) => (
                                    <div key={t.id} className={`p-5 flex items-center justify-between hover:bg-slate-50 transition-all ${idx !== wallet.transactions.length - 1 ? 'border-bottom border-slate-50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            {getTransactionIcon(t.type)}
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{getTransactionLabel(t.type)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-2">
                                                    <Calendar size={10} /> 
                                                    {new Date(t.created_at).toLocaleString('vi-VN')}
                                                    {t.booking?.service?.name && <span className="text-emerald-500 ml-1">• {t.booking.service.name}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-base font-black ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.amount >= 0 ? '+' : ''}{formatPrice(t.amount)}
                                            </p>
                                            <p className="text-[10px] text-slate-300 font-medium">Số dư: {formatPrice(t.balance_after)}</p>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-4 bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-all">Xem tất cả giao dịch</button>
                            </div>
                        )}
                    </div>

                    {/* Chart / Report Placeholder */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <TrendingUp className="text-emerald-500" size={20} />
                            <h3 className="font-black text-slate-900">Tăng trưởng 6 tháng</h3>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm min-h-[400px]">
                            {report.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
                                    <TrendingUp size={48} className="mb-2" />
                                    <p className="text-xs font-bold">Chưa đủ dữ liệu biểu đồ</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {report.map(r => (
                                        <div key={r.month} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                                                <span>Tháng {r.month.split('-')[1]}</span>
                                                <span className="text-slate-900">{formatPrice(r.total)}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                                                    style={{ width: `${Math.min(100, (r.total / Math.max(...report.map(x => x.total))) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-8 pt-6 border-t border-dashed">
                                        <p className="text-[10px] text-slate-400 font-medium text-center italic">Biểu đồ tự động cập nhật dựa trên dữ liệu thanh toán thực tế hàng tháng.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    .border-bottom { border-bottom: 1px solid #f8fafc; }
                `}</style>
            </div>
        </>
    );
};

export default MyWallet;
