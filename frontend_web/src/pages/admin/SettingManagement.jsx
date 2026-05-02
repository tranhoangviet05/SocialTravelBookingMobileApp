import React, { useState, useEffect } from 'react';
import { Settings, Save, Bell, Shield, Database, Globe, Percent, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const SettingManagement = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const toast = useNotification();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getSettings();
            if (response.success) {
                const settingsObj = {};
                response.data.forEach(s => {
                    settingsObj[s.key] = s.value;
                });
                setSettings(settingsObj);
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
            toast?.error?.('Không thể tải cấu hình hệ thống');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const response = await adminApi.updateSettings(settings);
            if (response.success) {
                toast?.success?.('Lưu cấu hình thành công');
            }
        } catch (error) {
            console.error('Save settings error:', error);
            toast?.error?.('Lỗi khi lưu cấu hình');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Đang tải cấu hình...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cài đặt hệ thống</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Cấu hình tham số vận hành sàn và các thiết lập bảo mật.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Commission Settings */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
                                <Percent size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Hoa hồng & Thanh toán</h3>
                                <p className="text-xs text-gray-400 font-medium">Thiết lập doanh thu sàn và đối tác.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tỷ lệ hoa hồng sàn (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.commission_rate || ''}
                                        onChange={(e) => handleChange('commission_rate', e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black">%</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tỷ lệ Affiliate (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.affiliate_rate || ''}
                                        onChange={(e) => handleChange('affiliate_rate', e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black">%</span>
                                </div>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Thời gian giải phóng Escrow (Giờ)</label>
                                <input
                                    type="number"
                                    value={settings.escrow_release_after_hours || ''}
                                    onChange={(e) => handleChange('escrow_release_after_hours', e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                                />
                                <div className="flex items-center gap-2 mt-2 px-1">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                    <p className="text-[10px] text-gray-400 font-bold italic">Thời gian chờ sau khi check-in để xác nhận thanh toán an toàn cho Provider.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI & Moderation Settings */}
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-10 shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[100px] pointer-events-none group-hover:bg-sky-500/20 transition-all" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-sky-400 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                    <Sparkles size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">AI & Smart Moderation</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Cấu hình thuật toán kiểm duyệt nội dung</p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngưỡng tin cậy (Confidence Threshold)</label>
                                        <div className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded-lg text-xs font-black border border-sky-500/30">
                                            {settings.ai_moderation_threshold || 0}
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={settings.ai_moderation_threshold || 0.85}
                                        onChange={(e) => handleChange('ai_moderation_threshold', e.target.value)}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-all"
                                    />
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                        Bài viết/Dịch vụ có điểm spam vượt quá ngưỡng này sẽ bị hệ thống tự động gắn cờ vi phạm hoặc từ chối phê duyệt ngay lập tức.
                                    </p>
                                </div>

                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black">Chế độ kiểm duyệt đa tầng</p>
                                        <p className="text-[10px] text-slate-500 font-bold">Kết hợp AI và báo cáo cộng đồng (User Reputation).</p>
                                    </div>
                                    <div className="w-12 h-6 bg-sky-500 rounded-full relative p-1 cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ad Settings */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Quảng cáo & Sàn</h3>
                                <p className="text-xs text-gray-400 font-medium">Thiết lập ngân sách và phạm vi.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ngân sách quảng cáo tối thiểu (VND)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={settings.ad_min_budget || ''}
                                    onChange={(e) => handleChange('ad_min_budget', e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none font-mono"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black">₫</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
                        <button
                            onClick={fetchSettings}
                            className="px-8 py-3.5 bg-white border border-gray-200 rounded-2xl text-xs font-black text-slate-500 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            Hủy thay đổi
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            className="flex items-center gap-2 px-10 py-3.5 bg-sky-500 text-white rounded-2xl text-xs font-black shadow-xl shadow-sky-500/25 hover:bg-sky-600 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Lưu cấu hình hệ thống
                        </button>
                </div>
            </div>
        </div>
    );
};

export default SettingManagement;
