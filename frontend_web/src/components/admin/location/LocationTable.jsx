import React, { useState } from 'react';
import { Edit2, Trash2, MapPin, Star, ChevronRight, Info } from 'lucide-react';

const LocationTable = ({ locations, onEdit, onDelete, isLoading }) => {
    const [hoveredLoc, setHoveredLoc] = useState(null);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 border-b border-slate-50 last:border-0" />
                ))}
            </div>
        );
    }

    if (locations.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                    <MapPin size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Chưa có địa điểm nào</h3>
                <p className="text-slate-500 max-w-xs mt-2">Bắt đầu bằng việc thêm địa điểm du lịch đầu tiên cho hệ thống của bạn.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm relative">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Địa điểm</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Slug</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Cấp</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {locations.map((loc) => (
                            <tr
                                key={loc.id}
                                className="hover:bg-slate-50/50 transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div
                                        className="flex items-center gap-4 cursor-pointer w-max"
                                        onMouseEnter={() => setHoveredLoc(loc)}
                                        onMouseLeave={() => setHoveredLoc(null)}
                                    >
                                        <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 bg-slate-50 transition-transform group-hover:scale-110">
                                            {loc.image_url ? (
                                                <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <MapPin size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight group-hover:text-sky-600 transition-colors flex items-center gap-2">
                                                {loc.name}
                                                <Info size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-[200px]">{loc.description || 'Chưa có mô tả'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600">{loc.slug}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {loc.parent ? (
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                            <span className="px-2 py-0.5 bg-sky-50 text-sky-600 font-bold rounded-lg border border-sky-100/50">
                                                {loc.parent.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-sky-100/20">Cấp Tỉnh/Thành</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {loc.is_popular && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Phổ biến</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(loc)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all cursor-pointer"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(loc.id)}
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

            {/* Fixed Centered Detail Card - Horizontal Layout for better space usage */}
            {hoveredLoc && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none animate-[fadeIn_0.2s_ease-out]">
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[4px]" />
                    <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white shadow-[0_32px_120px_-20px_rgba(0,0,0,0.3)] rounded-[40px] overflow-hidden scale-100 opacity-100 transition-all duration-300 flex flex-col md:flex-row">
                        {/* Left: Image Side */}
                        <div className="w-full md:w-2/5 aspect-square md:aspect-auto md:h-auto bg-slate-100 relative group/img">
                            {hoveredLoc.image_url ? (
                                <img src={hoveredLoc.image_url} alt={hoveredLoc.name} className="w-full h-full object-cover shadow-2xl" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <MapPin size={80} strokeWidth={1} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Right: Content Side */}
                        <div className="flex-1 p-8 md:p-10 flex flex-col">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{hoveredLoc.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full border border-sky-100 uppercase tracking-widest">{hoveredLoc.slug}</span>
                                        {hoveredLoc.is_popular && (
                                            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Phổ biến</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto no-scrollbar mb-8">
                                <p className="text-base leading-relaxed text-slate-600 font-medium">
                                    {hoveredLoc.description || 'Không có mô tả chi tiết cho địa điểm này.'}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse shadow-lg shadow-sky-200" />
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin chi tiết quản trị</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default LocationTable;
