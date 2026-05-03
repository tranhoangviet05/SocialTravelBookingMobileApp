import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Shield, User, Ban, CheckCircle, RotateCw,
    Mail, Settings2, Clock, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminData } from '../../contexts/AdminDataContext';

const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) return null;
    const { current_page, last_page, total } = meta;
    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-400 font-medium">Tổng: <span className="font-bold text-slate-600">{total}</span> người dùng</p>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(current_page - 1)} disabled={current_page <= 1}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={18} />
                </button>
                {Array.from({ length: last_page }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => onPageChange(page)}
                        className={`min-w-[36px] h-9 rounded-xl text-sm font-bold transition-all ${
                            page === current_page ? 'bg-sky-600 text-white shadow-lg shadow-sky-200' : 'text-slate-500 hover:bg-slate-100'
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

const UserManagement = () => {
    const { users, loadingStates, fetchUsers, meta, setUsers } = useAdminData();
    const usersMeta = meta?.users || { current_page: 1, last_page: 1, total: 0 };

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingId, setUpdatingId] = useState(null);
    const toast = useNotification();

    const loading = loadingStates.users && users.length === 0;
    const lockRef = React.useRef(null);

    const doFetch = useCallback((page = 1, search = '') => {
        fetchUsers(true, page, { search: search || undefined, role: 'tourist' });
    }, [fetchUsers]);

    useEffect(() => { doFetch(1, ''); setCurrentPage(1); }, [doFetch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            doFetch(1, searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        doFetch(page, searchTerm);
    };



    const handleStatusChange = async (userId, newStatus) => {
        setUpdatingId(userId);
        try {
            const res = await adminApi.updateUserStatus(userId, newStatus);
            if (res.success) {
                toast.success('Cập nhật trạng thái thành công');
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            }
        } catch (e) {
            toast.error('Lỗi khi cập nhật trạng thái');
        } finally { setUpdatingId(null); }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><Shield size={12} /> Admin</span>;
            case 'provider': return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><Settings2 size={12} /> Provider</span>;
            default: return <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"><User size={12} /> Tourist</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle size={14} /> Active</span>;
            case 'banned': return <span className="flex items-center gap-1 text-rose-500 font-bold text-xs"><Ban size={14} /> Banned</span>;
            default: return <span className="flex items-center gap-1 text-amber-500 font-bold text-xs"><Clock size={14} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Khách du lịch</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Xem và quản lý tất cả tài khoản khách du lịch trong hệ thống.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text" placeholder="Tìm theo tên, email..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => doFetch(currentPage, searchTerm)}
                        className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] shadow-sm transition-all active:scale-95 cursor-pointer">
                        <RotateCw size={20} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                    <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-bold">Đang tải danh sách khách du lịch...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                        <User size={40} />
                    </div>
                    <p className="text-slate-500 font-medium">Không có khách du lịch nào.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người dùng</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vai trò</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-black text-sm shadow-sm overflow-hidden border border-white">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            (user.display_name || user.email || 'U')[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{user.display_name || user.email}</p>
                                                        <div className="flex items-center gap-1 mt-0.5 text-[11px] font-bold text-gray-400">
                                                            <Mail size={10} /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                             <td className="px-8 py-5">
                                                 <div className="flex flex-wrap gap-2">
                                                     {getRoleBadge(user.role)}
                                                 </div>
                                             </td>
                                            <td className="px-8 py-5">{getStatusBadge(user.status)}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.status === 'active' ? (
                                                        <button onClick={() => handleStatusChange(user.id, 'banned')}
                                                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Ban">
                                                            <Ban size={18} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleStatusChange(user.id, 'active')}
                                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Unban">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination meta={usersMeta} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default UserManagement;
