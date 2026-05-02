import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, Clock, Users, CheckCircle2, Shield, CalendarDays,
    Loader2, BedDouble,
    Sun, Moon, Utensils, WifiHigh, Snowflake,
    Dumbbell, ShoppingBag, Waves,
    Car, Coffee, TreePine, Camera
} from 'lucide-react';
import Button from '../../components/common/Button';
import ServiceReviews from '../../components/tourist/services/ServiceReviews';
import { MOCK_REVIEWS } from '../../data/mockServices';
import axios from 'axios';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useAuth } from '../../contexts/AuthContext';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';

// Amenity icon mapping
const AMENITY_ICONS = {
    'wifi': WifiHigh, 'internet': WifiHigh, 'wifi miễn phí': WifiHigh,
    'pool': Waves, 'hồ bơi': Waves, 'bể bơi': Waves, 'swimming': Waves,
    'parking': Car, 'đỗ xe': Car, 'bãi đỗ': Car,
    'breakfast': Coffee, 'ăn sáng': Coffee, 'buffet': Coffee,
    'ac': Snowflake, 'điều hòa': Snowflake, 'máy lạnh': Snowflake,
    'gym': Dumbbell, 'phòng gym': Dumbbell, 'fitness': Dumbbell,
    'restaurant': Utensils, 'nhà hàng': Utensils, 'ẩm thực': Utensils,
    'beach': TreePine, 'biển': TreePine, 'bãi biển': TreePine,
    'spa': Camera, 'massage': Camera, 'thư giãn': Camera,
    'shop': ShoppingBag, 'mua sắm': ShoppingBag, 'cửa hàng': ShoppingBag,
};

const getAmenityIcon = (text) => {
    const lower = (text || '').toLowerCase();
    for (const [key, Icon] of Object.entries(AMENITY_ICONS)) {
        if (lower.includes(key)) return Icon;
    }
    return CheckCircle2;
};

const Tab = ({ id, label, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            active === id
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
        }`}
    >
        {label}
    </button>
);

const ItineraryItem = ({ item, isLast }) => (
    <div className="flex gap-6">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-sky-200 z-10">
                {item.day_number}
            </div>
            {!isLast && (
                <div className="w-0.5 flex-1 bg-gradient-to-b from-sky-200 to-transparent my-2 min-h-[40px]" />
            )}
        </div>
        <div className="flex-1 pb-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-slate-800 text-sm">{item.title}</h4>
                    {item.time && (
                        <span className="text-xs font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-lg">{item.time}</span>
                    )}
                </div>
                {item.description && (
                    <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                )}
            </div>
        </div>
    </div>
);

const AmenityBadge = ({ text }) => {
    const Icon = getAmenityIcon(text);
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sky-500"><Icon size={16} /></span>
            <span className="text-sm font-medium text-slate-700">{text}</span>
        </div>
    );
};

const StarRating = ({ rating, size = 14 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={size} className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
        ))}
    </div>
);

const ServiceDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [bookingForm, setBookingForm] = useState({
        date: new Date().toISOString().split('T')[0],
        adults: 1,
        children: 0
    });
    const [selectedRoomType, setSelectedRoomType] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveTab('overview');
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/general/get/services/detail/${slug}`);
                if (response.data.success) {
                    const data = response.data.data;
                    setServiceData(data);
                    // Mặc định chọn loại phòng đầu tiên nếu có
                    if (data.room_types && data.room_types.length > 0) {
                        setSelectedRoomType(data.room_types[0]);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết dịch vụ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug]);

    // Theo dõi hành vi: Gửi tín hiệu "view_service" ngay lập tức khi load xong data
    const { trackAction } = useBehaviorTracking(currentUser, serviceData?.location?.id, serviceData?.type);

    useEffect(() => {
        if (serviceData && currentUser) {
            trackAction('view_service', { 
                service_id: serviceData.id,
                location_id: serviceData.location?.id,
                service_type: serviceData.type,
                dwell_time: 0 // Lần đầu gửi dwell_time = 0
            });
        }
    }, [serviceData?.id, currentUser?.id, trackAction]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-sky-500" size={48} />
            </div>
        );
    }

    if (!serviceData) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold text-lg">
                Không tìm thấy thông tin dịch vụ này.
            </div>
        );
    }

    const isTour = serviceData.type === 'tour';
    const isHotel = serviceData.type === 'hotel';
    const isHomestay = serviceData.type === 'homestay';
    const isVehicle = serviceData.type === 'vehicle';

    const images = serviceData.media?.map(m => m.url) || [];
    const allImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800'];
    const price = selectedRoomType ? selectedRoomType.base_price : (serviceData.base_price ?? 0);
    const rating = serviceData.rating_avg ?? 0;
    const reviewCount = serviceData.total_reviews ?? serviceData.total_bookings ?? 0;
    const duration = (isTour && serviceData.duration_days)
        ? `${serviceData.duration_days} ngày ${serviceData.duration_nights ? serviceData.duration_nights + ' đêm' : ''}`
        : (isHotel ? 'Lưu trú' : 'Trong ngày');
    const reviews = serviceData.reviews ?? [];

    const amenities = serviceData.amenities || serviceData.tags || [];
    const includes = serviceData.includes || [];
    const excludes = serviceData.excludes || [];
    const schedules = serviceData.schedules || [];


    const handleBooking = () => {
        if (!serviceData) return;
        navigate('/checkout', { 
            state: { 
                service: serviceData,
                bookingInfo: {
                    ...bookingForm,
                    room_type_id: selectedRoomType?.id,
                    selectedRoomType: selectedRoomType
                }
            } 
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8 pb-16">
                {/* Header: Name, Type, Rating, Location - ABOVE image */}
                <div className="mb-6">
                    {/* Type badge */}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 ${
                        isTour ? 'bg-blue-50 text-blue-600' :
                        isHotel ? 'bg-purple-50 text-purple-600' :
                        isHomestay ? 'bg-pink-50 text-pink-600' :
                        'bg-orange-50 text-orange-600'
                    }`}>
                        {isTour ? '🗺️ Tour du lịch' : isHotel ? '🏨 Khách sạn' : isHomestay ? '🏡 Homestay' : '🚌 Phương tiện'}
                    </span>

                    <h1 className="text-3xl lg:text-4xl font-black text-slate-800 mb-4 leading-tight">{serviceData.name}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <span className="flex items-center gap-1.5">
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                            <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
                            <span className="text-slate-400">({reviewCount} đánh giá)</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin size={16} className="text-rose-400" />
                            {serviceData.location?.name || 'Việt Nam'}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <span className="font-bold text-slate-700">{serviceData.provider?.business_name || 'Hệ thống'}</span>
                        </span>
                    </div>

                </div>

                {/* Image Gallery - Restored to 4-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[440px] mb-8 shadow-sm">
                    <div
                        className="md:col-span-2 relative group cursor-pointer h-full rounded-2xl overflow-hidden"
                        onClick={() => { setActiveImage(0); setLightboxOpen(true); }}
                    >
                        <img
                            src={allImages[0]}
                            alt="Main"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="hidden md:flex flex-col gap-4 h-full">
                        {allImages.slice(1, 3).map((img, idx) => (
                            <div
                                key={idx}
                                className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer"
                                onClick={() => { setActiveImage(idx + 1); setLightboxOpen(true); }}
                            >
                                <img
                                    src={img}
                                    alt={`Gallery ${idx}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {idx === 1 && allImages.length > 3 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-black text-2xl">+{allImages.length - 3}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* 4th Column (Right tall image) */}
                    <div
                        className="hidden md:block rounded-2xl overflow-hidden relative group cursor-pointer h-full"
                        onClick={() => { setActiveImage(3); setLightboxOpen(true); }}
                    >
                        {allImages[3] ? (
                            <img src={allImages[3]} alt="Gallery 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <span className="text-slate-300 font-bold text-lg">+{allImages.length - 3} ảnh</span>
                            </div>
                        )}
                    </div>
                </div>

                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    index={activeImage}
                    slides={allImages.map(img => ({ src: img }))}
                />

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Quick Stats - Moved inside content area to prevent overlap */}
                        <div className="flex flex-wrap gap-3 py-6 border-b border-slate-100 mb-8">
                            {isTour && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <Clock size={18} className="text-sky-500" />
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Thời lượng</p>
                                        <p className="font-bold text-slate-800 text-xs">{duration}</p>
                                    </div>
                                </div>
                            )}
                            {(isHotel || isHomestay) && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <BedDouble size={18} className="text-purple-500" />
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Loại phòng</p>
                                        <p className="font-bold text-slate-800 text-xs">{selectedRoomType ? selectedRoomType.name : 'Standard'}</p>
                                    </div>
                                </div>
                            )}
                            {serviceData.max_guests && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <Users size={18} className="text-emerald-500" />
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Số khách</p>
                                        <p className="font-bold text-slate-800 text-xs">Tối đa {serviceData.max_guests}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Shield size={18} className="text-amber-500" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chính sách</p>
                                    <p className="font-bold text-slate-800 text-xs">Hủy miễn phí 48h</p>
                                </div>
                            </div>
                        </div>
                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-slate-200 mb-8 bg-white rounded-t-2xl px-2">
                            <Tab id="overview" label="Tổng quan" active={activeTab} onClick={setActiveTab} />
                            {isTour && <Tab id="itinerary" label={`Lịch trình (${schedules.length} ngày)`} active={activeTab} onClick={setActiveTab} />}
                            {(isHotel || isHomestay) && <Tab id="amenities" label={`Tiện nghi (${amenities.length})`} active={activeTab} onClick={setActiveTab} />}
                            <Tab id="reviews" label={`Đánh giá & Bình luận`} active={activeTab} onClick={setActiveTab} />
                        </div>

                        {/* Tab: Overview */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Description */}
                                <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <Sun size={20} className="text-amber-500" />
                                        Giới thiệu
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                        {serviceData.description || 'Chưa có mô tả cho dịch vụ này.'}
                                    </p>
                                </section>

                                {/* Room Selection for Hotels */}
                                {(isHotel || isHomestay) && serviceData.room_types?.length > 0 && (
                                    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <BedDouble size={20} className="text-purple-500" />
                                            Chọn loại phòng
                                        </h2>
                                        <div className="space-y-4">
                                            {serviceData.room_types.map((room) => (
                                                <div 
                                                    key={room.id}
                                                    onClick={() => setSelectedRoomType(room)}
                                                    className={`group relative flex flex-col md:flex-row gap-5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                        selectedRoomType?.id === room.id 
                                                            ? 'border-sky-500 bg-sky-50/30 ring-4 ring-sky-50 shadow-md' 
                                                            : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm'
                                                    }`}
                                                >
                                                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                                        <img 
                                                            src={room.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                            alt={room.name} 
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="font-black text-slate-800">{room.name}</h3>
                                                            <div className="text-right">
                                                                <p className="text-lg font-black text-sky-600">{new Intl.NumberFormat('vi-VN').format(room.base_price)}đ</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ đêm</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                                                            {room.description || 'Không có mô tả chi tiết cho loại phòng này.'}
                                                        </p>
                                                        <div className="flex flex-wrap gap-4">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                                <Users size={14} className="text-slate-400" />
                                                                {room.capacity_adults} người lớn {room.capacity_children > 0 && `, ${room.capacity_children} trẻ em`}
                                                            </div>
                                                            {room.amenities?.slice(0, 3).map((am, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                                    {am}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {selectedRoomType?.id === room.id && (
                                                        <div className="absolute top-4 right-4 bg-sky-500 text-white p-1 rounded-full shadow-lg">
                                                            <CheckCircle2 size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Includes / Excludes / Amenities */}
                                {(includes.length > 0 || excludes.length > 0 || amenities.length > 0) && (
                                    <section className="grid md:grid-cols-2 gap-6">
                                        {includes.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                                    Bao gồm
                                                </h2>
                                                <ul className="space-y-3">
                                                    {includes.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                                            <span className="text-sm text-slate-600">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {excludes.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                                    <Moon size={20} className="text-rose-500" />
                                                    Không bao gồm
                                                </h2>
                                                <ul className="space-y-3">
                                                    {excludes.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <div className="w-[18px] h-[18px] rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                                                                <div className="w-2 h-0.5 bg-rose-500 rounded-full" />
                                                            </div>
                                                            <span className="text-sm text-slate-600">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {amenities.length > 0 && (
                                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                                    <Star size={20} className="text-sky-500" />
                                                    Tiện ích
                                                </h2>
                                                <div className="flex flex-wrap gap-2">
                                                    {amenities.map((item, i) => (
                                                        <AmenityBadge key={i} text={item} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                )}
                            </div>
                        )}

                        {/* Tab: Itinerary (Tour) */}
                        {activeTab === 'itinerary' && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <CalendarDays size={22} className="text-sky-500" />
                                        Lịch trình chi tiết
                                    </h2>
                                    {schedules.length > 0 && (
                                        <span className="text-xs font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full">
                                            {schedules.length} ngày
                                        </span>
                                    )}
                                </div>

                                {schedules.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="font-bold">Nhà cung cấp chưa cập nhật lịch trình.</p>
                                        <p className="text-sm mt-1">Liên hệ để biết thêm chi tiết.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {schedules.map((item, idx) => (
                                            <ItineraryItem
                                                key={item.id || idx}
                                                item={item}
                                                isLast={idx === schedules.length - 1}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Amenities (Hotel/Homestay) */}
                        {activeTab === 'amenities' && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <BedDouble size={22} className="text-purple-500" />
                                    Tiện nghi & Dịch vụ
                                </h2>
                                {amenities.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <BedDouble size={48} className="mx-auto mb-4 opacity-30" />
                                        <p className="font-bold">Chưa có thông tin tiện nghi.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {amenities.map((item, i) => (
                                            <AmenityBadge key={i} text={item} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Reviews */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                {/* Rating Summary */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <div className="text-5xl font-black text-slate-800">{rating.toFixed(1)}</div>
                                            <StarRating rating={rating} size={18} />
                                            <p className="text-sm text-slate-400 mt-1 font-medium">{reviewCount} đánh giá</p>
                                        </div>
                                        <div className="flex-1 border-l border-slate-100 pl-8 space-y-2">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const pct = star === 5 ? 65 : star === 4 ? 20 : star === 3 ? 10 : 5;
                                                return (
                                                    <div key={star} className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-500 w-6">{star}</span>
                                                        <Star size={12} className="text-amber-400 fill-amber-400" />
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400 w-8">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Feedback & Review Component (Merged) */}
                                <ServiceReviews serviceId={serviceData.id} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Booking */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7 sticky top-24">
                            {/* Price */}
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-3xl font-black text-slate-800">
                                    {new Intl.NumberFormat('vi-VN').format(price)}đ
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-5">
                                {isHotel ? 'Giá / đêm' : isHomestay ? 'Giá / đêm' : isTour ? 'Giá / người' : 'Giá / chuyến'}
                            </p>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleBooking(); }}>
                                {/* Date */}
                                <div className="border border-slate-200 rounded-xl p-4 hover:border-sky-300 transition-colors">
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1.5">{isTour ? 'Ngày khởi hành' : 'Ngày nhận phòng'}</label>
                                    <input
                                        type="date"
                                        value={bookingForm.date}
                                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                        className="w-full font-bold text-slate-800 outline-none cursor-pointer bg-transparent"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {isTour && serviceData.duration_days && (
                                        <p className="mt-2 text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded inline-block">
                                            Kết thúc: {(() => {
                                                const d = new Date(bookingForm.date);
                                                d.setDate(d.getDate() + parseInt(serviceData.duration_days));
                                                return d.toLocaleDateString('vi-VN');
                                            })()}
                                        </p>
                                    )}
                                </div>

                                {/* Guests */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-slate-200 rounded-xl p-4 hover:border-sky-300 transition-colors">
                                        <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1.5">Người lớn</label>
                                        <select 
                                            value={bookingForm.adults}
                                            onChange={(e) => setBookingForm({ ...bookingForm, adults: parseInt(e.target.value) })}
                                            className="w-full font-bold text-slate-800 outline-none cursor-pointer bg-transparent"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} người</option>)}
                                        </select>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-4 hover:border-sky-300 transition-colors">
                                        <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1.5">Trẻ em</label>
                                        <select 
                                            value={bookingForm.children}
                                            onChange={(e) => setBookingForm({ ...bookingForm, children: parseInt(e.target.value) })}
                                            className="w-full font-bold text-slate-800 outline-none cursor-pointer bg-transparent"
                                        >
                                            {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} trẻ em</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Giá gốc</span>
                                        <span className="line-through">{new Intl.NumberFormat('vi-VN').format((price * bookingForm.adults + price * 0.5 * bookingForm.children) * 1.2)}đ</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-emerald-600 font-bold">
                                        <span>Giảm giá hệ thống</span>
                                        <span>-17%</span>
                                    </div>
                                    <div className="flex justify-between text-base font-black text-slate-800 border-t border-slate-100 pt-2 mt-2">
                                        <span>Tổng (tạm tính)</span>
                                        <span>{new Intl.NumberFormat('vi-VN').format(price * bookingForm.adults + price * 0.5 * bookingForm.children)}đ</span>
                                    </div>
                                </div>

                                <Button type="submit" variant="primary" className="w-full py-4 text-base font-black rounded-xl mt-2 shadow-lg shadow-sky-200">
                                    Đặt ngay
                                </Button>
                                <p className="text-center text-xs text-slate-400">Bạn sẽ không bị tính phí lúc này</p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;
