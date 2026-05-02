import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import bookingApi from '../../api/bookingApi';
import { Loader2, Calendar, CreditCard, ExternalLink, AlertCircle, X, User, Users, Phone, Tag, BedDouble } from 'lucide-react';


const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await bookingApi.getMyBookings();
            if (response.success) {
                setBookings(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đặt chỗ:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt chỗ này không?')) return;
        
        try {
            const res = await bookingApi.cancelBooking(id);
            if (res.success) {
                alert('Đã hủy đơn đặt chỗ thành công.');
                fetchBookings(); 
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn.');
        }
    };

    const handleDetail = (booking) => {
        setSelectedBooking(booking);
    };

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'pending', label: 'Chờ xử lý' },
        { id: 'confirmed', label: 'Đã xác nhận' },
        { id: 'ongoing', label: 'Đang diễn ra' },
        { id: 'completed', label: 'Hoàn thành' },
        { id: 'cancelled', label: 'Đã hủy' }
    ];

    const filteredBookings = activeTab === 'all' 
        ? bookings 
        : bookings.filter(booking => booking.status === activeTab);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const getPaymentStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            paid: 'bg-green-50 text-green-700 border border-green-200',
            refunded: 'bg-purple-50 text-purple-700 border border-purple-200',
            failed: 'bg-red-50 text-red-700 border border-red-200'
        };
        const labels = {
            pending: 'Chưa thanh toán',
            paid: 'Đã thanh toán',
            refunded: 'Đã hoàn tiền',
            failed: 'Thất bại'
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-slate-100 text-slate-600',
            confirmed: 'bg-sky-100 text-sky-700',
            ongoing: 'bg-amber-100 text-amber-700',
            completed: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-rose-100 text-rose-700'
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-sky-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Chuyến đi của tôi</h1>
                        <p className="text-slate-500 text-sm mt-1">Quản lý lịch sử và trạng thái các dịch vụ đã đặt</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigate('/search')}>Đặt chuyến đi mới</Button>
                </div>
                
                {/* Status Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50">
                        <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Status tabs">
                            {tabs.map((tab) => {
                                const count = tab.id === 'all' 
                                    ? bookings.length 
                                    : bookings.filter(b => b.status === tab.id).length;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            relative px-6 py-4 text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2
                                            ${isActive 
                                                ? 'text-sky-600 bg-white border-b-2 border-sky-600' 
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 border-b-2 border-transparent'}
                                        `}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <span>{tab.label}</span>
                                        <span className={`
                                            px-2 py-0.5 text-[10px] rounded-full font-black
                                            ${isActive ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-500'}
                                        `}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bookings List */}
                    <div className="divide-y divide-slate-100">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Service Image */}
                                    <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                        <img 
                                            src={booking.service?.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300'} 
                                            alt={booking.service?.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Booking Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="font-mono text-xs font-bold text-slate-400">#{booking.booking_code}</span>
                                            {getStatusBadge(booking.status)}
                                            {getPaymentStatusBadge(booking.payment_status)}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-sky-600 transition-colors cursor-pointer" onClick={() => handleDetail(booking)}>
                                            {booking.service?.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-slate-300" />
                                                {formatDate(booking.check_in_date)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CreditCard size={14} className="text-slate-300" />
                                                {formatCurrency(booking.total_amount)}
                                            </div>
                                            <div className="text-sky-500 bg-sky-50 px-2 py-0.5 rounded uppercase tracking-widest text-[9px]">
                                                {booking.service?.type}
                                            </div>
                                            {booking.room_type && (
                                                <div className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-widest text-[9px]">
                                                    🛏️ {booking.room_type.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => handleDetail(booking)} className="gap-1 px-4">
                                            Chi tiết <ExternalLink size={14} />
                                        </Button>
                                        {booking.status === 'pending' && (
                                            <>
                                                {booking.payment_status === 'pending' && (
                                                    <Button variant="primary" size="sm" onClick={() => navigate('/checkout', { state: { service: { ...booking.service, id: booking.service_id } } })}>
                                                        Thanh toán ngay
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => handleCancel(booking.id)} className="text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300">
                                                    Hủy đơn
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {filteredBookings.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                    <AlertCircle size={32} className="text-slate-200" />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-bold">Không tìm thấy chuyến đi nào</p>
                                    <p className="text-slate-400 text-xs">Bạn chưa có đơn đặt chỗ nào trong mục này.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Chi tiết đơn hàng */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="relative h-32 overflow-hidden">
                            <img 
                                src={selectedBooking.service?.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600'} 
                                className="w-full h-full object-cover"
                                alt="Service"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute bottom-4 left-6">
                                <span className="font-mono text-xs font-bold text-white/70 tracking-widest uppercase">Mã đặt chỗ</span>
                                <h2 className="text-xl font-black text-white tracking-widest">#{selectedBooking.booking_code}</h2>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><User size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedBooking.contact_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Calendar size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày đi</p>
                                            <p className="text-sm font-bold text-slate-800">{formatDate(selectedBooking.check_in_date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Users size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedBooking.num_adults} Người, {selectedBooking.num_children} Trẻ em</p>
                                        </div>
                                    </div>
                                    {selectedBooking.room_type && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><BedDouble size={18} /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại phòng</p>
                                                <p className="text-sm font-bold text-purple-600">{selectedBooking.room_type.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    {selectedBooking.payment_status === 'paid' ? (
                                        <>
                                            <div className="bg-white p-2 rounded-xl shadow-sm mb-2">
                                                <img 
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`Mã: ${selectedBooking.booking_code} | Khách: ${selectedBooking.contact_name}`)}`} 
                                                    alt="QR Code"
                                                    className="w-24 h-24"
                                                />
                                            </div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Quét để xác thực</p>
                                        </>
                                    ) : (
                                        <div className="text-center p-2">
                                            <div className="w-16 h-16 mx-auto mb-2 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                                                <AlertCircle size={32} />
                                            </div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight text-slate-400">Vui lòng thanh toán<br/>để nhận mã QR</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-5 mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-500">Dịch vụ</span>
                                    <span className="text-sm font-black text-slate-800">{selectedBooking.service?.name}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                    <span className="text-sky-600 font-bold">Tổng thanh toán</span>
                                    <span className="text-lg font-black text-sky-600">{formatCurrency(selectedBooking.total_amount)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button 
                                    variant="outline" 
                                    className="w-full font-bold py-3"
                                    onClick={() => navigate(`/service/${selectedBooking.service?.slug}`)}
                                >
                                    Xem dịch vụ
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="w-full font-bold py-3"
                                    onClick={() => setSelectedBooking(null)}
                                >
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
