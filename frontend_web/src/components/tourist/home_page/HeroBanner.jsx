import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, Hotel, Compass } from 'lucide-react';
import { COLORS } from '../../../utils/colors';

const HeroBanner = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTab, setSearchTab] = useState('stay');
    const [activeField, setActiveField] = useState(null);
    const [guestCount, setGuestCount] = useState({ adults: 2, children: 0, rooms: 1 });
    const [checkinDay, setCheckinDay] = useState(15);
    const [checkinMonth, setCheckinMonth] = useState(3);
    const [checkoutDay, setCheckoutDay] = useState(20);
    const [checkoutMonth, setCheckoutMonth] = useState(3);
    const [calendarMonth, setCalendarMonth] = useState(3);
    const wrapperRef = useRef(null);

    const handleSearch = () => {
        let url = `/search?type=${searchTab}`;
        if (searchQuery.trim()) {
            url += `&q=${encodeURIComponent(searchQuery.trim())}`;
        }
        const totalGuests = guestCount.adults + guestCount.children;
        if (totalGuests > 0) {
            url += `&guests=${totalGuests}`;
        }
        navigate(url);
    };

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const daysCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    const fmtDate = (d, m) => `${d} Th${String(m + 1).padStart(2, '0')}`;

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setActiveField(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const updateGuest = (key, delta) => {
        setGuestCount(prev => ({ ...prev, [key]: Math.max(key === 'rooms' ? 1 : 0, prev[key] + delta) }));
    };

    const handleSelectDate = (day) => {
        if (activeField === 'checkin') {
            setCheckinDay(day);
            setCheckinMonth(calendarMonth);
        } else if (activeField === 'checkout') {
            setCheckoutDay(day);
            setCheckoutMonth(calendarMonth);
        }
    };

    const isDayDisabled = (day) => {
        if (activeField !== 'checkout') return false;
        if (calendarMonth < checkinMonth) return true;
        if (calendarMonth === checkinMonth && day <= checkinDay) return true;
        return false;
    };

    const handlePrevMonth = (e) => { e.stopPropagation(); setCalendarMonth(m => Math.max(0, m - 1)); };
    const handleNextMonth = (e) => { e.stopPropagation(); setCalendarMonth(m => Math.min(11, m + 1)); };

    const showCalendar = activeField === 'checkin' || activeField === 'checkout';
    const showGuests = activeField === 'guests';

    return (
        <div className="relative pt-32 pb-36 flex items-center justify-center min-h-[800px] bg-gradient-to-br from-sky-800 via-sky-900 to-slate-900">
            {/* BG decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
                <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-sky-400 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 -right-48 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px]" />
            </div>

            <div className="container relative mx-auto px-4 z-10">
                <div className="w-full xl:w-10/12 mx-auto text-center">
                    <h1 className="text-white font-bold text-4xl lg:text-6xl mb-8 leading-tight">
                        Tìm điểm dừng chân tiếp theo cùng <br />
                        <span className="text-sky-300 font-black">Social Travel Booking</span>
                    </h1>

                    {/* === UNIFIED SEARCH BLOCK === */}
                    <div ref={wrapperRef} className="relative">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-visible">
                            {/* Tabs integrated at top */}
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => { setSearchTab('stay'); setActiveField(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all border-b-2 cursor-pointer ${searchTab === 'stay' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Hotel className={searchTab === 'stay' ? 'text-sky-500' : 'text-gray-400'} size={18} />
                                    Lưu trú
                                </button>
                                <button
                                    onClick={() => { setSearchTab('tour'); setActiveField(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all border-b-2 cursor-pointer ${searchTab === 'tour' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Compass className={searchTab === 'tour' ? 'text-sky-500' : 'text-gray-400'} size={18} />
                                    Tour & Hoạt động
                                </button>
                            </div>

                            {/* Search fields */}
                            <div className="p-2 flex flex-wrap xl:flex-nowrap items-stretch gap-0 text-left">
                                {searchTab === 'stay' ? (
                                    <>
                                        <SearchField icon={<MapPin size={18} />} label="Điểm đến" active={activeField === 'location'} onClick={() => setActiveField(activeField === 'location' ? null : 'location')}>
                                            <input 
                                                type="text" 
                                                placeholder="Bạn muốn đi đâu?" 
                                                className="w-full bg-transparent focus:outline-none text-slate-800 font-bold placeholder:text-gray-300 text-sm" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                        </SearchField>
                                        <Divider />
                                        <SearchField icon={<Calendar size={18} />} label="Ngày đến" active={activeField === 'checkin'} onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')} hasChevron chevronOpen={activeField === 'checkin'}>
                                            <span className="text-slate-700 font-bold text-sm">{fmtDate(checkinDay, checkinMonth)}</span>
                                        </SearchField>
                                        <Divider />
                                        <SearchField icon={<Calendar size={18} />} label="Ngày đi" active={activeField === 'checkout'} onClick={() => setActiveField(activeField === 'checkout' ? null : 'checkout')} hasChevron chevronOpen={activeField === 'checkout'}>
                                            <span className="text-slate-700 font-bold text-sm">{fmtDate(checkoutDay, checkoutMonth)}</span>
                                        </SearchField>
                                        <Divider />
                                        <SearchField icon={<Users size={18} />} label="Khách & Phòng" active={activeField === 'guests'} onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')} hasChevron chevronOpen={activeField === 'guests'}>
                                            <span className="text-slate-700 font-bold text-sm whitespace-nowrap">{guestCount.adults + guestCount.children} khách, {guestCount.rooms} phòng</span>
                                        </SearchField>
                                    </>
                                ) : (
                                    <>
                                        <SearchField icon={<Compass size={18} />} label="Địa điểm Tour" active={activeField === 'tour-location'} onClick={() => setActiveField('tour-location')}>
                                            <input 
                                                type="text" 
                                                placeholder="Tìm tour tại..." 
                                                className="w-full bg-transparent focus:outline-none text-slate-800 font-bold placeholder:text-gray-300 text-sm" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                        </SearchField>
                                        <Divider />
                                        <SearchField icon={<Calendar size={18} />} label="Ngày khởi hành" active={activeField === 'checkin'} onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')} hasChevron chevronOpen={activeField === 'checkin'}>
                                            <span className="text-slate-700 font-bold text-sm">{fmtDate(checkinDay, checkinMonth)}</span>
                                        </SearchField>
                                        <Divider />
                                        <SearchField icon={<Users size={18} />} label="Số người" active={activeField === 'guests'} onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')} hasChevron chevronOpen={activeField === 'guests'}>
                                            <span className="text-slate-700 font-bold text-sm whitespace-nowrap">{guestCount.adults + guestCount.children} người</span>
                                        </SearchField>
                                    </>
                                )}
                                <button 
                                    onClick={handleSearch}
                                    className="w-full xl:w-auto px-10 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 transition-all active:scale-95 shrink-0" 
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <Search size={20} />
                                    <span className="text-sm">Tìm kiếm</span>
                                </button>
                            </div>
                        </div>

                        {/* Calendar dropdown - OUTSIDE overflow, absolute to wrapper */}
                        {showCalendar && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5"
                                style={{ zIndex: 9999 }}
                                onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-4">
                                    <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"><ChevronLeft size={16} /></button>
                                    <span className="font-bold text-slate-800 text-sm">{monthNames[calendarMonth]}, 2026</span>
                                    <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"><ChevronRight size={16} /></button>
                                </div>
                                <div className="grid grid-cols-7 gap-0.5 text-center">
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                        <span key={d} className="text-[10px] font-bold text-gray-400 py-1">{d}</span>
                                    ))}
                                    {Array.from({ length: daysCount[calendarMonth] }).map((_, i) => {
                                        const day = i + 1;
                                        const sel = (activeField === 'checkin' && checkinDay === day && checkinMonth === calendarMonth) ||
                                            (activeField === 'checkout' && checkoutDay === day && checkoutMonth === calendarMonth);
                                        const dis = isDayDisabled(day);
                                        return (
                                            <button key={i} disabled={dis}
                                                onClick={(e) => { e.stopPropagation(); if (!dis) handleSelectDate(day); }}
                                                className={`text-xs h-8 w-8 mx-auto flex items-center justify-center rounded-full transition-all font-bold
                                                    ${sel ? 'bg-sky-500 text-white shadow-md' : ''}
                                                    ${dis ? 'text-gray-200 cursor-not-allowed' : !sel ? 'text-slate-600 hover:bg-sky-50 hover:text-sky-600' : ''}`}
                                            >{day}</button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Guest dropdown */}
                        {showGuests && (
                            <div className="absolute right-0 top-full mt-2 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5"
                                style={{ zIndex: 9999 }}
                                onClick={(e) => e.stopPropagation()}>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Người lớn', sub: 'Từ 13 tuổi', key: 'adults' },
                                        { label: 'Trẻ em', sub: '2 - 12 tuổi', key: 'children' },
                                        { label: 'Phòng', sub: 'Số phòng', key: 'rooms' }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                                                <p className="text-[10px] text-gray-400">{item.sub}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={(e) => { e.stopPropagation(); updateGuest(item.key, -1); }}
                                                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-sky-500 hover:text-sky-500 transition-all">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-6 text-center font-bold text-slate-800">{guestCount[item.key]}</span>
                                                <button onClick={(e) => { e.stopPropagation(); updateGuest(item.key, 1); }}
                                                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-sky-500 hover:text-sky-500 transition-all">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setActiveField(null)} className="w-full mt-4 py-2.5 bg-sky-500 text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-colors">Xong</button>
                            </div>
                        )}
                    </div>

                    {/* Quick tags */}
                    <div className="mt-6 flex justify-center gap-2 flex-wrap">
                        {['Resort biển', 'Săn mây', 'Phố cổ', 'Camping', 'Mùa hoa'].map(tag => (
                            <button key={tag} className="px-4 py-1.5 bg-white/10 cursor-pointer hover:bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white/80 border border-white/10 transition-all">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* Reusable sub-components */
const SearchField = ({ icon, label, active, onClick, children, hasChevron, chevronOpen }) => (
    <div onClick={onClick} className={`flex-1 min-w-[140px] p-4 rounded-xl transition-all cursor-pointer ${active ? 'bg-sky-50' : 'hover:bg-gray-50'}`}>
        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2">
            <span className="text-sky-500 shrink-0">{icon}</span>
            {children}
            {hasChevron && <ChevronDown size={12} className={`ml-auto text-gray-300 transition-transform ${chevronOpen ? 'rotate-180' : ''}`} />}
        </div>
    </div>
);

const Divider = () => <div className="hidden xl:block w-px bg-gray-100 my-3" />;

export default HeroBanner;
