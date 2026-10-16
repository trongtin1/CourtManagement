# Kiểm thử & Danh sách Rà soát trước khi Merge (QC & Review Checklist)

Tài liệu này cung cấp checklist tự kiểm tra bắt buộc đối với lập trình viên và người duyệt code trước khi tích hợp mã nguồn mới vào nhánh tích hợp.

---

## 1. Checklist Rà soát Backend (.NET)

### Kiến trúc & DTOs
- [ ] **Slim Controllers**: Chỉ đón nhận tham số định tuyến, chuyển tiếp đến Service và trả về API response, không chứa logic nghiệp vụ.
- [ ] **Unified DTOs**: Luôn trao đổi dữ liệu qua DTO, không trả thẳng Entity của Database ra API.
- [ ] **Result Wrapper**: Các service hàm luôn trả về đối tượng `Result<T>` hoặc `Result<bool>`.

### Cô lập Dữ liệu chi nhánh (Facility Isolation)
- [ ] **WorkingFacilityId Filter**: Lọc dữ liệu theo chi nhánh hoạt động từ header `X-Facility-Id`.
- [ ] **CanAccessFacility**: Kiểm tra xem user hiện hành có quyền truy cập vào chi nhánh đó hay không.

### Tính Nhất quán dữ liệu & Log
- [ ] **Unit of Work**: Thực thi ghi/sửa dữ liệu qua repository và lưu thay đổi duy nhất bằng `await _unitOfWork.SaveChangesAsync()`.
- [ ] **Vietnamese Logging**: File log luôn sử dụng Tiếng Việt và khai báo hằng số hoạt động `loggingHeader` cục bộ tại hàm.

---

## 2. Checklist Rà soát Frontend (React)

### Naming & Format
- [ ] **Prettier & ESLint**: Chạy `npm run lint` và `npm run format:check` không xuất hiện cảnh báo lỗi.
- [ ] **TypeScript Types**: Định nghĩa rõ ràng kiểu dữ liệu cho state, props và API response, hạn chế tối đa sử dụng kiểu `any`.

### React Query & API
- [ ] **Encapsulated API**: Giao tiếp mạng được đóng gói trong API client của features (ví dụ: `areaApi.ts`).
- [ ] **Custom Hooks**: Đóng gói truy vấn/mutation trong custom hooks.
- [ ] **Query Invalidation**: Thực hiện dọn dẹp cache (invalidate queries) trong `onSuccess` của mutation hook.

---

## 3. Kịch bản Smoke Test nhanh các tính năng cốt lõi

Lập trình viên chạy thủ công các luồng sau trên môi trường local trước khi release:

1. **Luồng Xác thực**: Đăng ký tài khoản mới $\rightarrow$ Đăng nhập $\rightarrow$ Kiểm tra xem Token có được lưu và tự động gắn vào Header các API sau đó không.
2. **Luồng Đặt sân**: Chọn chi nhánh $\rightarrow$ Xem lưới giờ trống ngày hôm nay $\rightarrow$ Chọn 1 slot trống $\rightarrow$ Bấm Đặt sân $\rightarrow$ Kiểm tra xem slot đó trên lưới đã đổi màu/báo bận chưa.
3. **Luồng Hủy đặt sân**: Vào lịch sử đặt sân $\rightarrow$ Bấm hủy đặt lịch $\rightarrow$ Kiểm tra xem slot đó đã trống lại trên lưới chưa và số tiền hoàn cọc tính đúng quy định không.
