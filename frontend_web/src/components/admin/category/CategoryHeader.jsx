import React from 'react';
import { Plus, Tag, RotateCw, Search } from 'lucide-react';
import { COLORS } from '../../../utils/colors';

const CategoryHeader = ({ 
    total, 
    onAddClick, 
    onReload,
    searchTerm,
    onSearchChange
}) => {
    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Danh mục</h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Phân loại các dịch vụ du lịch như Tour, Khách sạn, Homestay...</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Quick Stats */}
                    <div className="hidden sm:flex gap-4">
                        <div className="bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Tag size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng danh mục</p>
                                <p className="text-lg font-black text-slate-800 leading-none">{total}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onReload}
                        className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer"
                        title="Tải lại dữ liệu"
                    >
                        <RotateCw size={20} />
                    </button>
                    
                    <button
                        onClick={onAddClick}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[22px] shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer uppercase text-xs tracking-widest"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        <Plus size={20} />
                        Thêm danh mục
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryHeader;
