import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import locationApi from '../api/locationApi';
import categoryApi from '../api/categoryApi';
import adminApi from '../api/adminApi';

const AdminDataContext = createContext(null);

export const useAdminData = () => {
    const context = useContext(AdminDataContext);
    if (!context) {
        throw new Error('useAdminData must be used within an AdminDataProvider');
    }
    return context;
};

export const AdminDataProvider = ({ children }) => {
    const auth = useAuth();
    const currentUser = auth ? auth.currentUser : null;

    // Data states
    const [stats, setStats] = useState(null);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [reports, setReports] = useState([]);
    const [settings, setSettings] = useState(null);
    const [automation, setAutomation] = useState([]);
    const [meta, setMeta] = useState({
        users: { current_page: 1, last_page: 1, total: 0 },
        providers: { current_page: 1, last_page: 1, total: 0 },
        services: { current_page: 1, last_page: 1, total: 0 },
        bookings: { current_page: 1, last_page: 1, total: 0 },
        reviews: { current_page: 1, last_page: 1, total: 0 },
        locations: { current_page: 1, last_page: 1, total: 0 },
        categories: { current_page: 1, last_page: 1, total: 0 },
    });

    // Loading states
    const [loadingStates, setLoadingStates] = useState({});
    const [loadedStates, setLoadedStates] = useState({});

    // Reset on logout
    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            setStats(null); setLocations([]); setCategories([]); setUsers([]); setProviders([]);
            setServices([]); setBookings([]); setReviews([]); setCoupons([]); setReports([]);
            setSettings(null); setAutomation([]);
            setLoadedStates({});
        }
    }, [currentUser]);

    const setOneLoading = (key, val) => setLoadingStates(prev => ({ ...prev, [key]: val }));
    const setOneLoaded = (key, val) => setLoadedStates(prev => ({ ...prev, [key]: val }));

    const fetchStats = useCallback(async (force = false) => {
        if (loadedStates.stats && !force) return;
        setOneLoading('stats', true);
        try {
            const res = await adminApi.getDashboardStats();
            if (res.success) { setStats(res.data); setOneLoaded('stats', true); }
        } catch (e) { console.error('AdminData: stats', e); }
        finally { setOneLoading('stats', false); }
    }, [loadedStates.stats]);

    const fetchLocations = useCallback(async (force = false, page = 1, params = {}) => {
        if (loadedStates.locations && !force && page === meta.locations.current_page && Object.keys(params).length === 0) return;
        setOneLoading('locations', true);
        try {
            const res = await adminApi.getAllLocations({ page, per_page: 8, ...params });
            if (res.success) {
                setLocations(res.data);
                if (res.meta) setMeta(prev => ({ ...prev, locations: res.meta }));
                setOneLoaded('locations', true);
            }
        } catch (e) { console.error('AdminData: locations', e); }
        finally { setOneLoading('locations', false); }
    }, [loadedStates.locations, meta.locations.current_page]);

    const fetchCategories = useCallback(async (force = false, page = 1, params = {}) => {
        if (loadedStates.categories && !force && page === meta.categories.current_page && Object.keys(params).length === 0) return;
        setOneLoading('categories', true);
        try {
            const res = await adminApi.getAllCategories({ page, per_page: 8, ...params });
            if (res.success) {
                setCategories(res.data);
                if (res.meta) setMeta(prev => ({ ...prev, categories: res.meta }));
                setOneLoaded('categories', true);
            }
        } catch (e) { console.error('AdminData: categories', e); }
        finally { setOneLoading('categories', false); }
    }, [loadedStates.categories, meta.categories.current_page]);

    const fetchUsers = useCallback(async (force = false, page = 1, params = {}) => {
        if (loadedStates.users && !force && page === meta.users.current_page && Object.keys(params).length === 0) return;
        setOneLoading('users', true);
        try {
            const res = await adminApi.getAllUsers({ page, ...params });
            if (res.success) { 
                setUsers(res.data); 
                if (res.meta) setMeta(prev => ({ ...prev, users: res.meta }));
                setOneLoaded('users', true); 
            }
        } catch (e) { console.error('AdminData: users', e); }
        finally { setOneLoading('users', false); }
    }, [loadedStates.users, meta.users.current_page]);

    const fetchProviders = useCallback(async (force = false, page = 1, extraParams = {}) => {
        if (loadedStates.providers && !force && page === meta.providers.current_page && Object.keys(extraParams).length === 0) return;
        setOneLoading('providers', true);
        try {
            const res = await adminApi.getAllProviders({ page, ...extraParams });
            if (res.success) { 
                setProviders(res.data); 
                if (res.meta) setMeta(prev => ({ ...prev, providers: res.meta }));
                setOneLoaded('providers', true); 
            }
        } catch (e) { console.error('AdminData: providers', e); }
        finally { setOneLoading('providers', false); }
    }, [loadedStates.providers, meta.providers.current_page]);

    const fetchServices = useCallback(async (force = false, params = {}) => {
        const page = params.page || 1;
        const queryParams = { page, per_page: params.per_page || 15 };
        if (params.search) queryParams.search = params.search;
        if (params.type) queryParams.type = params.type;
        if (params.status) queryParams.status = params.status;
        if (loadedStates.services && !force && page === meta.services.current_page) return;
        setOneLoading('services', true);
        try {
            const res = await adminApi.getAllServices(queryParams);
            if (res.success) { 
                setServices(res.data); 
                if (res.meta) setMeta(prev => ({ ...prev, services: res.meta }));
                setOneLoaded('services', true); 
            }
        } catch (e) { console.error('AdminData: services', e); }
        finally { setOneLoading('services', false); }
    }, [loadedStates.services, meta.services.current_page]);

    const fetchBookings = useCallback(async (force = false, page = 1) => {
        if (loadedStates.bookings && !force && page === meta.bookings.current_page) return;
        setOneLoading('bookings', true);
        try {
            const res = await adminApi.getAllBookings({ page });
            if (res.success) { 
                setBookings(res.data); 
                if (res.meta) setMeta(prev => ({ ...prev, bookings: res.meta }));
                setOneLoaded('bookings', true); 
            }
        } catch (e) { console.error('AdminData: bookings', e); }
        finally { setOneLoading('bookings', false); }
    }, [loadedStates.bookings, meta.bookings.current_page]);

    const fetchReviews = useCallback(async (force = false, page = 1) => {
        if (loadedStates.reviews && !force && page === meta.reviews.current_page) return;
        setOneLoading('reviews', true);
        try {
            const res = await adminApi.getAllReviews({ page });
            if (res.success) { 
                setReviews(res.data); 
                if (res.meta) setMeta(prev => ({ ...prev, reviews: res.meta }));
                setOneLoaded('reviews', true); 
            }
        } catch (e) { console.error('AdminData: reviews', e); }
        finally { setOneLoading('reviews', false); }
    }, [loadedStates.reviews, meta.reviews.current_page]);

    const fetchCoupons = useCallback(async (force = false) => {
        if (loadedStates.coupons && !force) return;
        setOneLoading('coupons', true);
        try {
            const res = await adminApi.getAllCoupons();
            if (res.success) { setCoupons(res.data); setOneLoaded('coupons', true); }
        } catch (e) { console.error('AdminData: coupons', e); }
        finally { setOneLoading('coupons', false); }
    }, [loadedStates.coupons]);

    const fetchReports = useCallback(async (force = false) => {
        if (loadedStates.reports && !force) return;
        setOneLoading('reports', true);
        try {
            const res = await adminApi.getAllReports();
            if (res.success) { setReports(res.data); setOneLoaded('reports', true); }
        } catch (e) { console.error('AdminData: reports', e); }
        finally { setOneLoading('reports', false); }
    }, [loadedStates.reports]);

    const fetchSettings = useCallback(async (force = false) => {
        if (loadedStates.settings && !force) return;
        setOneLoading('settings', true);
        try {
            const res = await adminApi.getSettings();
            if (res.success) { setSettings(res.data); setOneLoaded('settings', true); }
        } catch (e) { console.error('AdminData: settings', e); }
        finally { setOneLoading('settings', false); }
    }, [loadedStates.settings]);

    const fetchAutomation = useCallback(async (force = false) => {
        if (loadedStates.automation && !force) return;
        setOneLoading('automation', true);
        try {
            const res = await adminApi.getAutomationWorkflows();
            if (res.success) { setAutomation(res.data); setOneLoaded('automation', true); }
        } catch (e) { console.error('AdminData: automation', e); }
        finally { setOneLoading('automation', false); }
    }, [loadedStates.automation]);

    const reloadAll = useCallback(async () => {
        // Only reload what is already loaded
        const reloads = [];
        if (loadedStates.stats) reloads.push(fetchStats(true));
        if (loadedStates.locations) reloads.push(fetchLocations(true));
        if (loadedStates.categories) reloads.push(fetchCategories(true));
        if (loadedStates.users) reloads.push(fetchUsers(true));
        if (loadedStates.providers) reloads.push(fetchProviders(true));
        if (loadedStates.services) reloads.push(fetchServices(true));
        if (loadedStates.bookings) reloads.push(fetchBookings(true));
        if (loadedStates.reviews) reloads.push(fetchReviews(true));
        if (loadedStates.coupons) reloads.push(fetchCoupons(true));
        if (loadedStates.reports) reloads.push(fetchReports(true));
        if (loadedStates.settings) reloads.push(fetchSettings(true));
        if (loadedStates.automation) reloads.push(fetchAutomation(true));
        await Promise.all(reloads);
    }, [loadedStates, fetchStats, fetchLocations, fetchCategories, fetchUsers, fetchProviders, fetchServices, fetchBookings, fetchReviews, fetchCoupons, fetchReports, fetchSettings, fetchAutomation]);

    // Helpers for CRUD updates (client-side state sync)
    const addLocation = (loc) => setLocations(prev => [loc, ...prev]);
    const updateLocation = (loc) => setLocations(prev => prev.map(l => l.id === loc.id ? loc : l));
    const removeLocation = (id) => setLocations(prev => prev.filter(l => l.id !== id));

    const addCategory = (cat) => setCategories(prev => [cat, ...prev]);
    const updateCategory = (cat) => setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    const removeCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));

    const addCoupon = (cpn) => setCoupons(prev => [cpn, ...prev]);
    const updateCoupon = (cpn) => setCoupons(prev => prev.map(c => c.id === cpn.id ? cpn : c));
    const removeCoupon = (id) => setCoupons(prev => prev.filter(c => c.id !== id));

    const value = {
        users, providers, services, bookings, reviews, coupons, reports, settings, automation, stats, meta, locations, categories,
        loadingStates,
        // Specific flags for convenience
        isLoadingUsers: loadingStates.users,
        isLoadingProviders: loadingStates.providers,
        isLoadingServices: loadingStates.services,
        isLoadingBookings: loadingStates.bookings,
        isLoadingReviews: loadingStates.reviews,
        isLoadingLocations: loadingStates.locations,
        isLoadingCategories: loadingStates.categories,
        
        // Fetch functions
        fetchUsers, fetchProviders, fetchServices, fetchBookings, fetchReviews, 
        fetchLocations, fetchCategories, fetchStats, fetchCoupons, fetchSettings, fetchAutomation,
        
        // Update helpers (Client-side state sync)
        setUsers, setProviders, setServices, setBookings, setReviews, setCoupons, setReports, setSettings, setAutomation, setMeta,
        addLocation, updateLocation, removeLocation,
        addCategory, updateCategory, removeCategory,
        addCoupon, updateCoupon, removeCoupon,
        
        reloadAll
    };

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
};
