# Biến môi trường & Cấu hình (Backend Configuration)

Toàn bộ các cấu hình hoạt động của backend được lưu trữ trong file `appsettings.json` (cho môi trường local) và được map thành các biến môi trường khi triển khai trên server.

---

## 1. Chuỗi kết nối Database (`ConnectionStrings`)

Cấu hình kết nối tới Microsoft SQL Server:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=CourtManagement;Trusted_Connection=True;TrustServerCertificate=True"
}
```

- **Môi trường chạy**: Local sử dụng Windows Authentication (Trusted Connection) và bỏ qua kiểm tra chứng chỉ SSL (`TrustServerCertificate=True`).
- **Khi lên Production**: Cần ghi đè bằng biến môi trường `ConnectionStrings__DefaultConnection` chứa thông tin đăng nhập SQL Server cụ thể.

---

## 2. Cấu hình bảo mật xác thực (`JwtSettings`)

Quản lý ký nhận và thời hạn hiệu lực của mã JWT Token:

```json
"JwtSettings": {
  "Issuer": "CourtManagementBE",
  "Audience": "CourtManagementFE",
  "Key": "CourtManagementBE.Development.Jwt.Signing.Key.2026.ChangeThisForProduction",
  "ExpiresAccessTokenInMinutes": 60,
  "ExpiresRefreshTokenInMinutes": 10080
}
```

- **Issuer / Audience**: Nguồn phát hành và đối tượng tiêu thụ token (để tránh trùng lặp phiên giữa các hệ thống).
- **Key**: Khóa ký JWT Token. Trên môi trường production phải đổi thành một chuỗi bảo mật dài và bí mật, ghi đè qua biến môi trường `JwtSettings__Key`.
- **ExpiresAccessTokenInMinutes (60 phút)**: Thời hạn hoạt động của Access Token sau khi đăng nhập thành công.
- **ExpiresRefreshTokenInMinutes (10080 phút = 7 ngày)**: Thời hạn của Refresh Token dùng để xin cấp mới Access Token tự động ở client.

---

## 3. Ghi nhật ký hệ thống (`Serilog`)

Cấu hình lọc mức log và format dòng log hiển thị ở console:

- **MinimumLevel**: Mức log mặc định là `Information`. Ghi đè log của EF Core commands để theo dõi câu lệnh SQL thực thi trong console phát triển.
- **OutputTemplate**: Định dạng dòng log: `# [{Timestamp:HH:mm:ss} {Level:u3}] [{SourceContext}] {Message}`.
