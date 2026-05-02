import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SocialRoute = () => {
    const { currentUser, socialActive, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-sky-100/50 border border-white max-w-sm w-full animate-in zoom-in duration-500">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-sky-500/10 rounded-full animate-pulse flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-slate-800">Đang chuẩn bị hồ sơ</h3>
                        <p className="text-gray-500 text-sm font-medium animate-pulse">Vui lòng đợi trong giây lát...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    if (!socialActive) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};

export default SocialRoute;
