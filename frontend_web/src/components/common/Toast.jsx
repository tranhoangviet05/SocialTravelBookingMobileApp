import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ id, message, type, duration, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <XCircle className="text-rose-500" size={20} />,
        warning: <AlertCircle className="text-amber-500" size={20} />,
        info: <Info className="text-sky-500" size={20} />,
    };

    const backgrounds = {
        success: 'bg-emerald-50/80 border-emerald-100',
        error: 'bg-rose-50/80 border-rose-100',
        warning: 'bg-amber-50/80 border-amber-100',
        info: 'bg-sky-50/80 border-sky-100',
    };

    return (
        <div 
            className={`
                pointer-events-auto
                min-w-[320px] max-w-[420px] 
                p-4 rounded-2xl border
                backdrop-blur-md shadow-lg 
                flex items-start gap-4
                transition-all duration-300 ease-out
                ${backgrounds[type]}
                ${isExiting ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}
                animate-[slideIn_0.3s_ease-out]
            `}
            style={{
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            }}
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[type]}
            </div>
            
            <div className="flex-grow">
                <p className="text-sm font-bold text-slate-800 leading-tight">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </p>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {message}
                </p>
            </div>

            <button 
                onClick={handleClose}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
                <X size={16} />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-black/5 w-full overflow-hidden rounded-b-2xl">
                <div 
                    className={`h-full transition-all linear ${
                        type === 'success' ? 'bg-emerald-500' :
                        type === 'error' ? 'bg-rose-500' :
                        type === 'warning' ? 'bg-amber-500' :
                        'bg-sky-500'
                    }`}
                    style={{ 
                        width: '100%',
                        transitionDuration: `${duration}ms`,
                        animation: `progress ${duration}ms linear forwards`
                    }}
                />
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default Toast;
