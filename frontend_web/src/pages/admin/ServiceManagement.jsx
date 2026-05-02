import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    Compass,
    Hotel,
    Car,
    Home,
    MapPin,
    Tag,
    Star,
    MoreVertical,
    Loader2,
    CheckCircle2,
    XCircle,
    Eye,
    Edit3,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';

const ServiceManagement = () => {
    const { services, meta, loadingStates, fetchServices, setServices } = useAdminData();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [actionMenuId, setActionMenuId] = useState(null);
    const [statusModal, setStatusModal] = useState({ open: false, service: null });
    const [newStatus, setNewStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [updating, setUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const toast = useNotification();

    const activeMeta = meta?.services || { current_page: 1, last_page: 1, total: 0 };

    const doFetchServices = async (page = 1) => {
        const params = { page, per_page: 8 };
        if (searchTerm) params.search = searchTerm;
        if (filterType) params.type = filterType;
        if (filterStatus) params.status = filterStatus;
        await fetchServices(true, params);
    };

    useEffect(() => {
        fetchServices(false, { page: 1, per_page: 8 });
    }, []);

    useEffect(() => {
        doFetchServices(currentPage);
    }, [filterType, filterStatus, currentPage]);

    const fetchPage = async (page = 1) => {
        setCurrentPage(page);
        await doFetchServices(page);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        doFetchServices(1);
    };

    const handleStatusUpdate = async () => {
        if (!statusModal.service || !newStatus) return;
        if (newStatus === 'rejected' && !rejectionReason.trim()) {
            toast?.error?.('Vui lòng nhập lý do từ chối');
            return;
        }

        setUpdating(true);
        try {
            const response = await adminApi.updateServiceStatus(
                statusModal.service.id,
                newStatus,
                newStatus === 'rejected' ? rejectionReason : null
            );
            if (response.success) {
                toast?.success?.('Cập nhật trạng thái thành công');
                setServices(services.map(s =>
                    s.id === statusModal.service.id ? { ...s, status: newStatus } : s
                ));
                setStatusModal({ open: false, service: null });
                setNewStatus('');
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast?.error?.('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa dịch vụ này? (Có thể khôi phục lại)')) return;
        try {
            const response = await adminApi.deleteService(id);
            if (response.success) {
                toast?.success?.('Xóa dịch vụ thành công');
                setServices(services.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error('Delete service error:', error);
            toast?.error?.('Không thể xóa dịch vụ');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'tour': return <Compass className="text-sky-500" size={16} />;
            case 'hotel': return <Hotel className="text-emerald-500" size={16} />;
            case 'homestay': return <Home className="text-amber-500" size={16} />;
            case 'vehicle': return <Car className="text-indigo-500" size={16} />;
            default: return <Tag className="text-gray-500" size={16} />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'tour': return 'Tour';
            case 'hotel': return 'Khách sạn';
            case 'homestay': return 'Homestay';
            case 'vehicle': return 'Di chuyển';
            default: return type;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending_review': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'draft': return 'bg-gray-50 text-gray-500 border-gray-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'pending_review': return 'Chờ duyệt';
            case 'draft': return 'Bản nháp';
            case 'rejected': return 'Từ chối';
            default: return status;
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0₫';
        return Number(price).toLocaleString('vi-VN') + '₫';
    };

    return (
        <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ & Tours</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Quản lý {activeMeta.total} dịch vụ trên toàn hệ thống.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên dịch vụ, địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:shadow-md transition-all font-medium"
                        />
                    </form>
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none cursor-pointer"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="tour">Tour</option>
                            <option value="hotel">Khách sạn</option>
                            <option value="homestay">Homestay</option>
                            <option value="vehicle">Di chuyển</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none cursor-pointer"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="pending_review">Chờ duyệt</option>
                            <option value="draft">Bản nháp</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loadingStates.isLoadingServices ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải danh sách dịch vụ...</p>
                    </div>
                ) : (
                    <>
                        <AdminTable
                            headers={['Dịch vụ', 'Loại', 'Nhà cung cấp', 'Giá cơ bản', 'Đánh giá', 'Trạng thái', '']}
                            title="Tất cả dịch vụ"
                            description={`Tổng cộng ${activeMeta.total} dịch vụ.`}
                        >
                            {services.length > 0 ? services.map((svc) => (
                                <tr key={svc.id} className="hover:bg-gray-50/50 transition-colors group relative">
                                    <td className="px-8 py-5">
                                        <div className="max-w-[300px]">
                                            <p className="text-sm font-black text-slate-900 truncate leading-tight">{svc.name}</p>
                                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-gray-400">
                                                <MapPin size={10} />
                                                {svc.location?.name || svc.address || 'Chưa có'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                        <div className="flex items-center gap-2 uppercase tracking-wide text-[10px]">
                                            {getTypeIcon(svc.type)}
                                            {getTypeLabel(svc.type)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                            {svc.provider?.user?.display_name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-black text-slate-900">{formatPrice(svc.base_price)}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-1">
                                            <Star size={14} className="text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-black text-slate-700">{svc.rating_avg || '0.0'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(svc.status)} uppercase tracking-tight`}>
                                            {getStatusLabel(svc.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right relative">
                                        <button
                                            onClick={() => setActionMenuId(actionMenuId === svc.id ? null : svc.id)}
                                            className="p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-xl transition-all"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {actionMenuId === svc.id && (
                                            <div className="absolute right-8 top-14 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-48 z-50">
                                                <button
                                                    onClick={() => {
                                                        setStatusModal({ open: true, service: svc });
                                                        setNewStatus(svc.status);
                                                        setActionMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                    Thay đổi trạng thái
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDelete(svc.id);
                                                        setActionMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                    Xóa dịch vụ
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-8 py-16 text-center text-gray-400 font-bold">
                                        Không tìm thấy dịch vụ nào
                                    </td>
                                </tr>
                            )}
                        </AdminTable>

                        {/* Pagination */}
                        {activeMeta.last_page > 1 && (
                            <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium">
                                    Trang {activeMeta.current_page} / {activeMeta.last_page} ({activeMeta.total} kết quả)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchPage(activeMeta.current_page - 1)}
                                        disabled={activeMeta.current_page <= 1}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => fetchPage(activeMeta.current_page + 1)}
                                        disabled={activeMeta.current_page >= activeMeta.last_page}
                                        className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-slate-900 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

            {/* Status Update Modal */}
            {statusModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setStatusModal({ open: false, service: null })} />
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-slate-900">Cập nhật trạng thái</h3>
                                <button onClick={() => setStatusModal({ open: false, service: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                                <p className="text-sm font-black text-slate-900 truncate">{statusModal.service?.name}</p>
                                <p className="text-xs text-gray-400 mt-1">Trạng thái hiện tại: <span className="font-bold">{getStatusLabel(statusModal.service?.status)}</span></p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Trạng thái mới</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                    >
                                        <option value="draft">Bản nháp</option>
                                        <option value="pending_review">Chờ duyệt</option>
                                        <option value="active">Hoạt động</option>
                                        <option value="rejected">Từ chối</option>
                                    </select>
                                </div>

                                {newStatus === 'rejected' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Lý do từ chối</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none font-medium"
                                            placeholder="Nhập lý do từ chối dịch vụ..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setStatusModal({ open: false, service: null })}
                                    className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updating}
                                    className="flex-[2] py-4 bg-sky-500 hover:bg-sky-600 text-white text-sm font-black rounded-2xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    Cập nhật
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

export default ServiceManagement;
