# Quản lý Stored Procedures (SqlScripts Execution)

Để tối ưu hiệu năng và đảm bảo tính toàn vẹn của dữ liệu trong các luồng xử lý phức tạp (như tính toán khung giờ trống thời gian thực hoặc hủy lịch hàng loạt), hệ thống sử dụng **Stored Procedures** viết bằng SQL thuần.

---

## 1. Cơ chế Tự động Nạp (Auto-loading Script on Startup)

- **Thư mục lưu trữ**: `CourtManagementBE.Infrastructure/SqlScripts/`
- **Cách thức hoạt động**: Khi ứng dụng backend khởi động, một hàm mở rộng (`DbExtensions`) trong project Infrastructure sẽ quét toàn bộ các file `.sql` trong thư mục này, đọc nội dung và chạy câu lệnh `CREATE OR ALTER PROCEDURE` để tự động đồng bộ mã SQL vào SQL Server. Việc này giúp lập trình viên chỉ cần thay đổi file `.sql` trong Git là database sẽ tự động được cập nhật khi khởi động lại ứng dụng.

---

## 2. Danh sách các Stored Procedures chính

Hệ thống hiện tại nạp 10 stored procedures chính:

### 1. Kiểm tra khung giờ trống sân (`003_sp_GetCourtSlotAvailability.sql` & `004_sp_GetAllCourtsSlotAvailability.sql`)
- **Chức năng**: Quét bảng `BookingSlots` và `CourtLockedSlots` của một ngày cụ thể để xuất ra danh sách các ô thời gian (ví dụ: 1-hour slots từ 5h00 đến 22h00) kèm cờ `IsAvailable (0/1)`.
- **Mục đích**: Phục vụ hiển thị lưới đặt sân (Time Slot Grid) ngoài frontend.

### 2. Đặt lịch định kỳ (`005_sp_CreateRecurringBookingGroup.sql` & `006_sp_UpdateRecurringBookingGroup.sql`)
- **Chức năng**: Chạy vòng lặp cơ sở dữ liệu để tự động insert hàng loạt các bản ghi `Bookings` và `BookingSlots` tương ứng với chu kỳ đặt lịch (ví dụ: thứ 2, thứ 4 hàng tuần kéo dài trong 3 tháng).
- **Lợi ích**: Đảm bảo tốc độ xử lý nhanh gấp nhiều lần so với việc chạy vòng lặp `INSERT` qua EF Core ở backend.

### 3. Quy trình hủy lịch đặt sân (`008_sp_CancelBooking.sql`)
- **Chức năng**:
  - Giải phóng các bản ghi giờ chơi của sân trong `BookingSlots`.
  - Cập nhật trạng thái `BookingStatus` thành hủy.
  - Tính toán số tiền được hoàn trả dựa trên quy định giới hạn thời gian (refund rules), ghi nhận bản ghi hoàn tiền vào `Payments`.
- **Mục đích**: Đảm bảo toàn bộ quy trình hủy lịch và hoàn cọc diễn ra trong một giao dịch cơ sở dữ liệu duy nhất (atomic transaction).

### 4. Cập nhật số lượng dịch vụ / combo (`006_sp_BulkUpdateBookingServices.sql` & `007_sp_BulkUpdateBookingCombos.sql`)
- **Chức năng**: Cập nhật hàng loạt danh sách đồ uống, vợt thuê đi kèm của một booking chỉ trong một câu lệnh, giảm tải kết nối tới DB.
