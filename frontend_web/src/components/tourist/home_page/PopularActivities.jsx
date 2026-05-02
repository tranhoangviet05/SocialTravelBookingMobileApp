import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ServiceCard from '../services/ServiceCard';
import axios from 'axios';

const PopularActivities = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeLocation, setActiveLocation] = useState('Tất cả');
    const [tours, setTours] = useState([]);
    const [locations, setLocations] = useState(['Tất cả']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/general/get/services');
                if (response.data.success) {
                    // Lọc lấy các dịch vụ là Tour
                    const filtered = response.data.data.filter(s => s.type === 'tour');
                    setTours(filtered);

                    // Trích xuất tự động các địa điểm thực tế có tour
                    const uniqueLocations = [...new Set(filtered.map(t => t.location?.name).filter(Boolean))];
                    setLocations(['Tất cả', ...uniqueLocations]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu tour:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    const nextSlide = () => {
        if (currentIndex < filteredTours.length - 4) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const filteredTours = activeLocation === 'Tất cả' 
        ? tours 
        : tours.filter(t => t.location?.name === activeLocation);

    if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;
    if (tours.length === 0) return null;

    return (
        <section className="py-16 bg-slate-50/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Hoạt động phổ biến</h2>
                        <p className="text-gray-500 font-medium">Khám phá những trải nghiệm thú vị nhất tại Việt Nam</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className={`p-3 rounded-xl border transition-all ${currentIndex === 0 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={nextSlide}
                            disabled={currentIndex >= filteredTours.length - 4}
                            className={`p-3 rounded-xl border transition-all ${currentIndex >= filteredTours.length - 4 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Filter Locations */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {locations.map(loc => (
                        <button
                            key={loc}
                            onClick={() => {
                                setActiveLocation(loc);
                                setCurrentIndex(0);
                            }}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeLocation === loc ? 'bg-sky-600 text-white shadow-lg shadow-sky-200' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
                        >
                            {loc}
                        </button>
                    ))}
                </div>

                <div className="overflow-hidden">
                    <div 
                        className="flex transition-transform duration-500 ease-out -mx-3"
                        style={{ transform: `translateX(calc(-${currentIndex} * 25%))` }}
                    >
                        {filteredTours.map(tour => (
                            <div key={tour.id} className="w-1/4 shrink-0 px-3">
                                <ServiceCard service={tour} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PopularActivities;
