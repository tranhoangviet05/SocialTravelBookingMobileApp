import React, { useState, useEffect } from 'react';
import { 
    X, Tag, Save, Loader2, Sparkles, AlertCircle, 
    Hotel, Map, Utensils, Car, Camera, Sunset, 
    Palmtree, Bike, Waves, Compass, Landmark, Ticket
} from 'lucide-react';
import { COLORS } from '../../../utils/colors';

const ICONS = [
    { name: 'Hotel', icon: Hotel },
    { name: 'Map', icon: Map },
    { name: 'Utensils', icon: Utensils },
    { name: 'Car', icon: Car },
    { name: 'Camera', icon: Camera },
    { name: 'Sunset', icon: Sunset },
    { name: 'Palmtree', icon: Palmtree },
    { name: 'Bike', icon: Bike },
    { name: 'Waves', icon: Waves },
    { name: 'Compass', icon: Compass },
    { name: 'Landmark', icon: Landmark },
    { name: 'Ticket', icon: Ticket },
    { name: 'Tag', icon: Tag },
];

const CategoryModal = ({ isOpen, onClose, onSave, category, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: 'Tag',
        description: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                icon: category.icon || 'Tag',
                description: category.description || ''
            });
        } else {
            setFormData({ name: '', slug: '', icon: 'Tag', description: '' });
        }
        setErrors({});
    }, [category, isOpen]);

    const validate = () => {
        const e = {};
        if (!formData.name.trim()) e.name = 'Tên danh mục là bắt buộc';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                            {category ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
                        </h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                             <Sparkles size={14} className="text-amber-400" /> Cấu hình hệ thống phân loại
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10">
                    <div className="space-y-8">
                        {/* Name Field */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tên hiển thị <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Ví dụ: Khách sạn, Tour mạo hiểm..."
                                className={`w-full px-6 py-4 bg-slate-50 border ${errors.name ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all font-black text-slate-800 text-lg shadow-sm`}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1"><AlertCircle size={14} />{errors.name}</p>}
                        </div>

                        {/* Icon Selector */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Biểu tượng (Icon)</label>
                            <div className="grid grid-cols-6 sm:grid-cols-7 gap-3">
                                {ICONS.map((item) => {
                                    const IconComp = item.icon;
                                    const isActive = formData.icon === item.name;
                                    return (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: item.name })}
                                            className={`aspect-square rounded-2xl flex items-center justify-center transition-all border-2 cursor-pointer ${
                                                isActive 
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                                                : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600'
                                            }`}
                                        >
                                            <IconComp size={22} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Mô tả ngắn</label>
                            <textarea
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all font-semibold text-slate-700 min-h-[100px] resize-none"
                                placeholder="Dùng để hiển thị gợi ý cho danh mục này..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4.5 bg-slate-100 cursor-pointer hover:bg-slate-200 text-slate-500 font-black rounded-2xl transition-all uppercase text-xs tracking-[0.2em] active:scale-95"
                        >
                            Đóng lại
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] flex items-center justify-center gap-3 px-8 py-4.5 bg-indigo-600 cursor-pointer hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-[0.2em] active:scale-95"
                            style={{ backgroundColor: COLORS.primary }}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-white" size={20} />
                            ) : (
                                <Save size={20} />
                            )}
                            {category ? 'Xác nhận lưu' : 'Tạo mới ngay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
