import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AdminMetricCard = ({ label, value, icon: Icon, change, trend, color = 'sky' }) => {
    const colorClasses = {
        sky: 'bg-sky-500 shadow-sky-500/20',
        emerald: 'bg-emerald-500 shadow-emerald-500/20',
        amber: 'bg-amber-500 shadow-amber-500/20',
        rose: 'bg-rose-500 shadow-rose-500/20',
        violet: 'bg-violet-500 shadow-violet-500/20',
        blue: 'bg-blue-600 shadow-blue-600/20',
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colorClasses[color]} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <Icon size={24} />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                        trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                    }`}>
                        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {change}
                    </div>
                )}
            </div>
            <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
                <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
};

export default AdminMetricCard;
