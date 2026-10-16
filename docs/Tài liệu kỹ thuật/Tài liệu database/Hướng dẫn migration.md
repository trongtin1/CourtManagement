# Hướng dẫn tạo và chạy Migration (EF Core Migrations)

Dự án sử dụng Entity Framework Core Code-First để quản lý vòng đời cấu trúc bảng database. Toàn bộ lịch sử migration được lưu trữ trong thư mục `Migrations/` của project `CourtManagementBE.Infrastructure`.

---

## 1. Yêu cầu chuẩn bị

Lập trình viên cần cài đặt công cụ `dotnet-ef` trên máy:

```bash
dotnet tool install --global dotnet-ef
```

*Lưu ý: Mọi lệnh migration dưới đây phải được chạy tại thư mục root của dự án.*

---

## 2. Các lệnh Migration cơ bản

### 1) Tạo một bản ghi Migration mới
Chạy lệnh sau khi thay đổi, thêm trường hoặc tạo thực thể Entity mới trong project Domain:
```bash
dotnet ef migrations add <TênMigration> --project CourtManagementBE.Infrastructure --startup-project CourtManagementBE.Api
```
*Ví dụ:*
```bash
dotnet ef migrations add AddRefundTable --project CourtManagementBE.Infrastructure --startup-project CourtManagementBE.Api
```

### 2) Cập nhật thay đổi vào Database
Đồng bộ các migration chưa chạy vào cơ sở dữ liệu:
```bash
dotnet ef database update --project CourtManagementBE.Infrastructure --startup-project CourtManagementBE.Api
```

### 3) Rollback (Quay lui phiên bản)
Nếu muốn hủy bỏ thay đổi cấu trúc bảng về một migration trước đó (ví dụ: quay về `AddRefundTable` từ một bản lỗi sau đó):
```bash
dotnet ef database update <TênMigrationTrướcĐó> --project CourtManagementBE.Infrastructure --startup-project CourtManagementBE.Api
```
Sau khi quay lui database, bạn có thể xóa tệp migration lỗi bằng lệnh:
```bash
dotnet ef migrations remove --project CourtManagementBE.Infrastructure --startup-project CourtManagementBE.Api
```
