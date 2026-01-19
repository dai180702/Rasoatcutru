# Hướng dẫn bật Firebase Authentication

## Bước 1: Bật Email/Password Authentication

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **rasoatcutru**
3. Vào **Authentication** trong menu bên trái
4. Click **Get started** (nếu chưa bật)
5. Vào tab **Sign-in method**
6. Click vào **Email/Password**
7. Bật **Enable** cho Email/Password
8. Click **Save**

## Bước 2: Tạo tài khoản admin

1. Vào tab **Users** trong Authentication
2. Click **Add user**
3. Nhập:
   - **Email**: `phanminhdai.it@gmail.com`
   - **Password**: (đặt mật khẩu của bạn)
4. Click **Add user**

## Bước 3: Cập nhật Firestore Rules

Xem file `FIRESTORE_RULES.md` để cập nhật Rules cho phép:
- Mọi người có thể thêm bản ghi (không cần đăng nhập)
- Chỉ `phanminhdai.it@gmail.com` mới có thể xem và xóa danh sách

## Kiểm tra

Sau khi setup xong:
1. Chạy `npm run dev`
2. Mở `http://localhost:3000`
3. Thử điền form → sẽ thành công (không cần đăng nhập)
4. Thử xem danh sách → sẽ yêu cầu đăng nhập
5. Đăng nhập với `phanminhdai.it@gmail.com` → sẽ thấy danh sách

