import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import locationApi from '../../../api/locationApi';
import { Loader2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const TrendingDestinations = () => {
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchPopularLocations = async () => {
            try {
                // Thử lấy danh sách địa điểm đánh dấu "Phổ biến"
                let response = await locationApi.getAll({ is_popular: 1 });
                
                // Nếu chưa có địa điểm nào được đánh dấu phổ biến, lấy danh sách tất cả địa điểm làm mặc định
                if (response.success && response.data.length === 0) {
                    response = await locationApi.getAll({ limit: 6 });
                }

                if (response.success) {
                    setDestinations(response.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải địa điểm thịnh hành:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularLocations();
    }, []);

    const nextSlide = () => {
        if (currentIndex < destinations.length - 4) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (loading) {
        return (
            <section className="py-8 bg-white min-h-[420px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </section>
        );
    }

    if (destinations.length === 0) {
        return null; // Không hiển thị nếu không có địa điểm phổ biến
    }

    return (
        <section className="py-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-sky-500 font-bold text-m uppercase tracking-widest mb-2">Khám phá</p>
                        <h2 className="text-3xl font-black text-slate-900">Điểm đến thịnh hành</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className={`p-3 rounded-xl border transition-all ${currentIndex === 0 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 cursor-pointer'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={currentIndex >= Math.max(0, destinations.length - 4)}
                            className={`p-3 rounded-xl border transition-all ${currentIndex >= Math.max(0, destinations.length - 4) ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 cursor-pointer'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden p-4 -m-4">
                    <div 
                        className="flex transition-transform duration-500 ease-out -mx-3"
                        style={{ transform: `translateX(calc(-${currentIndex} * 25%))` }}
                    >
                        {destinations.map((dest, i) => (
                            <div key={dest.id || i} className="w-1/4 shrink-0 px-3 h-[380px]">
                                <div 
                                    className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg h-full"
                                    onClick={() => navigate(`/search?q=${encodeURIComponent(dest.name)}`)}
                                >
                                    {dest.image_url ? (
                                        <img src={dest.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={dest.name} />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                            <MapPin size={48} className="text-slate-400" />
                                        </div>
                                    )}

                                    {/* Default: show name only */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wider mb-2">
                                            {dest.country_code === 'VN' ? 'Nội địa' : dest.country_code}
                                        </span>
                                        <h3 className="text-white text-xl font-black">{dest.name}</h3>
                                    </div>

                                    {/* Hover: show info overlay - transparent */}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <h3 className="text-white text-xl font-black mb-2">{dest.name}</h3>
                                        {dest.description && (
                                            <p className="text-white/90 text-[11px] leading-relaxed mb-4 line-clamp-3">{dest.description}</p>
                                        )}
                                        <button className="self-start px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black shadow-lg hover:bg-sky-50 transition-all hover:scale-105 active:scale-95 uppercase tracking-wide cursor-pointer">
                                            Khám phá
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrendingDestinations;
