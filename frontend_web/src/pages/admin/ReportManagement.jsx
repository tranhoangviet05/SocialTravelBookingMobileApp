import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    AlertCircle,
    CheckCircle2,
    MoreHorizontal,
    User,
    Loader2,
    ChevronLeft,
    ChevronRight,
    X,
    MessageSquare,
    Eye,
    ShieldOff,
    Search,
    RotateCw,
    Flag
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [resolveModal, setResolveModal] = useState({ open: false, report: null });
    const [resolutionNote, setResolutionNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailModal, setDetailModal] = useState({ open: false, report: null, loading: false });

    const toast = useNotification();

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReports(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [filterStatus, searchTerm]);

    const fetchReports = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 8 };
            if (filterStatus) params.status = filterStatus;
            if (searchTerm) params.search = searchTerm;

            const response = await adminApi.getAllReports(params);
            if (response.success) {
                setReports(response.data);
                setMeta(response.meta || { current_page: 1, last_page: 1, total: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            toast?.error?.('Không thể tải danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (id) => {
        setDetailModal({ open: true, report: null, loading: true });
        try {
            const response = await adminApi.getReportDetail(id);
            if (response.success) {
                setDetailModal({ open: true, report: response.data, loading: false });
            }
        } catch (error) {
            console.error('Fetch report detail error:', error);
            toast?.error?.('Không thể tải chi tiết báo cáo');
        }
    };

    const handleResolve = async (status) => {
        if (!resolutionNote.trim()) {
            toast?.error?.('Vui lòng nhập ghi chú xử lý');
            return;
        }

        setSubmitting(true);
        try {
            const response = await adminApi.resolveReport(resolveModal.report.id, {
                status,
                resolution_note: resolutionNote
            });
            if (response.success) {
                toast?.success?.('Đã cập nhật trạng thái báo cáo');
                fetchReports(meta.current_page);
                setResolveModal({ open: false, report: null });
                setResolutionNote('');
            }
        } catch (error) {
            console.error('Resolve report error:', error);
            toast?.error?.('Lỗi khi xử lý báo cáo');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'resolved': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'dismissed': return 'text-gray-400 bg-gray-50 border-gray-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Chờ xử lý';
            case 'resolved': return 'Đã giải quyết';
            case 'dismissed': return 'Đã bác bỏ';
            default: return status;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'spam': return 'Rác / Quảng cáo';
            case 'fraud': return 'Lừa đảo';
            case 'inappropriate': return 'Không phù hợp';
            case 'misleading': return 'Sai sự thật';
            default: return type;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Báo cáo & Vi phạm</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Xử lý {meta.total} báo cáo từ cộng đồng về nội dung và người dùng.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm báo cáo..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="h-14 px-6 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="resolved">Đã giải quyết</option>
                            <option value="dismissed">Đã bác bỏ</option>
                        </select>
                        <button onClick={() => fetchReports(meta.current_page)}
                            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                            <RotateCw size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải danh sách báo cáo...</p>
                    </div>
                ) : (
                    <>
                        <AdminTable
                            headers={['Loại báo cáo', 'Nội dung', 'Người báo cáo', 'Sự kiện/Dịch vụ', 'Trạng thái', '']}
                            title="Danh sách báo cáo"
                            description={`${meta.total} yêu cầu khiếu nại.`}
                        >
                            {reports.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 w-fit">
                                                {getTypeLabel(r.type)}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">ID: {r.id.split('-')[0]}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm text-slate-700 font-medium max-w-[200px] line-clamp-2">{r.description || 'Không có mô tả chi tiết.'}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-600">{r.reporter?.display_name || 'Khách'}</p>
                                                <p className="text-[10px] text-gray-300 font-bold">{formatDate(r.created_at)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-black text-indigo-600 truncate max-w-[150px]">{r.service?.name || r.post_id || 'N/A'}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(r.status)}`}>
                                            {getStatusLabel(r.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleViewDetail(r.id)}
                                                className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {r.status === 'pending' && (
                                                <button
                                                    onClick={() => setResolveModal({ open: true, report: r })}
                                                    className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                    title="Xử lý"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </AdminTable>

                        {meta.last_page > 1 && (
                            <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-gray-100 mt-4">
                                <p className="text-sm text-gray-500 font-medium whitespace-nowrap">Trang {meta.current_page} / {meta.last_page}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchReports(meta.current_page - 1)}
                                        disabled={meta.current_page <= 1}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => fetchReports(meta.current_page + 1)}
                                        disabled={meta.current_page >= meta.last_page}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Resolve Modal */}
                {resolveModal.open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                            <div className="p-8">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <Flag className="text-rose-500" size={24} /> Xử lý báo cáo vi phạm
                                </h3>

                                <div className="space-y-5">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nội dung báo cáo</p>
                                        <p className="text-sm font-medium text-slate-700 italic">"{resolveModal.report?.description}"</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Ghi chú giải quyết / Lý do</label>
                                        <textarea
                                            required
                                            value={resolutionNote}
                                            onChange={(e) => setResolutionNote(e.target.value)}
                                            className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                            placeholder="Nhập thông tin xử lý hoặc lý do vì sao bác bỏ báo cáo này..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleResolve('dismissed')}
                                            disabled={submitting}
                                            className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShieldOff size={16} /> Bác bỏ
                                        </button>
                                        <button
                                            onClick={() => handleResolve('resolved')}
                                            disabled={submitting}
                                            className="py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            Giải quyết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {detailModal.open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900">Chi tiết báo cáo</h3>
                                    <button onClick={() => setDetailModal({ open: false, report: null, loading: false })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                {detailModal.loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                    </div>
                                ) : detailModal.report ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-2xl">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Loại vi phạm</p>
                                                <p className="text-sm font-black text-rose-500">{getTypeLabel(detailModal.report.type)}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                                                <p className="text-sm font-black uppercase tracking-tight">{getStatusLabel(detailModal.report.status)}</p>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-slate-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thông tin người báo cáo</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 text-slate-400 font-bold">
                                                    {detailModal.report.reporter?.display_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{detailModal.report.reporter?.display_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{detailModal.report.reporter?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Nội dung bị báo cáo (Dịch vụ/Bài viết)</p>
                                            <p className="text-sm font-black text-indigo-900">{detailModal.report.service?.name || detailModal.report.post_id || 'Không xác định'}</p>
                                            {detailModal.report.service?.provider?.user && (
                                                <p className="text-[10px] text-indigo-400 font-bold mt-1">Chủ quản: {detailModal.report.service.provider.user.display_name}</p>
                                            )}
                                        </div>

                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả vi phạm</p>
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">"{detailModal.report.description}"</p>
                                        </div>

                                        {detailModal.report.resolution_note && (
                                            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <CheckCircle2 size={12} /> Ghi chú giải quyết ({detailModal.report.reviewer?.display_name})
                                                </p>
                                                <p className="text-sm text-emerald-900 font-bold">{detailModal.report.resolution_note}</p>
                                                <p className="text-[10px] text-emerald-500 font-bold mt-1">{formatDate(detailModal.report.reviewed_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
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

export default ReportManagement;
