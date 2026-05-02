import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [notification, setNotification] = useState(null);

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse wishlist:', e);
            }
        }
    }, []);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 2500);
    }, []);

    const addToWishlist = useCallback((service) => {
        const exists = wishlist.find(item => item.id === service.id);
        if (exists) {
            showNotification('Dịch vụ đã có trong danh sách yêu thích!', 'info');
            return false;
        }
        setWishlist(prev => [...prev, service]);
        showNotification('Đã thêm vào danh sách yêu thích!', 'success');
        return true;
    }, [wishlist, showNotification]);

    const removeFromWishlist = useCallback((serviceId) => {
        setWishlist(prev => prev.filter(item => item.id !== serviceId));
        showNotification('Đã xóa khỏi danh sách yêu thích!', 'info');
    }, [showNotification]);

    const isInWishlist = useCallback((serviceId) => {
        return wishlist.some(item => item.id === serviceId);
    }, [wishlist]);

    const value = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        notification,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
            
            {/* Toast Notification */}
            {notification && (
                <div className={`fixed top-24 right-4 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-[slideInRight_0.3s_ease-out] ${
                    notification.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                    {notification.type === 'success' ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    {notification.message}
                </div>
            )}
            
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </WishlistContext.Provider>
    );
};

export default WishlistContext;
