import React, { useState, useEffect, useRef } from 'react';
import { signUp, signInWithGoogle } from '../../firebase/services/authService';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import { Eye, EyeOff, X, User } from 'lucide-react';
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

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [reportMessage, setReportMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [role, setRole] = useState('tourist'); // 'tourist' | 'provider'
    const timerRef = useRef(null);
    const navigate = useNavigate();
    const toast = useNotification();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentSlide(0);
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        timerRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timerRef.current);
    }, [isOpen]);

    if (!isOpen) return null;

    // Xoá thông báo lỗi khi người dùng nhập lại
    const clearError = () => { if (reportMessage) setReportMessage(''); };

    const handleRegister = async (e) => {
        e.preventDefault();
        setReportMessage('');

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setReportMessage('Vui lòng nhập đầy đủ thông tin');
            return;
        } else if (name.trim().length < 3) {
            setReportMessage('Tên phải có ít nhất 3 ký tự');
            return;
        } else if (name.trim().length > 50) {
            setReportMessage('Tên không được vượt quá 50 ký tự');
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setReportMessage('Email không hợp lệ');
            return;
        } else if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            setReportMessage('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và số');
            return;
        } else if (password !== confirmPassword) {
            setReportMessage('Mật khẩu xác nhận không khớp');
            return;
        } else if (!agreeTerms) {
            setReportMessage('Bạn cần đồng ý với điều khoản sử dụng');
            return;
        }

        setIsLoading(true);
        try {
            const user = await signUp(email, password, name.trim());

            // Force refresh token để bao gồm displayName mới cập nhật
            const idToken = await user.getIdToken(true);
            // Gửi displayName và role qua body
            const response = await authApi.syncUser(idToken, { 
                displayName: name.trim(),
                role: role 
            });

            console.log('Register success:', user, 'Role:', role);
            setReportMessage('');
            toast.success('Đăng ký tài khoản thành công!');
            onClose();

            // Chuyển hướng theo vai trò
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'provider') navigate('/provider/dashboard');
        } catch (error) {
            console.error('Register failed:', error);
            const errorMap = {
                'auth/email-already-in-use': 'Email này đã được sử dụng',
                'auth/invalid-email': 'Email không hợp lệ',
                'auth/weak-password': 'Mật khẩu quá yếu',
            };
            const msg = errorMap[error.code] || 'Đăng ký thất bại. Vui lòng thử lại.';
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
            const response = await authApi.syncUser(idToken, { role: role });
            const finalRole = response?.data?.role || role;

            console.log('Google login & sync success:', finalRole);
            toast.success('Đăng ký với Google thành công!');
            onClose();

            // Chuyển hướng theo vai trò
            if (finalRole === 'admin') navigate('/admin/dashboard');
            else if (finalRole === 'provider') navigate('/provider/dashboard');
        } catch (error) {
            console.error('Google Auth failed:', error);
            const msg = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
            setReportMessage(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-[900px] max-h-[90vh] mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex animate-[modalIn_0.3s_ease-out]">
                {/* Left side - Slideshow */}
                <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                    {slides.map((slide, i) => (
                        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                            <img src={slide.image} alt={slide.name} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
                        <span className="inline-block w-fit bg-emerald-400/30 text-white text-[10px] font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-widest border border-white/20">
                            {slides[currentSlide].tag}
                        </span>
                        <h2 className="text-3xl font-black text-white leading-tight mb-2">
                            {slides[currentSlide].name}
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed mb-6">
                            {slides[currentSlide].desc}
                        </p>
                        <div className="flex gap-2">
                            {slides.map((_, i) => (
                                <button key={i} onClick={() => setCurrentSlide(i)}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side - Register Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-10 overflow-y-auto no-scrollbar">
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer">
                        <X size={16} />
                    </button>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Tham gia cùng</h3>
                         <h2 className="text-2xl font-black text-sky-900 mb-1">Social Travel Booking</h2>
                        <p className="text-gray-400 text-sm">Tạo tài khoản để bắt đầu hành trình</p>
                    </div>

                    {/* Role Selection Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('tourist')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${role === 'tourist' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Người du lịch
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('provider')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${role === 'provider' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Nhà cung cấp
                        </button>
                    </div>

                    {/* Google Register */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-slate-700 hover:bg-gray-50 transition-all mb-5 cursor-pointer disabled:opacity-60"
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="Google" />
                        Tiếp tục với Google
                    </button>

                    <div className="relative flex items-center mb-5">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hoặc</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên</label>
                            <input
                                type="text"
                                placeholder="Nguyễn Văn A"
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all outline-none text-slate-900 font-medium text-sm"
                                value={name}
                                onChange={(e) => { setName(e.target.value); clearError(); }}
                            />
                        </div>

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
                                    placeholder="Tối thiểu 8 ký tự"
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all outline-none text-slate-900 font-medium text-sm"
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
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Nhập lại mật khẩu"
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all outline-none text-slate-900 font-medium text-sm"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-500 transition-colors cursor-pointer">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            {reportMessage && (
                                <p className="text-red-500 text-sm text-center">{reportMessage}</p>
                            )}
                        </div>

                        <div className="flex items-start gap-2">
                            <input type="checkbox" checked={agreeTerms} onChange={(e) => { setAgreeTerms(e.target.checked); clearError(); }} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-sky-500 focus:ring-sky-500 cursor-pointer" />
                            <span className="text-xs text-gray-500 leading-relaxed">
                                Tôi đồng ý với <a href="#" className="text-sky-600 font-bold hover:underline">Điều khoản sử dụng</a> và <a href="#" className="text-sky-600 font-bold hover:underline">Chính sách bảo mật</a>
                            </span>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:brightness-105 transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: COLORS.primary }}>
                            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-gray-500 text-sm">
                        Đã có tài khoản?{' '}
                        <button onClick={onSwitchToLogin} className="font-bold text-sky-600 hover:underline cursor-pointer">Đăng nhập</button>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default RegisterModal;
