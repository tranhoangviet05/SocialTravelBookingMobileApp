import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import behaviorApi from '../../api/behaviorApi';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const RecommendedServices = () => {
    const { currentUser } = useAuth();
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchRecs = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await behaviorApi.getRecommendations();
                if (res?.success && res?.data) {
                    setRecommendation(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecs();
    }, [currentUser]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth * 0.8 
                : scrollLeft + clientWidth * 0.8;
            
            scrollRef.current.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
        }
    };

    if (loading || !recommendation || !recommendation.suggested_services?.length) {
        return null;
    }

    const { location_name, suggested_services } = recommendation;

    const containerStyle = {
        maxWidth: '1200px',
        margin: '60px auto',
        padding: '0 20px',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    };

    const cardContainerStyle = {
        background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 50%, #fff9f5 100%)',
        borderRadius: '40px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
    };

    const navButtonStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'white',
        border: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 10,
        transition: 'all 0.3s ease',
        color: '#4f46e5'
    };

    return (
        <div style={containerStyle}>
            <div style={cardContainerStyle}>
                {/* Decoration */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', opacity: 0.05 }}>
                    <Sparkles size={240} color="#4f46e5" />
                </div>

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#4f46e5', color: 'white', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                                <Sparkles size={16} />
                                Dành riêng cho bạn
                            </div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#111827', margin: 0, lineHeight: '1.2' }}>
                                Có thể bạn đang quan tâm? <br/>
                                <span style={{ color: '#4f46e5' }}>Tại {location_name}</span>
                            </h2>
                        </div>
                        
                        {/* Nút điều hướng */}
                        {suggested_services.length > 3 && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => scroll('left')}
                                    style={navButtonStyle}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button 
                                    onClick={() => scroll('right')}
                                    style={navButtonStyle}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div 
                        ref={scrollRef}
                        style={{ 
                            display: 'flex', 
                            gap: '24px', 
                            overflowX: 'auto', 
                            padding: '10px 0 30px 0', 
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {suggested_services.map((service) => (
                            <Link 
                                key={service.id} 
                                to={`/service/${service.slug}`}
                                style={{ 
                                    flexShrink: 0, 
                                    width: '300px', 
                                    background: 'white', 
                                    borderRadius: '32px', 
                                    border: '1px solid #f3f4f6', 
                                    textDecoration: 'none',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
                                    display: 'block'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-12px)';
                                    e.currentTarget.style.boxShadow = '0 20px 30px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.02)';
                                }}
                            >
                                <div style={{ height: '200px', position: 'relative', overflow: 'hidden', borderRadius: '32px 32px 0 0' }}>
                                    <img 
                                        src={service.cover_image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop'} 
                                        alt={service.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop';
                                        }}
                                    />
                                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '900', color: '#111827', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                        {service.rating_avg || '5.0'}
                                    </div>
                                </div>
                                
                                <div style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#111827', margin: '0 0 10px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {service.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                                        <MapPin size={14} color="#ef4444" />
                                        {location_name}
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f9fafb' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giá từ</div>
                                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#ea580c' }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.base_price)}
                                            </div>
                                        </div>
                                        <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '14px', color: '#4f46e5' }}>
                                            <ArrowRight size={22} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            
            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default RecommendedServices;
