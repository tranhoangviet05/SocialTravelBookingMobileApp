import React, { useState, useEffect } from 'react';
import {
    Ticket,
    Plus,
    Calendar,
    Percent,
    Trash2,
    Search,
    Loader2,
    X,
    CheckCircle2,
    AlertCircle,
    Edit3,
    DollarSign
} from 'lucide-react';
import AdminTable from '../../components/admin/AdminTable';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ isOpen: false, coupon: null });
    const [formData, setFormData] = useState({
        code: '',
        type: 'percent',
        discount_value: '',
        min_order_amount: '',
        usage_limit: '',
        valid_from: '',
        valid_until: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const toast = useNotification();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getAllCoupons({ search: searchTerm });
            if (response.success) {
                setCoupons(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            toast?.error?.('Không thể tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCoupons();
    };

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setModal({ isOpen: true, coupon });
            setFormData({
                code: coupon.code,
                type: coupon.type,
                discount_value: coupon.discount_value,
                min_order_amount: coupon.min_order_amount || '',
                usage_limit: coupon.usage_limit || '',
                valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
                valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : ''
            });
        } else {
            setModal({ isOpen: true, coupon: null });
            setFormData({
                code: '',
                type: 'percent',
                discount_value: '',
                min_order_amount: '',
                usage_limit: '',
                valid_from: '',
                valid_until: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let response;
            if (modal.coupon) {
                response = await adminApi.updateCoupon(modal.coupon.id, formData);
            } else {
                response = await adminApi.createCoupon(formData);
            }

            if (response.success) {
                toast?.success?.(modal.coupon ? 'Cập nhật thành công' : 'Tạo mới thành công');
                fetchCoupons();
                setModal({ isOpen: false, coupon: null });
            }
        } catch (error) {
            console.error('Coupon save error:', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast?.error?.(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
        try {
            const response = await adminApi.deleteCoupon(id);
            if (response.success) {
                toast?.success?.('Đã xóa mã giảm giá');
                setCoupons(coupons.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error('Delete coupon error:', error);
            toast?.error?.('Không thể xóa mã giảm giá');
        }
    };

    const formatCurrency = (amount) => {
        return new Number(amount).toLocaleString('vi-VN') + '₫';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Vô thời hạn';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mã giảm giá</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các chiến dịch khuyến mãi và ưu đãi.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Tạo mã mới
                    </button>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo mã code..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold">Đang tải mã giảm giá...</p>
                    </div>
                ) : (
                    <AdminTable
                        headers={['Mã code', 'Loại hình', 'Giá trị giảm', 'Đơn tối thiểu', 'Hạn dùng', 'Lượt dùng', '']}
                        title="Tất cả mã giảm giá"
                        description={`Hiện có ${coupons.length} chiến dịch.`}
                    >
                        {coupons.length > 0 ? coupons.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-mono font-black text-xs border-2 border-dashed border-amber-200">
                                        {c.code}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    {c.type === 'percent' ? (
                                        <div className="flex items-center gap-1.5 text-sky-500">
                                            <Percent size={14} /> Phần trăm
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-emerald-500">
                                            <DollarSign size={14} /> Cố định
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-sm font-black text-slate-900">
                                    {c.type === 'percent' ? `${c.discount_value}%` : formatCurrency(c.discount_value)}
                                </td>
                                <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                                    {c.min_order_amount > 0 ? formatCurrency(c.min_order_amount) : 'Không giới hạn'}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <Calendar size={14} /> {formatDate(c.valid_until)}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-700">{c.used_count || 0}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">/ {c.usage_limit || '∞'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleOpenModal(c)}
                                            className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-8 py-16 text-center text-gray-400 font-bold">Không tìm thấy mã nào.</td>
                            </tr>
                        )}
                    </AdminTable>
                )}

                {/* Modal */}
                {modal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModal({ isOpen: false, coupon: null })} />
                        <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-[modalIn_0.3s_ease-out]">
                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                        {modal.coupon ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới'}
                                    </h3>
                                    <button type="button" onClick={() => setModal({ isOpen: false, coupon: null })} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mã Code (In hoa, viết liền)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                            placeholder="VÍ DỤ: GIAM50K"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Loại hình</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                            >
                                                <option value="percent">Phần trăm (%)</option>
                                                <option value="fixed">Cố định (₫)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Giá trị giảm</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.discount_value}
                                                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black focus:outline-none"
                                                placeholder={formData.type === 'percent' ? '5, 10, 15...' : '50000, 100000...'}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Đơn tối thiểu</label>
                                            <input
                                                type="number"
                                                value={formData.min_order_amount}
                                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                                placeholder="0 (Không giới hạn)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Giới hạn lượt dùng</label>
                                            <input
                                                type="number"
                                                value={formData.usage_limit}
                                                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                                placeholder="Bỏ trống nếu không hạn chế"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Từ ngày</label>
                                            <input
                                                type="date"
                                                value={formData.valid_from}
                                                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Đến ngày</label>
                                            <input
                                                type="date"
                                                value={formData.valid_until}
                                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setModal({ isOpen: false, coupon: null })}
                                        className="flex-1 py-4 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-2xl transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] py-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : (modal.coupon ? <CheckCircle2 size={16} /> : <Plus size={16} />)}
                                        {modal.coupon ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá'}
                                    </button>
                                </div>
                            </form>
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

export default CouponManagement;
