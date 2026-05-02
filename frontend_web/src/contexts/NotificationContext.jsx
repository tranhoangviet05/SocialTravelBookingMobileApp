import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const show = useCallback((message, type = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const remove = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const notificationApi = {
        success: (msg, dur) => show(msg, 'success', dur),
        error: (msg, dur) => show(msg, 'error', dur),
        warning: (msg, dur) => show(msg, 'warning', dur),
        info: (msg, dur) => show(msg, 'info', dur),
    };

    return (
        <NotificationContext.Provider value={notificationApi}>
            {children}
            {/* Render Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {notifications.map(n => (
                    <Toast 
                        key={n.id} 
                        {...n} 
                        onClose={() => remove(n.id)} 
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
