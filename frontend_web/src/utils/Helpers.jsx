// 1. Định dạng tiền tệ VNĐ
export const formatCurrency = (value) => {
    if (!value && value !== 0) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value).replace('₫', 'đ');
};

// 2. Định dạng ngày tháng (Ví dụ: 25/12/2023)
export const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

// 3. Rút gọn văn bản (Dùng cho mô tả ngắn)
export const truncate = (str, n = 100) => {
    if (!str) return "";
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
};

// 4. Tính số ngày giữa 2 ngày (Dùng cho đặt phòng/tour)
export const calculateDaysBetween = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 5. Kiểm tra định dạng Email (Regex)
export const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};