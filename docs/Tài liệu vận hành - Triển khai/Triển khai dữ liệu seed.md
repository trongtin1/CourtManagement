# Quy chuẩn Dữ liệu Seed khởi tạo (System Seeding Rules)

Để dự án khởi chạy bình thường ngay sau khi dựng database mới (Migration), hệ thống tự động gieo (seed) các nhóm dữ liệu cấu hình cốt lõi thông qua class `AppDbSeeder.cs` đặt tại project Infrastructure.

---

## 1. Danh sách Vai trò Người dùng (User Roles Seeding)

Hệ thống bắt buộc phải khởi tạo 3 vai trò chính để phân quyền truy cập:

1. **`Admin`**: Người quản trị tối cao. Được phép tạo cơ sở, điều phối nhân sự, và cấu hình bảng giá.
2. **`Staff`**: Nhân viên trực quầy. Được phép Check-in khách chơi sân, thu tiền mặt phần còn thiếu của hóa đơn, và thực hiện khóa sân khẩn cấp.
3. **`Customer`**: Khách hàng đã đăng ký. Được quyền đặt lịch sân online và theo dõi lịch sử giao dịch cá nhân.

---

## 2. Cài đặt Hệ thống Mặc định (System Settings Seeding)

Các tham số vận hành được seed mặc định vào bảng `SystemSettings`:

| Tham số | Giá trị Seed mặc định | Mục đích |
|---|---|---|
| `DefaultDepositPercentage` | `50` (%) | Tỷ lệ đặt cọc mặc định khi khách đặt sân trực tuyến. |
| `CancelThresholdHours` | `24` (Giờ) | Giới hạn thời gian trước giờ chơi cho phép khách tự hủy lịch và nhận lại cọc. |
| `BookingReleaseMinutes` | `15` (Phút) | Thời hạn cho phép giữ slot ở trạng thái `Unpaid` chờ thanh toán trước khi tự động giải phóng. |
| `MaxAdvanceBookingDays` | `30` (Ngày) | Khoảng thời gian xa nhất trong tương lai mà khách hàng được phép đặt sân trước. |
