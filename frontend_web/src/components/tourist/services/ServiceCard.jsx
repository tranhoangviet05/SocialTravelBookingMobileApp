import React from 'react';
import { Star, MapPin, Clock, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../contexts/WishlistContext';

const ServiceCard = ({ service, className = '' }) => {
    // Mapping backend fields to local variables
    const {
        id,
        name,
        slug,
        type,
        location,
        base_price,
        rating_avg,
        total_bookings,
        duration_days,
        duration_nights,
        max_guests,
        media = [],
        tags = [],
        provider,
        media_count,
    } = service;

    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isFavorited = isInWishlist(id);

    // Format data
    const price = base_price;
    const rating = rating_avg || 0;
    const soldCount = total_bookings || 0;
    const locationName = location?.name || 'Việt Nam';
    const mainImage = media.find(m => m.is_cover)?.url || media[0]?.url || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800';
    
    // Duration label
    const duration = (type === 'tour' && duration_days)
        ? `${duration_days} ngày ${duration_nights ? duration_nights + ' đêm' : ''}`
        : (type === 'tour' ? 'Trong ngày' : 'Lưu trú');

    const typeLabel = type === 'tour' ? 'Tour' : 'Lưu trú';
    const typeColor = type === 'tour' ? 'bg-amber-500' : 'bg-sky-600';

    const formatPrice = (p) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p);

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFavorited) {
            removeFromWishlist(id);
        } else {
            addToWishlist(service);
        }
    };

    return (
        <Link
            to={`/service/${slug}`}
            className={`group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${className}`}
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={mainImage}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Type badge */}
                <span className={`absolute top-3 right-3 ${typeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                    {typeLabel}
                </span>

                {/* Favorite */}
                <button
                    onClick={handleFavorite}
                    className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all cursor-pointer ${
                        isFavorited 
                            ? 'bg-rose-500 text-white hover:bg-rose-600' 
                            : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'
                    }`}
                    title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                    <Heart size={16} className={isFavorited ? 'fill-current' : 'group-hover:fill-current transition-colors'} />
                </button>

                {/* Sold count */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span>Đã bán {soldCount}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Location */}
                <div className="flex items-center gap-1 text-sky-600 text-xs font-semibold mb-2">
                    <MapPin size={12} />
                    <span>{locationName}</span>
                </div>

                {/* Name */}
                <h3 className="text-slate-900 font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-sky-700 transition-colors">
                    {name}
                </h3>

                {/* Provider */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {provider?.business_name?.[0] || 'P'}
                    </div>
                    <span className="text-xs text-gray-500">{provider?.business_name || 'Hệ thống'}</span>
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {tags.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[11px] text-slate-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                {/* Info row */}
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {duration}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={12} />
                        Tối đa {max_guests || 'N/A'}
                    </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-700">{rating}</span>
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                    <div>
                        <span className="text-lg font-black text-sky-700">{formatPrice(price)}</span>
                        {type === 'hotel' || type === 'homestay' ? (
                            <span className="text-xs text-gray-400"> / đêm</span>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">/{media_count || media.length} ảnh</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};


export default ServiceCard;