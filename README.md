# Social Travel Booking - Mobile App (React Native & Laravel)

Ứng dụng di động dành cho hệ thống đặt vé du lịch, được xây dựng bằng **React Native (Expo)** và tích hợp hệ thống xác thực **Firebase** kết hợp đồng bộ dữ liệu **Laravel (PostgreSQL)**.

## 📱 Hướng dẫn Kết nối & Chạy dự án

Để chạy ứng dụng trên điện thoại thật và kết nối được với Server Backend trên máy tính, bạn **bắt buộc** phải thực hiện đúng các bước sau:

### 1. Chuẩn bị Mạng (Quan trọng nhất)
*   Đảm bảo **Điện thoại** và **Máy tính** đang bắt chung một mạng **WiFi**.

### 2. Khởi chạy Backend (Laravel)
Di chuyển vào thư mục `backend` và chạy lệnh sau (Không dùng `localhost` hay `127.0.0.1`):

```bash
php -S 0.0.0.0:8000 -t public
```
> **Lưu ý:** Lệnh `0.0.0.0` cho phép các thiết bị bên ngoài (như điện thoại) truy cập vào máy tính của bạn thông qua địa chỉ IP LAN.

### 3. Cấu hình IP LAN trên Mobile
1.  Tìm địa chỉ IPv4 của máy tính:
    *   Mở Terminal (PowerShell/CMD) gõ: `ipconfig`
    *   Tìm dòng `IPv4 Address` (Ví dụ: `192.168.1.14`).
2.  Mở file `src/api/apiClient.js` trong dự án Mobile.
3.  Cập nhật biến `IP_LAN` bằng địa chỉ vừa tìm được:
    ```javascript
    const IP_LAN = '192.168.1.xx'; // Thay xx bằng số của bạn
    ```

### 4. Khởi chạy ứng dụng Expo
Mở một Terminal mới tại thư mục gốc của dự án Mobile:

```bash
npx expo start -c
```
*   Dùng ứng dụng **Expo Go** trên điện thoại để quét mã QR hiện ra trên màn hình máy tính.

---

## 🛠 Cấu trúc dự án & Luồng xác thực

### Luồng Đăng nhập/Đăng ký (Auth Flow)
1.  **Xác thực Firebase**: Người dùng nhập email/mật khẩu, ứng dụng gọi Firebase Auth để xác thực.
2.  **Màn hình Đồng bộ (SyncLoading)**: 
    *   Ngay sau khi Firebase thành công, ứng dụng chuyển vào màn hình chờ.
    *   Tại đây, ứng dụng lấy `ID Token` từ Firebase và gọi API `POST /api/auth/post/sync` sang Laravel.
3.  **Lưu PostgreSQL**: Laravel kiểm tra token, lấy thông tin người dùng và lưu/cập nhật vào DB PostgreSQL.
4.  **Hoàn tất**: Sau khi Backend phản hồi thành công (200 OK), người dùng mới được vào Trang chủ.

### Các công nghệ chính
*   **Frontend**: React Native, Expo, React Navigation, Lucide Icons.
*   **Backend**: Laravel 11, Firebase Admin SDK.
*   **Database**: PostgreSQL.
*   **Storage**: Cloudinary (Upload ảnh).

## ⚠️ Giải quyết lỗi thường gặp
*   **Network Error**: Kiểm tra xem đã chạy PHP với `0.0.0.0` chưa và IP trong `apiClient.js` có khớp với `ipconfig` không.
*   **Timeout**: Đã được cấu hình lên 60 giây trong `apiClient.js` để chờ Firebase xác thực lần đầu.
*   **HostFunction Error**: Đảm bảo phiên bản `react-native-screens` và `reanimated` tương thích với Expo 54 (Xem hướng dẫn trong log terminal).

---
*Phát triển bởi Đội ngũ Social Travel Booking*
