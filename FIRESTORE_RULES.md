# Firestore Rules - Cấu hình phân quyền

## Rules cần cập nhật trong Firebase Console

Vào **Firestore Database** > **Rules** và dán đoạn sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /verification_records/{document=**} {
      // Cho phép mọi người thêm bản ghi (không cần đăng nhập)
      allow create: if true;
      
      // Chỉ cho phép đọc và xóa nếu đã đăng nhập và là tài khoản được phép
      allow read, delete: if request.auth != null 
        && request.auth.token.email == 'phanminhdai.it@gmail.com';
      
      // Không cho phép update (chỉ có thể thêm mới hoặc xóa)
      allow update: if false;
    }
  }
}
```

## Giải thích:

- **`allow create: if true`**: Mọi người đều có thể thêm bản ghi mới (không cần đăng nhập)
- **`allow read, delete: if request.auth != null && request.auth.token.email == 'phanminhdai.it@gmail.com'`**: 
  - Chỉ cho phép đọc và xóa khi đã đăng nhập
  - Và email phải là `phanminhdai.it@gmail.com`
- **`allow update: if false`**: Không cho phép chỉnh sửa bản ghi (chỉ có thể thêm mới hoặc xóa)

## Cách cập nhật:

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **rasoatcutru**
3. Vào **Firestore Database** > tab **Rules**
4. Copy đoạn rules ở trên và dán vào
5. Click **Publish**

