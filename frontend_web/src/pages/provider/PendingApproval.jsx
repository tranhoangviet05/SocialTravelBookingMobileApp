import React from 'react';
import {
    Clock, CheckCircle2, ShieldAlert, ArrowLeft,
    RefreshCw, Mail, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProviderData } from '../../contexts/ProviderDataContext';

const PendingApproval = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { fetchStats, stats } = useProviderData();

    const handleCheckStatus = async () => {
        await fetchStats(true);
        if (stats?.provider_status === 'approved') {
            navigate('/provider/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
            <div className="max-w-xl w-full text-center">
                <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-amber-100 rounded-[2.5rem] flex items-center justify-center text-amber-600 animate-pulse">
                        <Clock size={40} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={24} />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Đang chờ phê duyệt</h1>
                <p className="text-slate-500 font-medium leading-relaxed mb-10">
                    Cảm ơn bạn đã khởi tạo hồ sơ! Thông tin của bạn đang được Admin xem xét. Quá trình này thường mất tối đa <span className="text-emerald-600 font-black">24 giờ</span> làm việc.
                </p>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 space-y-6">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái hiện tại</p>
                            <p className="text-sm font-black text-amber-600">Đang được xem xét</p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-50 w-full" />

                    <div className="space-y-4">
                        <button
                            onClick={handleCheckStatus}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} /> Kiểm tra lại trạng thái
                        </button>
                        <button
                            onClick={() => window.location.href = 'mailto:support@socialtravel.vn'}
                            className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Mail size={18} /> Liên hệ hỗ trợ
                        </button>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-slate-400 hover:text-rose-500 font-bold text-sm mx-auto transition-colors"
                >
                    <ArrowLeft size={16} /> Đăng xuất tài khoản
                </button>

                <div className="mt-12 flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                            <MessageSquare size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Hỗ trợ 24/7</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <ShieldAlert size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Bảo mật cao</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
