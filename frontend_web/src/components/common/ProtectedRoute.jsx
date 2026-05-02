import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute — Bảo vệ route theo vai trò người dùng
 * 
 * @param {React.ReactNode} children - Component con cần bảo vệ
 * @param {string[]} allowedRoles - Danh sách vai trò được phép truy cập
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { currentUser, userRole, loading } = useAuth();

    // Đang kiểm tra trạng thái đăng nhập
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm font-medium">Đang xác thực...</p>
                </div>
            </div>
        );
    }

    // Chưa đăng nhập → Về trang chủ
    if (!currentUser) {
        return <Navigate to="/" replace />;
    }

    // Đã đăng nhập nhưng sai vai trò → Chuyển về trang mặc định của vai trò
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        const roleRedirects = {
            admin: '/admin/dashboard',
            provider: '/provider/dashboard',
            tourist: '/',
        };
        return <Navigate to={roleRedirects[userRole] || '/'} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
