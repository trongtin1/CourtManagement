# Cơ chế Hooks & Providers (React State & Data Layer)

Ứng dụng frontend quản lý trạng thái dữ liệu và kết nối mạng tập trung thông qua hệ thống Context Providers và các custom React Hooks được đóng gói sẵn.

---

## 1. Các Provider bọc ngoài ứng dụng (`App.tsx` / `main.tsx`)

Ứng dụng được bao bọc bởi các tầng dữ liệu sau:
1. **QueryClientProvider**: Cấp quyền quản lý bộ nhớ đệm (caching) và đồng bộ trạng thái server của **React Query (TanStack Query v5)**.
2. **Provider (Redux Toolkit)**: Cung cấp trạng thái Client-side dùng chung toàn cục (ví dụ: thông tin user đăng nhập, cài đặt ngôn ngữ, theme).
3. **ConfigProvider (Antd)**: Cấu hình màu sắc chủ đạo, font chữ và các biến CSS theme cho Ant Design v6.

---

## 2. Axios API Client & Interceptors (`apiClient.ts`)

Mọi giao tiếp HTTP qua Axios đều được chặn và xử lý tự động bởi các Interceptor tại `src/services/apiClient.ts`:

- **Gửi Token tự động**: Đọc JWT token hiện hành từ bộ nhớ và đính kèm vào header:
  ```text
  Authorization: Bearer <Access-Token>
  ```
- **Facility Isolation Scope**: Tự động lấy ID của cơ sở đang làm việc hiện tại và đính kèm vào header:
  ```text
  X-Facility-Id: <Working-Facility-Id>
  ```
- **Cơ chế chống gửi trùng dữ liệu (Idempotency Safeguard)**:
  Khi client thực hiện các tác vụ tạo mới/chỉnh sửa dữ liệu, nếu khai báo tham số `idempotent: true` trong cấu hình Axios, interceptor sẽ tự động tạo một chuỗi UUID ngẫu nhiên và đính vào header:
  ```text
  Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
  ```
  Backend sẽ lưu vết key này trong cache ngắn hạn để chặn các request bị trùng lặp do bấm đúp hoặc lag mạng.

---

## 3. Quy chuẩn viết React Query Custom Hooks

Để tách biệt mã nguồn giao diện với logic xử lý dữ liệu, lập trình viên bắt buộc phải khai báo API trong features và đóng gói thành hooks.

### Hook lấy dữ liệu (useQuery)
```typescript
export const useAreasQuery = (params?: PaginationQuery) => {
  return useQuery({
    queryKey: areaKeys.list(params),
    queryFn: () => areaApi.getAll(params),
  });
};
```

### Hook thay đổi dữ liệu (useMutation)
Bắt buộc có hàm xử lý `onSuccess` để dọn dẹp cache và buộc các Table đang xem tự động tải lại dữ liệu mới nhất:
```typescript
export const useCreateAreaMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAreaRequest) => areaApi.create(data),
    onSuccess: () => {
      // Xóa cache của danh sách khu vực để ép reload
      qc.invalidateQueries({ queryKey: areaKeys.all });
    },
  });
};
```
