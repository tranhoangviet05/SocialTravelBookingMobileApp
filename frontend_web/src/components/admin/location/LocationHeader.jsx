import React from 'react';
import { Plus, MapPin, Star, RotateCw, Search, Filter } from 'lucide-react';
import { COLORS } from '../../../utils/colors';

const LocationHeader = ({
    total,
    popularCount,
    onAddClick,
    onReload,
    searchTerm,
    onSearchChange,
    isPopularActive,
    onPopularToggle
}) => {
    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Địa điểm</h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Thiết lập & Điều phối các điểm đến du lịch toàn hệ thống</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Quick Stats */}
                    <div className="hidden sm:flex gap-4">
                        <div className="bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng số</p>
                                <p className="text-lg font-black text-slate-800 leading-none">{total}</p>
                            </div>
                        </div>

                        <div className="bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                <Star size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phổ biến</p>
                                <p className="text-lg font-black text-slate-800 leading-none">{popularCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên địa điểm hoặc tên tỉnh/thành..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-sky-50 focus:border-sky-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onReload}
                        className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-sky-600 hover:border-sky-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer"
                        title="Tải lại dữ liệu"
                    >
                        <RotateCw size={20} />
                    </button>

                    <button
                        onClick={onPopularToggle}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[22px] border transition-all cursor-pointer font-black text-xs uppercase tracking-widest ${isPopularActive
                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-amber-200 hover:text-amber-500'
                            }`}
                    >
                        <Star size={18} fill={isPopularActive ? 'currentColor' : 'none'} />
                        {isPopularActive ? 'Đang lọc phổ biến' : 'Lọc phổ biến'}
                    </button>

                    <button
                        onClick={onAddClick}
                        className="flex items-center gap-3 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-[22px] shadow-xl shadow-sky-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer uppercase text-xs tracking-widest"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        <Plus size={20} />
                        Thêm địa điểm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationHeader;
