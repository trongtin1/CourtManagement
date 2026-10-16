# Biến môi trường Frontend (Client Environment Variables)

Phần frontend sử dụng trình đóng gói **Vite** để quản lý các biến môi trường cấu hình tại các file `.env` ở thư mục root của ClientApp:

- `.env.development`: Cấu hình cho môi trường phát triển local.
- `.env.production`: Cấu hình cho môi trường chạy chính thức.

---

## 1. Danh sách các Biến môi trường chính

Do sử dụng Vite, mọi biến môi trường muốn sử dụng trong mã nguồn client bắt buộc phải có tiền tố `VITE_`. Các biến không có tiền tố này sẽ bị Vite ẩn đi để bảo mật.

| Tên biến | Kiểu dữ liệu | Mục đích | Ví dụ |
|---|---|---|---|
| `VITE_API_BASE_URL` | String | Địa chỉ URL gốc của Backend Web API. Dùng để cấu hình Axios Client. | `http://localhost:5000/api` |
| `VITE_DEFAULT_FACILITY_ID` | Number | ID của chi nhánh mặc định sẽ tự động chọn khi người dùng mới đăng nhập lần đầu. | `1` |

---

## 2. Cách truy xuất biến trong code

Trong mã nguồn TypeScript/Vite, biến môi trường được gọi thông qua đối tượng `import.meta.env`:

```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});
```
