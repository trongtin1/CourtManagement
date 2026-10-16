# Quy trình Phát triển Tính năng & Khởi chạy (Developer Command Matrix)

Tài liệu này tổng hợp toàn bộ các tập lệnh chạy (run), xây dựng (build), kiểm tra định dạng và chuẩn hóa mã nguồn trên cả Backend và Frontend của dự án **Court Management System**.

---

## 1. Chuẩn bị Môi trường & Restore

Các lệnh quản lý gói phụ thuộc được điều phối từ file `package.json` ở thư mục gốc của dự án:

- **Khôi phục toàn bộ phụ thuộc hệ thống (C# NuGet + NPM ClientApp)**:
  ```bash
  npm run restore
  ```
- **Chỉ cài đặt NPM packages cho Frontend**:
  ```bash
  npm run install:client
  ```

---

## 2. Khởi chạy trong quá trình Phát triển (Development Mode)

Nên mở 2 cửa sổ terminal tại thư mục root để chạy song song:

- **Khởi chạy Backend API (Chế độ tự động load lại khi sửa code - Hot Reload)**:
  ```bash
  npm run dev:api
  ```
- **Khởi chạy Frontend Client (Vite Dev Server)**:
  ```bash
  npm run dev:client
  ```

---

## 3. Biên dịch và Đóng gói (Production Build)

- **Biên dịch toàn bộ hệ thống (API + ClientApp compile)**:
  ```bash
  npm run build
  ```
- **Chỉ biên dịch Backend API**:
  ```bash
  npm run build:api
  ```
- **Chỉ biên dịch Frontend Client**:
  ```bash
  npm run build:client
  ```

---

## 4. Kiểm tra Định dạng & Quy chuẩn Code (Linting & Formatting)

Trước khi gửi Pull Request hoặc chạy Smoke Test, lập trình viên bắt buộc phải chạy các lệnh kiểm tra sau và xử lý hết các cảnh báo (Warnings/Errors):

- **Kiểm tra lỗi Lint (Eslint phía client)**:
  ```bash
  npm run lint
  ```
- **Kiểm tra định dạng code (Prettier)**:
  ```bash
  npm run format:check
  ```
- **Tự động sửa lỗi định dạng code**:
  ```bash
  npm run format
  ```
