import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Loader2, Tag, ChevronLeft, ChevronRight, Copy, CheckCircle2, Zap } from 'lucide-react';
import axios from 'axios';

const SpecialOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/general/get/coupons');
                if (response.data.success) {
                    setOffers(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy mã giảm giá:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    // Autoplay logic
    useEffect(() => {
        let interval;
        if (!isPaused && offers.length > 0) {
            interval = setInterval(() => {
                if (scrollRef.current) {
                    const scrollContainer = scrollRef.current;
                    const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                    const cardWidth = scrollContainer.firstChild?.offsetWidth || 0;
                    
                    if (scrollContainer.scrollLeft >= maxScrollLeft - 10) {
                        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        scrollContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
                    }
                }
            }, 3500); // Tự động trượt mỗi 3.5s
        }
        return () => clearInterval(interval);
    }, [isPaused, offers.length]);

    const scrollLeft = () => {
        if (scrollRef.current) {
            const cardWidth = scrollRef.current.firstChild?.offsetWidth || 0;
            scrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            const cardWidth = scrollRef.current.firstChild?.offsetWidth || 0;
            scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
    };

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const gradients = [
        "from-blue-500 to-indigo-600",
        "from-emerald-400 to-teal-500",
        "from-orange-400 to-rose-500",
        "from-purple-500 to-indigo-500",
        "from-sky-400 to-blue-500",
        "from-rose-400 to-red-500"
    ];

    if (loading) {
        return (
            <div className="py-16 flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-sky-500" size={32} />
            </div>
        );
    }

    if (offers.length === 0) return null;

    return (
        <section className="py-16 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Sub-section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <p className="text-sky-600 font-bold text-sm uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                            <Zap size={16} className="fill-sky-500" /> Ưu đãi độc quyền
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Mã giảm giá cho bạn</h2>
                    </div>
                    {/* Removed nav buttons for marquee compatibility */}
                </div>

                    {/* Continuous Marquee Slider Container */}
                <div className="overflow-hidden relative -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div 
                        className="animate-marquee py-6 flex gap-6"
                    >
                        {[...offers, ...offers, ...offers, ...offers].map((offer, i) => (
                            <div 
                                key={`${offer.id}-${i}`} 
                                className="shrink-0 w-[85vw] sm:w-[50vw] md:w-[400px] perspective-container"
                            >
                                {/* Floating Animation Wrapper */}
                                <div className="animate-float h-full" style={{ animationDelay: `${(i % offers.length) * 0.4}s` }}>
                                    {/* Parallax Card */}
                                    <div className={`relative h-full rounded-[2rem] p-8 bg-gradient-to-br ${gradients[i % gradients.length]} text-white overflow-hidden group cursor-pointer parallax-card shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] flex flex-col`}>
                                        
                                        {/* Glassmorphism Icon (Top Right) */}
                                        <div className="parallax-element-fast absolute top-6 right-6 w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 rotate-12 group-hover:rotate-0 shadow-[0_8px_32px_0_rgba(255,255,255,0.2)]">
                                            <Tag size={28} className="text-white drop-shadow-md" />
                                        </div>

                                        {/* Background decorative blobs */}
                                        <div className="parallax-bg absolute -top-24 -right-24 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                                        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

                                        <div className="relative z-10 flex-1 parallax-content">
                                            {/* Discount Badge */}
                                            <div className="parallax-element inline-flex px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/30 shadow-inner mb-6">
                                                {offer.type === 'percent' ? `GIẢM ${offer.discount_value}%` : `GIẢM ${new Intl.NumberFormat('vi-VN').format(offer.discount_value)}đ`}
                                            </div>
                                            
                                            {/* Content */}
                                            <h3 className="parallax-element-slow text-2xl lg:text-3xl font-black mb-3 leading-tight tracking-tight drop-shadow-sm pr-12">
                                                {offer.name || offer.title || "Ưu đãi du lịch"}
                                            </h3>
                                            <p className="parallax-element text-white/90 text-sm leading-relaxed mb-8 font-medium line-clamp-2">
                                                {offer.description || `Đừng bỏ lỡ cơ hội nhận ưu đãi hấp dẫn với mã ${offer.code}. Áp dụng ngay hôm nay!`}
                                            </p>
                                        </div>

                                        {/* Footer / Copy Button area */}
                                        <div className="relative z-10 p-5 bg-black/10 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-between mt-auto group-hover:bg-black/20 transition-colors parallax-element">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Mã giảm giá</span>
                                                <span className="text-xl md:text-2xl font-black tracking-widest font-mono drop-shadow-md">{offer.code}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleCopy(offer.code, `${offer.id}-${i}`); }}
                                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-slate-800 hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                                                title="Sao chép mã"
                                            >
                                                {copiedId === `${offer.id}-${i}` ? (
                                                    <CheckCircle2 size={24} className="text-emerald-500" />
                                                ) : (
                                                    <Copy size={22} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Removed CSS Fading Edges by user request */}
                </div>
            </div>
            {/* CSS to hide scrollbar but keep functionality */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                /* Webflow-style advanced animations */
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    width: max-content;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(0.5deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .perspective-container {
                    perspective: 1200px;
                }
                .parallax-card {
                    transform-style: preserve-3d;
                    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                    will-change: transform, box-shadow;
                }
                .parallax-card:hover {
                    transform: translateY(-8px) rotateX(4deg) rotateY(-3deg) scale(1.02);
                    box-shadow: -15px 25px 40px -10px rgba(0,0,0,0.3);
                }
                
                /* Nested parallax elements with varying transform-Z depths */
                .parallax-element, 
                .parallax-element-fast, 
                .parallax-element-slow,
                .parallax-content,
                .parallax-bg {
                    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                
                .parallax-card:hover .parallax-bg {
                    transform: scale(1.2) translateZ(-40px);
                }
                .parallax-card:hover .parallax-content {
                    transform: translateZ(20px);
                }
                .parallax-card:hover .parallax-element {
                    transform: translateZ(30px) translateY(-2px);
                }
                .parallax-card:hover .parallax-element-fast {
                    transform: translateZ(50px) translateY(-5px) rotate(0deg);
                }
                .parallax-card:hover .parallax-element-slow {
                    transform: translateZ(10px) translateY(-1px);
                }
            `}</style>
        </section>
    );
};

export default SpecialOffers;
