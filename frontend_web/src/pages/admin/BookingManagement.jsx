import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Download,
    Filter,
    Loader2,
    ChevronLeft,
    ChevronRight,
    X,
    AlertCircle,
    RotateCw
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPayment, setFilterPayment] = useState('');
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [detailModal, setDetailModal] = useState({ open: false, booking: null, loading: false });

    const toast = useNotification();

    useEffect(() => {
        fetchBookings();
    }, [filterStatus, filterPayment]);

    const fetchBookings = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 8 };
            if (searchTerm) params.search = searchTerm;
            if (filterStatus) params.status = filterStatus;
            if (filterPayment) params.payment_status = filterPayment;

            const response = await adminApi.getAllBookings(params);
            if (response.success) {
                setBookings(response.data);
                setMeta(response.meta || { current_page: 1, last_page: 1, total: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast?.error?.('Không thể tải danh sách đặt chỗ');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBookings();
    };

    const handleViewDetail = async (bookingId) => {
        setDetailModal({ open: true, booking: null, loading: true });
        try {
            const response = await adminApi.getBookingDetail(bookingId);
            if (response.success) {
                setDetailModal({ open: true, booking: response.data, loading: false });
            }
        } catch (error) {
            console.error('Failed to load booking detail:', error);
            toast?.error?.('Không thể tải chi tiết đơn');
            setDetailModal({ open: false, booking: null, loading: false });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'confirmed': return 'text-sky-600 bg-sky-50 border-sky-100';
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'ongoing': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
            case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Đã xác nhận';
            case 'completed': return 'Hoàn thành';
            case 'pending': return 'Chờ xử lý';
            case 'ongoing': return 'Đang diễn ra';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getPaymentBadge = (status) => {
        switch (status) {
            case 'paid': return <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500"><CheckCircle2 size={12} /> Đã thanh toán</span>;
            case 'pending': return <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500"><Clock size={12} /> Chờ thanh toán</span>;
            case 'refunded': return <span className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-500"><CreditCard size={12} /> Đã hoàn tiền</span>;
            default: return <span className="text-[10px] font-bold text-gray-400 uppercase">N/A</span>;
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0₫';
        return Number(price).toLocaleString('vi-VN') + '₫';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đặt chỗ</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Theo dõi và xử lý {meta.total} đơn đặt chỗ trên toàn hệ thống.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm mã đặt chỗ, khách hàng, dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="h-14 px-4 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="ongoing">Đang diễn ra</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                        <select
                            value={filterPayment}
                            onChange={(e) => setFilterPayment(e.target.value)}
                            className="h-14 px-4 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Tất cả thanh toán</option>
                            <option value="pending">Chờ thanh toán</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="refunded">Đã hoàn tiền</option>
                        </select>
                        <button onClick={() => fetchBookings(meta.current_page)}
                            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                            <RotateCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải danh sách đặt chỗ...</p>
                    </div>
                ) : (
                    <>
                        <AdminTable
                            headers={['Mã đặt chỗ', 'Khách hàng', 'Dịch vụ', 'Tổng tiền', 'Thanh toán', 'Trạng thái', '']}
                            title="Lịch sử đặt chỗ"
                            description={`Tổng ${meta.total} đơn đặt chỗ.`}
                        >
                            {bookings.length > 0 ? bookings.map((bk) => (
                                <tr key={bk.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className="font-mono text-[11px] font-bold text-gray-400 block tracking-wider">{bk.booking_code}</span>
                                        <span className="text-[10px] text-gray-300 font-bold mt-0.5 block">{formatDate(bk.created_at)}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-black text-slate-900">{bk.user?.display_name || bk.contact_name || 'N/A'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{bk.user?.email || bk.contact_email || ''}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm text-gray-600 font-medium truncate max-w-[180px]">{bk.service?.name || 'N/A'}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-black text-slate-900">{formatPrice(bk.total_amount)}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {getPaymentBadge(bk.payment_status)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(bk.status)}`}>
                                            {getStatusLabel(bk.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                            <button
                                                onClick={() => handleViewDetail(bk.id)}
                                                className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-8 py-16 text-center text-gray-400 font-bold">
                                        Không tìm thấy đơn đặt chỗ nào
                                    </td>
                                </tr>
                            )}
                        </AdminTable>

                        {/* Pagination */}
                        {meta.last_page > 1 && (
                            <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium">
                                    Trang {meta.current_page} / {meta.last_page} ({meta.total} đơn)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchBookings(meta.current_page - 1)}
                                        disabled={meta.current_page <= 1}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => fetchBookings(meta.current_page + 1)}
                                        disabled={meta.current_page >= meta.last_page}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}


            {/* Detail Modal */}
            {detailModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out] max-h-[80vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-slate-900">Chi tiết đơn đặt chỗ</h3>
                                <button onClick={() => setDetailModal({ open: false, booking: null, loading: false })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            {detailModal.loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                </div>
                            ) : detailModal.booking ? (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã đơn</p>
                                            <p className="text-sm font-black text-slate-900 mt-1">{detailModal.booking.booking_code}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng tiền</p>
                                            <p className="text-sm font-black text-emerald-600 mt-1">{formatPrice(detailModal.booking.total_amount)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thông tin liên hệ</p>
                                        <p className="text-sm font-bold text-slate-900">{detailModal.booking.contact_name}</p>
                                        <p className="text-xs text-gray-500">{detailModal.booking.contact_phone} • {detailModal.booking.contact_email}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dịch vụ</p>
                                        <p className="text-sm font-bold text-slate-900">{detailModal.booking.service?.name}</p>
                                        <p className="text-xs text-gray-500">
                                            Check-in: {formatDate(detailModal.booking.check_in_date)}
                                            {detailModal.booking.check_out_date && ` → ${formatDate(detailModal.booking.check_out_date)}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {detailModal.booking.num_adults} người lớn, {detailModal.booking.num_children} trẻ em
                                        </p>
                                    </div>

                                    {detailModal.booking.special_requests && (
                                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Yêu cầu đặc biệt</p>
                                            <p className="text-sm text-amber-800 mt-1">{detailModal.booking.special_requests}</p>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default BookingManagement;
