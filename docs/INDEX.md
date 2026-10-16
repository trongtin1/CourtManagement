# Tổng quan Tài liệu — Court Management System

> Tài liệu hướng dẫn phát triển, quy trình vận hành và nghiệp vụ đặt sân thể thao.  
> File này là **bản đồ điều hướng** trung tâm duy nhất để tìm kiếm tài liệu trong dự án.

---

## 1. Tuyến đọc theo yêu cầu (Developer Reading Priority)

### Onboarding / Nhận dự án mới
1. **[AGENTS.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/AGENTS.md)**: Hướng dẫn cốt lõi cho lập trình viên/AI Agent.
2. **[Huấn luyện AI kế nhiệm](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/Agents/Kh%E1%BB%9Fi%20%C4%91%E1%BB%99ng/Hu%E1%BA%A5n%20luy%E1%BB%87n%20AI%20k%E1%BA%BF%20nhi%E1%BB%87m.md)**: Trạng thái session hiện tại.
3. **[Kiến trúc Hệ thống](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/Ki%E1%BA%BFn%20tr%C3%BAc.md)**: Tổng quan folder và sơ đồ 3 lớp.

### Phát triển Backend C#
1. **[Quy ước Lập trình](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/Quy%20%C6%B0%E1%BB%9Bc.md)**: Cách viết code, Serilog log tiếng Việt.
2. **[Coding Guide Backend](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20backend/Coding%20Guide%20%E2%80%94%20T%E1%BA%A1o%20module%20m%E1%BB%9Bi.md)**: Hướng dẫn 8 bước dựng module.
3. **[Stored Procedures](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20database/Stored%20Procedures.md)**: Nạp SQL Scripts tự động.

### Phát triển Frontend React 19
1. **[Kiến trúc Frontend](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend/Ki%E1%BA%BFn%20tr%C3%BAc.md)**: Feature-based layout trong ClientApp.
2. **[Quy ước form và trạng thái UI](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend/Quy%20%C6%B0%E1%BB%9Bc%20form%20v%C3%A0%20tr%E1%BA%A1ng%20th%C3%A1i%20UI.md)**: Kết hợp Antd v6 + Tailwind v4.
3. **[Hook và Provider](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend/Hook%20v%C3%A0%20Provider.md)**: API Client + Idempotency key.

### Kiểm thử & Review Code
1. **[Checklist Review & Smoke Test](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20ki%E1%BB%83m%20th%E1%BB%B1/Checklist%20review%20v%C3%A0%20Smoke%20test.md)**: Kiểm tra trước khi PR.
2. **[Quy trình phát triển tính năng](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20quy%20tr%C3%ACnh/Quy%20tr%C3%ACnh%20ph%C3%A1t%20tri%E1%BB%83n%20t%C3%ADnh%20n%C4%83ng.md)**: Lệnh chạy lint/format.

---

## 2. Bản đồ Chỉ mục Tài liệu (Documentation Map)

### 📌 Quy định - Quy tắc/
*Các tiêu chuẩn bắt buộc khi làm việc với kho lưu trữ git:*
- **[Branch.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/Quy%20%C4%91%E1%BB%8Bnh%20-%20Quy%20t%E1%BA%AFc/Branch.md)**: Quy chuẩn phân tách nhánh và phát hành.
- **[Commit.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/Quy%20%C4%91%E1%BB%8Bnh%20-%20Quy%20t%E1%BA%AFc/Commit.md)**: Chuẩn commit message Conventional Commits.

### 📌 Tài liệu kỹ thuật/
*Toàn bộ chi tiết kỹ thuật hệ thống:*
- **[README.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/README.md)**: Index tài liệu kỹ thuật.
- **[Kiến trúc.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/Ki%E1%BA%BFn%20tr%C3%BAc.md)**: Sơ đồ 3 lớp và cấu trúc folder.
- **[Quy ước.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/Quy%20%C6%B0%E1%BB%9Bc.md)**: Quy ước code backend & frontend.
- **Tài liệu backend/**
  - **[Endpoints.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20backend/Endpoints.md)**: Danh sách các API Controller.
  - **[Middleware.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20backend/Middleware.md)**: Pipeline Middleware bắt lỗi & phân quyền.
  - **[Biến môi trường.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20backend/Bi%E1%BA%BFn%20m%C3%B4i%20tr%C6%B0%E1%BB%9Dng.md)**: Các cấu hình appsettings.json.
  - **[Coding Guide — Tạo module mới.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20backend/Coding%20Guide%20%E2%80%94%20T%E1%BA%A1o%20module%20m%E1%BB%9Bi.md)**: Hướng dẫn viết thêm chức năng.
- **Tài liệu frontend/**
  - **[Kiến trúc.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend/Ki%E1%BA%BFn%20tr%C3%BAc.md)**: Tổ chức ClientApp.
  - **[Quy ước form và trạng thái UI.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend/Quy%20%C6%B0%E1%BB%9Bc%20form%20v%C3%A0%20tr%E1%BA%A1ng%20th%C3%A1i%20UI.md)**: Layout và Form Antd.
  - **[Hook và Provider.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend/Hook%20v%C3%A0%20Provider.md)**: Client context & API wrapper.
  - **[Biến môi trường.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend/Bi%E1%BA%BFn%20m%C3%B4i%20tr%C6%B0%E1%BB%9Dng.md)**: Env variables cho client.
- **Tài liệu database/**
  - **[Schema.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20database/Schema.md)**: Thiết kế các bảng.
  - **[Stored Procedures.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20database/Stored%20Procedures.md)**: Quản lý SQL Scripts tự động.
  - **[Hướng dẫn migration.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20database/H%C6%B0%E1%BB%9Bng%20d%E1%BA%ABn%20migration.md)**: Lệnh chạy migrations.
- **Tài liệu luồng kỹ thuật/**
  - **[Xác thực.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20lu%E1%BB%93ng%20k%E1%BB%B9%20thu%E1%BA%ADt/X%C3%A1c%20th%E1%BB%B1c.md)**: Luồng JWT xác thực.
  - **[Đặt lịch sân.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20lu%E1%BB%93ng%20k%E1%BB%B9%20thu%E1%BA%ADt/%C4%90%E1%BA%B7t%20l%E1%BB%8Bch%20s%C3%A2n.md)**: Luồng kiểm soát trùng lịch thời gian thực.

### 📌 Tài liệu nghiệp vụ/
*Đặc tả tính năng và luật vận hành:*
- **[README.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20nghi%E1%BB%87p%20v%E1%BB%A5/README.md)**: Tổng quan nghiệp vụ.
- **[Nghiệp vụ đặt sân thể thao.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20nghi%E1%BB%87p%20v%E1%BB%A5/Nghi%E1%BB%87p%20v%E1%BB%A5%20%C4%91%E1%BA%B7t%20s%C3%A2n%20th%E1%BB%83%20thao.md)**: Định nghĩa sân, slot, đặt đơn, đặt định kỳ.
- **[Nghiệp vụ dịch vụ đi kèm.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20nghi%E1%BB%87p%20v%E1%BB%A5/Nghi%E1%BB%87p%20v%E1%BB%A5%20d%E1%BB%8ch%20v%E1%BB%A5%20%C4%91i%20k%C3%A8m.md)**: Thuê vợt, bóng, nước uống, HLV.
- **[Nghiệp vụ thanh toán và đối soát.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20nghi%E1%BB%87p%20v%E1%BB%A5/Nghi%E1%BB%87p%20v%E1%BB%A5%20thanh%20to%C3%A1n%20v%C3%A0%20%C4%91%E1%BB%91i%20so%C3%A1t.md)**: Cọc, hủy sân, hoàn cọc.

### 📌 Tài liệu quy trình/
*Quy chuẩn hoạt động:*
- **[README.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20quy%20tr%C3%ACnh/README.md)**: Danh mục các quy trình.
- **[Quy trình cập nhật tài liệu.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20quy%20tr%C3%ACnh/Quy%20tr%C3%ACnh%20c%E1%BA%ADp%20nh%E1%BA%ADt%20t%C3%A0i%20li%E1%BB%87u.md)**: Cách nộp log và duyệt sửa tài liệu.
- **[Quy trình phát triển tính năng.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20quy%20tr%C3%ACnh/Quy%20tr%C3%ACnh%20ph%C3%A1t%20tri%E1%BB%83n%20t%C3%ADnh%20n%C4%83ng.md)**: Lệnh dev, build, format.

### 📌 Tài liệu kiểm thử/
*Hồ sơ kiểm định chất lượng:*
- **[README.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20ki%E1%BB%83m%20th%E1%BB%B1/README.md)**: Index kiểm thử.
- **[Checklist review và Smoke test.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20ki%E1%BB%83m%20th%E1%BB%B1/Checklist%20review%20v%C3%A0%20Smoke%20test.md)**: Bảng kiểm tra trước khi PR và kịch bản test.

### 📌 Tài liệu vận hành - Triển khai/
*Cài đặt cấu hình hệ thống ban đầu:*
- **[README.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20v%E1%BA%ADn%20h%C3%A0nh%20-%20Tri%E1%BB%83n%20khai/README.md)**: Index vận hành.
- **[Triển khai dữ liệu seed.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20v%E1%BA%ADn%20h%C3%A0nh%20-%20Tri%E1%BB%83n%20khai/Tri%E1%BB%83n%20khai%20d%E1%BB%AF%20li%E1%BB%87u%20seed.md)**: Seed Default Roles, System Settings.
