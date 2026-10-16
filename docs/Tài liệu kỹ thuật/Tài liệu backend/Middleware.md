# Cơ chế Middlewares & Request Pipeline

Hệ thống sử dụng các Middleware trong ASP.NET Core để kiểm soát pipeline xử lý request, bao gồm bắt lỗi tập trung, xác thực JWT, phân quyền người dùng và thực thi phân tách dữ liệu theo cơ sở (Facility isolation).

---

## 1. ExceptionMiddleware (Xử lý lỗi tập trung)

Tất cả các biệt lệ (Exceptions) không được bắt ở các tầng dưới và các mã lỗi HTTP dạng 4xx, 5xx đều được chặn và xử lý bởi `ExceptionMiddleware` đặt tại `CourtManagementBE.Api/Middlewares/ExceptionMiddleware.cs`.

### Chức năng chính:
- **Bắt lỗi hệ thống (500)**: Chặn biệt lệ, ghi log lỗi đầy đủ qua Serilog (`_logger.LogError`) và trả về JSON bọc định dạng chuẩn `Result<object>.Failure` với thông báo thân thiện: `"Đã xảy ra lỗi. Vui lòng thử lại sau."`.
- **Chặn các lỗi HTTP standard (401, 403, 404)**: Tự động dịch mã lỗi thành thông báo Tiếng Việt thân thiện và ghi log warning:
  - `401 Unauthorized` $\rightarrow$ `"Bạn cần đăng nhập để tiếp tục."`
  - `403 Forbidden` $\rightarrow$ `"Bạn không có quyền thực hiện thao tác này."`
  - `404 NotFound` $\rightarrow$ `"Không tìm thấy dữ liệu phù hợp."`

---

## 2. Thứ tự đăng ký Pipeline trong `Program.cs`

Các middleware được đăng ký theo thứ tự nghiêm ngặt dưới đây trong `Program.cs` để đảm bảo luồng chạy an toàn:

1. **UseExceptionMiddleware**: Đăng ký đầu tiên để bắt được lỗi xảy ra ở tất cả các middleware đăng ký sau nó.
2. **UseCors**: Cấp quyền chia sẻ tài nguyên nguồn gốc chéo với client.
3. **UseAuthentication**: Đọc JWT token từ header `Authorization: Bearer <token>`, phân tích Claims của người dùng.
4. **UseAuthorization**: Xác thực quyền hạn truy cập của API endpoint (ví dụ: Policy Admin/Staff).
5. **Controllers Routing**: Ánh xạ route tới API Controller tương ứng.

---

## 3. Cơ chế Phân tách Dữ liệu theo Cơ sở (Facility Isolation)

Dự án là hệ thống đa cơ sở (Multi-facility). Việc cách ly dữ liệu được thực thi thông qua:
- **Client Side**: Gửi header `X-Facility-Id` tự động thông qua Axios Interceptor trong mỗi request.
- **Backend Service**: Đọc header `X-Facility-Id` hoặc thông tin của user hiện hành và thực hiện kiểm tra quyền:
  ```csharp
  if (!CanAccessFacility(facilityId))
  {
      return Unauthorized<AreaResponse>("Bạn không có quyền truy cập cơ sở này.");
  }
  ```
  Nếu không có quyền, service trả về kết quả có trạng thái `HttpStatusCode.Unauthorized` hoặc `Forbidden` để Middleware chuyển đổi thành HTTP Response phù hợp trả về client.
