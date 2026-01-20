# Firestore Rules - Cấu hình phân quyền

## Rules cần cập nhật trong Firebase Console

Vào **Firestore Database** > **Rules** và dán đoạn sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection cũ (để tương thích)
    match /verification_records/{document=**} {
      // Cho phép mọi người thêm bản ghi (không cần đăng nhập)
      allow create: if true;
      
      // Chỉ cho phép đọc và xóa nếu đã đăng nhập và là tài khoản được phép
      allow read, delete: if request.auth != null 
        && request.auth.token.email == 'phanminhdai.it@gmail.com';
      
      // Không cho phép update (chỉ có thể thêm mới hoặc xóa)
      allow update: if false;
    }
    
    // Collection Tạm trú
    match /tam_tru_records/{document=**} {
      // Cho phép mọi người thêm bản ghi (không cần đăng nhập)
      allow create: if true;
      
      // Chỉ cho phép đọc và xóa nếu đã đăng nhập và là tài khoản được phép
      allow read, delete: if request.auth != null 
        && request.auth.token.email == 'phanminhdai.it@gmail.com';
      
      // Không cho phép update (chỉ có thể thêm mới hoặc xóa)
      allow update: if false;
    }
    
    // Collection Thường trú
    match /thuong_tru_records/{document=**} {
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

## Tạo Composite Index (Quan trọng!)

Khi sử dụng query với `where` và `orderBy` cùng lúc, Firestore yêu cầu composite index. 

### Cách 1: Tự động (Khuyến nghị)
1. Khi chạy ứng dụng và gặp lỗi `failed-precondition`, Firebase sẽ tự động hiển thị link để tạo index
2. Click vào link đó và Firebase sẽ tự động tạo index cho bạn

### Cách 2: Thủ công
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **rasoatcutru**
3. Vào **Firestore Database** > tab **Indexes**
4. Click **Create Index**
5. Collection ID: `verification_records`
6. Fields to index:
   - Field: `loaiCuTru`, Order: `Ascending`
   - Field: `createdAt`, Order: `Ascending`
7. Click **Create**

**Lưu ý**: Ứng dụng sẽ tự động fallback về query không có `orderBy` nếu index chưa được tạo, nhưng để có hiệu suất tốt nhất, nên tạo index.

