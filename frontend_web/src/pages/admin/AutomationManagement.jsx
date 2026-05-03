import React, { useState, useEffect } from 'react';
import {
    Zap,
    Link2,
    Settings2,
    Activity,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    ExternalLink,
    Pause,
    Loader2,
    RotateCw,
    Search,
    Play
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const AutomationManagement = () => {
    const [workflows, setWorkflows] = useState([]);
    const [connection, setConnection] = useState({ status: 'offline', url: '', version: '' });
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useNotification();

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getAutomationWorkflows();
            if (response.success) {
                setWorkflows(response.data);
                setConnection(response.connection);
            }
        } catch (error) {
            console.error('Fetch workflows error:', error);
            toast?.error?.('Không thể kết nối với hệ thống n8n');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        setTogglingId(id);
        try {
            const response = await adminApi.toggleAutomationWorkflow(id);
            if (response.success) {
                toast?.success?.('Đã cập nhật trạng thái workflow');
                setWorkflows(prev => prev.map(wf =>
                    wf.id === id ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' } : wf
                ));
            }
        } catch (error) {
            console.error('Toggle workflow error:', error);
            toast?.error?.('Lỗi khi điều khiển workflow');
        } finally {
            setTogglingId(null);
        }
    };

    const filteredWorkflows = workflows.filter(wf => 
        wf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wf.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tự động hóa (n8n Workflow)</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các kịch bản Marketing và Chăm sóc khách hàng tự động.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm tên workflow..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>
                    <button onClick={fetchWorkflows}
                        className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                        <RotateCw size={20} />
                    </button>
                </div>
            </div>

            {/* Connection Status Card */}
            <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Zap className="text-amber-400 fill-amber-400" size={36} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">N8N ENGINE CONNECTED</h3>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 ${connection.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${connection.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{connection.status === 'online' ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm mt-1 font-mono">{connection.url} <span className="text-slate-700 ml-2">[{connection.version}]</span></p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchWorkflows}
                            className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black transition-all hover:translate-y-[-1px]"
                        >
                            <RotateCcw size={16} /> RE-SCAN
                        </button>
                        <button className="flex items-center gap-3 px-10 py-4 bg-sky-500 hover:bg-sky-600 rounded-2xl text-xs font-black shadow-2xl shadow-sky-500/30 transition-all hover:translate-y-[-2px] active:translate-y-[0px]">
                            <Settings2 size={18} /> API CONFIG
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px] -mr-48 -mt-48 transition-opacity duration-1000 group-hover:opacity-100 opacity-60" />
            </div>

            {/* Workflow List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                    <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-bold tracking-tight">Cầu hình n8n đang được đồng bộ...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AdminTable
                        headers={['Tên luồng công việc', 'Trạng thái', 'Lần chạy cuối', 'Tỷ lệ thành công', 'Webhook URL', '']}
                        title="Kịch bản tự động hóa"
                        description="Danh sách các workflow đang kết nối với hệ thống n8n."
                    >
                        {filteredWorkflows.map((wf) => (
                            <tr key={wf.id} className="group hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0">
                                <td className="px-8 py-6">
                                    <div className="max-w-xs">
                                        <p className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors uppercase tracking-tight">{wf.name}</p>
                                        <p className="text-[11px] text-gray-400 font-bold mt-1 line-clamp-1 italic">{wf.desc}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-fit ${wf.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/5'
                                        : 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/5'
                                        }`}>
                                        {wf.status === 'active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{wf.status === 'active' ? 'ACTIVE' : 'PAUSED'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-xs font-black text-slate-400 tabular-nums">{wf.lastRun}</td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-sky-500 rounded-full" style={{ width: wf.successRate }} />
                                        </div>
                                        <span className="text-xs font-black text-slate-900">{wf.successRate}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-gray-100 w-fit group-hover:bg-white group-hover:text-sky-500 transition-colors cursor-pointer active:scale-95">
                                        <Link2 size={12} />
                                        {wf.webhook.slice(0, 30)}...
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <button
                                            onClick={() => toggleStatus(wf.id)}
                                            disabled={togglingId === wf.id}
                                            className={`p-2.5 rounded-2xl shadow-sm transition-all active:scale-90 ${wf.status === 'active'
                                                ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                                }`}
                                            title={wf.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                                        >
                                            {togglingId === wf.id ? <Loader2 size={20} className="animate-spin" /> : (wf.status === 'active' ? <Pause size={20} /> : <Play size={20} />)}
                                        </button>
                                        <button className="p-2.5 bg-white text-slate-400 hover:text-sky-500 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-90">
                                            <ExternalLink size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                </div>
            )}

            {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'Tổng số lần Trigger', value: '12,854', icon: Activity, color: 'text-sky-500', bg: 'bg-sky-50' },
                        { label: 'Tiết kiệm thời gian', value: '450 giờ', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                        { label: 'Tỷ lệ chuyển đổi', value: '+12.5%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all hover:translate-y-[-4px]">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{stat.value}</p>
                            </div>
                            <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all group-hover:scale-110 ${stat.bg} ${stat.color}`}>
                                <stat.icon size={28} />
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default AutomationManagement;
