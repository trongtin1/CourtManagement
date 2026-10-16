# Sơ đồ Cấu trúc Database (Database Schema Overview)

Cơ sở dữ liệu của **Court Management System** sử dụng Microsoft SQL Server làm kho lưu trữ bền vững. Các bảng được quản lý bởi Entity Framework Core thông qua ánh xạ Object-Relational Mapping (ORM).

---

## 1. Các nhóm Bảng chính trong Hệ thống

Bảng dữ liệu được phân chia thành 4 nhóm nghiệp vụ chính:

### Nhóm 1: Quản lý Cơ sở & Sân bãi (Facility & Court Infrastructure)
- **`Facilities`**: Lưu thông tin các chi nhánh (Cơ sở) thể thao. Chứa cột `Id`, `Name`, `Address`, `PhoneNumber`.
- **`Areas`**: Các khu vực bộ môn trong cơ sở (Ví dụ: Khu sân Tennis, Khu sân Cầu lông).
- **`Courts`**: Sân cụ thể (Ví dụ: Sân Tennis số 1, Sân Cầu lông số 3) thuộc một Khu vực.
- **`CourtTypes`**: Định nghĩa kiểu sân (Sân cỏ nhân tạo, Sân đất nện, Sân trong nhà).

### Nhóm 2: Nghiệp vụ Đặt lịch (Booking Flow)
- **`Bookings`**: Bản ghi đặt sân chính. Lưu thông tin ngày chơi, tổng tiền, tiền cọc, trạng thái thanh toán và ID của khách hàng.
- **`BookingSlots`**: Khung giờ chiếm dụng (ví dụ: Slot 17h00 - 18h00, 18h00 - 19h00) gắn với từng mã `BookingId` và `CourtId`. Dùng để kiểm tra trùng lịch.
- **`BookingGroups`**: Nhóm đặt lịch khi khách hàng đặt nhiều sân/nhiều ngày cùng lúc.
- **`RecurringConfigs`**: Cấu hình quy tắc đặt lịch định kỳ (ví dụ: Đặt sân 1 vào mỗi tối thứ 3 hàng tuần).

### Nhóm 3: Gói Combo & Dịch vụ đi kèm (Services & Combos)
- **`Services`**: Dịch vụ bán kèm hoặc cho thuê (Thuê vợt, nước suối, bóng đá...).
- **`Combos`**: Gói combo ưu đãi gộp chung nhiều dịch vụ và giờ chơi.
- **`BookingServices`** & **`BookingCombos`**: Bảng trung gian lưu vết các dịch vụ/combo được sử dụng trong mỗi đơn đặt sân (`BookingId`).

### Nhóm 4: Thanh toán & Vận hành (Payment & Operational Configuration)
- **`Payments`**: Nhật ký giao dịch thanh toán (Đặt cọc, thanh toán hết, hoặc hoàn tiền).
- **`SystemSettings`**: Lưu cấu hình vận hành hệ thống (ví dụ: Tỷ lệ đặt cọc bắt buộc %, thời gian tối thiểu cho phép hủy lịch trước giờ chơi...).
- **`AuditLogs`**: Tự động lưu vết lịch sử thay đổi thực thể (Ai tạo, sửa lúc nào, giá trị cũ/mới).
- **`IdempotencyKeys`**: Lưu UUID của các request ghi dữ liệu để chống trùng lặp request khi client bị lag.
