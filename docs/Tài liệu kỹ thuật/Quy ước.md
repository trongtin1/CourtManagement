# Quy ước Lập trình (Coding Conventions & Best Practices)

Tài liệu này tổng hợp các chuẩn lập trình, naming conventions và quy tắc thiết kế hệ thống bắt buộc áp dụng trong mã nguồn của **Court Management System**.

---

## 1. Quy ước Backend (.NET 10.0)

### Định dạng & Naming
- **PascalCase**: Dành cho tên Lớp, Struct, Enum, Interface, Method và Property.
  - Ví dụ: `class AreaService`, `public async Task<Result<bool>> CreateArea(...)`.
- **camelCase**: Dành cho biến cục bộ, tham số truyền vào hàm.
  - Ví dụ: `var targetArea = ...`, `int facilityId`.
- **Private Readonly Fields**: Bắt đầu bằng dấu gạch dưới và camelCase.
  - Ví dụ: `private readonly IUnitOfWork _unitOfWork;`.

### Unified Service Response (`Result<T>`)
Tất cả các dịch vụ (Services) ở tầng Application phải trả về đối tượng bọc kết quả thống nhất là `Result<T>` hoặc `Result<bool>` chứa mã trạng thái HTTP, cờ thành công và dữ liệu/lỗi:
- Các Controller không xử lý nghiệp vụ, chỉ giải nén `Result<T>` và trả về HTTP Status Code tương ứng:
  ```csharp
  [HttpPost]
  public async Task<IActionResult> Create([FromBody] AreaRequest req)
  {
      var r = await _service.Create(req);
      return StatusCode((int)r.StatusCode, r);
  }
  ```

### Quy chuẩn Logging Tiếng Việt
Chúng tôi sử dụng Serilog để ghi log hoạt động trong hệ thống. Quy định ghi log bắt buộc:
1. Mỗi hàm xử lý nghiệp vụ tại Service phải định nghĩa một hằng số hoạt động bằng Tiếng Việt tên là `loggingHeader`:
   ```csharp
   const string loggingHeader = "Cập nhật thông tin sân";
   ```
2. Log và câu lệnh `return` trả kết quả phải được đóng gói chung trong một cặp ngoặc nhọn `{}`:
   ```csharp
   { _logger.LogInformation($"{loggingHeader} - Thành công. Sân ID: {entity.Id}"); return Success(true, "Cập nhật sân thành công."); }
   ```

### Giao dịch & Cách thao tác Dữ liệu
- Mọi hoạt động ghi, sửa, xóa dữ liệu thông thường phải gọi thông qua `UnitOfWork` (ví dụ: `_unitOfWork.IAreaRepository.Add(entity)`) và chốt bằng lệnh duy nhất `await _unitOfWork.SaveChangesAsync()`.
- Các câu lệnh SQL phức tạp hoặc liên quan tới grid thời gian thực (real-time slot grid) bắt buộc phải đóng gói thành Stored Procedure trong thư mục `SqlScripts` của Infrastructure.

---

## 2. Quy ước Frontend (React 19 & TypeScript)

### Đặt tên Tệp & Tổ chức Component
- **Component & Page**: Đặt tên dạng `PascalCase` và sử dụng đuôi `.tsx`.
  - Ví dụ: `AreasPage.tsx`, `BookingForm.tsx`.
- **Helper, API, Hook**: Đặt tên dạng `camelCase` và sử dụng đuôi `.ts`.
  - Ví dụ: `useAreaQueries.ts`, `areaApi.ts`.

### Giao tiếp API & Axios Client
- Toàn bộ request được thực hiện qua instance `httpClient` tại thư mục service.
- **Idempotency Safeguard**: Các API thay đổi dữ liệu (POST, PUT, DELETE) cần cấu hình `{ idempotent: true }` trong Axios để client tự động đính header `Idempotency-Key` dạng UUID ngăn chặn việc double-submit.
- **Facility Scope**: API client tự động đọc facility hiện hành từ state và đính header `X-Facility-Id` gửi kèm.

### Quản lý Truy vấn bằng React Query (TanStack Query)
- **Đóng gói Hooks**: Không gọi trực tiếp `useQuery` hay `useMutation` ở UI component. Tất cả phải được viết dưới dạng Custom Hook đặt tại feature tương ứng.
- **Invalidation tự động**: Các hook mutation phải cài đặt hàm `onSuccess` để tự động làm mới (invalidate) query key liên quan, giúp giao diện tự động reload dữ liệu mới.
  ```typescript
  export const useCreateAreaMutation = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (data: CreateAreaRequest) => areaApi.create(data),
      onSuccess: () => qc.invalidateQueries({ queryKey: areaKeys.all }),
    });
  };
  ```
