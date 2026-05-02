import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onLoginClick }) => {
    const { currentUser, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setShowDropdown(false);
        await logout();
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <div className="text-2xl font-black tracking-tight text-sky-900">
                        Social Travel Booking
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex space-x-8">
                    {[
                        { text: 'TRANG CHỦ', path: '/' },
                        { text: 'HOẠT ĐỘNG', path: '/search?type=tour' },
                        { text: 'LƯU TRÚ', path: '/search?type=accommodation' },
                        { text: 'CỘNG ĐỒNG', path: '/newsfeed' }
                    ].map((item) => (
                        <Link
                            key={item.text}
                            to={item.path}
                            className={`text-sm font-semibold transition-colors text-gray-500 hover:text-sky-900`}
                        >
                            {item.text}
                        </Link>
                    ))}
                </nav>

                {/* Auth & Icons */}
                <div className="flex items-center space-x-6 text-gray-600">
                    <button className="cursor-pointer hover:text-sky-900 transition-colors">
                        <Bell size={20} />
                    </button>

                    {currentUser ? (
                        /* — Đã đăng nhập: Hiển thị avatar + dropdown — */
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                {currentUser.photoURL || currentUser.avatar_url ? (
                                    <img
                                        src={currentUser.photoURL || currentUser.avatar_url}
                                        alt="Avatar"
                                        className="w-9 h-9 rounded-full object-cover border-2 border-sky-200 group-hover:border-sky-400 transition-all"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-sky-900 flex items-center justify-center text-white text-sm font-bold">
                                        {(currentUser.displayName || currentUser.display_name || currentUser.email || '?')[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="hidden lg:block text-sm font-semibold text-slate-700 max-w-[120px] truncate group-hover:text-sky-900 transition-colors">
                                    {currentUser.displayName || currentUser.display_name || currentUser.email?.split('@')[0]}
                                </span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-[fadeIn_0.15s_ease-out]">
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {currentUser.displayName || currentUser.display_name || 'Người dùng'}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {currentUser.email}
                                        </p>
                                    </div>

                                    {/* Menu items */}
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowDropdown(false)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <User size={16} />
                                        Thông tin cá nhân
                                    </Link>

                                    <Link
                                        to="/my-bookings"
                                        onClick={() => setShowDropdown(false)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                        Chuyến đi của tôi
                                    </Link>

                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                        >
                                            <LogOut size={16} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* — Chưa đăng nhập: Nút Đăng nhập — */
                        <button
                            onClick={onLoginClick}
                            className="cursor-pointer px-6 py-2 rounded-full font-semibold text-white bg-sky-900 transition-all transform hover:scale-105 hover:bg-sky-800"
                        >
                            Đăng nhập
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </header>
    );
};

export default Header;
