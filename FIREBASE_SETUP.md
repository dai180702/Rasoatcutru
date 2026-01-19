# Hướng dẫn cấu hình Firebase

## Bước 1: Tạo dự án Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo dự án mới hoặc chọn dự án có sẵn
3. Vào **Project Settings** (biểu tượng bánh răng)

## Bước 2: Thêm ứng dụng Web

1. Trong Project Settings, click **Add app** và chọn **Web** (</>)
2. Đặt tên ứng dụng và click **Register app**
3. Copy các thông tin cấu hình Firebase

## Bước 3: Bật Firestore Database

1. Vào **Firestore Database** trong menu bên trái
2. Click **Create database**
3. Chọn **Start in test mode** (hoặc production mode nếu bạn đã cấu hình rules)
4. Chọn location (chọn gần Việt Nam nhất có thể)
5. Click **Enable**

## Bước 4: Cấu hình Firestore Rules (Quan trọng!)

Vào **Firestore Database** > **Rules** và cập nhật:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /verification_records/{document=**} {
      allow read, write: if true; // Cho phép đọc/ghi (tạm thời cho development)
      // Trong production, bạn nên thêm authentication:
      // allow read, write: if request.auth != null;
    }
  }
}
```

**Lưu ý:** Quy tắc trên cho phép mọi người đọc/ghi. Trong production, bạn nên thêm authentication để bảo mật.

## Bước 5: Tạo file .env.local

Tạo file `.env.local` trong thư mục gốc của dự án với nội dung:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id-here
```

Thay thế các giá trị bằng thông tin từ Firebase Console của bạn.

**Gợi ý:** Có sẵn file mẫu `env.example` — bạn có thể copy sang `.env.local` để điền nhanh.

## Bước 6: Tạo Index cho Firestore (Nếu cần)

Nếu bạn gặp lỗi về index khi query, Firebase sẽ tự động hiển thị link để tạo index. Click vào link đó để tạo index tự động.

## Kiểm tra

Sau khi cấu hình xong, chạy lại ứng dụng:

```bash
npm run dev
```

Dữ liệu sẽ được lưu vào Firestore và tự động đồng bộ!

