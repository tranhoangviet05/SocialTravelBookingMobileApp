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
    AlertCircle
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
    const [statusModal, setStatusModal] = useState({ open: false, booking: null });
    const [newStatus, setNewStatus] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [updating, setUpdating] = useState(false);
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

    const handleStatusUpdate = async () => {
        if (!statusModal.booking || !newStatus) return;
        if (newStatus === 'cancelled' && !cancelReason.trim()) {
            toast?.error?.('Vui lòng nhập lý do hủy');
            return;
        }

        setUpdating(true);
        try {
            const response = await adminApi.updateBookingStatus(
                statusModal.booking.id,
                newStatus,
                newStatus === 'cancelled' ? cancelReason : null
            );
            if (response.success) {
                toast?.success?.('Cập nhật trạng thái thành công');
                setBookings(bookings.map(b =>
                    b.id === statusModal.booking.id ? { ...b, status: newStatus } : b
                ));
                setStatusModal({ open: false, booking: null });
                setNewStatus('');
                setCancelReason('');
            }
        } catch (error) {
            console.error('Failed to update booking status:', error);
            toast?.error?.('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdating(false);
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
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                    <form onSubmit={handleSearch} className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm mã đặt chỗ, khách hàng, dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                        />
                    </form>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
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
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                        <option value="">Tất cả thanh toán</option>
                        <option value="pending">Chờ thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="refunded">Đã hoàn tiền</option>
                    </select>
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
                                            <button
                                                onClick={() => {
                                                    setStatusModal({ open: true, booking: bk });
                                                    setNewStatus(bk.status);
                                                }}
                                                className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="Cập nhật trạng thái"
                                            >
                                                <CheckCircle2 size={18} />
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

            {/* Status Update Modal */}
            {statusModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setStatusModal({ open: false, booking: null })} />
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-slate-900">Cập nhật trạng thái đơn</h3>
                                <button onClick={() => setStatusModal({ open: false, booking: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mã đơn</p>
                                <p className="text-lg font-black text-slate-900 mt-1">{statusModal.booking?.booking_code}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Trạng thái mới</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                    >
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="confirmed">Đã xác nhận</option>
                                        <option value="ongoing">Đang diễn ra</option>
                                        <option value="completed">Hoàn thành</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                </div>

                                {newStatus === 'cancelled' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Lý do hủy</label>
                                        <textarea
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none font-medium"
                                            placeholder="Nhập lý do hủy đơn..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStatusModal({ open: false, booking: null })} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all">Hủy</button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating}
                                    className="flex-[2] py-4 bg-sky-500 hover:bg-sky-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailModal({ open: false, booking: null, loading: false })} />
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
