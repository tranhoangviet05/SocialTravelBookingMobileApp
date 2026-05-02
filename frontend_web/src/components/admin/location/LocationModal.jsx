import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Star, AlertCircle, Loader2, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../../../utils/cloudinary';
import { COLORS } from '../../../utils/colors';

const LocationModal = ({ isOpen, onClose, onSave, location, locations, isLoading: isSaving }) => {
    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        image_url: '',
        is_popular: false,
        description: '',
        country_code: 'VN'
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('basic'); // basic | media

    useEffect(() => {
        if (location) {
            setFormData({
                name: location.name || '',
                parent_id: location.parent_id || '',
                image_url: location.image_url || '',
                is_popular: !!location.is_popular,
                description: location.description || '',
                country_code: location.country_code || 'VN'
            });
            setPreviewUrl(location.image_url || '');
        } else {
            setFormData({ name: '', parent_id: '', image_url: '', is_popular: false, description: '', country_code: 'VN' });
            setPreviewUrl('');
            setSelectedFile(null);
        }
        setErrors({});
        setActiveTab('basic');
    }, [location, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Tên địa điểm là bắt buộc';
        if (formData.name.length < 2) newErrors.name = 'Tên quá ngắn';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        let finalImageUrl = formData.image_url;

        if (selectedFile) {
            setIsUploading(true);
            try {
                finalImageUrl = await uploadImage(selectedFile);
            } catch (error) {
                setErrors({ image: 'Lỗi khi tải ảnh lên Cloudinary' });
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        onSave({ ...formData, image_url: finalImageUrl });
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            {/* Content Container */}
            <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
                
                {/* Left Sidebar Info (Visual only) */}
                <div className="hidden md:flex w-72 bg-slate-900 p-10 flex-col justify-between text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                   
                   <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20">
                            <Globe size={28} />
                        </div>
                        <h2 className="text-2xl font-black leading-tight mb-4">
                            {location ? 'Cập nhật địa điểm' : 'Tạo mới địa điểm'}
                        </h2>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Quản lý thông tin điểm đến giúp khách hàng dễ dàng khám phá và lựa chọn dịch vụ tại khu vực này.
                        </p>
                   </div>

                   <div className="relative z-10 space-y-4">
                        <button onClick={() => setActiveTab('basic')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'basic' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                            <FileText size={18} /> Thông tin cơ bản
                        </button>
                        <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'media' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                            <ImageIcon size={18} /> Hình ảnh & Media
                        </button>
                   </div>
                </div>

                {/* Right Form Area */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
                        <div className="md:hidden flex items-center gap-3">
                            <Globe className="text-indigo-600" size={24} />
                            <h3 className="font-black text-slate-900">{location ? 'Sửa địa điểm' : 'Thêm địa điểm'}</h3>
                        </div>
                        <div className="hidden md:block" />
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10">
                        {activeTab === 'basic' ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Tên địa điểm <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            className={`w-full px-6 py-4 bg-slate-50 rounded-2xl border ${errors.name ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100'} focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all outline-none font-black text-slate-800 text-lg`}
                                            placeholder="Ví dụ: Vịnh Hạ Long, Đà Lạt..."
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        {errors.name && <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1"><AlertCircle size={14} />{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Quốc gia (Mã)</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all outline-none font-bold text-slate-800"
                                                value={formData.country_code}
                                                maxLength={2}
                                                onChange={(e) => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Trực thuộc (Parent)</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all outline-none font-bold text-slate-800 appearance-none"
                                            value={formData.parent_id}
                                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                        >
                                            <option value="">— Cấp Tỉnh/Thành phố —</option>
                                            {locations.filter(l => l.id !== location?.id).map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Mô tả giới thiệu</label>
                                    <textarea
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all outline-none font-semibold text-slate-700 min-h-[140px] resize-none leading-relaxed"
                                        placeholder="Mô tả sự tuyệt vời của địa điểm này..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <label className="flex items-center gap-4 p-5 bg-amber-50/50 rounded-3xl border border-amber-100 cursor-pointer hover:bg-amber-100/50 transition-all group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.is_popular ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-white text-slate-300'}`}>
                                        <Star size={24} className={formData.is_popular ? 'fill-white' : ''} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-amber-900">Địa điểm phổ biến</p>
                                        <p className="text-xs text-amber-700/60 font-bold tracking-tight mt-0.5 uppercase">Ưu tiên hiển thị ở trang chủ</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-6 h-6 rounded-lg border-amber-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                        checked={formData.is_popular}
                                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Hình ảnh bìa / Đại diện</label>
                                <div className="relative group aspect-video">
                                    <div className={`absolute inset-0 rounded-[32px] border-3 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-5 bg-slate-50 ${previewUrl ? 'border-indigo-500/20' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
                                        {previewUrl ? (
                                            <div className="relative w-full h-full">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-md">
                                                    <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }} className="w-14 h-14 bg-white/20 hover:bg-rose-500 rounded-full text-white backdrop-blur-md transition-all flex items-center justify-center cursor-pointer">
                                                        <X size={28} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                                                    <Upload size={36} />
                                                </div>
                                                <div className="text-center px-4">
                                                    <p className="text-lg font-black text-slate-800 leading-tight">Click hoặc Kéo thả ảnh</p>
                                                    <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Hỗ trợ JPG, PNG, WEBP (Max 5MB)</p>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                                {errors.image && <p className="text-rose-500 text-xs font-bold mt-4 flex items-center gap-1"><AlertCircle size={14} />{errors.image}</p>}
                                
                                <div className="mt-8 bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                                    <p className="text-xs text-indigo-700 font-bold leading-relaxed">
                                        💡 Mẹo: Chọn hình ảnh có độ phân giải cao và khung hình chữ nhật sẽ hiển thị đẹp nhất trên ứng dụng.
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Footer Actions */}
                    <div className="p-8 md:px-10 border-t border-slate-50 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 md:flex hidden gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${activeTab === 'basic' ? 'bg-indigo-500 w-6' : 'bg-slate-200'} transition-all`} />
                            <div className={`w-2 h-2 rounded-full ${activeTab === 'media' ? 'bg-indigo-500 w-6' : 'bg-slate-200'} transition-all`} />
                        </div>
                        
                        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            
                            {activeTab === 'basic' ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('media')}
                                    className="px-10 py-4 bg-indigo-100 text-indigo-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-200 transition-all cursor-pointer"
                                >
                                    Tiếp theo
                                </button>
                            ) : (
                                <button
                                    type="button" // Change to button and handle submit manually to avoid ambiguity, or keep submit
                                    onClick={handleSubmit}
                                    disabled={isUploading || isSaving}
                                    className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-3 cursor-pointer text-xs uppercase tracking-widest"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    {(isUploading || isSaving) ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            {isUploading ? 'ĐANG TẢI ẢNH...' : 'ĐANG LƯU...'}
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            {location ? 'CẬP NHẬT NGAY' : 'TẠO ĐỊA ĐIỂM'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
