# Luồng kỹ thuật Xác thực (Authentication & Authorization Flow)

Hệ thống Court Management System sử dụng cơ chế xác thực không trạng thái (Stateless Authentication) qua **JSON Web Token (JWT)** phối hợp với **Refresh Token** để duy trì phiên đăng nhập của người dùng.

---

## 1. Sơ đồ luồng Xác thực

```mermaid
sequenceDiagram
    participant FE as ClientApp (React)
    participant BE as Web API (Controllers)
    participant DB as SQL Server / EF Core

    FE->>BE: POST /api/auth/login { Username, Password }
    BE->>DB: Truy vấn & Xác minh tài khoản
    DB-->>BE: Khớp thông tin người dùng
    BE-->>FE: Trả về Result { AccessToken, RefreshToken }
    Note over FE: Lưu AccessToken vào RAM/State,<br/>Lưu RefreshToken vào Cookies/Storage

    FE->>BE: Yêu cầu lấy dữ liệu kèm Header (Bearer AccessToken)
    BE-->>FE: Phản hồi dữ liệu thành công
```

---

## 2. Luồng Gia hạn tự động (Refresh Token Flow)

Khi Access Token hết hạn (hạn dùng mặc định là 60 phút), Axios Interceptor trên client sẽ tự động bắt mã lỗi `401 Unauthorized` và thực hiện xin cấp mới token ngầm mà không làm ngắt quãng trải nghiệm của người dùng:

```mermaid
sequenceDiagram
    participant FE as ClientApp (Axios)
    participant BE as Web API (Auth)

    FE->>BE: Gửi Request (Token đã hết hạn)
    BE-->>FE: Trả về HTTP Code 401
    Note over FE: Chặn request, gọi âm thầm:<br/>POST /api/auth/refresh-token
    FE->>BE: Gửi { RefreshToken } cũ
    BE-->>FE: Cấp cặp Access/Refresh Token mới
    Note over FE: Lưu Token mới và gửi lại request cũ ban đầu
    FE->>BE: Gửi lại request cũ kèm Token mới
    BE-->>FE: Trả về dữ liệu thành công
```

---

## 3. Vai trò phân quyền (Authorization RBAC)

Hệ thống phân chia quyền hạn dựa trên Role gắn với tài khoản người dùng:
- **`[Authorize(Roles = "Admin")]`**: Toàn quyền cấu hình hệ thống, tạo cơ sở, khu vực, cài đặt giá sân.
- **`[Authorize(Roles = "Staff")]`**: Nhân viên vận hành, check-in khách hàng, khóa sân đột xuất, hỗ trợ đặt sân tại quầy.
- **`[Authorize]` (Không chỉ định role)**: Khách hàng đã đăng ký tài khoản, được phép xem lịch sử đặt sân cá nhân và tạo booking.
- **Public**: Xem danh sách cơ sở, thông tin sân trống để chuẩn bị đặt lịch.
