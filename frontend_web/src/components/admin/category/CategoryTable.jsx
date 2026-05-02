import React from 'react';
import { Edit2, Trash2, Tag, ExternalLink } from 'lucide-react';

const CategoryTable = ({ categories, onEdit, onDelete, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 border-b border-slate-50 last:border-0" />
                ))}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                    <Tag size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Chưa có danh mục nào</h3>
                <p className="text-slate-500 max-w-xs mt-2">Phân loại giúp người dùng dễ dàng tìm thấy các dịch vụ du lịch mong muốn.</p>
            </div>
        );
    }

    return (
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
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-slate-400">#{cat.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                                            <Tag size={18} />
                                        </div>
                                        <p className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{cat.name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600">{cat.slug}</span>
                                        <a 
                                            href={`/categories/${cat.slug}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-slate-300 hover:text-indigo-500 transition-colors"
                                        >
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(cat)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(cat.id)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                            title="Xóa"
                                        >
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
    );
};

export default CategoryTable;
