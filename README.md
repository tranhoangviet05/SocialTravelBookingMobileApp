# Social Travel Booking - Mobile App (React Native & Laravel)

Dự án hệ thống đặt vé du lịch tích hợp mạng xã hội, sử dụng **React Native (Expo)** cho Mobile và **Laravel 11** cho Backend.

---

## 🛠 Yêu cầu hệ thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
*   **Node.js** (Phiên bản 18 trở lên)
*   **PHP** (Phiên bản 8.2 trở lên)
*   **Composer** (Quản lý thư viện PHP)
*   **PostgreSQL** (Cơ sở dữ liệu chính)
*   **Expo Go** (Cài sẵn trên điện thoại Android/iOS)

---

## 🚀 Hướng dẫn Cài đặt (Installation)

### 1. Cài đặt Backend (Laravel)
Mở terminal tại thư mục `backend`:
```bash
# 1. Cài đặt các thư viện PHP
composer install

# 2. Tạo file cấu hình môi trường
copy .env.example .env

# 3. Tạo khóa ứng dụng
php artisan key:generate

# 4. Cấu hình Database trong file .env (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD)

# 5. Chạy Migration để tạo các bảng dữ liệu
php artisan migrate

# 6. Chuẩn bị file Firebase (Quan trọng)
# - Đặt file 'firebase-service-account.json' vào thư mục backend/
# - Cấu hình FIREBASE_PROJECT_ID trong .env
```

### 2. Cài đặt Mobile App (React Native)
Mở terminal tại thư mục gốc của dự án Mobile:
```bash
# 1. Cài đặt các thư viện Node.js
npm install

# 2. Cấu hình Firebase
# Đảm bảo file 'src/config/firebase.js' đã có đầy đủ thông tin API Key từ Firebase Console.
```

---

## 📱 Hướng dẫn Kết nối & Chạy dự án

### Bước 1: Khởi chạy Backend
```bash
cd backend
php -S 0.0.0.0:8000 -t public
```

### Bước 2: Tìm IPv4 và Cấu hình Mobile
1.  Gõ `ipconfig` trong terminal để tìm địa chỉ IPv4 (Ví dụ: `192.168.1.14`).
2.  Mở file `src/api/apiClient.js` và cập nhật:
    ```javascript
    const IP_LAN = '192.168.1.14'; // Địa chỉ IP máy tính của bạn
    ```

### Bước 3: Chạy ứng dụng Mobile
```bash
npx expo start -c
```
*   Dùng điện thoại quét mã QR để mở ứng dụng qua **Expo Go**.

---

## 🔄 Luồng hoạt động của Hệ thống
1.  **Auth**: Đăng ký/Đăng nhập bằng Firebase Auth trên điện thoại.
2.  **Sync**: Ngay sau khi thành công, màn hình `SyncLoading` sẽ hiện ra để gọi API sang Laravel.
3.  **Database**: Laravel xác thực Token và lưu thông tin người dùng vào **PostgreSQL**.
4.  **Ready**: Sau khi đồng bộ xong, người dùng mới được vào màn hình chính.

## 🛠 Xử lý sự cố (Troubleshooting)
*   **Lỗi thư viện native (HostFunction)**: Nếu gặp lỗi TypeError liên quan đến boolean/string, hãy chạy lệnh: `npx expo install react-native-screens react-native-reanimated`.
*   **Không kết nối được Server**: Kiểm tra xem điện thoại và máy tính có dùng chung WiFi không và Firewall của Windows có đang chặn port 8000 không.

---
*Phát triển bởi Đội ngũ Social Travel Booking*
