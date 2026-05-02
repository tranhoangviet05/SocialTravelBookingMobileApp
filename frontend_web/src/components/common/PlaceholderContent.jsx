import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderContent = ({ title, page }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
            <div className="w-24 h-24 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 animate-pulse">
                <Construction size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Trang {page}</h2>
            <p className="text-slate-500 font-medium max-w-sm">
                Vai trò: <span className="text-sky-600 font-bold">{title}</span>. 
                Chúng tôi đang nỗ lực hoàn thiện tính năng này. Vui lòng quay lại sau!
            </p>
            <div className="mt-8 flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping [animation-delay:0.4s]" />
            </div>
        </div>
    );
};

export default PlaceholderContent;
