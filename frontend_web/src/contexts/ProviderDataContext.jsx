import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import providerApi from '../api/providerApi';

const ProviderDataContext = createContext(null);

export const useProviderData = () => {
    const context = useContext(ProviderDataContext);
    if (!context) {
        throw new Error('useProviderData must be used within a ProviderDataProvider');
    }
    return context;
};

export const ProviderDataProvider = ({ children }) => {
    const { currentUser } = useAuth();

    // Data states
    const [stats, setStats] = useState(null);
    const [services, setServices] = useState([]);
    const [servicesMeta, setServicesMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [walletReport, setWalletReport] = useState([]);
    const [settings, setSettings] = useState(null);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);

    // Loading & Loaded states
    const [loadingStates, setLoadingStates] = useState({
        stats: false,
        services: false,
        bookings: false,
        reviews: false,
        wallet: false,
        settings: false,
        system: false
    });

    const [loadedStates, setLoadedStates] = useState({
        stats: false,
        services: false,
        bookings: false,
        reviews: false,
        wallet: false,
        settings: false,
        system: false
    });

    // Reset data on logout
    useEffect(() => {
        if (!currentUser || currentUser.role !== 'provider') {
            setStats(null);
            setServices([]);
            setBookings([]);
            setReviews([]);
            setWallet(null);
            setSettings(null);
            setLoadedStates({
                stats: false,
                services: false,
                bookings: false,
                reviews: false,
                wallet: false,
                settings: false
            });
        }
    }, [currentUser]);

    const setOneLoading = (key, val) => setLoadingStates(prev => ({ ...prev, [key]: val }));
    const setOneLoaded = (key, val) => setLoadedStates(prev => ({ ...prev, [key]: val }));

    const fetchStats = useCallback(async (force = false) => {
        if (loadedStates.stats && !force) return;
        setOneLoading('stats', true);
        try {
            const res = await providerApi.getStats();
            if (res.success) {
                setStats(res.data);
                setOneLoaded('stats', true);
            }
        } catch (err) { console.error('ProviderData: fetchStats error', err); }
        finally { setOneLoading('stats', false); }
    }, [loadedStates.stats]);

    const fetchServices = useCallback(async (force = false, params = {}) => {
        if (loadedStates.services && !force && !params.page) return;
        setOneLoading('services', true);
        try {
            const res = await providerApi.getServices(params);
            if (res.success) {
                setServices(res.data);
                setServicesMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
                setOneLoaded('services', true);
            }
        } catch (err) { console.error('ProviderData: fetchServices error', err); }
        finally { setOneLoading('services', false); }
    }, [loadedStates.services]);

    const fetchBookings = useCallback(async (force = false) => {
        if (loadedStates.bookings && !force) return;
        setOneLoading('bookings', true);
        try {
            const res = await providerApi.getBookings();
            if (res.success) {
                setBookings(res.data);
                setOneLoaded('bookings', true);
            }
        } catch (err) { console.error('ProviderData: fetchBookings error', err); }
        finally { setOneLoading('bookings', false); }
    }, [loadedStates.bookings]);

    const fetchReviews = useCallback(async (force = false) => {
        if (loadedStates.reviews && !force) return;
        setOneLoading('reviews', true);
        try {
            const res = await providerApi.getReviews();
            if (res.success) {
                setReviews(res.data);
                setOneLoaded('reviews', true);
            }
        } catch (err) { console.error('ProviderData: fetchReviews error', err); }
        finally { setOneLoading('reviews', false); }
    }, [loadedStates.reviews]);

    const fetchWallet = useCallback(async (force = false) => {
        if (loadedStates.wallet && !force) return;
        setOneLoading('wallet', true);
        try {
            const res = await providerApi.getWallet();
            if (res.success) {
                setWallet(res.data);
                setOneLoaded('wallet', true);
            }
        } catch (err) { console.error('ProviderData: fetchWallet error', err); }
        finally { setOneLoading('wallet', false); }
    }, [loadedStates.wallet]);

    const fetchWalletReport = useCallback(async (force = false) => {
        if (loadedStates.walletReport && !force) return;
        setOneLoading('walletReport', true);
        try {
            const res = await providerApi.getWalletReport();
            if (res.success) {
                setWalletReport(res.data);
                setOneLoaded('walletReport', true);
            }
        } catch (err) { console.error('ProviderData: fetchWalletReport error', err); }
        finally { setOneLoading('walletReport', false); }
    }, [loadedStates.walletReport]);

    const fetchSettings = useCallback(async (force = false) => {
        if (loadedStates.settings && !force) return;
        setOneLoading('settings', true);
        try {
            const res = await providerApi.getSettings();
            if (res.success) {
                setSettings(res.data);
                setOneLoaded('settings', true);
            }
        } catch (err) { console.error('ProviderData: fetchSettings error', err); }
        finally { setOneLoading('settings', false); }
    }, [loadedStates.settings]);

    const fetchSystemData = useCallback(async (force = false) => {
        if (loadedStates.system && !force && locations.length > 0) return;
        setOneLoading('system', true);
        try {
            // Lấy toàn bộ địa điểm và danh mục (không phân trang)
            const [locRes, catRes] = await Promise.all([
                providerApi.getPublicLocations(),
                providerApi.getPublicCategories()
            ]);
            
            if (locRes.data) setLocations(locRes.data);
            else if (locRes.success) setLocations(locRes.data || []);

            if (catRes.data) setCategories(catRes.data); 
            else if (catRes.success) setCategories(catRes.data || []);

            setOneLoaded('system', true);
        } catch (err) { 
            console.error('ProviderData: fetchSystemData error', err); 
        } finally { 
            setOneLoading('system', false); 
        }
    }, [loadedStates.system, locations.length]);

    const reloadAll = useCallback(async () => {
        await Promise.all([
            fetchStats(true),
            fetchServices(true),
            fetchBookings(true),
            fetchReviews(true),
            fetchWallet(true),
            fetchWalletReport(true),
            fetchSettings(true),
            fetchSystemData(true)
        ]);
    }, [fetchStats, fetchServices, fetchBookings, fetchReviews, fetchWallet, fetchWalletReport, fetchSettings, fetchSystemData]);

    const value = {
        stats, services, bookings, reviews, wallet, walletReport, settings, locations, categories,
        servicesMeta,
        loadingStates, loadedStates,
        fetchStats, fetchServices, fetchBookings, fetchReviews, fetchWallet, fetchWalletReport, fetchSettings, fetchSystemData,
        reloadAll,
        setServices, setBookings, setReviews, setSettings
    };

    return (
        <ProviderDataContext.Provider value={value}>
            {children}
        </ProviderDataContext.Provider>
    );
};
