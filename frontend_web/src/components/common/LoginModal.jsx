import React, { useState, useEffect, useRef } from 'react';
import { signIn, signInWithGoogle } from '../../firebase/services/authService';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import { Eye, EyeOff, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { COLORS } from '../../utils/colors';
import dnBg from '../../assets/images/dn_bg.jpg';
import quynhonBg from '../../assets/images/quynhon_bg.jpg';
import hueBg from '../../assets/images/hue_bg.jpg';

const slides = [
    { image: dnBg, name: 'Đà Nẵng', tag: 'Biển & Phố', desc: 'Thành phố đáng sống với bãi biển Mỹ Khê, cầu Vàng và ẩm thực đường phố tuyệt vời.' },
    { image: quynhonBg, name: 'Quy Nhơn', tag: 'Thiên nhiên', desc: 'Viên ngọc ẩn giấu với Eo Gió, Kỳ Co và những bãi biển hoang sơ tuyệt đẹp.' },
    { image: hueBg, name: 'Huế', tag: 'Di sản', desc: 'Cố đô ngàn năm với Đại Nội, lăng tẩm triều Nguyễn và nét đẹp văn hóa trầm mặc.' },
];

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [reportMessage, setReportMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const timerRef = useRef(null);
    const navigate = useNavigate();
    const toast = useNotification();

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentSlide(0);
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Auto-advance slides every 3s
    useEffect(() => {
        if (!isOpen) return;
        timerRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timerRef.current);
    }, [isOpen]);

    if (!isOpen) return null;

    const clearError = () => { if (reportMessage) setReportMessage(''); };

    const handleLogin = async (e) => {
        e.preventDefault();
        setReportMessage('');

        if (!email.trim() || !password) {
            setReportMessage('Vui lòng nhập Email và Mật khẩu');
            return;
        }

        setIsLoading(true);
        try {
            const user = await signIn(email, password);

            const idToken = await user.getIdToken();
            const response = await authApi.syncUser(idToken);
            const role = response?.data?.role;

            console.log('Login success:', user, 'Role:', role);
            toast.success(`Chào mừng bạn quay lại, ${user.displayName || 'Người dùng'}!`);
            onClose();

            // Chuyển hướng theo vai trò
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'provider') navigate('/provider/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            const errorMap = {
                'auth/user-not-found': 'Email không tồn tại',
                'auth/wrong-password': 'Mật khẩu không chính xác',
                'auth/invalid-email': 'Email không hợp lệ',
                'auth/invalid-credential': 'Thông tin đăng nhập không chính xác',
            };
            const msg = errorMap[error.code] || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setReportMessage(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setReportMessage('');
        try {
            const user = await signInWithGoogle();

            const idToken = await user.getIdToken();
            const response = await authApi.syncUser(idToken);
            const role = response?.data?.role;

            console.log('Google login success', 'Role:', role);
            toast.success('Đăng nhập với Google thành công!');
            onClose();

            // Chuyển hướng theo vai trò
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'provider') navigate('/provider/dashboard');
        } catch (error) {
            console.error('Google Auth failed:', error);
            const msg = 'Đăng nhập Google thất bại';
            setReportMessage(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[900px] min-h-[90vh] mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex animate-[modalIn_0.3s_ease-out]">
                {/* Left side - Slideshow */}
                <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                    {/* Loading Overlay for Auth Process */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-sky-900/40 backdrop-blur-md z-[100] flex flex-col items-center justify-center transition-all duration-500">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-white font-bold tracking-wide animate-pulse">ĐANG XÁC THỰC...</p>
                        </div>
                    )}

                    {slides.map((slide, i) => (
                        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                            <img src={slide.image} alt={slide.name} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
                        <span className="inline-block w-fit bg-sky-400/30 text-white text-[10px] font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-widest border border-white/20">
                            {slides[currentSlide].tag}
                        </span>
                        <h2 className="text-3xl font-black text-white leading-tight mb-2 transition-all">
                            {slides[currentSlide].name}
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed mb-6">
                            {slides[currentSlide].desc}
                        </p>
                        {/* Dot indicators */}
                        <div className="flex gap-2">
                            {slides.map((_, i) => (
                                <button key={i} onClick={() => setCurrentSlide(i)}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className={`w-full lg:w-1/2 p-8 md:p-10 overflow-y-auto no-scrollbar relative transition-all duration-500 ${isLoading ? 'blur-[2px]' : ''}`}>
                    {/* Loading Overlay for mobile/right side */}
                    {isLoading && (
                        <div className="lg:hidden absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mb-4" />
                            <p className="text-sky-900 font-bold text-sm">ĐANG XỬ LÝ...</p>
                        </div>
                    )}

                    {/* Close button */}
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer z-[101]">
                        <X size={16} />
                    </button>

                    {/* Heading */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900">Chào mừng đến với</h3>
                        <h2 className="text-2xl font-black text-sky-900 mb-1">Social Travel Booking</h2>
                        <p className="text-gray-400 text-sm">Nhập thông tin để tiếp tục hành trình</p>
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-slate-700 hover:bg-gray-50 transition-all mb-6 cursor-pointer disabled:opacity-60"
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="Google" />
                        Tiếp tục với Google
                    </button>

                    <div className="relative flex items-center mb-6">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hoặc</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all outline-none text-slate-900 font-medium text-sm"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all outline-none text-slate-900 font-medium tracking-widest text-sm"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-500 transition-colors cursor-pointer">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            {reportMessage && (
                                <p className="text-red-500 text-sm text-center mb-4">{reportMessage}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                                <span className="text-xs text-gray-500 group-hover:text-slate-800 transition-colors">Ghi nhớ</span>
                            </label>
                            <a href="#" className="text-xs font-bold text-sky-600 hover:text-sky-700">Quên mật khẩu?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:brightness-105 transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: COLORS.primary }}>
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-500 text-sm">
                        Chưa có tài khoản?{' '}
                        <button onClick={onSwitchToRegister} className="font-bold text-sky-600 hover:underline cursor-pointer">Đăng ký ngay</button>
                    </p>
                </div>
            </div>

            {/* Animation keyframe */}
            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default LoginModal;
