import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getCurrentUser } from '../../../firebase/services/authService';
import axios from 'axios';
import { Star, Send, User, Loader2, MessageSquare } from 'lucide-react';
import Button from '../../common/Button';

const ServiceReviews = ({ serviceId }) => {
    const { currentUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/general/get/services/${serviceId}/feedbacks`);
            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (serviceId) {
            fetchReviews();
        }
    }, [serviceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || submitting || !currentUser) return;

        setSubmitting(true);
        try {
            const fbUser = getCurrentUser();
            if (!fbUser) {
                alert("Bạn cần đăng nhập lại.");
                return;
            }
            const idToken = await fbUser.getIdToken();
            const response = await axios.post(
                `http://localhost:8000/api/services/${serviceId}/feedbacks`,
                { 
                    content: content,
                    rating: rating
                },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                }
            );

            if (response.data.success) {
                setContent('');
                setRating(5);
                // Vì controller trả về feedback mới nạp kèm user
                setReviews([response.data.data, ...reviews]);
            }
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            const errorMsg = error.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.";
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ value, size = 16, interactive = false }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type={interactive ? "button" : "submit"}
                    disabled={!interactive}
                    onClick={() => interactive && setRating(s)}
                    onMouseEnter={() => interactive && setHoverRating(s)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    className={`${interactive ? 'cursor-pointer p-0.5 hover:scale-110 transition-transform' : ''}`}
                >
                    <Star 
                        size={size} 
                        className={`${
                            s <= (interactive && hoverRating ? hoverRating : value) 
                                ? "text-amber-400 fill-amber-400" 
                                : "text-slate-200"
                        } transition-colors`} 
                    />
                </button>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-sky-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Write Review Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <MessageSquare size={24} className="text-sky-500" />
                    Chia sẻ trải nghiệm của bạn
                </h3>
                
                {currentUser ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 overflow-hidden shrink-0 shadow-lg shadow-sky-100 hidden sm:block">
                                {currentUser.photoURL ? (
                                    <img src={currentUser.photoURL} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">
                                        {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <span className="text-sm font-bold text-slate-500">Chất lượng:</span>
                                    <StarRating value={rating} size={24} interactive={true} />
                                    <span className="text-sm font-black text-amber-500 ml-2">
                                        {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : 'Rất tệ'}
                                    </span>
                                </div>

                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Tour này có gì thú vị? Hãy chia sẻ cho mọi người cùng biết nhé..."
                                    className="w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-5 text-sm outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-400 transition-all resize-none min-h-[120px] font-medium leading-relaxed"
                                    disabled={submitting}
                                />
                                
                                <div className="flex justify-end">
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        disabled={!content.trim() || submitting}
                                        className="h-12 px-8 rounded-xl font-black shadow-lg shadow-sky-200"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 size={18} className="animate-spin" />
                                                Đang gửi...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Gửi đánh giá
                                                <Send size={18} />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="bg-slate-50 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200">
                        <User size={48} className="mx-auto text-slate-300 mb-4" />
                        <h4 className="font-bold text-slate-800 mb-2">Bạn chưa đăng nhập?</h4>
                        <p className="text-slate-500 text-sm mb-6">Đăng nhập để chia sẻ cảm nghĩ của bạn về tour này nhé!</p>
                        <Button variant="primary" onClick={() => window.location.href = '/login'} className="px-10 rounded-xl font-black">
                            Đăng nhập ngay
                        </Button>
                    </div>
                )}
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-black text-slate-800">
                        Đánh giá từ cộng đồng ({reviews.length})
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        Sắp xếp: <span className="text-sky-500">Mới nhất</span>
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star size={40} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-black text-lg">Chưa có đánh giá nào.</p>
                        <p className="text-slate-400 text-sm mt-1">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                        {review.user?.avatar_url ? (
                                            <img src={review.user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-500 font-black">
                                                {(review.user?.display_name || "U")[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="font-black text-slate-800 text-[15px]">
                                                    {review.user?.display_name || "Người dùng ẩn danh"}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <StarRating value={review.rating} size={14} />
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                            {review.is_verified && (
                                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-100">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                    Đã trải nghiệm
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 text-[15px] leading-relaxed font-medium mt-3 bg-slate-50/30 p-4 rounded-2xl border border-slate-50">
                                            {review.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceReviews;
