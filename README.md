# 📱 Social Travel Booking - Mobile App Project

Chào mừng bạn đến với Repository dành riêng cho team Mobile. Repo này bao gồm toàn bộ hệ sinh thái cần thiết để phát triển và chạy ứng dụng Mobile, bao gồm cả Backend API và Web Dashboard (dành cho Admin/Provider).

## 📂 Cấu trúc thư mục
- `/` (Root): Mã nguồn Flutter (Mobile App).
- `/backend`: Laravel API Server (Cung cấp dữ liệu cho App).
- `/frontend_web`: React Web (Dành cho Admin và Provider quản lý).

---

## 🛠 Hướng dẫn Setup cho máy mới (Lần đầu tiên)

### 1. Cài đặt các công cụ cần thiết
Bạn cần cài đặt các công cụ sau trước khi bắt đầu:
- **Flutter SDK**: [Cài đặt tại đây](https://docs.flutter.dev/get-started/install)
- **PHP (8.2+)**: Khuyên dùng [Laravel Herd](https://herd.laravel.com/) cho Windows để tự động có PHP & Composer.
- **Node.js (18+)**: Để chạy frontend web.
- **PostgreSQL**: Hệ quản trị cơ sở dữ liệu.
- **Git**: Để quản lý mã nguồn.

### 2. Thiết lập Backend (Laravel)
Mở terminal và thực hiện các lệnh sau:
```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```
**Quan trọng:** Bạn cần mở file `.env` và cập nhật thông tin Database của bạn:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=social_travel_mobile  # Tên database bạn đã tạo
DB_USERNAME=postgres
DB_PASSWORD=your_password
```
Sau đó chạy migration để tạo bảng:
```bash
php artisan migrate
```

### 3. Thiết lập Frontend Web (React)
```bash
cd frontend_web
npm install
```

### 4. Thiết lập Flutter App
```bash
flutter pub get
```

---

## 🚀 Cách chạy dự án

Để thuận tiện, chúng tôi đã chuẩn bị file `start.bat`. Bạn chỉ cần double-click vào file này ở thư mục gốc để khởi động đồng thời:
- Laravel API (Cổng 8000)
- WebSocket Server (Cổng 8080)
- React Web (Cổng 5173)

Sau đó, để chạy ứng dụng Mobile, hãy dùng lệnh:
```bash
flutter run
```
*(Hoặc nhấn F5 trong VS Code khi đang mở file `lib/main.dart`)*

---

## 📜 Quy tắc đóng góp (Contributing)
Vui lòng tham khảo file `CONTRIBUTING.md` để biết quy định về đặt tên nhánh và quy trình làm việc.

## 🔑 Tài khoản Test
Tham khảo file `ACCOUNT.md` để lấy danh sách tài khoản Admin/Provider mẫu.
