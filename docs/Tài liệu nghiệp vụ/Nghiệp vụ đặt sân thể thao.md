# Nghiệp vụ Đặt sân Thể thao (Court Booking Business Logic)

Nghiệp vụ cốt lõi của hệ thống xoay quanh việc quản lý hạ tầng các sân đấu thể thao và cung cấp giao diện đặt lịch trực tuyến linh hoạt cho khách hàng.

---

## 1. Định nghĩa các khái niệm Cơ bản

- **Cơ sở (Facilities)**: Các chi nhánh vật lý của hệ thống (Ví dụ: Chi nhánh Quận 1, Chi nhánh Thủ Đức). Mỗi cơ sở quản lý độc lập về cấu hình giờ mở cửa, giá cả và danh sách sân.
- **Khu vực bộ môn (Areas)**: Phân vùng thể thao trong một cơ sở (Ví dụ: Khu sân Tennis, Khu sân Cầu lông).
- **Sân đấu (Courts)**: Vị trí chơi cụ thể (Ví dụ: Sân Tennis 1, Sân Tennis 2).
- **Khung giờ chơi (Slots)**: Mỗi ngày hoạt động được chia nhỏ thành các Slot (thường là 60 phút hoặc 90 phút). Lịch đặt sân sẽ ghim chặt vào các Slot cụ thể để tránh chồng chéo lịch.

---

## 2. Các hình thức Đặt sân

Hệ thống hỗ trợ 3 hình thức đặt lịch:

### A. Đặt sân Đơn lẻ (Single Booking)
- **Đối tượng**: Khách vãng lai đặt giờ chơi ngẫu nhiên trong tuần.
- **Quy trình**: Chọn sân $\rightarrow$ Chọn ngày $\rightarrow$ Chọn các slot trống trên lưới $\rightarrow$ Tiến hành đặt cọc và xác nhận.

### B. Đặt sân theo nhóm (Group Booking)
- **Đối tượng**: Các doanh nghiệp, ban tổ chức giải đấu hoặc hội nhóm muốn đặt nhiều sân cùng lúc (ví dụ: đặt Sân 1 và Sân 2 cùng lúc từ 18h00 - 20h00 để giao lưu).
- **Đặc điểm**: Gom chung các lịch đặt sân vào một mã nhóm duy nhất (`BookingGroupId`) để thanh toán và quản lý tập trung.

### C. Đặt lịch Định kỳ (Recurring Booking)
- **Đối tượng**: Các câu lạc bộ, lớp học, hoặc nhóm chơi cố định hàng tuần (ví dụ: đặt Sân 1 cố định vào tối thứ 3 và thứ 5 hàng tuần từ 19h00 - 21h00, kéo dài trong 3 tháng).
- **Quy tắc**: Hệ thống tự động tạo chuỗi các `Bookings` trong tương lai. Chỉ cho phép duyệt nếu tất cả các slot trong chuỗi đều trống.
