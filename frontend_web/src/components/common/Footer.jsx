import React from 'react';
import { Facebook, Instagram, Twitter, Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-sky-900 via-sky-950 to-slate-900 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-white mb-4">Social Travel Booking</h3>
                        <p className="text-sky-200/60 text-sm leading-relaxed mb-5">
                            Kết nối bạn với những hành trình đáng nhớ và cộng đồng du lịch sôi nổi trên khắp Việt Nam.
                        </p>
                        <div className="flex space-x-3">
                            {[Facebook, Instagram, Twitter, Globe].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 bg-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/20 transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-5 uppercase text-xs tracking-widest">Về chúng tôi</h4>
                        <ul className="space-y-3 text-sm text-sky-200/60">
                            <li><a href="#" className="hover:text-white transition-colors">Giới thiệu</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Báo chí</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Ứng dụng di động</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-5 uppercase text-xs tracking-widest">Hỗ trợ</h4>
                        <ul className="space-y-3 text-sm text-sky-200/60">
                            <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-5 uppercase text-xs tracking-widest">Liên hệ</h4>
                        <ul className="space-y-3 text-sm text-sky-200/60">
                            <li>Hotline: 1900 6868</li>
                            <li>Email: sociatravelbooking.business@gmail.com</li>
                            <li>Địa chỉ: Đà Nẵng, Việt Nam</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-white/30">© 2026 Social Travel Booking. All rights reserved.</p>
                    <div className="flex space-x-6 text-sm text-white/30">
                        <a href="#" className="hover:text-white transition-colors">Về chúng tôi</a>
                        <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
                        <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
