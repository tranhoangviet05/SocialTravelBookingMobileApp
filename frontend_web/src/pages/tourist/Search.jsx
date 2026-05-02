import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, X, ChevronDown, Grid, LayoutList } from 'lucide-react';
import ServiceCard from '../../components/tourist/services/ServiceCard';
import { MOCK_SERVICES, MOCK_LOCATIONS } from '../../data/mockServices';
import axios from 'axios';

const ALL_TYPES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'tour', label: 'Tour' },
    { value: 'hotel', label: 'Lưu trú' },
];

const SORT_OPTIONS = [
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'rating', label: 'Đánh giá cao' },
    { value: 'price_asc', label: 'Giá: Thấp → Cao' },
    { value: 'price_desc', label: 'Giá: Cao → Thấp' },
    { value: 'newest', label: 'Mới nhất' },
];

const PRICE_RANGES = [
    { label: 'Tất cả', min: 0, max: Infinity },
    { label: 'Dưới 500K', min: 0, max: 500000 },
    { label: '500K - 1 triệu', min: 500000, max: 1000000 },
    { label: '1 - 2 triệu', min: 1000000, max: 2000000 },
    { label: '2 - 5 triệu', min: 2000000, max: 5000000 },
    { label: 'Trên 5 triệu', min: 5000000, max: Infinity },
];

const DURATIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: '1', label: '1 ngày' },
    { value: '2', label: '2 ngày' },
    { value: '3', label: '3 ngày' },
    { value: '5', label: '5+ ngày' },
];

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Search & filter state
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [guests, setGuests] = useState(0);
    const [selectedType, setSelectedType] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [selectedPriceRange, setSelectedPriceRange] = useState(0);
    const [selectedDuration, setSelectedDuration] = useState('all');
    const [minRating, setMinRating] = useState(0);

    // Fetch services from API
    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:8000/api/general/get/services');
                if (response.data.success) {
                    setServices(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách dịch vụ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    // Sync state with URL parameters when component mounts or URL changes
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam && ['tour', 'hotel'].includes(typeParam)) {
            setSelectedType(typeParam);
        } else {
            setSelectedType('all');
        }

        const qParam = searchParams.get('q');
        if (qParam) {
            setSearchQuery(decodeURIComponent(qParam));
        } else {
            setSearchQuery('');
        }

        const guestsParam = searchParams.get('guests');
        if (guestsParam && !isNaN(guestsParam)) {
            setGuests(parseInt(guestsParam, 10));
        } else {
            setGuests(0);
        }
    }, [searchParams]);

    const handleTypeChange = (typeStr) => {
        setSelectedType(typeStr);
        const newParams = new URLSearchParams(searchParams);
        if (typeStr !== 'all') {
            newParams.set('type', typeStr);
        } else {
            newParams.delete('type');
        }
        setSearchParams(newParams);
    };

    // UI state
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    // Filter & sort logic
    const filteredServices = useMemo(() => {
        let result = [...services];

        // Text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.location?.name?.toLowerCase().includes(q)
            );
        }

        // Guests filter (max_participants)
        if (guests > 0) {
            result = result.filter((s) => {
                const capacity = s.max_participants || 0;
                if (capacity > 0) {
                    return capacity >= guests;
                }
                return true; 
            });
        }

        // Type filter
        if (selectedType !== 'all') {
            result = result.filter((s) => s.type === selectedType);
        }

        // Location filter
        if (selectedLocation !== 'all') {
            result = result.filter((s) => s.location?.slug === selectedLocation);
        }

        // Price filter
        const range = PRICE_RANGES[selectedPriceRange];
        if (range.min > 0 || range.max < Infinity) {
            result = result.filter((s) => s.base_price >= range.min && s.base_price <= range.max);
        }

        // Duration filter
        if (selectedDuration !== 'all') {
            result = result.filter((s) => {
                const days = s.duration_days || 1;
                if (selectedDuration === '5') return days >= 5;
                return days === parseInt(selectedDuration);
            });
        }

        // Rating filter
        if (minRating > 0) {
            result = result.filter((s) => (s.rating_avg || 0) >= minRating);
        }

        // Sort
        switch (sortBy) {
            case 'rating':
                result.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
                break;
            case 'price_asc':
                result.sort((a, b) => a.base_price - b.base_price);
                break;
            case 'price_desc':
                result.sort((a, b) => b.base_price - a.base_price);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            default:
                result.sort((a, b) => (b.total_bookings || 0) - (a.total_bookings || 0));
        }

        return result;
    }, [services, searchQuery, selectedType, selectedLocation, selectedPriceRange, selectedDuration, minRating, sortBy, guests]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedType('all');
        setSelectedLocation('all');
        setSelectedPriceRange(0);
        setSelectedDuration('all');
        setMinRating(0);
    };

    const hasActiveFilters =
        searchQuery ||
        selectedType !== 'all' ||
        selectedLocation !== 'all' ||
        selectedPriceRange !== 0 ||
        selectedDuration !== 'all' ||
        minRating > 0;

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-sky-100 pt-20">
            {/* Hero Search Bar */}
            <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-cyan-700 py-12 px-4">
                <div className="max-w-3xl mx-auto text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        Khám phá Việt Nam
                    </h1>
                    <p className="text-sky-200 text-sm">
                        Hơn {MOCK_SERVICES.length} tours & chỗ ở đang chờ bạn
                    </p>
                </div>

                {/* Search bar */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl p-2 shadow-xl flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <Search size={18} className="text-sky-600 shrink-0" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tour, khách sạn, địa điểm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full outline-none text-sm text-slate-700 placeholder-gray-400"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${showFilters ? 'bg-sky-600 text-white' : 'bg-gray-100 text-slate-600 hover:bg-sky-50'}`}
                        >
                            <SlidersHorizontal size={16} />
                            <span>Bộ lọc</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="max-w-7xl mx-auto px-4 mt-4 animate-[slideDown_0.3s_ease-out]">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800">Bộ lọc nâng cao</h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs text-red-500 font-semibold hover:underline cursor-pointer">
                                    Xóa tất cả
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Location */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Địa điểm</label>
                                <div
                                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                                    className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <span className="text-sm text-slate-700 truncate">
                                        {MOCK_LOCATIONS.find((l) => l.slug === selectedLocation)?.name || 'Chọn địa điểm'}
                                    </span>
                                    <ChevronDown size={14} className="text-gray-400 shrink-0" />
                                </div>
                                {showLocationDropdown && (
                                    <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                        <div onClick={() => { setSelectedLocation('all'); setShowLocationDropdown(false); }}
                                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-sky-50 ${selectedLocation === 'all' ? 'text-sky-600 font-semibold bg-sky-50' : 'text-slate-600'}`}>
                                            Tất cả
                                        </div>
                                        {MOCK_LOCATIONS.map((loc) => (
                                            <div key={loc.id} onClick={() => { setSelectedLocation(loc.slug); setShowLocationDropdown(false); }}
                                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-sky-50 ${selectedLocation === loc.slug ? 'text-sky-600 font-semibold bg-sky-50' : 'text-slate-600'}`}>
                                                {loc.name} ({loc.count})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Mức giá</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {PRICE_RANGES.map((r, i) => (
                                        <button key={i} onClick={() => setSelectedPriceRange(i)}
                                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${selectedPriceRange === i ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-gray-200 hover:border-sky-400'}`}>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Thời gian</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {DURATIONS.map((d) => (
                                        <button key={d.value} onClick={() => setSelectedDuration(d.value)}
                                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${selectedDuration === d.value ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-gray-200 hover:border-sky-400'}`}>
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Đánh giá</label>
                                <div className="flex gap-1.5">
                                    {[0, 4, 4.5].map((r) => (
                                        <button key={r} onClick={() => setMinRating(r === minRating ? 0 : r)}
                                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${minRating === r ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-600 border-gray-200 hover:border-sky-400'}`}>
                                            {r === 0 ? 'Tất cả' : <><Star size={10} className="text-amber-400 fill-amber-400" />{r}+</>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {/* Type tabs */}
                        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                            {ALL_TYPES.map((t) => (
                                <button key={t.value} onClick={() => handleTypeChange(t.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${selectedType === t.value ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-sky-600'}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <span className="text-sm text-gray-500">
                            {filteredServices.length} kết quả
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <div className="relative">
                            <button onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 text-sm text-slate-600 hover:border-sky-300 cursor-pointer">
                                <span>{SORT_OPTIONS.find((s) => s.value === sortBy)?.label}</span>
                                <ChevronDown size={14} />
                            </button>
                            {showSortDropdown && (
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-sky-50 ${sortBy === opt.value ? 'text-sky-600 font-semibold bg-sky-50' : 'text-slate-600'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View mode */}
                        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                            <button onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-sky-100 text-sky-600' : 'text-gray-400'}`}>
                                <Grid size={16} />
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-sky-100 text-sky-600' : 'text-gray-400'}`}>
                                <LayoutList size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Service Grid */}
                {filteredServices.length > 0 ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'flex flex-col gap-4'}>
                        {filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                className={viewMode === 'list' ? 'flex-row !aspect-auto' : ''}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">Không tìm thấy dịch vụ phù hợp</h3>
                        <p className="text-sm text-gray-400 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        <button onClick={clearFilters} className="text-sm text-sky-600 font-semibold hover:underline cursor-pointer">
                            Xóa bộ lọc
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {filteredServices.length > 0 && (
                    <div className="flex justify-center mt-10">
                        <div className="flex items-center gap-2">
                            <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-sky-300 hover:text-sky-600 cursor-pointer bg-white">
                                ‹
                            </button>
                            {[1, 2, 3].map((n) => (
                                <button key={n}
                                    className={`w-9 h-9 rounded-lg font-semibold text-sm transition-all cursor-pointer ${n === 1 ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-gray-200 hover:border-sky-300'}`}>
                                    {n}
                                </button>
                            ))}
                            <span className="text-gray-400 text-sm px-1">...</span>
                            <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-slate-600 hover:border-sky-300 cursor-pointer bg-white">
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS animation */}
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SearchPage;