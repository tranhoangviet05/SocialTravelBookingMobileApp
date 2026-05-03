import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Briefcase,
    Mail,
    MapPin,
    Search,
    Plus,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    MoreVertical,
    X,
    ChevronLeft,
    ChevronRight,
    Eye,
    AlertCircle,
    RotateCw
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

import { useAdminData } from '../../contexts/AdminDataContext';

const ProviderManagement = () => {
    const { 
        providers, meta, fetchProviders, loadingStates, setProviders 
    } = useAdminData();

    const providerMeta = meta.providers || { current_page: 1, last_page: 1, total: 0 };
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [statusModal, setStatusModal] = useState({ open: false, provider: null });
    const [newStatus, setNewStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [updating, setUpdating] = useState(false);
    const [detailModal, setDetailModal] = useState({ open: false, provider: null, loading: false });

    const toast = useNotification();
    
    const loading = loadingStates.providers && providers.length === 0;

    useEffect(() => {
        fetchProviders(false, 1, { search: searchTerm, status: filterStatus });
    }, [fetchProviders, filterStatus]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProviders(true, 1, { search: searchTerm, status: filterStatus });
    };

    const handlePageChange = (newPage) => {
        fetchProviders(true, newPage, { search: searchTerm, status: filterStatus });
    };

    const handleViewDetail = async (providerId) => {
        setDetailModal({ open: true, provider: null, loading: true });
        try {
            const response = await adminApi.getProviderDetail(providerId);
            if (response.success) {
                setDetailModal({ open: true, provider: response.data, loading: false });
            }
        } catch (error) {
            console.error('Failed to load provider detail:', error);
            toast?.error?.('Không thể tải chi tiết hồ sơ');
            setDetailModal({ open: false, provider: null, loading: false });
        }
    };

    const handleStatusUpdate = async () => {
        if (!statusModal.provider || !newStatus) return;
        if (newStatus === 'rejected' && !rejectionReason.trim()) {
            toast?.error?.('Vui lòng nhập lý do từ chối');
            return;
        }

        setUpdating(true);
        try {
            const response = await adminApi.updateProviderStatus(
                statusModal.provider.id,
                newStatus,
                newStatus === 'rejected' ? rejectionReason : null
            );
            if (response.success) {
                toast?.success?.('Cập nhật trạng thái thành công');
                setProviders(providers.map(p =>
                    p.id === statusModal.provider.id ? { ...p, status: newStatus } : p
                ));
                setStatusModal({ open: false, provider: null });
                setNewStatus('');
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Failed to update provider status:', error);
            toast?.error?.('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'rejected': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'suspended': return 'text-gray-600 bg-gray-50 border-gray-100';
            case 'not_initialized': return 'text-slate-400 bg-slate-50 border-slate-100 italic';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'approved': return 'Đã duyệt';
            case 'pending': return 'Chờ duyệt';
            case 'rejected': return 'Bị từ chối';
            case 'suspended': return 'Tạm khóa';
            case 'not_initialized': return 'Chưa khởi tạo';
            default: return status;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nhà cung cấp</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Phê duyệt hồ sơ kinh doanh và quản lý {providerMeta.total} đối tác.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm doanh nghiệp, người đại diện, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="h-14 px-6 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ phê duyệt</option>
                            <option value="approved">Đã phê duyệt</option>
                            <option value="rejected">Bị từ chối</option>
                            <option value="suspended">Tạm khóa</option>
                            <option value="not_initialized">Chưa khởi tạo hồ sơ</option>
                        </select>
                        <button onClick={() => fetchProviders(true, 1, { search: searchTerm, status: filterStatus })}
                            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                            <RotateCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải danh sách đối tác...</p>
                    </div>
                ) : (
                    <>
                        <AdminTable
                            headers={['Doanh nghiệp', 'Loại hình', 'Đại diện', 'Ngày tham gia', 'Trạng thái', '']}
                            title="Danh sách đối tác"
                            description={`${providerMeta.total} nhà cung cấp đã đăng ký.`}
                        >
                            {providers.length > 0 ? providers.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{p.business_name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-bold text-gray-400">
                                                    <MapPin size={10} />
                                                    {p.address || 'Chưa cập nhật'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-600 font-medium">
                                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs uppercase font-bold tracking-tight">
                                            {p.business_type || 'Du lịch'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-700">{p.user?.display_name || 'N/A'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{p.user?.email || ''}</p>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-400 font-bold">
                                        {formatDate(p.created_at)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(p.status)}`}>
                                            {getStatusLabel(p.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    if (!p.id) {
                                                        toast?.info?.('Đối tác này chưa khởi tạo hồ sơ.');
                                                        return;
                                                    }
                                                    handleViewDetail(p.id);
                                                }}
                                                className={`p-2 rounded-xl transition-all ${!p.id ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-sky-500 hover:bg-sky-50'}`}
                                                title={!p.id ? 'Chưa có hồ sơ' : 'Xem chi tiết'}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (p.status === 'not_initialized') {
                                                        toast?.warning?.('Đối tác chưa cung cấp thông tin hồ sơ nên không thể xét duyệt.');
                                                        return;
                                                    }
                                                    setStatusModal({ open: true, provider: p });
                                                    setNewStatus(p.status);
                                                }}
                                                className={`p-2 rounded-xl transition-all ${p.status === 'not_initialized' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                title={p.status === 'not_initialized' ? 'Chưa có hồ sơ' : 'Cập nhật trạng thái'}
                                            >
                                                <ShieldCheck size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold">
                                        Không tìm thấy nhà cung cấp nào
                                    </td>
                                </tr>
                            )}
                        </AdminTable>

                        {/* Pagination */}
                        {providerMeta.last_page > 1 && (
                            <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-gray-100 mt-4">
                                <p className="text-sm text-gray-500 font-medium">
                                    Trang {providerMeta.current_page} / {providerMeta.last_page} ({providerMeta.total} bản ghi)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(providerMeta.current_page - 1)}
                                        disabled={providerMeta.current_page <= 1}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(providerMeta.current_page + 1)}
                                        disabled={providerMeta.current_page >= providerMeta.last_page}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

            {/* Status Modal */}
            {statusModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Xét duyệt đối tác</h3>
                                <button onClick={() => setStatusModal({ open: false, provider: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-indigo-50/50 p-4 rounded-2xl mb-6 flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                    <Briefcase size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate">{statusModal.provider?.business_name}</p>
                                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">Hồ sơ: {getStatusLabel(statusModal.provider?.status)}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quyết định xét duyệt</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setNewStatus('approved')}
                                            className={`py-3 px-4 rounded-xl text-xs font-black transition-all border ${newStatus === 'approved' ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            Phê duyệt
                                        </button>
                                        <button
                                            onClick={() => setNewStatus('rejected')}
                                            className={`py-3 px-4 rounded-xl text-xs font-black transition-all border ${newStatus === 'rejected' ? 'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/20' : 'bg-white text-slate-400 border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 mt-2">
                                        <button
                                            onClick={() => setNewStatus('suspended')}
                                            className={`py-3 px-4 rounded-xl text-xs font-black transition-all border ${newStatus === 'suspended' ? 'bg-slate-800 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-white text-slate-400 border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            Tạm khóa hoạt động
                                        </button>
                                    </div>
                                </div>

                                {newStatus === 'rejected' && (
                                    <div className="space-y-2 animate-[modalIn_0.2s_ease-out]">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 text-rose-500">Lý do từ chối (Gửi cho đối tác)</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                                            placeholder="Nêu rõ lý do từ chối hồ sơ này..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setStatusModal({ open: false, provider: null })}
                                    className="flex-1 py-4 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating || !newStatus}
                                    className="flex-[2] py-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                    Xác nhận quyết định
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Chi tiết hồ sơ đối tác</h3>
                                <button onClick={() => setDetailModal({ open: false, provider: null, loading: false })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            {detailModal.loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                                    <p className="text-xs font-bold text-slate-400">Đang tải hồ sơ...</p>
                                </div>
                            ) : detailModal.provider ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                            <Briefcase size={32} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-lg font-black text-slate-900 truncate">{detailModal.provider.business_name}</h4>
                                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{detailModal.provider.business_type || 'Nhà cung cấp dịch vụ'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 align-middle">
                                                <User size={10} className="mt-[-2px]" /> Người đại diện
                                            </p>
                                            <p className="text-sm font-black text-slate-900">{detailModal.provider.user?.display_name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{detailModal.provider.user?.email}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 align-middle">
                                                <Clock size={10} className="mt-[-2px]" /> Ngày đăng ký
                                            </p>
                                            <p className="text-sm font-black text-slate-900">{formatDate(detailModal.provider.created_at)}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Bản ghi hệ thống</p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 align-middle">
                                            <MapPin size={10} className="mt-[-2px]" /> Địa chỉ trụ sở
                                        </p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{detailModal.provider.address || 'Chưa cung cấp địa chỉ chi tiết.'}</p>
                                    </div>

                                    {detailModal.provider.status === 'rejected' && (
                                        <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex gap-3">
                                            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Lý do từ chối trước đó</p>
                                                <p className="text-sm font-medium text-rose-800 leading-relaxed italic">"{detailModal.provider.rejection_reason}"</p>
                                            </div>
                                        </div>
                                    )}

                                    {detailModal.provider.status === 'approved' && detailModal.provider.approver && (
                                        <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                                            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Đã được phê duyệt bởi</p>
                                                <p className="text-sm font-bold text-emerald-900">{detailModal.provider.approver.display_name} <span className="text-emerald-400 font-medium ml-2">• {formatDate(detailModal.provider.approved_at)}</span></p>
                                            </div>
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

export default ProviderManagement;
