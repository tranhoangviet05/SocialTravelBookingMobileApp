import React, { useState, useEffect } from 'react';
import { useProviderData } from '../../contexts/ProviderDataContext';
import {
    Star, MessageSquare, Send, Loader2, Package, CheckCircle, AlertCircle, Filter, RotateCw, Search
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

const MyReviews = () => {
    const { 
        reviews, fetchReviews, loadingStates, setReviews 
    } = useProviderData();

    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [toast, setToast] = useState(null);
    const [ratingFilter, setRatingFilter] = useState(0); // 0 = all

    const loading = loadingStates.reviews && reviews.length === 0;

    useEffect(() => { 
        fetchReviews(); 
    }, [fetchReviews]);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const handleReply = async (reviewId) => {
        if (!replyText.trim() || sending) return;
        setSending(true);
        try {
            const res = await providerApi.replyReview(reviewId, replyText.trim());
            if (res.success) {
                showToast('Đã gửi phản hồi thành công!');
                setReviews(prev => prev.map(r =>
                    r.id === reviewId
                        ? { ...r, provider_reply: replyText.trim(), provider_reply_at: new Date().toISOString() }
                        : r
                ));
                setReplyingId(null);
                setReplyText('');
            }
        } catch (err) {
            showToast('Lỗi khi gửi phản hồi', 'error');
        } finally {
            setSending(false);
        }
    };

    const renderStars = (rating, size = 14) => (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={size} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
            ))}
        </div>
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return ''; }
    };

    // Stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : 0;
    const repliedCount = reviews.filter(r => r.provider_reply).length;

    // Filter
    const filteredReviews = ratingFilter === 0
        ? reviews
        : reviews.filter(r => r.rating === ratingFilter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đánh giá của khách hàng</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Xem và phản hồi các đánh giá từ khách hàng đã sử dụng dịch vụ.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm nội dung đánh giá, tên khách hàng..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchReviews()}
                        className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                        <RotateCw size={20} />
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            {!loading && totalReviews > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
                        <p className="text-3xl font-black text-emerald-600">{avgRating}</p>
                        <div className="flex justify-center mt-1.5 mb-1">{renderStars(Math.round(avgRating), 16)}</div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Điểm trung bình</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
                        <p className="text-3xl font-black text-slate-900">{totalReviews}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Tổng đánh giá</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
                        <p className="text-3xl font-black text-blue-600">{repliedCount}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Đã phản hồi</p>
                    </div>
                </div>
            )}

            {/* Rating Filter */}
            {!loading && totalReviews > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Filter size={13} /> Lọc theo sao:
                    </span>
                    <button
                        onClick={() => setRatingFilter(0)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${ratingFilter === 0 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
                    >
                        Tất cả ({totalReviews})
                    </button>
                    {[5,4,3,2,1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        if (count === 0) return null;
                        return (
                            <button key={star}
                                onClick={() => setRatingFilter(star)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${ratingFilter === star ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
                            >
                                <Star size={11} className={ratingFilter === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />
                                {star} sao ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-bold">Đang tải đánh giá...</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <MessageSquare size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">
                        {ratingFilter !== 0 ? `Không có đánh giá ${ratingFilter} sao` : 'Chưa có đánh giá nào'}
                    </p>
                    <p className="text-slate-300 text-sm mt-1">Đánh giá sẽ xuất hiện khi khách hàng hoàn thành dịch vụ.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map(review => (
                        <div key={review.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                        {(review.user?.display_name || 'K')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{review.user?.display_name || 'Khách hàng'}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {renderStars(review.rating)}
                                            <span className="text-[10px] text-slate-400 font-bold">{formatDate(review.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Service badge */}
                                <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1.5 flex-shrink-0">
                                    <Package size={11} /> {review.service?.name || 'Dịch vụ'}
                                </span>
                            </div>

                            {/* Review Content */}
                            <div className="ml-[56px]">
                                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                    {review.content || <span className="text-slate-300 italic">(Không có nội dung)</span>}
                                </p>

                                {/* Provider Reply */}
                                {review.provider_reply ? (
                                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
                                                <MessageSquare size={12} className="text-white" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">Phản hồi của bạn</span>
                                            <span className="text-[10px] text-emerald-400 font-medium ml-auto">{formatDate(review.provider_reply_at)}</span>
                                        </div>
                                        <p className="text-sm text-emerald-800 leading-relaxed">{review.provider_reply}</p>
                                    </div>
                                ) : replyingId === review.id ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Nhập phản hồi của bạn cho khách hàng..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
                                            autoFocus
                                            onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleReply(review.id)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setReplyingId(null); setReplyText(''); }}
                                                className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                                                Hủy
                                            </button>
                                            <button disabled={sending || !replyText.trim()}
                                                onClick={() => handleReply(review.id)}
                                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2">
                                                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                Gửi phản hồi
                                            </button>
                                            <span className="text-[11px] text-slate-300 self-center">Ctrl+Enter để gửi</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setReplyingId(review.id); setReplyText(''); }}
                                        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors group">
                                        <MessageSquare size={13} className="group-hover:scale-110 transition-transform" />
                                        Phản hồi đánh giá này
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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

export default MyReviews;
