import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Tag, RotateCw, Search, Loader2,
    Edit2, Trash2, ExternalLink, ChevronLeft, ChevronRight,
    Hotel, Map, Utensils, Car, Camera, Sunset, 
    Palmtree, Bike, Waves, Compass, Landmark, Ticket
} from 'lucide-react';
import CategoryModal from '../../components/admin/category/CategoryModal';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';
import adminApi from '../../api/adminApi';

const ICON_MAP = {
    Hotel, Map, Utensils, Car, Camera, Sunset, 
    Palmtree, Bike, Waves, Compass, Landmark, Ticket, Tag
};

const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) return null;
    const { current_page, last_page, total } = meta;
    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-400 font-medium">Tổng: <span className="font-bold text-slate-600">{total}</span> danh mục</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(current_page - 1)} disabled={current_page <= 1}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={18} />
                </button>
                {Array.from({ length: last_page }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => onPageChange(page)}
                        className={`min-w-[36px] h-9 rounded-xl text-sm font-bold transition-all ${
                            page === current_page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'
                        }`}>
                        {page}
                    </button>
                ))}
                <button onClick={() => onPageChange(current_page + 1)} disabled={current_page >= last_page}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

const CategoryManagement = () => {
    const { categories, loadingStates, fetchCategories, meta } = useAdminData();
    const categoriesMeta = meta?.categories || { current_page: 1, last_page: 1, total: 0 };
    const loading = loadingStates.categories;

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const toast = useNotification();

    const doFetch = useCallback((page = 1, search = '') => {
        fetchCategories(true, page, { search: search || undefined });
    }, [fetchCategories]);

    useEffect(() => {
        doFetch(1, '');
        setCurrentPage(1);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            doFetch(1, searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, doFetch]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        doFetch(page, searchTerm);
    };

    const handleAddClick = () => { setEditingCategory(null); setIsModalOpen(true); };
    const handleEditClick = (cat) => { setEditingCategory(cat); setIsModalOpen(true); };

    const handleSave = async (data) => {
        setIsSaving(true);
        try {
            if (editingCategory) {
                const res = await adminApi.updateCategory(editingCategory.id, data);
                if (res.success) { toast.success('Cập nhật danh mục thành công!'); doFetch(currentPage, searchTerm); }
            } else {
                const res = await adminApi.createCategory(data);
                if (res.success) { toast.success('Thêm danh mục mới thành công!'); doFetch(1, searchTerm); setCurrentPage(1); }
            }
            setIsModalOpen(false);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Lỗi khi lưu dữ liệu.');
        } finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa danh mục này?')) return;
        try {
            const res = await adminApi.deleteCategory(id);
            if (res.success) {
                toast.success('Xóa danh mục thành công!');
                if (categories.length === 1 && currentPage > 1) {
                    handlePageChange(currentPage - 1);
                } else {
                    doFetch(currentPage, searchTerm);
                }
            }
        } catch (e) {
            toast.error(e.response?.data?.message || 'Không thể xóa danh mục.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Danh mục</h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Phân loại các dịch vụ du lịch như Tour, Khách sạn, Homestay...</p>
                </div>
                <div className="bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Tag size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng danh mục</p>
                        <p className="text-lg font-black text-slate-800 leading-none">{categoriesMeta.total}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text" placeholder="Tìm kiếm danh mục..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => doFetch(currentPage, searchTerm)}
                        className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                        <RotateCw size={20} />
                    </button>
                    <button onClick={handleAddClick}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[22px] shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer uppercase text-xs tracking-widest">
                        <Plus size={20} /> Thêm danh mục
                    </button>
                </div>
            </div>

            {loading && categories.length === 0 ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
            ) : categories.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                        <Tag size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Chưa có danh mục nào</h3>
                    <p className="text-slate-500 max-w-xs mt-2">Phân loại giúp người dùng dễ dàng tìm thấy các dịch vụ du lịch mong muốn.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Danh mục</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Slug</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4"><span className="text-xs font-bold text-slate-400">#{cat.id}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                                        {(() => {
                                                            const IconComp = ICON_MAP[cat.icon] || Tag;
                                                            return <IconComp size={18} />;
                                                        })()}
                                                    </div>
                                                    <p className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-wider">{cat.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600">{cat.slug}</span>
                                                    <a href={`/categories/${cat.slug}`} target="_blank" rel="noopener noreferrer"
                                                        className="text-slate-300 hover:text-indigo-500 transition-colors">
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEditClick(cat)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(cat.id)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination meta={categoriesMeta} onPageChange={handlePageChange} />
                </>
            )}

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                category={editingCategory}
                isLoading={isSaving}
            />
        </div>
    );
};

export default CategoryManagement;
