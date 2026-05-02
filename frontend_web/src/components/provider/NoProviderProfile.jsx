import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import providerApi from '../../api/providerApi';

/**
 * Hiển thị khi Provider chưa có ProviderProfile trong DB.
 * Cho phép tự tạo profile bằng 1 click.
 */
const NoProviderProfile = ({ onProfileCreated }) => {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleSetup = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await providerApi.setupProfile();
            if (res.success) {
                setDone(true);
                setTimeout(() => {
                    if (onProfileCreated) onProfileCreated();
                    else window.location.reload();
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể khởi tạo hồ sơ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center">
                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-emerald-800 mb-2">Hồ sơ đã được khởi tạo!</h3>
                <p className="text-emerald-600">Đang tải lại dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 text-center">
            <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-amber-800 mb-2">Chưa có hồ sơ nhà cung cấp</h3>
            <p className="text-amber-600 mb-6 max-w-md mx-auto">
                Tài khoản của bạn chưa có hồ sơ kinh doanh. Bấm bên dưới để khởi tạo hồ sơ và bắt đầu sử dụng cổng nhà cung cấp.
            </p>
            {error && (
                <p className="text-rose-600 text-sm font-medium mb-4 bg-rose-50 px-4 py-2 rounded-xl inline-block">
                    {error}
                </p>
            )}
            <button
                onClick={handleSetup}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-white rounded-2xl font-black text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
                {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Đang khởi tạo...</>
                ) : (
                    <><RefreshCw size={18} /> Khởi tạo hồ sơ ngay</>
                )}
            </button>
            <p className="text-amber-500 text-xs mt-4 font-medium">
                Hồ sơ sẽ ở trạng thái "Chờ duyệt" cho đến khi Admin phê duyệt
            </p>
        </div>
    );
};

export default NoProviderProfile;
