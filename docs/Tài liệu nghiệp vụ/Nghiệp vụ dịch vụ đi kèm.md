# Nghiệp vụ Dịch vụ Đi kèm & Gói Combo (Ancillary Services & Combos)

Bên cạnh tiền thuê sân, hệ thống hỗ trợ tích hợp các dịch vụ gia tăng để tăng doanh thu và nâng cao tiện ích cho khách hàng.

---

## 1. Dịch vụ bán lẻ và cho thuê (Services)

Khách hàng có thể chọn thêm các dịch vụ khi đặt sân online hoặc mua trực tiếp tại quầy:

- **Dịch vụ cho thuê**: Thuê vợt thi đấu, thuê bóng/quả cầu lông, thuê giày thể thao.
  - Giá thuê được tính trên mỗi lượt hoặc tính theo giờ chơi tương ứng với giờ thuê sân.
- **Dịch vụ bán hàng**: Nước giải khát, nước suối, khăn lạnh, băng cuốn chấn thương.
  - Giá bán cố định trên từng đơn vị sản phẩm.
- **Dịch vụ huấn luyện viên (Coaches)**: Cho phép thuê huấn luyện viên hướng dẫn kỹ thuật trong suốt buổi chơi.
  - Giá thuê HLV tính theo giờ chơi và có bảng phân loại giá theo cấp độ HLV.

---

## 2. Gói dịch vụ ưu đãi (Combo Packages)

Gói Combo là giải pháp gộp nhiều dịch vụ lẻ cùng thời gian thuê sân để áp dụng chính sách giảm giá thu hút khách hàng.

*Ví dụ:*
- **Combo Giao Lưu (Cầu lông)**: Bao gồm 2 giờ chơi sân cầu lông + 4 chai nước suối + 2 cặp vợt thuê. Giá combo rẻ hơn 15% so với mua lẻ.
- **Combo Đào Tạo (Tennis)**: Bao gồm 1 giờ thuê sân + 1 giờ thuê HLV + 1 hộp bóng tennis.

### Quy trình kỹ thuật xử lý Combo:
- Khi khách hàng chọn Combo, hệ thống tự động gán các bản ghi tương ứng vào bảng `BookingCombos` và `BookingServices` của đơn đặt sân đó.
- Nếu khách hàng hủy lịch, các dịch vụ trong combo cũng tự động được hủy và giải phóng trạng thái hoàn trả tương ứng.
