import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, MapPin, Phone, FileText, CheckCircle2,
    ArrowRight, Loader2, Store, Info
} from 'lucide-react';
import providerApi from '../../api/providerApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useProviderData } from '../../contexts/ProviderDataContext';

const SetupProfile = () => {
    const navigate = useNavigate();
    const toast = useNotification();
    const { fetchStats } = useProviderData();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        business_name: '',
        business_type: '',
        phone: '',
        address: '',
        description: ''
    });

    const businessTypes = [
        'Khách sạn / Lưu trú',
        'Công ty du lịch / Tour',
        'Cho thuê phương tiện',
        'Nhà hàng / Ẩm thực',
        'Hoạt động giải trí',
        'Đa dịch vụ',
        'Khác'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await providerApi.setupProfile(formData);
            if (res.success) {
                toast?.success?.('Khởi tạo hồ sơ thành công! Vui lòng chờ Admin phê duyệt.');
                await fetchStats(true); // Cập nhật lại stats để Layout nhận diện trạng thái mới
                navigate('/provider/waiting');
            }
        } catch (error) {
            console.error('Setup profile error:', error);
            toast?.error?.(error.response?.data?.message || 'Có lỗi xảy ra khi khởi tạo hồ sơ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 py-20">
            <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                {/* Left Sidebar - Branding */}
                <div className="md:w-1/3 bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-white flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                            <Store size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black mb-4 leading-tight">Bắt đầu kinh doanh cùng chúng tôi</h1>
                        <p className="text-emerald-100/80 text-sm font-medium leading-relaxed">
                            Chỉ vài bước đơn giản để kết nối dịch vụ của bạn với hàng ngàn du khách.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center text-[10px] font-black">01</div>
                            <p className="text-xs font-bold">Thông tin cơ bản</p>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-black">02</div>
                            <p className="text-xs font-bold">Chờ phê duyệt</p>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-black">03</div>
                            <p className="text-xs font-bold">Kinh doanh ngay</p>
                        </div>
                    </div>
                </div>

                {/* Right Content - Form */}
                <div className="flex-1 p-10 md:p-14">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Khởi tạo hồ sơ</h2>
                        <p className="text-slate-400 text-sm font-bold mt-1">Cung cấp thông tin doanh nghiệp của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tên doanh nghiệp / Cửa hàng <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ví dụ: Sun Travel, Hotel Majestic..."
                                        value={formData.business_name}
                                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-bold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Loại hình kinh doanh <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <select
                                        required
                                        value={formData.business_type}
                                        onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-bold text-slate-800 appearance-none"
                                    >
                                        <option value="">Chọn loại hình...</option>
                                        {businessTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="0123 456 789"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-bold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Địa chỉ trụ sở <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Số nhà, tên đường, quận/huyện..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-bold text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mô tả ngắn về doanh nghiệp</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <textarea
                                    rows="3"
                                    placeholder="Chia sẻ đôi điều về dịch vụ của bạn..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-bold text-slate-800 resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 size={20} className="animate-spin" /> Đang xử lý...</>
                                ) : (
                                    <>Khởi tạo hồ sơ ngay <ArrowRight size={20} /></>
                                )}
                            </button>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-6">
                            <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                                Sau khi khởi tạo, hồ sơ của bạn sẽ ở trạng thái <b>Chờ phê duyệt</b>. Admin sẽ xem xét và kích hoạt tài khoản trong vòng 24h.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SetupProfile;
