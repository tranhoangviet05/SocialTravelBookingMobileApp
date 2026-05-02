# 📜 Quy định đóng góp mã nguồn (Contributor Guidelines)

Chào mừng các thành viên đến với dự án **Social Travel Booking**. Để đảm bảo mã nguồn luôn sạch sẽ, dễ quản lý và tránh xung đột, tất cả các thành viên (Backend, Web, Mobile) vui lòng tuân thủ các quy tắc sau:

---

## 🌿 1. Quy định đặt tên Nhánh (Branch Naming)

Chúng ta sử dụng tiền tố (Prefix) kết hợp với phạm vi (Scope) để phân biệt các công việc.

**Cấu trúc:** `loai/phamvi-ten-tinh-nang`

| Loại | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `feat/` | Tính năng mới | `feat/web-login-ui`, `feat/mobi-google-sign-in` |
| `fix/` | Sửa lỗi | `fix/api-search-filter`, `fix/web-responsive-header` |
| `refactor/` | Tối ưu/Dọn dẹp code | `refactor/api-auth-service` |
| `docs/` | Cập nhật tài liệu | `docs/update-api-spec` |

---

## 💬 2. Quy định viết Commit (Commit Messages)

Chúng ta áp dụng chuẩn **Conventional Commits**. Mỗi lần commit phải mô tả rõ "Làm gì" và "Ở đâu".

**Cấu trúc:** `loai(phamvi): mo ta ngan gon`

- `feat(web): thêm màn hình danh sách tour`
- `feat(mobi): tích hợp Firebase Auth Core`
- `fix(api): sửa lỗi lọc giá tour không chính xác`
- `docs(all): cập nhật quy định đóng góp mã nguồn`

---

## 🔄 3. Quy trình gửi mã nguồn (PR Workflow)

1. **Checkout**: Luôn bắt đầu từ nhánh `develop` mới nhất.
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Create Branch**: Tạo nhánh mới theo quy tắc trên.
   ```bash
   git checkout -b feat/web-user-profile
   ```
3. **Commit**: Viết commit đúng chuẩn.
4. **Pull Request (PR)**: Đẩy nhánh lên GitHub và tạo PR vào nhánh `develop`.
   - **Mô tả PR**: Ghi rõ những gì đã thay đổi và ảnh chụp màn hình (nếu là UI).
   - **Review**: Ít nhất 1 Lead (hoặc bạn @tranhoangviet05) phải Approve trước khi Merge.

---

## 📂 4. Lưu ý về Monorepo

Dự án này chứa cả Backend, Web và Mobile. Hãy cẩn thận khi thực hiện các lệnh Git ở thư mục gốc:

- Không commit các file môi trường (`.env`, `google-services.json`, v.v.).
- Đảm bảo bạn đang ở đúng thư mục dự án của mình trước khi chạy các lệnh build/install.

---

> [!IMPORTANT]
> **Quy tắc vàng:** Không bao giờ "force push" (`git push -f`) lên các nhánh chung (`main`, `develop`). Nếu lỡ tay làm hỏng, hãy báo ngay cho Lead để cùng xử lý.

Cảm ơn sự hợp tác của các bạn! 🚀
