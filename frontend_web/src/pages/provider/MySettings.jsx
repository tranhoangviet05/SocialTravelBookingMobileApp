import React, { useState, useEffect } from 'react';
import { useProviderData } from '../../contexts/ProviderDataContext';
import { 
    Store, MapPin, Briefcase, Save, Loader2, 
    CheckCircle, AlertCircle, Building2, UserCircle
} from 'lucide-react';
import providerApi from '../../api/providerApi';

// --- Toast ---
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-[slideInUp_0.3s_ease-out] ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{message}</p>
        </div>
    );
};

const MySettings = () => {
    const { 
        settings, fetchSettings, loadingStates, setSettings 
    } = useProviderData();

    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [profile, setProfile] = useState({
        business_name: '',
        business_type: '',
        address: '',
        status: ''
    });

    const loading = loadingStates.settings && !settings;

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (settings) {
            setProfile(settings);
        }
    }, [settings]);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await providerApi.updateSettings({
                business_name: profile.business_name,
                business_type: profile.business_type,
                address: profile.address
            });
            if (res.success) {
                showToast('Cập nhật thông tin cửa hàng thành công!');
            }
        } catch (err) {
            showToast('Lỗi khi lưu thông tin', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Đang tải cấu hình cửa hàng...</p>
            </div>
        );
    }

    const getStatusText = (status) => {
        const map = {
            'pending': 'Chờ duyệt',
            'approved': 'Đã xác thực',
            'rejected': 'Bị từ chối',
            'suspended': 'Đang khóa'
        };
        return map[status] || status;
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cài đặt của hàng</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý định danh và thông tin kinh doanh của bạn.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Info Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
                            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] mx-auto flex items-center justify-center text-emerald-600 mb-6">
                                <Store size={40} />
                            </div>
                            <h3 className="font-black text-xl text-slate-900 mb-1">{profile.business_name}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{profile.business_type || 'Nhà cung cấp tự do'}</p>
                            
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${profile.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${profile.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                {getStatusText(profile.status)}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative">
                            <div className="relative z-10">
                                <Building2 className="text-white/20 mb-4" size={24} />
                                <h4 className="font-bold text-sm mb-2">Yêu cầu xác thực</h4>
                                <p className="text-[10px] text-white/60 leading-relaxed mb-4">Để rút tiền và quảng bá dịch vụ tốt hơn, vui lòng gửi các giấy tờ pháp lý cần thiết cho Admin.</p>
                                <button className="text-[10px] font-black uppercase bg-white/10 hover:bg-white/20 py-2 px-4 rounded-lg transition-all">Gửi hồ sơ</button>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                        </div>
                    </div>

                    {/* Right Form Card */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
                            <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                        <Store size={14} /> Tên thương hiệu / Doanh nghiệp
                                    </label>
                                    <input 
                                        required 
                                        value={profile.business_name} 
                                        onChange={e => setProfile({...profile, business_name: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all outline-none"
                                        placeholder="Nhập tên doanh nghiệp của bạn" />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                        <Briefcase size={14} /> Lĩnh vực kinh doanh
                                    </label>
                                    <input 
                                        value={profile.business_type || ''} 
                                        onChange={e => setProfile({...profile, business_type: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all outline-none"
                                        placeholder="Ví dụ: Tour du lịch, Cho thuê xe, Lưu trú..." />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                        <MapPin size={14} /> Địa chỉ văn phòng / Store
                                    </label>
                                    <textarea 
                                        rows={3}
                                        value={profile.address || ''} 
                                        onChange={e => setProfile({...profile, address: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all outline-none resize-none"
                                        placeholder="Nhập địa chỉ trụ sở chính" />
                                </div>

                                <div className="pt-4 border-t border-slate-50">
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Lưu thay đổi hồ sơ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <style>{`@keyframes slideInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </>
    );
};

export default MySettings;
