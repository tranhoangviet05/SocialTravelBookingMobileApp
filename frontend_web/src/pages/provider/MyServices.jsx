import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProviderData } from '../../contexts/ProviderDataContext';
import {
    Plus, Search, Trash2, Loader2, Package, MapPin, X, Edit3,
    CheckCircle, AlertCircle, Image as ImageIcon,
    UploadCloud, Clock, ChevronLeft, ChevronRight,
    CalendarDays, Star, Settings2, ChevronDown, ChevronUp,
    Bed, Users, RotateCw
} from 'lucide-react';
import providerApi from '../../api/providerApi';
import { uploadImage } from '../../utils/cloudinary';


const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{message}</p>
        </div>
    );
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150]">
        <div className="bg-white rounded-3xl p-8 w-[400px] shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Trash2 size={24} className="text-rose-500" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900">Xác nhận</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{message}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">Hủy</button>
                <button onClick={onConfirm} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all">Đồng ý</button>
            </div>
        </div>
    </div>
);

const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) return null;
    const { current_page, last_page, total } = meta;
    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-400 font-medium">Tổng: <span className="font-bold text-slate-600">{total}</span> dịch vụ</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(current_page - 1)} disabled={current_page <= 1} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={18} />
                </button>
                {Array.from({ length: last_page }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => onPageChange(page)} className={`min-w-[36px] h-9 rounded-xl text-sm font-bold transition-all ${page === current_page ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                        {page}
                    </button>
                ))}
                <button onClick={() => onPageChange(current_page + 1)} disabled={current_page >= last_page} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// SCHEDULE MODAL (lịch trình tour)
// ============================================================================
const ScheduleModal = ({ service, onClose, showToast }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editItem, setEditItem] = useState(null); // null = đang thêm mới
    const [showForm, setShowForm] = useState(false);
    const [confirmDel, setConfirmDel] = useState(null);

    const emptyForm = { day_number: '', title: '', description: '', activities: [] };
    const [form, setForm] = useState(emptyForm);
    const [activityInput, setActivityInput] = useState('');

    useEffect(() => {
        providerApi.getSchedules(service.id)
            .then(res => setSchedules(res.data || []))
            .catch(() => showToast('Không tải được lịch trình', 'error'))
            .finally(() => setLoading(false));
    }, [service.id]);

    const maxDays = service.duration_days || Infinity;
    const canAddMore = schedules.length < maxDays;

    const openCreate = () => {
        if (!canAddMore) { showToast(`Tour chỉ có ${maxDays} ngày, không thể thêm thêm!`, 'error'); return; }
        setEditItem(null);
        setForm({ ...emptyForm, day_number: (schedules.length + 1).toString() });
        setShowForm(true);
    };
    const openEdit = (s) => {
        setEditItem(s);
        setForm({
            day_number: s.day_number,
            title: s.title,
            description: s.description || '',
            activities: Array.isArray(s.activities) ? s.activities : []
        });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dayNum = Number(form.day_number);
            if (!editItem && dayNum > maxDays) {
                showToast(`Ngày ${dayNum} vượt quá thời lượng tour (${maxDays} ngày)!`, 'error');
                setSaving(false);
                return;
            }
            const existingDay = schedules.find(s => s.day_number === dayNum && s.id !== editItem?.id);
            if (existingDay) {
                showToast(`Ngày ${dayNum} đã tồn tại trong lịch trình!`, 'error');
                setSaving(false);
                return;
            }
            const payload = {
                day_number: dayNum,
                title: form.title,
                description: form.description,
                activities: form.activities
            };
            if (editItem) {
                const res = await providerApi.updateSchedule(service.id, editItem.id, payload);
                setSchedules(prev => prev.map(s => s.id === editItem.id ? res.data : s));
                showToast('Đã cập nhật ngày lịch trình!');
            } else {
                const res = await providerApi.createSchedule(service.id, payload);
                setSchedules(prev => [...prev, res.data].sort((a, b) => a.day_number - b.day_number));
                showToast('Đã thêm ngày mới!');
            }
            setShowForm(false);
        } catch {
            showToast('Lỗi lưu dữ liệu', 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await providerApi.deleteSchedule(service.id, confirmDel.id);
            setSchedules(prev => prev.filter(s => s.id !== confirmDel.id));
            showToast('Đã xóa ngày lịch trình.');
        } catch { showToast('Lỗi xóa', 'error'); }
        finally { setConfirmDel(null); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110]">
            <div className="bg-white rounded-[2rem] w-[680px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <CalendarDays size={22} className="text-sky-500" />
                            Lịch trình Tour
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-slate-400 font-medium">{service.name}</p>
                            {maxDays !== Infinity && (
                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${schedules.length >= maxDays
                                    ? 'bg-rose-50 text-rose-500'
                                    : 'bg-sky-50 text-sky-600'
                                    }`}>
                                    {schedules.length}/{maxDays} ngày
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={openCreate}
                            disabled={!canAddMore}
                            title={!canAddMore ? `Đã đủ ${maxDays} ngày lịch trình` : 'Thêm ngày'}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${canAddMore
                                ? 'bg-sky-600 text-white hover:bg-sky-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <Plus size={16} /> Thêm ngày
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
                    </div>
                </div>

                {/* Form thêm/sửa */}
                {showForm && (
                    <form onSubmit={handleSave} className="px-8 py-5 bg-sky-50 border-b border-sky-100 overflow-y-auto max-h-[400px] custom-scrollbar">
                        <h4 className="text-sm font-black text-sky-700 mb-4">{editItem ? `Sửa Ngày ${editItem.day_number}` : 'Thêm ngày mới'}</h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày số *</label>
                            <input required type="number" min="1" value={form.day_number}
                                onChange={e => setForm({ ...form, day_number: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                        </div>
                        <div className="mt-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề ngày *</label>
                            <input required value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                placeholder="VD: Đà Nẵng - Bà Nà Hills" />
                        </div>
                        <div className="mt-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả hoạt động</label>
                            <textarea rows={2} value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                placeholder="Tóm tắt hoạt động trong ngày..." />
                        </div>

                        {/* Điểm dừng / Hoạt động chi tiết */}
                        <div className="mt-4">
                            <label className="block text-xs font-black text-sky-700 uppercase mb-2">Các điểm dừng / Hoạt động chi tiết</label>
                            <div className="space-y-2 mb-3">
                                {form.activities.map((act, idx) => (
                                    <div key={idx} className="flex items-center gap-2 group">
                                        <div className="flex-1 px-4 py-2 bg-white border border-sky-100 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
                                            {act}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, activities: form.activities.filter((_, i) => i !== idx) })}
                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={activityInput}
                                    onChange={e => setActivityInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (activityInput.trim()) {
                                                setForm({ ...form, activities: [...form.activities, activityInput.trim()] });
                                                setActivityInput('');
                                            }
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                    placeholder="Thêm điểm dừng..."
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (activityInput.trim()) {
                                            setForm({ ...form, activities: [...form.activities, activityInput.trim()] });
                                            setActivityInput('');
                                        }
                                    }}
                                    className="px-4 py-2 bg-sky-100 text-sky-600 rounded-xl text-xs font-black hover:bg-sky-200 transition-colors"
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold">Hủy</button>
                            <button type="submit" disabled={saving} className="flex-1 py-2 bg-sky-600 text-white rounded-xl text-sm font-black disabled:opacity-60">
                                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : (editItem ? 'Cập nhật' : 'Thêm ngày')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Danh sách */}
                <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
                    ) : schedules.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-bold">Chưa có lịch trình nào.</p>
                            <p className="text-sm mt-1">Nhấn "Thêm ngày" để bắt đầu tạo lịch trình.</p>
                        </div>
                    ) : (
                        schedules.sort((a, b) => a.day_number - b.day_number).map(s => (
                            <div key={s.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div className="w-10 h-10 bg-sky-600 text-white rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-lg shadow-sky-200">{s.day_number}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-slate-800 text-sm">{s.title}</p>
                                        {s.time && <span className="text-xs font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-lg">{s.time}</span>}
                                    </div>
                                    {s.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.description}</p>}
                                    {Array.isArray(s.activities) && s.activities.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {s.activities.map((act, idx) => (
                                                <span key={idx} className="px-2.5 py-1 bg-white border border-sky-100 text-[10px] font-black text-sky-600 rounded-lg shadow-sm">
                                                    📍 {act}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-sky-100 text-slate-400 hover:text-sky-600 rounded-xl"><Edit3 size={14} /></button>
                                    <button onClick={() => setConfirmDel(s)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {confirmDel && <ConfirmModal message={`Xóa Ngày ${confirmDel.day_number}: "${confirmDel.title}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />}
        </div>
    );
};

// ============================================================================
// ROOM TYPE MODAL (quản lý loại phòng khách sạn)
// ============================================================================
const RoomTypeModal = ({ service, onClose, showToast }) => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [confirmDel, setConfirmDel] = useState(null);

    const emptyForm = {
        name: '', rank: 'standard', base_price: '', total_rooms: '1',
        inventory: '1',
        capacity_adults: '2', capacity_children: '0',
        description: '', amenities: '', images: []
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        providerApi.getRoomTypes(service.id)
            .then(res => setRoomTypes(res.data || []))
            .catch(() => showToast('Không tải được loại phòng', 'error'))
            .finally(() => setLoading(false));
    }, [service.id]);

    const openCreate = () => {
        setEditItem(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (rt) => {
        setEditItem(rt);
        setForm({
            name: rt.name,
            rank: rt.rank || 'standard',
            base_price: rt.base_price,
            total_rooms: rt.total_rooms.toString(),
            inventory: (rt.inventory || 1).toString(),
            capacity_adults: rt.capacity_adults.toString(),
            capacity_children: rt.capacity_children.toString(),
            description: rt.description || '',
            amenities: (rt.amenities || []).join('\n'),
            images: rt.images || []
        });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                base_price: Number(form.base_price),
                total_rooms: Number(form.total_rooms),
                inventory: Number(form.inventory),
                capacity_adults: Number(form.capacity_adults),
                capacity_children: Number(form.capacity_children),
                amenities: form.amenities.split('\n').map(s => s.trim()).filter(Boolean),
                images: form.images
            };

            if (editItem) {
                const res = await providerApi.updateRoomType(service.id, editItem.id, payload);
                setRoomTypes(prev => prev.map(rt => rt.id === editItem.id ? res.data : rt));
                showToast('Đã cập nhật loại phòng!');
            } else {
                const res = await providerApi.createRoomType(service.id, payload);
                setRoomTypes(prev => [...prev, res.data]);
                showToast('Đã thêm loại phòng mới!');
            }
            setShowForm(false);
        } catch {
            showToast('Lỗi khi lưu dữ liệu', 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await providerApi.deleteRoomType(service.id, confirmDel.id);
            setRoomTypes(prev => prev.filter(rt => rt.id !== confirmDel.id));
            showToast('Đã xóa loại phòng.');
        } catch { showToast('Lỗi khi xóa', 'error'); }
        finally { setConfirmDel(null); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110]">
            <div className="bg-white rounded-[2rem] w-[750px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Bed size={22} className="text-emerald-500" />
                            Quản lý loại phòng
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 font-medium">{service.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">
                            <Plus size={16} /> Thêm phòng
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <form onSubmit={handleSave} className="px-8 py-6 bg-emerald-50/50 border-b border-emerald-100 overflow-y-auto max-h-[50vh]">
                        <h4 className="text-sm font-black text-emerald-700 mb-5">{editItem ? 'Sửa thông tin phòng' : 'Thêm loại phòng mới'}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên loại phòng *</label>
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="VD: Deluxe Ocean View" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Hạng phòng *</label>
                                <select value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                    <option value="standard">🥉 Bình dân</option>
                                    <option value="premium">🥈 Cao cấp</option>
                                    <option value="vip">🥇 VIP</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giá cơ bản *</label>
                                <input required type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="VNĐ" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Số phòng ngủ *</label>
                                    <input required type="number" value={form.total_rooms} onChange={e => setForm({ ...form, total_rooms: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Số lượng phòng (Kho) *</label>
                                    <input required type="number" value={form.inventory} onChange={e => setForm({ ...form, inventory: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sức chứa (Lớn) *</label>
                                    <input required type="number" value={form.capacity_adults} onChange={e => setForm({ ...form, capacity_adults: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Trẻ em</label>
                                    <input type="number" value={form.capacity_children} onChange={e => setForm({ ...form, capacity_children: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ảnh chi tiết phòng</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        id="room-images"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files);
                                            setSaving(true);
                                            try {
                                                const urls = await Promise.all(files.map(uploadImage));
                                                setForm(f => ({ ...f, images: [...f.images, ...urls] }));
                                            } catch { showToast('Lỗi tải ảnh', 'error'); }
                                            finally { setSaving(false); }
                                        }}
                                    />
                                    <label htmlFor="room-images" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase cursor-pointer hover:bg-slate-50 transition-all">
                                        <UploadCloud size={16} /> Tải ảnh lên ({form.images?.length})
                                    </label>
                                </div>
                            </div>
                        </div>

                        {form.images?.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                                {form.images.map((url, idx) => (
                                    <div key={idx} className="relative w-12 h-12 flex-shrink-0 group">
                                        <img src={url} className="w-full h-full object-cover rounded-lg border border-slate-100" />
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                                            className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tiện nghi riêng (Mỗi dòng 1 mục)</label>
                            <textarea rows={3} value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-medium resize-none focus:outline-none" placeholder={"Bồn tắm\nBan công hướng biển\nMinibar"} />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold">Hủy</button>
                            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black disabled:opacity-60 shadow-lg shadow-emerald-600/20">
                                {saving ? <Loader2 size={18} className="animate-spin mx-auto" /> : (editItem ? 'Cập nhật phòng' : 'Thêm phòng')}
                            </button>
                        </div>
                    </form>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto px-8 py-5 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
                    ) : roomTypes.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Bed size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-bold">Khách sạn chưa có loại phòng nào.</p>
                            <p className="text-sm mt-1 text-slate-300">Hãy thêm các loại phòng để khách hàng có thể đặt phòng.</p>
                        </div>
                    ) : (
                        roomTypes.map(rt => (
                            <div key={rt.id} className="flex items-center gap-5 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Bed size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h5 className="font-black text-slate-800">{rt.name}</h5>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${rt.rank === 'vip' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                            rt.rank === 'premium' ? 'bg-sky-100 text-sky-700 border border-sky-200' :
                                                'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>
                                            {rt.rank === 'vip' ? '👑 VIP' : rt.rank === 'premium' ? '✨ Cao cấp' : '🏠 Bình dân'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-white text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black">
                                            {rt.inventory} Phòng • {rt.total_rooms} PN
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                                            <Users size={12} /> {rt.capacity_adults} Lớn, {rt.capacity_children} Trẻ
                                        </div>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <div className="text-[11px] font-black text-emerald-600 uppercase italic">
                                            {Number(rt.base_price).toLocaleString()}₫ / đêm
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => openEdit(rt)} className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl"><Edit3 size={18} /></button>
                                    <button onClick={() => setConfirmDel(rt)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {confirmDel && <ConfirmModal message={`Xóa loại phòng "${confirmDel.name}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />}
        </div>
    );
};

// ============================================================================
// AMENITIES MODAL (tiện nghi / bao gồm / không bao gồm)
// ============================================================================
const AmenitiesModal = ({ service, onClose, showToast, onSaved }) => {
    const [form, setForm] = useState({
        amenities: (service.amenities || []).join('\n'),
        includes: (service.includes || []).join('\n'),
        excludes: (service.excludes || []).join('\n'),
        tags: (service.tags || []).join('\n'),
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                amenities: form.amenities.split('\n').map(s => s.trim()).filter(Boolean),
                includes: form.includes.split('\n').map(s => s.trim()).filter(Boolean),
                excludes: form.excludes.split('\n').map(s => s.trim()).filter(Boolean),
                tags: form.tags.split('\n').map(s => s.trim()).filter(Boolean),
            };
            await providerApi.updateAmenities(service.id, payload);
            showToast('Đã lưu tiện nghi dịch vụ!');
            onSaved(payload);
            onClose();
        } catch {
            showToast('Lỗi khi lưu', 'error');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110]">
            <div className="bg-white rounded-[2rem] w-[720px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Star size={22} className="text-amber-500" />
                            Tiện nghi & Chi tiết
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5 font-medium">{service.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Bao gồm */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-emerald-600">✅ Bao gồm</label>
                            <p className="text-[10px] text-slate-400 mb-2 font-medium">Mỗi mục một dòng</p>
                            <textarea rows={5}
                                value={form.includes}
                                onChange={e => setForm(f => ({ ...f, includes: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                placeholder={"Bữa sáng\nVé vào cửa\nHướng dẫn viên"}
                            />
                        </div>
                        {/* Không bao gồm */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-rose-500">❌ Không bao gồm</label>
                            <p className="text-[10px] text-slate-400 mb-2 font-medium">Mỗi mục một dòng</p>
                            <textarea rows={5}
                                value={form.excludes}
                                onChange={e => setForm(f => ({ ...f, excludes: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                placeholder={"Vé máy bay\nChi phí cá nhân\nBảo hiểm du lịch"}
                            />
                        </div>
                    </div>
                    {/* Tiện nghi - Ẩn nếu là tour hoặc phương tiện */}
                    {(service.type !== 'tour' && service.type !== 'vehicle') && (
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-sky-600">🌟 Tiện nghi (Khách sạn/Homestay)</label>
                            <p className="text-[10px] text-slate-400 mb-2 font-medium">Mỗi mục một dòng</p>
                            <textarea rows={5}
                                value={form.amenities}
                                onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                placeholder={"WiFi miễn phí\nHồ bơi\nSân tập gym\nĐiều hòa"}
                            />
                        </div>
                    )}
                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-purple-600">🏷️ Tags (từ khóa tìm kiếm)</label>
                        <p className="text-[10px] text-slate-400 mb-2 font-medium">Mỗi mục một dòng</p>
                        <textarea rows={3}
                            value={form.tags}
                            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            placeholder={"lịch sử\nthiên nhiên\ngia đình\nkỳ nghỉ"}
                        />
                    </div>
                </div>

                <div className="flex gap-4 px-8 py-5 border-t border-slate-100">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold">Hủy</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                        {saving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// AVAILABILITY MODAL (quản lý số chỗ/phòng trống theo ngày)
// ============================================================================
const AvailabilityModal = ({ service, onClose, showToast }) => {
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
    const [saving, setSaving] = useState(false);

    // Batch form
    const [batchForm, setBatchForm] = useState({
        dates: [],
        total_slots: service.max_guests || 0,
        price_override: '',
        is_blocked: false
    });

    const isHotel = service.type === 'hotel' || service.type === 'homestay';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (isHotel) {
                    const rtRes = await providerApi.getRoomTypes(service.id);
                    setRoomTypes(rtRes.data || []);
                    if (rtRes.data?.length > 0) setSelectedRoomTypeId(rtRes.data[0].id);
                }
                await fetchAvailability();
            } catch (err) {
                showToast('Không tải được dữ liệu', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [service.id]);

    const fetchAvailability = async (rtId = selectedRoomTypeId) => {
        const res = await providerApi.getAvailability(service.id, {
            room_type_id: isHotel ? rtId : undefined,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        setAvailability(res.data || []);
    };

    useEffect(() => {
        if (isHotel && selectedRoomTypeId) {
            fetchAvailability(selectedRoomTypeId);
            const rt = roomTypes.find(r => r.id === selectedRoomTypeId);
            if (rt) setBatchForm(f => ({ ...f, total_slots: rt.inventory || 0 }));
        }
    }, [selectedRoomTypeId, roomTypes]);

    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        if (batchForm.dates.length === 0) return showToast('Vui lòng chọn ít nhất một ngày', 'error');
        setSaving(true);
        try {
            await providerApi.updateAvailabilityBatch(service.id, {
                ...batchForm,
                room_type_id: isHotel ? selectedRoomTypeId : undefined,
                price_override: batchForm.price_override ? Number(batchForm.price_override) : null,
                total_slots: Number(batchForm.total_slots)
            });
            showToast('Cập nhật thành công!');
            fetchAvailability();
            setBatchForm(f => ({ ...f, dates: [] }));
        } catch {
            showToast('Lỗi khi cập nhật', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleDate = (date) => {
        setBatchForm(f => ({
            ...f,
            dates: f.dates.includes(date) ? f.dates.filter(d => d !== date) : [...f.dates, date]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110]">
            <div className="bg-white rounded-[2.5rem] w-[900px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-10 pt-10 pb-6 border-b border-slate-50">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                            <CalendarDays size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Trạng thái khả dụng</h3>
                            <p className="text-sm text-slate-400 font-medium">{service.name} • Quản lý số chỗ trống và giá</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Sidebar: Batch Update */}
                    <div className="w-[340px] border-r border-slate-50 p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Settings2 size={16} className="text-indigo-500" /> Thiết lập nhanh
                        </h4>

                        {isHotel && (
                            <div className="mb-6">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Chọn loại phòng</label>
                                <select
                                    value={selectedRoomTypeId}
                                    onChange={e => setSelectedRoomTypeId(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                                </select>
                            </div>
                        )}

                        <form onSubmit={handleBatchSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Số chỗ / Phòng trống</label>
                                <input type="number" required value={batchForm.total_slots} onChange={e => setBatchForm({ ...batchForm, total_slots: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Giá ghi đè (VNĐ)</label>
                                <input type="number" value={batchForm.price_override} onChange={e => setBatchForm({ ...batchForm, price_override: e.target.value })} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Trống = giá gốc" />
                            </div>
                            <div className="flex items-center gap-3 px-1">
                                <input type="checkbox" id="is_blocked" checked={batchForm.is_blocked} onChange={e => setBatchForm({ ...batchForm, is_blocked: e.target.checked })} className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer" />
                                <label htmlFor="is_blocked" className="text-sm font-bold text-slate-700 cursor-pointer">Chặn ngày này</label>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={saving || batchForm.dates.length === 0} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : (
                                        <>Cập nhật cho {batchForm.dates.length} ngày</>
                                    )}
                                </button>
                                <p className="text-[10px] text-center mt-3 text-slate-400 font-medium italic">* Chọn các ngày ở lịch bên phải để áp dụng</p>
                            </div>
                        </form>
                    </div>

                    {/* Main View: Calendar/List */}
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                <RotateCw size={16} className="text-emerald-500" /> Trạng thái 30 ngày tới
                            </h4>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full" /> <span className="text-[10px] font-bold text-slate-500">Còn trống</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-full" /> <span className="text-[10px] font-bold text-slate-500">Đã chặn</span></div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {Array.from({ length: 30 }).map((_, i) => {
                                    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                    const d = new Date(date);
                                    const dayStr = d.toLocaleDateString('vi-VN', { weekday: 'short' });
                                    const dateStr = d.getDate() + '/' + (d.getMonth() + 1);

                                    const status = availability.find(a => a.available_date === date);
                                    const isSelected = batchForm.dates.includes(date);
                                    const isBlocked = status?.is_blocked;

                                    return (
                                        <div
                                            key={date}
                                            onClick={() => toggleDate(date)}
                                            className={`relative p-4 rounded-3xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100 ring-2 ring-indigo-600/10' :
                                                isBlocked ? 'border-rose-100 bg-rose-50/50' :
                                                    'border-slate-50 bg-white hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>{dayStr}</span>
                                                <div className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                            </div>
                                            <div className={`text-lg font-black ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{dateStr}</div>

                                            <div className="mt-2 space-y-1">
                                                <div className="text-[10px] font-bold text-slate-500 flex justify-between">
                                                    <span>Chỗ:</span>
                                                    <span className={status ? 'text-slate-900' : 'text-slate-300'}>
                                                        {status ? `${status.booked_slots}/${status.total_slots}` : 'Mặc định'}
                                                    </span>
                                                </div>
                                                {status?.price_override && (
                                                    <div className="text-[10px] font-black text-rose-500 truncate">
                                                        {Number(status.price_override).toLocaleString()}₫
                                                    </div>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg">
                                                    <CheckCircle size={14} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const MyServices = () => {
    const {
        services, locations, categories,
        fetchServices, fetchSystemData,
        loadingStates,
        setServices, servicesMeta
    } = useProviderData();

    const loading = (loadingStates.services && services.length === 0) || (loadingStates.system && locations.length === 0);
    const [hasProfile, setHasProfile] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentServiceId, setCurrentServiceId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const fileInputRef = useRef(null);

    // Modals mới
    const [scheduleService, setScheduleService] = useState(null);
    const [amenitiesService, setAmenitiesService] = useState(null);
    const [roomTypeService, setRoomTypeService] = useState(null);
    const [availabilityService, setAvailabilityService] = useState(null);

    const initialForm = {
        name: '', type: 'tour', category_id: '', location_id: '',
        base_price: '', description: '', address: '',
        latitude: null, longitude: null,
        max_guests: '',
        price_unit: 'per_person', duration_days: '', duration_nights: ''
    };
    const [form, setForm] = useState(initialForm);
    const [toast, setToast] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const doFetch = useCallback((page = 1) => {
        fetchServices(true, {
            page,
            per_page: 8,
            search: searchTerm || undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
        }).catch(err => {
            if (err.response?.status === 404 || err.response?.status === 403) setHasProfile(false);
        });
    }, [fetchServices, searchTerm, typeFilter]);

    useEffect(() => { fetchSystemData(); }, [fetchSystemData]);

    useEffect(() => {
        doFetch(1);
        setCurrentPage(1);
    }, [searchTerm, typeFilter]);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            showToast('Bạn chỉ có thể tải lên tối đa 5 ảnh', 'error');
            return;
        }
        setSelectedFiles(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        const newPreviews = [...previewUrls];
        if (newPreviews[index].startsWith('blob:')) URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const handleOpenCreate = () => {
        setEditMode(false);
        setForm(initialForm);
        setSelectedFiles([]);
        setPreviewUrls([]);
        setShowModal(true);
    };

    const handleOpenEdit = (service) => {
        setEditMode(true);
        setCurrentServiceId(service.id);
        setForm({
            name: service.name,
            type: service.type,
            category_id: service.category_id,
            location_id: service.location_id,
            base_price: service.base_price,
            description: service.description || '',
            address: service.address || '',
            latitude: service.latitude || null,
            longitude: service.longitude || null,
            max_guests: service.max_guests || '',
            price_unit: service.price_unit,
            duration_days: service.duration_days || '',
            duration_nights: service.duration_nights || ''
        });
        setSelectedFiles([]);
        setPreviewUrls(service.media?.map(m => m.url) || []);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (!form.location_id || !form.category_id) return showToast('Vui lòng chọn Điểm đến và Danh mục', 'error');

        setSubmitting(true);
        try {
            let imageUrls = previewUrls.filter(url => url.startsWith('http'));

            if (selectedFiles.length > 0) {
                const uploadedUrls = await Promise.all(selectedFiles.map(file => uploadImage(file)));
                imageUrls = [...imageUrls, ...uploadedUrls];
            }

            const payload = {
                ...form,
                base_price: Number(form.base_price),
                category_id: Number(form.category_id),
                location_id: Number(form.location_id),
                max_guests: form.max_guests ? Number(form.max_guests) : null,
                duration_days: form.duration_days ? Number(form.duration_days) : null,
                duration_nights: form.duration_nights ? Number(form.duration_nights) : null,
                latitude: form.latitude ? Number(form.latitude) : null,
                longitude: form.longitude ? Number(form.longitude) : null,
                images: imageUrls
            };

            const res = editMode
                ? await providerApi.updateService(currentServiceId, payload)
                : await providerApi.createService(payload);

            if (res.success) {
                showToast(editMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
                setShowModal(false);
                doFetch(currentPage);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Lỗi xử lý', 'error');
        } finally { setSubmitting(false); }
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await providerApi.deleteService(confirmDelete.id);
            if (res.success) {
                if (services.length === 1 && currentPage > 1) {
                    doFetch(currentPage - 1);
                    setCurrentPage(p => p - 1);
                } else {
                    doFetch(currentPage);
                }
                showToast('Đã xóa dịch vụ.');
            }
        } catch { showToast('Lỗi khi xóa', 'error'); }
        finally { setConfirmDelete(null); }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        doFetch(page);
    };

    const getStatusBadge = (status) => {
        const map = {
            active: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100', label: 'Hoạt động' },
            pending_review: { cls: 'bg-amber-50 text-amber-600 border border-amber-100', label: 'Chờ duyệt' },
            draft: { cls: 'bg-slate-100 text-slate-500 border border-slate-200', label: 'Bản nháp' },
            rejected: { cls: 'bg-rose-50 text-rose-600 border border-rose-100', label: 'Bị từ chối' },
        };
        const s = map[status] || map.draft;
        return <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${s.cls}`}>{s.label}</span>;
    };

    const getTypeBadge = (type) => {
        const map = {
            tour: { cls: 'bg-blue-50 text-blue-600 border border-blue-100', label: '🗺️ Tour' },
            hotel: { cls: 'bg-purple-50 text-purple-600 border border-purple-100', label: '🏨 Khách sạn' },
            homestay: { cls: 'bg-pink-50 text-pink-600 border border-pink-100', label: '🏡 Homestay' },
            vehicle: { cls: 'bg-orange-50 text-orange-600 border border-orange-100', label: '🚌 Phương tiện' },
        };
        const t = map[type] || map.tour;
        return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${t.cls}`}>{t.label}</span>;
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dịch vụ của tôi</h2>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý các dịch vụ bạn đang cung cấp.</p>
                    </div>
                    <button onClick={handleOpenCreate} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                        <Plus size={18} /> Thêm dịch vụ
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-white p-1 border border-slate-100 rounded-[22px] shadow-sm">
                            {['all', 'tour', 'hotel', 'homestay', 'vehicle'].map(opt => (
                                <button key={opt} onClick={() => setTypeFilter(opt)}
                                    className={`px-4 py-2.5 rounded-[18px] text-xs font-bold transition-all ${typeFilter === opt ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    {opt === 'all' ? 'Tất cả' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => doFetch(1)}
                            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                            <RotateCw size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
                ) : services.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 font-medium">Không có dịch vụ nào.</div>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {services.map(service => (
                                <div key={service.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                                {service.media?.[0]?.url
                                                    ? <img src={service.media[0].url} className="w-full h-full object-cover" alt={service.name} />
                                                    : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 truncate">{service.name}</h3>
                                                <div className="flex gap-2 mt-1.5">{getTypeBadge(service.type)} {getStatusBadge(service.status)}</div>
                                                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                                                    <span className="flex items-center gap-1"><MapPin size={11} /> {service.location?.name || '---'}</span>
                                                    {service.type === 'tour' && (service.duration_days || service.duration_nights) && (
                                                        <span className="flex items-center gap-1"><Clock size={11} /> {service.duration_days}N {service.duration_nights}Đ</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-black text-emerald-600">{Number(service.base_price).toLocaleString()}₫</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{service.price_unit === 'per_person' ? '/người' : '/phòng'}</p>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                {/* Lịch trình - chỉ cho tour */}
                                                {service.type === 'tour' && (
                                                    <button
                                                        onClick={() => setScheduleService(service)}
                                                        title="Quản lý lịch trình"
                                                        className="p-2 text-slate-300 hover:text-sky-600 hover:bg-sky-50 rounded-xl flex flex-col items-center gap-0.5"
                                                    >
                                                        <CalendarDays size={15} />
                                                        <span className="text-[9px] font-bold leading-none">Lịch trình</span>
                                                    </button>
                                                )}

                                                {/* Tiện nghi - cho hotel/homestay và cả tour (includes/excludes) */}
                                                <button
                                                    onClick={() => setAmenitiesService(service)}
                                                    title="Tiện nghi & Chi tiết"
                                                    className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl flex flex-col items-center gap-0.5"
                                                >
                                                    <Star size={15} />
                                                    <span className="text-[9px] font-bold leading-none">Tiện nghi</span>
                                                </button>

                                                {/* Quản lý loại phòng - chỉ cho hotel/homestay */}
                                                {(service.type === 'hotel' || service.type === 'homestay') && (
                                                    <button
                                                        onClick={() => setRoomTypeService(service)}
                                                        title="Quản lý phòng"
                                                        className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl flex flex-col items-center gap-0.5"
                                                    >
                                                        <Bed size={15} />
                                                        <span className="text-[9px] font-bold leading-none">Phòng</span>
                                                    </button>
                                                )}

                                                {/* Trạng thái khả dụng (Số chỗ/phòng) - Chỉ cho Tour */}
                                                {service.type === 'tour' && (
                                                    <button
                                                        onClick={() => setAvailabilityService(service)}
                                                        title="Trạng thái khả dụng"
                                                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl flex flex-col items-center gap-0.5"
                                                    >
                                                        <CalendarDays size={15} />
                                                        <span className="text-[9px] font-bold leading-none">Trống</span>
                                                    </button>
                                                )}

                                                <button onClick={() => handleOpenEdit(service)} className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl flex flex-col items-center gap-0.5">
                                                    <Edit3 size={15} />
                                                    <span className="text-[9px] font-bold leading-none">Sửa</span>
                                                </button>
                                                <button onClick={() => setConfirmDelete({ id: service.id, name: service.name })} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl flex flex-col items-center gap-0.5">
                                                    <Trash2 size={15} />
                                                    <span className="text-[9px] font-bold leading-none">Xóa</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination meta={servicesMeta} onPageChange={handlePageChange} />
                    </>
                )}
            </div>

            {/* Modal Tạo/Sửa dịch vụ */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-[2.5rem] p-8 w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900">{editMode ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Hình ảnh dịch vụ (Tối đa 5 ảnh)</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border bg-slate-50 group">
                                            <img src={url} className="w-full h-full object-cover" alt="" />
                                            <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {previewUrls.length < 5 && (
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                                            <UploadCloud size={24} />
                                            <span className="text-[10px] font-bold mt-1 uppercase">Tải ảnh</span>
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Tên dịch vụ *</label>
                                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" placeholder="VD: Tour Trekking Langbiang" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <select value={form.type} onChange={e => {
                                        const newType = e.target.value;
                                        setForm({
                                            ...form,
                                            type: newType,
                                            duration_days: newType !== 'tour' ? '' : form.duration_days,
                                            duration_nights: newType !== 'tour' ? '' : form.duration_nights,
                                            price_unit: ['hotel', 'homestay'].includes(newType) ? 'per_room' : 'per_person'
                                        });
                                    }} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none">
                                        <option value="tour">🗺️ Tour du lịch</option>
                                        <option value="hotel">🏨 Khách sạn</option>
                                        <option value="homestay">🏡 Homestay</option>
                                        <option value="vehicle">🚌 Phương tiện</option>
                                    </select>
                                    <select required value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none">
                                        <option value="">-- Danh mục --</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <div className={`grid ${form.type === 'tour' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                                        <select required value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none">
                                            <option value="">-- Điểm đến (Tỉnh/Thành) --</option>
                                            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                        </select>

                                        {form.type !== 'tour' && (
                                            <input
                                                value={form.address}
                                                onChange={e => setForm({ ...form, address: e.target.value })}
                                                className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none"
                                                placeholder="Địa chỉ chi tiết"
                                            />
                                        )}
                                    </div>

                                </div>

                                {form.type === 'tour' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="0" value={form.duration_days} onChange={e => {
                                                const days = e.target.value;
                                                const val = days === '' ? '' : Math.max(0, parseInt(days) || 0);
                                                setForm({
                                                    ...form,
                                                    duration_days: val,
                                                    duration_nights: val !== '' && Number(form.duration_nights) >= Number(val) ? String(Math.max(0, Number(val) - 1)) : form.duration_nights
                                                });
                                            }} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none" placeholder="Số ngày (VD: 3)" />
                                            <span className="text-xs font-bold text-slate-400">Ngày</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="0" max={form.duration_days || undefined} value={form.duration_nights} onChange={e => {
                                                const nights = e.target.value;
                                                const val = nights === '' ? '' : Math.min(Number(form.duration_days || 0), Math.max(0, parseInt(nights) || 0));
                                                setForm({ ...form, duration_nights: val });
                                            }} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none" placeholder="Số đêm (VD: 2)" />
                                            <span className="text-xs font-bold text-slate-400">Đêm</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <input required type="number" min="0" value={form.base_price} onChange={e => setForm({ ...form, base_price: Math.max(0, e.target.value) })} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none" placeholder="Giá (VNĐ)" />
                                    <select value={form.price_unit} onChange={e => setForm({ ...form, price_unit: e.target.value })} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none">
                                        <option value="per_person">/ người</option>
                                        {(form.type !== 'tour' && form.type !== 'vehicle') && <option value="per_room">/ phòng</option>}
                                    </select>
                                    <input type="number" min="1" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: Math.max(1, e.target.value) })} className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:outline-none" placeholder="Khách tối đa" />
                                </div>

                                <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold resize-none focus:outline-none" placeholder="Mô tả dịch vụ..." />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Hủy</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                                    {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : (editMode ? 'Cập nhật dịch vụ' : 'Tạo dịch vụ ngay')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Lịch Trình */}
            {scheduleService && (
                <ScheduleModal
                    service={scheduleService}
                    onClose={() => setScheduleService(null)}
                    showToast={showToast}
                />
            )}

            {/* Modal Tiện Nghi */}
            {amenitiesService && (
                <AmenitiesModal
                    service={amenitiesService}
                    onClose={() => setAmenitiesService(null)}
                    showToast={showToast}
                    onSaved={() => doFetch(currentPage)}
                />
            )}

            {/* Modal Loại Phòng */}
            {roomTypeService && (
                <RoomTypeModal
                    service={roomTypeService}
                    onClose={() => setRoomTypeService(null)}
                    showToast={showToast}
                />
            )}

            {/* Modal Trạng thái khả dụng */}
            {availabilityService && (
                <AvailabilityModal
                    service={availabilityService}
                    onClose={() => setAvailabilityService(null)}
                    showToast={showToast}
                />
            )}

            {confirmDelete && <ConfirmModal message={`Xóa dịch vụ "${confirmDelete.name}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDelete(null)} />}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </>
    );
};

export default MyServices;
