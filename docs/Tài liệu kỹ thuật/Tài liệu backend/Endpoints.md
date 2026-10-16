# Danh sách API Endpoints (Backend API Routes)

Tất cả các API Endpoints của **Court Management System** đều bắt đầu bằng tiền tố `/api` và trả về cấu trúc response chuẩn `Result<T>` bao gồm dữ liệu và mã trạng thái HTTP.

---

## 1. Xác thực tài khoản (`/api/auth`)
Phục vụ đăng ký, đăng nhập và quản lý phiên của người dùng.

| Method | Endpoint | Auth | Chức năng |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Đăng nhập tài khoản, trả về JWT Token và Refresh Token |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản khách hàng mới |
| `POST` | `/api/auth/refresh-token` | Public | Gia hạn JWT Token bằng Refresh Token |
| `POST` | `/api/auth/change-password` | Authorized | Thay đổi mật khẩu tài khoản hiện tại |

---

## 2. Quản lý Cơ sở và Khu vực (`/api/facility`, `/api/area`)
Dành cho người quản trị cấu hình các chi nhánh và khu vực đặt sân (ví dụ: khu vực sân tennis, khu vực sân cầu lông).

| Method | Endpoint | Auth | Chức năng |
|---|---|---|---|
| `GET` | `/api/facility` | Authorized | Lấy danh sách toàn bộ cơ sở thể thao |
| `POST` | `/api/facility` | Admin | Tạo cơ sở mới |
| `GET` | `/api/area` | Authorized | Lấy danh sách khu vực (có lọc theo cơ sở qua header `X-Facility-Id`) |
| `POST` | `/api/area` | Admin | Tạo khu vực mới |
| `PUT` | `/api/area/{id}` | Admin | Cập nhật thông tin khu vực |
| `DELETE` | `/api/area/{id}` | Admin | Xóa khu vực |

---

## 3. Sân và Khung giờ trống (`/api/court`, `/api/booking-slot`)
Phục vụ truy vấn thông tin sân và kiểm tra tính khả dụng của các khung giờ đặt trong ngày.

| Method | Endpoint | Auth | Chức năng |
|---|---|---|---|
| `GET` | `/api/court` | Authorized | Lấy danh sách sân theo cơ sở và khu vực |
| `POST` | `/api/court` | Admin | Thêm sân mới vào khu vực |
| `GET` | `/api/booking-slot/availability` | Authorized | Gọi Stored Procedure lấy trạng thái trống/bận của tất cả slot của sân theo ngày |
| `POST` | `/api/court-locked-slot` | Admin/Staff | Khóa slot sân (bảo trì, sự kiện đột xuất) |

---

## 4. Luồng đặt sân (`/api/booking`, `/api/booking-group`)
Xử lý đặt sân đơn lẻ, đặt sân theo nhóm và đặt lịch định kỳ dài hạn.

| Method | Endpoint | Auth | Chức năng |
|---|---|---|---|
| `GET` | `/api/booking` | Authorized | Lấy danh sách lịch đặt sân |
| `POST` | `/api/booking` | Authorized | Tạo lịch đặt sân mới (Hỗ trợ `Idempotency-Key` bảo vệ) |
| `POST` | `/api/booking-group` | Authorized | Tạo nhóm đặt nhiều sân cùng lúc |
| `PUT` | `/api/booking/{id}/cancel` | Authorized | Yêu cầu hủy lịch đặt sân |

---

## 5. Dịch vụ và Combo (`/api/service`, `/api/combo`)
Quản lý các dịch vụ đi kèm khi đặt sân như nước uống, thuê bóng, thuê vợt hoặc dịch vụ huấn luyện viên.

| Method | Endpoint | Auth | Chức năng |
|---|---|---|---|
| `GET` | `/api/service` | Authorized | Danh sách các dịch vụ lẻ |
| `GET` | `/api/combo` | Authorized | Danh sách các combo trọn gói ưu đãi |

---

## 6. Thanh toán (`/api/payment`)

| Method | Endpoint | Auth | Chức năng |
|---|---|---|---|
| `POST` | `/api/payment/checkout` | Authorized | Tạo link/thanh toán hóa đơn đặt sân |
| `GET` | `/api/payment/history` | Authorized | Xem lịch sử thanh toán |
