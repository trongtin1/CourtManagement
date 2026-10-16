# Kiến trúc Giao diện (Frontend Architecture)

Phần frontend của **Court Management System** đặt tại thư mục `ClientApp` được phát triển trên công nghệ **React 19**, biên dịch bằng **Vite 8** và sử dụng ngôn ngữ **TypeScript**.

---

## 1. Thiết kế Feature-Based Layout

Thư mục nguồn `src/` tuân thủ quy tắc tổ chức feature-based (chia nhỏ mã nguồn theo mô-đun nghiệp vụ), giúp dễ dàng scale ứng dụng và cô lập mã nguồn:

```text
src/
├── app/                  # Router, Context Providers bao ngoài ứng dụng
├── assets/               # Hình ảnh, Font chữ tĩnh
├── components/           # UI Components tái sử dụng (Button, Spin, Modal...)
├── config/               # Cấu hình API endpoints, biến global
├── constants/            # Các hằng số (Local storage keys, Status codes...)
├── features/             # Nơi chứa logic cô lập của từng module nghiệp vụ
│   ├── bookings/         # Module đặt sân
│   ├── areas/            # Module quản lý khu vực
│   └── ...
├── hooks/                # Custom React Hooks dùng chung toàn ứng dụng
├── layouts/              # Cấu trúc khung trang (Header, Sidebar, Footer)
├── pages/                # Các trang hiển thị tương ứng với từng Route
├── services/             # Axios API Client, LocalStorage Helpers
├── store/                # Quản lý State tập trung bằng Redux Toolkit
└── styles/               # Chứa file CSS, cấu hình Ant Design Theme & Tailwind CSS
```

---

## 2. Chi tiết luồng hoạt động của Module trong `features/`

Mỗi module nghiệp vụ nằm trong thư mục `src/features/<feature-name>/` sẽ được tách biệt logic với UI thông qua các file sau:

1. **`api/` (Tầng kết nối mạng)**:
   - `<feature>Api.ts`: Chứa danh sách các hàm gọi API sử dụng Axios Client (ví dụ: `areaApi.create(...)`).
   - `use<Feature>Queries.ts`: Chứa các custom hooks React Query bọc ngoài API (`useAreasQuery`, `useCreateAreaMutation`).
2. **`model/` (Tầng kiểu dữ liệu)**:
   - `types.ts`: Khai báo các TypeScript interfaces của Request và Response DTOs.

---

## 3. Vai trò của tầng `pages/` và `components/`

- **Pages**: Mỗi trang con trong `pages/` đại diện cho một màn hình độc lập (ví dụ: `pages/areas/AreasPage.tsx`). Nhiệm vụ của file Page là:
  - Lấy trạng thái từ query string hoặc local state.
  - Gọi các React Query custom hook từ thư mục `features/` để tải dữ liệu.
  - Quản lý trạng thái mở/đóng của Drawers hoặc Modals trên màn hình.
  - Kết nối dữ liệu vào các Ant Design Components (như Table) để hiển thị.
- **Components**: Là các component thuần giao diện, nhận dữ liệu qua `props` và không trực tiếp gọi API hay lưu cache. Giúp tối đa hóa khả năng tái sử dụng.
