import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AdminDataProvider } from './contexts/AdminDataContext';
import { ProviderDataProvider } from './contexts/ProviderDataContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import ProviderLayout from './components/provider/ProviderLayout';
import HomePage from './pages/tourist/Home';
import SearchPage from './pages/tourist/Search';
import ServiceDetailPage from './pages/tourist/ServiceDetail';
import ProfilePage from './pages/tourist/Profile';
import MyBookingsPage from './pages/tourist/MyBookings';
import NewsFeed from './pages/tourist/NewsFeed';
import NewsFeedHome from './pages/tourist/news_feed/Home';
import NewsFeedSearch from './pages/tourist/news_feed/SearchPage';
import NewsFeedProfile from './pages/tourist/news_feed/Profile';
import NewsFeedActivity from './pages/tourist/news_feed/Activity';
import CheckoutPage from './pages/tourist/Checkout';
import SuccessPage from './pages/tourist/Success';
import CartPage from './pages/tourist/Cart';
import WishlistPage from './pages/tourist/Wishlist';
import Onboarding from './pages/tourist/Onboarding';
import SocialRoute from './components/common/SocialRoute';
// --- Admin Pages ---
import DashboardManagement from './pages/admin/DashboardManagement';
import UserManagement from './pages/admin/UserManagement';
import ProviderManagement from './pages/admin/ProviderManagement';
import LocationManagement from './pages/admin/LocationManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import BookingManagement from './pages/admin/BookingManagement';
import CouponManagement from './pages/admin/CouponManagement';
import ReportManagement from './pages/admin/ReportManagement';
import SettingManagement from './pages/admin/SettingManagement';
import ReviewManagement from './pages/admin/ReviewManagement';
import AutomationManagement from './pages/admin/AutomationManagement';
import CategoryManagement from './pages/admin/CategoryManagement';

// --- Provider Pages ---
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderMyServices from './pages/provider/MyServices';
import ProviderMyBookings from './pages/provider/MyBookings';
import ProviderMyReviews from './pages/provider/MyReviews';
import ProviderMyWallet from './pages/provider/MyWallet';
import ProviderMySettings from './pages/provider/MySettings';
import ProviderMessages from './pages/provider/Messages';
import SetupProfile from './pages/provider/SetupProfile';
import PendingApproval from './pages/provider/PendingApproval';

import './App.css';
import { API_ENDPOINTS } from './utils/ConstantSystems';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AdminDataProvider>
            <ProviderDataProvider>
              <Routes>
                  {/* ... Existing Routes ... */}
                  <Route element={
                    <WishlistProvider>
                      <MainLayout />
                    </WishlistProvider>
                  }>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/service/:slug" element={<ServiceDetailPage />} />

                    {/* Các route yêu cầu đăng nhập đối với Tourist */}
                    <Route element={<ProtectedRoute allowedRoles={['tourist', 'provider']} />}>
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/my-bookings" element={<MyBookingsPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/success" element={<SuccessPage />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                    </Route>
                  </Route> {/* Close MainLayout */}

                  {/* === CỘNG ĐỒNG / MẠNG XÃ HỘI === */}
                  {/* Bảo vệ bởi SocialRoute: phải đăng nhập và đã kích hoạt social_active */}
                  <Route element={<SocialRoute />}>
                    <Route path="/newsfeed" element={<NewsFeed />}>
                      <Route index element={<NewsFeedHome />} />
                      <Route path="search" element={<NewsFeedSearch />} />
                      <Route path="profile" element={<NewsFeedProfile />} />
                      <Route path="activity" element={<NewsFeedActivity />} />
                    </Route>
                  </Route>

                  {/* === HỆ THỐNG QUẢN TRỊ (ADMIN) === */}
                  <Route element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route path={API_ENDPOINTS.ADMIN_DASHBOARD} element={<DashboardManagement />} />
                    <Route path={API_ENDPOINTS.LOCATIONS_ADMIN} element={<LocationManagement />} />
                    <Route path={API_ENDPOINTS.CATEGORIES_ADMIN} element={<CategoryManagement />} />
                    <Route path={API_ENDPOINTS.USERS_ADMIN} element={<UserManagement />} />
                    <Route path={API_ENDPOINTS.PROVIDERS_ADMIN} element={<ProviderManagement />} />
                    <Route path={API_ENDPOINTS.SERVICES_ADMIN} element={<ServiceManagement />} />
                    <Route path={API_ENDPOINTS.BOOKINGS_ADMIN} element={<BookingManagement />} />
                    <Route path={API_ENDPOINTS.REVIEWS_ADMIN} element={<ReviewManagement />} />
                    <Route path={API_ENDPOINTS.COUPONS_ADMIN} element={<CouponManagement />} />
                    <Route path={API_ENDPOINTS.AUTOMATION_ADMIN} element={<AutomationManagement />} />
                    <Route path={API_ENDPOINTS.REPORTS_ADMIN} element={<ReportManagement />} />
                    <Route path={API_ENDPOINTS.SETTINGS_ADMIN} element={<SettingManagement />} />

                    {/* Fallback routes for admin */}
                    <Route path="/admin/services" element={<ServiceManagement />} />
                    <Route path="/admin/hotels" element={<ServiceManagement />} />
                    <Route path="/admin/tours" element={<ServiceManagement />} />
                    <Route path="/admin/stats" element={<DashboardManagement />} />
                  </Route>

                  {/* === HỆ THỐNG NHÀ CUNG CẤP (PROVIDER) === */}
                  <Route element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderLayout />
                    </ProtectedRoute>
                  }>
                    <Route path={API_ENDPOINTS.PROVIDER_DASHBOARD} element={<ProviderDashboard />} />
                    <Route path={API_ENDPOINTS.PROVIDER_SERVICES} element={<ProviderMyServices />} />
                    <Route path={API_ENDPOINTS.PROVIDER_BOOKINGS} element={<ProviderMyBookings />} />
                    <Route path={API_ENDPOINTS.PROVIDER_REVIEWS} element={<ProviderMyReviews />} />
                    {/* Fallback endpoints without absolute object mapping in case they misalign */}
                    <Route path={API_ENDPOINTS.PROVIDER_MESSAGES} element={<ProviderMessages />} />
                    <Route path="/provider/wallet" element={<ProviderMyWallet />} />
                    <Route path="/provider/settings" element={<ProviderMySettings />} />
                    <Route path="/provider/setup" element={<SetupProfile />} />
                    <Route path="/provider/waiting" element={<PendingApproval />} />
                  </Route>

                </Routes>
              </ProviderDataProvider>
            </AdminDataProvider>
          </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
