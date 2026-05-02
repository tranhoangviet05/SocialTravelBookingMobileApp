import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = ({ roleTitle = 'Dashboard' }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <Link to="/" className="text-xl font-bold text-sky-600">TravelWise</Link>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-6 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {roleTitle} Menu
                    </div>
                    {/* Các tính năng cụ thể sẽ được nhúng thông qua Dashboard components */}
                    <nav className="px-4 space-y-1">
                        <Link to="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-sky-50 text-sky-700">
                            Dashboard
                        </Link>
                        {/* More links can be added here or passed as children/config */}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-200">
                    <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
                    >
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <h1 className="text-xl font-semibold text-slate-800">{roleTitle}</h1>
                    <div className="flex items-center">
                        <span className="text-sm text-slate-500 mr-4">Xin chào, {currentUser?.email || 'User'}</span>
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
                            {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
