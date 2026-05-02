import React from 'react';
import { ShieldCheck, Tag, UserPlus, Headset } from 'lucide-react';

const WhyChooseUs = () => {
    const reasons = [
        { icon: <ShieldCheck className="text-sky-500" />, title: "An toàn tuyệt đối", desc: "Chúng tôi cam kết bảo mật thông tin và bảo hiểm cho mọi chuyến đi của bạn.", color: "#E0F2FE" },
        { icon: <Tag className="text-orange-500" />, title: "Giá tốt nhất", desc: "Luôn đảm bảo mức giá cạnh tranh nhất với nhiều ưu đãi độc quyền hàng ngày.", color: "#FFF7ED" },
        { icon: <UserPlus className="text-amber-600" />, title: "Cộng đồng sôi nổi", desc: "Kết nối hàng ngàn người có sở thích và kinh nghiệm du lịch thực tế.", color: "#FEF3C7" },
        { icon: <Headset className="text-blue-500" />, title: "Hỗ trợ 24/7", desc: "Đội ngũ nhân viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn.", color: "#EFF6FF" }
    ];

    return (
        <section className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-10">
                    <p className="text-sky-500 font-bold text-xs uppercase tracking-widest mb-2">Vì sao chọn chúng tôi</p>
                    <h2 className="text-3xl font-black text-slate-900">Lý do chọn Social Travel Booking</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reasons.map((item, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: item.color }}>
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
