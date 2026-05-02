import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User, Menu, ArrowLeft } from 'lucide-react';

const Sidebar = ({ openCreateModal }) => {
    const location = useLocation();

    const navItems = [
        { id: 'home', icon: Home, path: '/newsfeed' },
        { id: 'search', icon: Search, path: '/newsfeed/search' },
        { id: 'create', icon: PlusSquare, path: null },
        { id: 'activity', icon: Heart, path: '/newsfeed/activity' },
        { id: 'profile', icon: User, path: '/newsfeed/profile' },
    ];

    const isActive = (item) => {
        if (!item.path) return false;
        if (item.id === 'home') return location.pathname === '/newsfeed';
        return location.pathname.startsWith(item.path);
    };

    return (
        <nav className="w-[76px] sticky top-0 h-screen flex flex-col justify-between py-6 items-center">
            <div className="flex flex-col items-center w-full">
                {/* Nút quay về trang Booking */}
                <Link
                    to="/"
                    title="Về trang Đặt chỗ"
                    className="p-3 mb-8 text-sky-500 bg-sky-50 hover:bg-sky-100 hover:text-sky-600 rounded-xl transition-colors group relative"
                >
                    <ArrowLeft size={28} strokeWidth={2.5} />
                    <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-50">
                        Về trang Đặt chỗ
                    </span>
                </Link>

                <div className="flex flex-col gap-8">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const className = `p-3 rounded-xl transition-all ${active ? 'text-black' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`;

                        if (item.id === 'create') {
                            return (
                                <button
                                    key={item.id}
                                    onClick={openCreateModal}
                                    className={className}
                                >
                                    <Icon size={28} strokeWidth={2} fill="none" />
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={className}
                            >
                                <Icon size={28} strokeWidth={active ? 2.5 : 2} fill={active && item.id === 'home' ? 'currentColor' : 'none'} />
                            </Link>
                        );
                    })}
                </div>
            </div>
            <button className="p-3 text-gray-400 hover:text-black transition-colors mb-4">
                <Menu size={28} />
            </button>
        </nav>
    );
};

export default Sidebar;