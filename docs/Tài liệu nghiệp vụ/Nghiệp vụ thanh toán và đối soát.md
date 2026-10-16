# Nghiệp vụ Thanh toán & Quy tắc Hủy lịch (Payment & Cancellation Rules)

Quy trình quản lý dòng tiền, giao dịch đặt cọc và chính sách hủy lịch chơi được tự động hóa nhằm bảo vệ quyền lợi của cơ sở thể thao và tính minh bạch cho khách hàng.

---

## 1. Cơ chế Đặt cọc giữ sân (Deposit Policy)

- **Quy tắc bắt buộc**: Để hoàn tất việc đặt lịch giữ sân trực tuyến, khách hàng phải thanh toán tối thiểu một tỷ lệ phần trăm đặt cọc (Ví dụ: `50%` tổng giá trị đơn đặt lịch) được định nghĩa trong `SystemSettings`.
- **Trạng thái thanh toán của Booking (`PaymentStatuses`)**:
  - `Unpaid`: Lịch mới tạo, chưa thanh toán cọc. Lịch này sẽ bị hệ thống tự động giải phóng sau 15 phút nếu không nhận được thanh toán.
  - `DepositPaid`: Đã thanh toán cọc thành công, lịch chơi được xác nhận giữ chỗ chính thức.
  - `FullyPaid`: Đã thanh toán 100% giá trị đơn đặt sân (có thể thanh toán online trước hoặc thanh toán nốt phần còn lại bằng tiền mặt/chuyển khoản tại quầy khi đến check-in).
  - `Refunded`: Đã hoàn lại tiền cho khách hàng sau khi hủy lịch thành công.

---

## 2. Quy tắc Hủy lịch & Hoàn tiền (Cancellation & Refund Rules)

Quy định hủy lịch đặt cọc được kiểm soát chặt chẽ dựa trên khoảng thời gian so với giờ bắt đầu chơi:

### Trường hợp 1: Hủy lịch Đủ điều kiện (Trước mốc giới hạn)
- **Điều kiện**: Khách hàng hủy lịch trước giờ chơi ít nhất `X` tiếng (Ví dụ: `24 giờ` trước giờ bắt đầu, cấu hình tại `SystemSettings`).
- **Kết quả**: Hệ thống ghi nhận hủy lịch thành công, tự động giải phóng các `BookingSlots` để người khác đặt và kích hoạt lệnh hoàn trả cọc `100%` (hoặc trừ phí xử lý nhỏ nếu có quy định).

### Trường hợp 2: Hủy lịch Không đủ điều kiện (Sau mốc giới hạn)
- **Điều kiện**: Khách hàng hủy lịch muộn hơn mốc `X` tiếng trước giờ chơi.
- **Kết quả**: Khách hàng bị phạt mất hoàn toàn tiền đặt cọc đã trả. Hệ thống giải phóng slot sân nhưng không hoàn tiền cọc.

---

## 3. Quá trình Đối soát (Auditing)

Mọi giao dịch thanh toán hoặc thay đổi trạng thái booking đều được giám sát qua:
- **`AuditInterceptor`**: Tự động lưu vết tài khoản thực hiện sửa đổi (người dùng tự hủy hay nhân viên hủy hộ).
- **`BookingHistories`**: Lưu lại mọi sự thay đổi trạng thái của booking (từ khởi tạo $\rightarrow$ đã cọc $\rightarrow$ đã hủy/đã chơi) phục vụ đối soát doanh thu cuối ngày.
