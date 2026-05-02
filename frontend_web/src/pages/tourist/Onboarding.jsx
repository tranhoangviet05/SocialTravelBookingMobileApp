// v3 - Final Sync Fix - Refresh Autoloader & Controllers
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../firebase/services/authService';
import authApi from '../../api/authApi';
import { User, AtSign, FileText, Camera, ArrowRight } from 'lucide-react';


const SocialOnboarding = ({ onSyncSuccess }) => {
    const { currentUser, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        displayName: '',
        avatarUrl: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cập nhật formData khi currentUser đã sẵn sàng
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                displayName: currentUser.displayName || currentUser.display_name || '',
                avatarUrl: currentUser.photoURL || currentUser.avatar_url || ''
            }));
        }
    }, [currentUser]);

    const handleSync = async () => {
        setErrors({});
        setSubmitError('');
        
        if (!currentUser) return;
        setIsSubmitting(true);

        try {
            const firebaseUser = getCurrentUser();
            if (!firebaseUser) {
                setIsSubmitting(false);
                return;
            }

            const idToken = await firebaseUser.getIdToken();

            // Log payload để debug
            console.log('Payload gửi đi:', formData);

            const response = await authApi.syncSocialProfile(idToken, formData);
            console.log('Đồng bộ thành công', response.data);

            await refreshProfile();
            
            // Đợi một chút để người dùng thấy hiệu ứng chuyển cảnh mượt mà
            setTimeout(() => {
                if (onSyncSuccess) onSyncSuccess();
                navigate('/newsfeed', { replace: true });
            }, 1500);

        } catch (error) {
            setIsSubmitting(false);
            console.error('Lỗi đồng bộ', error);
            if (error.response?.status === 422) {
                // Hiện lỗi validation từ Backend
                const backendErrors = error.response.data?.errors || {};
                setErrors(backendErrors);
                console.log('Validation errors:', backendErrors);
            } else {
                setSubmitError(error.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 mt-10">
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center transition-all animate-in fade-in duration-500">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-sky-500/10 rounded-full animate-pulse flex items-center justify-center">
                                <div className="w-2 h-2 bg-sky-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent mb-2">
                            Đang chuẩn bị không gian cho bạn
                        </h2>
                        <p className="text-gray-500 animate-pulse">Vui lòng đợi Social Travel trong giây lát...</p>
                    </div>
                </div>
            )}

            <div className={`max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100 transition-all duration-500 ${isSubmitting ? 'blur-sm scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <img
                            src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || 'User')}&background=random`}
                            className="w-24 h-24 rounded-full border-4 border-sky-100 object-cover mx-auto bg-gray-100"
                            alt="Avatar"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || 'User')}&background=random`;
                            }}
                        />
                        <button className="absolute bottom-0 right-0 bg-sky-500 text-white p-2 rounded-full border-2 border-white cursor-pointer hover:bg-sky-600 transition-colors">
                            <Camera size={16} />
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mt-4">Hoàn thiện hồ sơ</h1>
                    <p className="text-gray-500 text-sm">Chỉ một bước nữa để kết nối với cộng đồng Social Travel</p>
                </div>

                <div className="space-y-5">
                    {/* Username - Rất quan trọng cho Social */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tên người dùng (@username)</label>
                        <div className="relative">
                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="viet_traveler"
                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:ring-2 outline-none transition-all ${
                                    errors.username ? 'ring-2 ring-red-400' : 'focus:ring-sky-500'
                                }`}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.username[0]}</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Giới thiệu ngắn</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
                            <textarea
                                rows="3"
                                placeholder="Chia sẻ niềm đam mê du lịch của bạn..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>
                        {errors.bio && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.bio[0]}</p>
                        )}
                    </div>

                    {submitError && (
                        <p className="text-red-500 text-sm text-center">{submitError}</p>
                    )}

                    <button
                        onClick={handleSync}
                        className="w-full py-4 bg-[#00AEEF] text-white rounded-2xl font-bold shadow-lg shadow-sky-100 cursor-pointer hover:brightness-105 transition-all flex items-center justify-center gap-2 group"
                    >
                        Bắt đầu khám phá
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SocialOnboarding;