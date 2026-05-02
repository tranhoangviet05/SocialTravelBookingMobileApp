import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ServiceCard from '../services/ServiceCard';
import axios from 'axios';

const Accommodations = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccommodations = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/general/get/services');
                if (response.data.success) {
                    const filtered = response.data.data.filter(s =>
                        s.type === 'hotel' || s.type === 'homestay'
                    );
                    setAccommodations(filtered);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu chỗ ở:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccommodations();
    }, []);

    const nextSlide = () => {
        if (currentIndex < accommodations.length - 4) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;
    if (accommodations.length === 0) return null;

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Chỗ ở nổi bật</h2>
                        <p className="text-gray-500 font-medium">Từ homestay ấm cúng đến resort sang trọng</p>
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
                            disabled={currentIndex >= accommodations.length - 4}
                            className={`p-3 rounded-xl border transition-all ${currentIndex >= accommodations.length - 4 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out -mx-3"
                        style={{ transform: `translateX(calc(-${currentIndex} * 25%))` }}
                    >
                        {accommodations.map(item => (
                            <div key={item.id} className="w-1/4 shrink-0 px-3">
                                <ServiceCard service={item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Accommodations;
