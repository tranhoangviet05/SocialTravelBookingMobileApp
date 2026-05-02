import React, { useState, useEffect } from 'react';
import { useProviderData } from '../../contexts/ProviderDataContext';
import {
    Loader2, CalendarCheck, User, Clock, CheckCircle, XCircle, Play, AlertCircle
} from 'lucide-react';
import providerApi from '../../api/providerApi';

// --- Toast Component ---
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-[slideInUp_0.3s_ease-out] ${
            type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{message}</p>
        </div>
    );
};

// --- Cancel Modal ---
const CancelModal = ({ bookingCode, onConfirm, onCancel, loading }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150]">
            <div className="bg-white rounded-3xl p-8 w-[440px] shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                        <XCircle size={24} className="text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Từ chối đơn đặt chỗ</h3>
                        <p className="text-sm text-slate-400 mt-0.5">Đơn #{bookingCode}</p>
                    </div>
                </div>
                <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lý do từ chối (không bắt buộc)</label>
                    <textarea
                        rows={3}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="VD: Đã hết chỗ trong thời gian khách yêu cầu..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                        className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all disabled:opacity-50">
                        Giữ lại
                    </button>
                    <button onClick={() => onConfirm(reason)} disabled={loading}
                        className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        Từ chối đơn
                    </button>
                </div>
            </div>
        </div>
    );
};

const MyBookings = () => {
    const { 
        bookings, fetchBookings, loadingStates, setBookings 
    } = useProviderData();

    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [cancelModal, setCancelModal] = useState(null); // booking object

    const loading = loadingStates.bookings && bookings.length === 0;

    useEffect(() => { 
        fetchBookings(); 
    }, [fetchBookings]);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const handleStatusUpdate = async (bookingId, newStatus, cancelReason = '') => {
        if (updatingId) return;
        setUpdatingId(bookingId);
        try {
            const res = await providerApi.updateBookingStatus(bookingId, newStatus, cancelReason);
            if (res.success) {
                const statusLabels = {
                    confirmed: 'Đã xác nhận đơn thành công!',
                    ongoing: 'Đã bắt đầu dịch vụ!',
                    completed: 'Đã hoàn thành dịch vụ!',
                    cancelled: 'Đã từ chối đơn đặt chỗ.',
                };
                showToast(statusLabels[newStatus] || 'Cập nhật thành công!');
                setBookings(prev => prev.map(b =>
                    b.id === bookingId ? { ...b, status: newStatus } : b
                ));
                setCancelModal(null);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: { bg: 'bg-amber-50 text-amber-700 border border-amber-100', icon: Clock, label: 'Chờ xác nhận' },
            confirmed: { bg: 'bg-blue-50 text-blue-700 border border-blue-100', icon: CheckCircle, label: 'Đã xác nhận' },
            ongoing: { bg: 'bg-violet-50 text-violet-700 border border-violet-100', icon: Play, label: 'Đang diễn ra' },
            completed: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: CheckCircle, label: 'Hoàn thành' },
            cancelled: { bg: 'bg-rose-50 text-rose-700 border border-rose-100', icon: XCircle, label: 'Đã hủy' },
        };
        const s = map[status] || map.pending;
        return (
            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl ${s.bg}`}>
                <s.icon size={12} /> {s.label}
            </span>
        );
    };

    const getActionButtons = (booking) => {
        const isProcessing = updatingId === booking.id;
        const btnClass = "px-4 py-2 rounded-xl text-[12px] font-bold transition-all disabled:opacity-50 flex items-center gap-1.5";

        switch (booking.status) {
            case 'pending':
                return (
                    <div className="flex gap-2">
                        <button disabled={isProcessing}
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className={`${btnClass} bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20`}>
                            {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                            Xác nhận
                        </button>
                        <button disabled={isProcessing}
                            onClick={() => setCancelModal(booking)}
                            className={`${btnClass} bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100`}>
                            <XCircle size={13} /> Từ chối
                        </button>
                    </div>
                );
            case 'confirmed':
                return (
                    <button disabled={isProcessing}
                        onClick={() => handleStatusUpdate(booking.id, 'ongoing')}
                        className={`${btnClass} bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/20`}>
                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Play size={13} />}
                        Bắt đầu
                    </button>
                );
            case 'ongoing':
                return (
                    <button disabled={isProcessing}
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className={`${btnClass} bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20`}>
                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                        Hoàn thành
                    </button>
                );
            default:
                return null;
        }
    };

    const statusTabs = [
        { key: 'all', label: 'Tất cả', count: bookings.length },
        { key: 'pending', label: 'Chờ duyệt' },
        { key: 'confirmed', label: 'Đã xác nhận' },
        { key: 'ongoing', label: 'Đang diễn ra' },
        { key: 'completed', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return dateStr; }
    };

    const filteredBookings = statusFilter === 'all' 
        ? bookings 
        : bookings.filter(b => b.status === statusFilter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lịch đặt chỗ</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý và xác nhận tất cả đơn đặt chỗ từ khách hàng.</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {statusTabs.map(tab => (
                    <button key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === tab.key
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                        }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-bold">Đang tải đơn đặt chỗ...</p>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <CalendarCheck size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">Chưa có đơn đặt chỗ nào</p>
                    <p className="text-slate-300 text-sm mt-1">
                        {statusFilter !== 'all' ? 'Không có đơn nào trong trạng thái này' : 'Đơn đặt chỗ sẽ hiện khi khách hàng book dịch vụ'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredBookings.map(booking => (
                        <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Code + Status */}
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <span className="text-xs font-mono font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                                            #{booking.booking_code || booking.id}
                                        </span>
                                        {getStatusBadge(booking.status)}
                                    </div>

                                    {/* Service name */}
                                    <h3 className="text-sm font-black text-slate-900 mb-2">
                                        {booking.service?.name || 'Dịch vụ'}
                                    </h3>

                                    {/* Details */}
                                    <div className="flex items-center gap-5 text-xs text-slate-400 font-medium flex-wrap">
                                        <span className="flex items-center gap-1.5">
                                            <User size={13} />
                                            {booking.contact_name || booking.user?.display_name || 'Khách hàng'}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CalendarCheck size={13} />
                                            {formatDate(booking.check_in_date)}
                                            {booking.check_out_date && ` → ${formatDate(booking.check_out_date)}`}
                                        </span>
                                        <span>
                                            {booking.num_adults} người lớn
                                            {booking.num_children > 0 && ` · ${booking.num_children} trẻ em`}
                                        </span>
                                    </div>

                                    {/* Cancel reason */}
                                    {booking.cancel_reason && (
                                        <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                                            <XCircle size={11} /> Lý do hủy: {booking.cancel_reason}
                                        </p>
                                    )}
                                </div>

                                {/* Right: Price + Actions */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xl font-black text-emerald-600 mb-1">
                                        {Number(booking.total_amount || 0).toLocaleString('vi-VN')}₫
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Tổng tiền</p>
                                    {getActionButtons(booking)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModal && (
                <CancelModal
                    bookingCode={cancelModal.booking_code || cancelModal.id}
                    loading={updatingId === cancelModal.id}
                    onConfirm={(reason) => handleStatusUpdate(cancelModal.id, 'cancelled', reason)}
                    onCancel={() => setCancelModal(null)}
                />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default MyBookings;
