import React, { useState } from 'react';
import { Trash2, ShoppingCart, Info, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { MOCK_SERVICES } from '../../data/mockServices';

const Cart = () => {
    const navigate = useNavigate();
    // Giả lập giỏ hàng có 2 món
    const [cartItems, setCartItems] = useState([
        {
            ...MOCK_SERVICES[0],
            cartId: 1,
            selectedDate: '20/05/2026',
            adults: 2,
            children: 0,
        },
        {
            ...MOCK_SERVICES[1],
            cartId: 2,
            selectedDate: '25/05/2026',
            adults: 1,
            children: 0,
        }
    ]);

    const handleRemove = (cartId) => {
        setCartItems(prev => prev.filter(item => item.cartId !== cartId));
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.adults), 0);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <ShoppingCart size={80} className="text-gray-200 mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Giỏ hàng trống</h2>
                <p className="text-slate-500 mb-6">Bạn chưa có dịch vụ nào trong giỏ hàng.</p>
                <Link to="/search">
                    <Button variant="primary">Khám phá ngay</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Giỏ hàng của bạn</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Danh sách giỏ hàng */}
                <div className="flex-1 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.cartId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-5 relative">
                            <img src={item.images[0]} alt={item.name} className="w-full sm:w-40 h-32 object-cover rounded-lg" />
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="font-bold text-lg text-slate-800 line-clamp-2">{item.name}</h3>
                                        <button onClick={() => handleRemove(item.cartId)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1 mb-3">
                                        <MapPin size={14} /> {item.location}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                                        <div><span className="text-gray-500">Khởi hành:</span> <span className="font-semibold text-slate-800">{item.selectedDate}</span></div>
                                        <div><span className="text-gray-500">Số lượng:</span> <span className="font-semibold text-slate-800">{item.adults} Người lớn</span></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-sky-600">
                                        {new Intl.NumberFormat('vi-VN').format(item.price * item.adults)}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex gap-3 text-sm">
                        <Info size={20} className="shrink-0" />
                        <p>Các dịch vụ trong giỏ hàng chưa được giữ chỗ cho đến khi bạn hoàn tất thanh toán. Vui lòng thanh toán sớm kẻo hết chỗ nhé!</p>
                    </div>
                </div>

                {/* Tóm tắt thanh toán */}
                <div className="w-full lg:w-80">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-slate-800 mb-5 border-b pb-2">Tạm tính</h2>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tổng phụ ({cartItems.length} dịch vụ)</span>
                                <span className="font-semibold text-slate-800">{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Giảm giá</span>
                                <span className="font-semibold text-green-600">0đ</span>
                            </div>
                            <div className="flex justify-between text-base pt-3 border-t border-slate-200 mt-2">
                                <span className="font-bold text-slate-800">Tổng cộng</span>
                                <span className="font-black text-red-500 text-xl">{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
                            </div>
                        </div>

                        <Button 
                            variant="primary" 
                            className="w-full py-3"
                            onClick={() => navigate('/checkout')}
                        >
                            Tiếp tục thanh toán
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
