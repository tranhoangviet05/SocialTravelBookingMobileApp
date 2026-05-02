import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../../components/tourist/services/ServiceCard';
import { useWishlist } from '../../contexts/WishlistContext';

const Wishlist = () => {
    const { wishlist } = useWishlist();
    const navigate = useNavigate();

    if (wishlist.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <Heart size={80} className="text-gray-200 mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Danh sách yêu thích trống</h2>
                <p className="text-slate-500 mb-6">Hãy thả tim các dịch vụ bạn ưng ý để lưu lại ở đây nhé.</p>
                <button 
                    onClick={() => navigate('/search')}
                    className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors cursor-pointer"
                >
                    Khám phá dịch vụ
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Danh sách yêu thích</h1>
                    <p className="text-slate-500 text-sm">Bạn đã lưu {wishlist.length} dịch vụ để dành.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map(service => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
