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
    ChevronRight,
    RotateCw,
    Clock,
    FileText,
    Image as ImageIcon,
    ShieldCheck,
    Info,
    Calendar,
    Users,
    Map
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
    const [detailModal, setDetailModal] = useState({ open: false, service: null, loading: false });
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

    const handleViewDetail = async (id) => {
        setDetailModal({ open: true, service: null, loading: true });
        try {
            console.log('Fetching service detail for ID:', id);
            const response = await adminApi.getServiceDetail(id);
            console.log('Service detail response:', response);
            
            // Xử lý dữ liệu linh hoạt: kiểm tra response.data hoặc chính response
            const serviceData = response.data || response;
            
            if (serviceData && (serviceData.id || response.success)) {
                setDetailModal({ 
                    open: true, 
                    service: response.data || response, 
                    loading: false 
                });
            } else {
                toast?.error?.('Dữ liệu dịch vụ không hợp lệ');
                setDetailModal(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Fetch service detail error:', error);
            toast?.error?.('Không thể lấy chi tiết dịch vụ');
            setDetailModal({ open: false, service: null, loading: false });
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
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm tên dịch vụ, địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="h-14 px-4 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
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
                            className="h-14 px-4 bg-white border border-slate-100 rounded-[22px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 cursor-pointer shadow-sm transition-all"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="pending_review">Chờ duyệt</option>
                            <option value="draft">Bản nháp</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                        <button onClick={() => fetchPage(currentPage)}
                            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                            <RotateCw size={20} />
                        </button>
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
                                            <button 
                                                onClick={() => handleViewDetail(svc.id)}
                                                className="text-sm font-black text-slate-900 truncate leading-tight hover:text-indigo-600 transition-colors text-left block w-full"
                                            >
                                                {svc.name}
                                            </button>
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
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
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

            {/* Detail Modal */}
            {detailModal.open && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setDetailModal({ open: false, service: null, loading: false })} />
                    <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusStyle(detailModal.service?.status)}`}>
                                    {detailModal.service ? getTypeIcon(detailModal.service.type) : <Info size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                                        {detailModal.loading ? 'Đang tải...' : (detailModal.service?.name || 'Chi tiết dịch vụ')}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {detailModal.service && (
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${getStatusStyle(detailModal.service.status)}`}>
                                                {getStatusLabel(detailModal.service.status)}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {detailModal.service?.type || 'Dịch vụ'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setDetailModal({ open: false, service: null, loading: false })}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                            {detailModal.loading ? (
                                <div className="h-full flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                    <p className="font-bold text-slate-400">Đang tải dữ liệu chi tiết...</p>
                                </div>
                            ) : detailModal.service ? (
                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* Left Column */}
                                        <div className="md:col-span-2 space-y-8">
                                            {/* Main Media */}
                                            <div className="aspect-video w-full rounded-3xl bg-slate-200 overflow-hidden shadow-inner">
                                                {detailModal.service.media && detailModal.service.media.length > 0 ? (
                                                    <img 
                                                        src={detailModal.service.media[0].url} 
                                                        alt="" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <ImageIcon size={64} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Gallery */}
                                            {detailModal.service.media && detailModal.service.media.length > 1 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <ImageIcon size={18} className="text-pink-500" /> Bộ sưu tập ({detailModal.service.media.length})
                                                    </h4>
                                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                                        {detailModal.service.media.map((m, i) => (
                                                            <div key={i} className="aspect-square rounded-2xl bg-white border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all shadow-sm">
                                                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Description */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                    <FileText size={18} className="text-indigo-500" /> Mô tả chi tiết
                                                </h4>
                                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {detailModal.service.description || 'Không có mô tả chi tiết cho dịch vụ này.'}
                                                </div>
                                            </div>

                                            {/* Schedules */}
                                            {detailModal.service.type === 'tour' && detailModal.service.schedules?.length > 0 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <Map size={18} className="text-sky-500" /> Lịch trình chuyến đi
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {[...detailModal.service.schedules].sort((a,b) => a.day_number - b.day_number).map((day) => (
                                                            <div key={day.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                                                                <div className="flex items-center gap-4 mb-4">
                                                                    <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center text-sm font-black shadow-lg shadow-sky-200">
                                                                        {day.day_number}
                                                                    </div>
                                                                    <p className="font-black text-slate-900">{day.title}</p>
                                                                </div>
                                                                <div className="ml-14 space-y-2">
                                                                    {day.activities && Array.isArray(day.activities) && day.activities.map((act, i) => (
                                                                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                                                            <div className="w-2 h-2 bg-sky-400 rounded-full shrink-0" />
                                                                            {act}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-6">
                                            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá cơ bản</p>
                                                    <p className="text-3xl font-black text-white">{formatPrice(detailModal.service.base_price)}</p>
                                                </div>
                                                <div className="h-px bg-white/10" />
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời lượng</p>
                                                        <p className="text-sm font-bold">{detailModal.service.duration_days}N {detailModal.service.duration_nights}Đ</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sức chứa</p>
                                                        <p className="text-sm font-bold">{detailModal.service.max_guests || '--'} khách</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                                                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Nhà cung cấp</h5>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm text-lg">
                                                        {detailModal.service.provider?.user?.display_name?.[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-slate-900 truncate">{detailModal.service.provider?.user?.display_name}</p>
                                                        <p className="text-[10px] text-indigo-500 font-bold truncate">{detailModal.service.provider?.user?.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Địa điểm</h5>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black text-slate-900">{detailModal.service.location?.name || 'Tỉnh/Thành'}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed">
                                                            {detailModal.service.address || 'Chưa có địa chỉ cụ thể'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {((detailModal.service.amenities?.length > 0) || (detailModal.service.includes?.length > 0)) && (
                                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tiện ích & Bao gồm</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[...(detailModal.service.amenities || []), ...(detailModal.service.includes || [])].map((item, i) => (
                                                            <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-xl border border-slate-100">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center p-12 text-slate-400 font-bold">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
                            <button 
                                onClick={() => setDetailModal({ open: false, service: null, loading: false })}
                                className="px-8 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                            >
                                Đóng
                            </button>
                            {!detailModal.loading && detailModal.service?.status === 'pending_review' && (
                                <>
                                    <button 
                                        onClick={() => {
                                            setStatusModal({ open: true, service: detailModal.service });
                                            setNewStatus('rejected');
                                            setDetailModal({ open: false, service: null, loading: false });
                                        }}
                                        className="px-8 py-3 bg-rose-50 text-rose-600 text-sm font-black rounded-2xl hover:bg-rose-100 transition-all border border-rose-100"
                                    >
                                        Từ chối duyệt
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setStatusModal({ open: true, service: detailModal.service });
                                            setNewStatus('active');
                                            setDetailModal({ open: false, service: null, loading: false });
                                        }}
                                        className="px-10 py-3 bg-emerald-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                                    >
                                        Phê duyệt
                                    </button>
                                </>
                            )}
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
