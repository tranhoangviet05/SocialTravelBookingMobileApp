import React from 'react';
import { Construction } from 'lucide-react';

const AdminPlaceholder = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 animate-bounce">
                <Construction size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Tính năng {title}</h2>
            <p className="text-slate-500 font-medium max-w-sm">
                Chúng tôi đang nỗ lực hoàn thiện trang quản lý này. Tính năng sẽ sớm được ra mắt trong các bản cập nhật tiếp theo.
            </p>
            <div className="mt-8 flex gap-4">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping [animation-delay:0.4s]" />
            </div>
        </div>
    );
};

export default AdminPlaceholder;
