import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    CheckCircle, Home, CalendarDays, Download,
    QrCode, Wallet, MapPin, Users, Clock, Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n ?? 0) + 'đ';

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

const Success = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const booking = location.state?.booking;
    const service = location.state?.service;

    // Hiệu ứng pháo giấy ăn mừng
    useEffect(() => {
        const duration = 3500;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 28, spread: 360, ticks: 70, zIndex: 999 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 60 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, colors: ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b'], origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, colors: ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b'], origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const paymentMethodLabel = (method) => {
        if (method === 'wallet') return { label: 'Ví SocialTravel', icon: <Wallet size={14} />, color: 'text-violet-600 bg-violet-50' };
        if (method === 'momo') return { label: 'SePay / Chuyển khoản', icon: <QrCode size={14} />, color: 'text-sky-600 bg-sky-50' };
        return { label: method || 'Trực tuyến', icon: <QrCode size={14} />, color: 'text-sky-600 bg-sky-50' };
    };

    const pm = paymentMethodLabel(booking?.payment_method);

    return (
        <div className="min-h-[90vh] flex items-center justify-center py-14 px-4 bg-gradient-to-br from-slate-50 to-green-50">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-8 sm:p-10 text-center relative overflow-hidden">
                {/* Gradient top */}
                <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-emerald-50 to-transparent pointer-events-none" />

                {/* Icon */}
                <div className="relative mb-6 flex justify-center">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center ring-8 ring-emerald-50">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-2">Đặt dịch vụ thành công!</h1>
                <p className="text-slate-500 text-sm mb-2">
                    Xin chào <strong>{booking?.contact_name || 'Quý khách'}</strong>, đơn đặt chỗ của bạn đã được xác nhận.
                </p>
                {booking?.booking_code && (
                    <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5 mb-8">
                        <span className="text-xs font-bold text-slate-500">Mã đặt chỗ:</span>
                        <span className="font-black text-sky-700 tracking-wider">{booking.booking_code}</span>
                    </div>
                )}

                {/* Order details card */}
                <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left border border-slate-100 space-y-3">
                    <h3 className="font-black text-sm text-slate-800 border-b border-slate-200 pb-2 mb-3">
                        Chi tiết đơn hàng
                    </h3>

                    {service && (
                        <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                            <img
                                src={service.media?.[0]?.url || service.cover_image || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=120'}
                                alt={service.name}
                                className="w-14 h-14 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0">
                                <p className="font-black text-sm text-slate-800 line-clamp-2">{service.name}</p>
                                <p className="text-xs text-slate-400">{service.provider?.business_name || 'Nhà cung cấp'}</p>
                                {service.location && (
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                        <MapPin size={11} /> {service.location.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2.5 text-sm">
                        {booking?.check_in_date && (
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1.5 text-slate-500">
                                    <Clock size={13} />
                                    {service?.type === 'hotel' || service?.type === 'homestay' ? 'Check-in' : 'Ngày tham gia'}
                                </span>
                                <span className="font-bold text-slate-800">{formatDate(booking.check_in_date)}</span>
                            </div>
                        )}
                        {booking?.check_out_date && (
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1.5 text-slate-500"><Clock size={13} />Check-out</span>
                                <span className="font-bold text-slate-800">{formatDate(booking.check_out_date)}</span>
                            </div>
                        )}
                        {(booking?.num_adults || booking?.num_children) && (
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1.5 text-slate-500"><Users size={13} />Khách</span>
                                <span className="font-bold text-slate-800">
                                    {[
                                        booking.num_adults > 0 ? `${booking.num_adults} người lớn` : null,
                                        booking.num_children > 0 ? `${booking.num_children} trẻ em` : null,
                                    ].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                        {booking?.coupon_code && (
                            <div className="flex justify-between text-emerald-600">
                                <span className="flex items-center gap-1.5"><Tag size={13} />Mã giảm giá</span>
                                <span className="font-black">{booking.coupon_code}</span>
                            </div>
                        )}
                        {booking?.discount_amount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Giảm giá</span>
                                <span className="font-black">-{fmt(booking.discount_amount)}</span>
                            </div>
                        )}
                    </div>

                    {/* Total + Payment method */}
                    <div className="border-t border-slate-200 pt-3 mt-2 flex justify-between items-center">
                        <span className="font-bold text-slate-800">Tổng tiền đã trả</span>
                        <span className="text-2xl font-black text-emerald-600">{fmt(booking?.total_amount)}</span>
                    </div>
                    {booking?.payment_method && (
                        <div className="flex justify-end">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${pm.color}`}>
                                {pm.icon} {pm.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Email confirm note */}
                <p className="text-xs text-slate-400 mb-6">
                    📧 Chúng tôi đã gửi email xác nhận chi tiết đến <strong>{booking?.contact_email || 'email của bạn'}</strong>
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-sky-200">
                        <CalendarDays size={18} />
                        Quản lý vé của tôi
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-5 rounded-2xl transition-all">
                        <Home size={18} />
                    </button>
                    <button
                        className="sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-2xl transition-all"
                        title="Tải biên lai PDF">
                        <Download size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Success;
