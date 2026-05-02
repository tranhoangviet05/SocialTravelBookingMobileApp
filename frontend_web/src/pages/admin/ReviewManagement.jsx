import React, { useState, useEffect } from 'react';
import {
    Search,
    Star,
    MessageSquare,
    Send,
    Filter,
    Calendar,
    User,
    ExternalLink,
    CheckCircle2,
    X,
    Loader2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MessageCircle
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [filterReplied, setFilterReplied] = useState('');
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [replyModal, setReplyModal] = useState({ isOpen: false, review: null });
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const toast = useNotification();

    useEffect(() => {
        fetchReviews();
    }, [filterRating, filterReplied]);

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 8 };
            if (searchTerm) params.search = searchTerm;
            if (filterRating) params.rating = filterRating;
            if (filterReplied) params.replied = filterReplied;

            const response = await adminApi.getAllReviews(params);
            if (response.success) {
                setReviews(response.data);
                setMeta(response.meta || { current_page: 1, last_page: 1, total: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast?.error?.('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReviews();
    };

    const handleOpenReply = (review) => {
        setReplyModal({ isOpen: true, review });
        setReplyText(review.provider_reply || '');
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            const response = await adminApi.replyToReview(replyModal.review.id, replyText);
            if (response.success) {
                toast?.success?.('Gửi phản hồi thành công');
                setReviews(reviews.map(rv =>
                    rv.id === replyModal.review.id
                        ? { ...rv, provider_reply: replyText, provider_reply_at: new Date() }
                        : rv
                ));
                setReplyModal({ isOpen: false, review: null });
                setReplyText('');
            }
        } catch (error) {
            console.error('Reply review error:', error);
            toast?.error?.('Không thể gửi phản hồi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
        try {
            const response = await adminApi.deleteReview(id);
            if (response.success) {
                toast?.success?.('Đã xóa đánh giá');
                setReviews(reviews.filter(rv => rv.id !== id));
            }
        } catch (error) {
            console.error('Delete review error:', error);
            toast?.error?.('Không thể xóa đánh giá');
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={12}
                        className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Đánh giá</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Theo dõi phản hồi từ khách hàng và điều phối nội dung.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm nội dung, tên khách hàng, mã dịch vụ..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    <div className="flex gap-2">
                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none"
                        >
                            <option value="">Tất cả điểm</option>
                            <option value="5">5 Sao</option>
                            <option value="4">4 Sao</option>
                            <option value="3">3 Sao</option>
                            <option value="2">2 Sao</option>
                            <option value="1">1 Sao</option>
                        </select>
                        <select
                            value={filterReplied}
                            onChange={(e) => setFilterReplied(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none"
                        >
                            <option value="">Trạng thái phản hồi</option>
                            <option value="false">Chưa phản hồi</option>
                            <option value="true">Đã phản hồi</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải đánh giá...</p>
                    </div>
                ) : (
                    <>
                        <AdminTable
                            headers={['Khách hàng', 'Dịch vụ', 'Đánh giá', 'Nội dung', 'Trạng thái', '']}
                            title="Danh sách đánh giá"
                            description={`${meta.total} phản hồi từ khách hàng.`}
                        >
                            {reviews.length > 0 ? reviews.map((rv) => (
                                <tr key={rv.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {rv.user?.avatar_url ? (
                                                <img src={rv.user.avatar_url} className="w-8 h-8 rounded-full border border-gray-100 object-cover" alt="avatar" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                    {rv.user?.display_name?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{rv.user?.display_name || 'Khách ẩn danh'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{rv.user?.email || ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="max-w-[150px]">
                                            <p className="text-xs font-black text-indigo-600 truncate">{rv.service?.name}</p>
                                            <p className="text-[10px] text-gray-300 font-bold uppercase mt-0.5 tracking-wider">CODE: {rv.booking?.booking_code || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {renderStars(rv.rating)}
                                        <span className="text-[10px] font-bold text-gray-400 mt-1 block">{formatDate(rv.created_at)}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm text-slate-600 font-medium max-w-[250px] line-clamp-2">{rv.content}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        {rv.provider_reply ? (
                                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-fit">
                                                <CheckCircle2 size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">Đã trả lời</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
                                                <MessageCircle size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Chưa phản hồi</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenReply(rv)}
                                                className="p-2 text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                                                title="Trả lời"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rv.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Xóa đánh giá"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold">
                                        Không tìm thấy đánh giá nào
                                    </td>
                                </tr>
                            )}
                        </AdminTable>

                        {/* Pagination */}
                        {meta.last_page > 1 && (
                            <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-gray-100 mt-4">
                                <p className="text-sm text-gray-500 font-medium">Trang {meta.current_page} / {meta.last_page}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchReviews(meta.current_page - 1)}
                                        disabled={meta.current_page <= 1}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => fetchReviews(meta.current_page + 1)}
                                        disabled={meta.current_page >= meta.last_page}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Reply Modal */}
                {replyModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReplyModal({ isOpen: false, review: null })} />
                        <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-slate-900">Phản hồi khách hàng</h3>
                                    <button onClick={() => setReplyModal({ isOpen: false, review: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest leading-none">{replyModal.review?.user?.display_name}</span>
                                        </div>
                                        {renderStars(replyModal.review?.rating)}
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium italic leading-relaxed">"{replyModal.review?.content}"</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nội dung phản hồi từ hệ thống</label>
                                    <textarea
                                        className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all font-medium resize-none"
                                        placeholder="Gửi lời cảm ơn hoặc giải đáp thắc mắc..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={() => setReplyModal({ isOpen: false, review: null })}
                                        className="flex-1 py-4 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={submitting || !replyText.trim()}
                                        className="flex-[2] py-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        {replyModal.review?.provider_reply ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}
                                    </button>
                                </div>
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

export default ReviewManagement;
