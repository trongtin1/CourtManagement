# Quy chuẩn Viết Commit (Conventional Commits)

Để duy trì lịch sử Git rõ ràng và tự động hóa quá trình sinh changelog/versioning, dự án **Court Management System** áp dụng quy chuẩn **Conventional Commits**.

---

## 1. Cấu trúc của Commit Message

Mỗi commit message phải tuân theo cấu trúc chuẩn sau:

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

*Ví dụ:*
- `feat(booking): tích hợp stored procedure kiểm tra slot trống`
- `fix(auth): sửa lỗi crash khi JWT token hết hạn đột ngột`
- `docs(db): cập nhật sơ đồ ERD bảng Courts và Bookings`

---

## 2. Các Loại Commit Quy chuẩn (Types)

| Loại | Ý nghĩa | Ví dụ |
|---|---|---|
| `feat` | Thêm tính năng mới | `feat(api): thêm endpoint hủy lịch đặt sân` |
| `fix` | Sửa một lỗi (bug) | `fix(ui): căn chỉnh lại vị trí hiển thị ô nhập mã coupon` |
| `docs` | Thay đổi hoặc bổ sung tài liệu | `docs(readme): cập nhật hướng dẫn cài đặt dev server` |
| `style` | Thay đổi liên quan tới format code (không đổi logic code) | `style(be): chạy dotnet-format định dạng lại code` |
| `refactor` | Tái cấu trúc mã nguồn (không thêm tính năng, không sửa bug) | `refactor(service): tối ưu luồng xử lý tính tiền combo` |
| `perf` | Tối ưu hóa hiệu năng | `perf(sp): tối ưu hóa query lấy slot khả dụng` |
| `test` | Thêm hoặc sửa mã nguồn kiểm thử | `test(client): bổ sung unit test cho hooks check slot` |
| `chore` | Các thay đổi phụ trợ (cấu hình build, package npm...) | `chore(deps): nâng cấp thư viện Antd lên v6` |
| `wip` | Tính năng đang phát triển dở dang (không khuyến khích merge) | `wip(booking): đang dựng form thanh toán` |

---

## 3. Quy định về Phạm vi (Scope)

Phạm vi đại diện cho module hoặc thành phần bị thay đổi. Đối với hệ thống quản lý sân, các scope tiêu biểu gồm:

- `booking`: Các thay đổi liên quan đến luồng đặt sân, lịch trình.
- `court`: Quản lý danh sách sân, diện tích, trạng thái sân.
- `facility`: Quản lý các cơ sở thể thao.
- `combo`: Quản lý dịch vụ đi kèm, thuê huấn luyện viên, đồ uống.
- `payment`: Xử lý cổng thanh toán, hóa đơn, hoàn tiền.
- `auth`: Đăng ký, đăng nhập, phân quyền người dùng.
- `api`: Tổng quan các endpoints, cấu hình định tuyến.
- `ui`: Giao diện người dùng, component chung.

---

## 4. Nguyên tắc Viết Subject

1. **Sử dụng tiếng Việt ngắn gọn**: Mô tả súc tích hành động thực hiện.
2. **Không viết hoa chữ cái đầu**: Để giữ tính đồng bộ.
3. **Không kết thúc bằng dấu chấm (`.`)**: Đảm bảo gọn gàng.
4. **Sử dụng thể chủ động**: Trực tiếp mô tả hành động (ví dụ: `thêm endpoint` thay vì `endpoint đã được thêm`).
5. **Ngăn cách**: Sử dụng dấu hai chấm và khoảng trắng sau scope: `<type>(<scope>): <subject>`.
