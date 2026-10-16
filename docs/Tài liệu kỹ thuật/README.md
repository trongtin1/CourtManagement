# Hướng dẫn & Tài liệu Kỹ thuật (Technical Documentation)

Thư mục này lưu trữ toàn bộ các tài liệu kỹ thuật chi tiết của dự án **Court Management System**, bao gồm kiến trúc hệ thống, quy ước code, thiết kế database, sơ đồ các luồng kỹ thuật quan trọng và hướng dẫn phát triển cho cả Backend và Frontend.

---

## 1. Bản đồ Tài liệu Kỹ thuật

Hãy nhấp vào các liên kết dưới đây để truy cập chi tiết:

- **[Kiến trúc Hệ thống & Thư mục](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/Ki%E1%BA%BFn%20tr%C3%BAc.md)**: Sơ đồ kiến trúc 3 lớp tổng thể, sơ đồ Clean Architecture của Backend và mô hình Features/Pages của Frontend.
- **[Quy ước Viết Code](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/Quy%20%C6%B0%E1%BB%9Bc.md)**: Quy chuẩn đặt tên biến, cấu trúc service response, quy chuẩn ghi log tiếng Việt và cấu hình Axios/React Query.

### Thư mục con chi tiết:

1. **[Tài liệu Backend](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20backend)**
   - API Endpoints, Middlewares xử lý lỗi/phân quyền/cơ sở, cấu hình biến môi trường, hướng dẫn 8 bước viết thêm module Backend mới.
2. **[Tài liệu Frontend](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend)**
   - Cơ chế quản lý state bằng Redux Toolkit + React Query, cấu hình env client, quy ước xây dựng form Ant Design v6 kết hợp Tailwind CSS v4.
3. **[Tài liệu Database](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20database)**
   - Schema các bảng dữ liệu, hướng dẫn quản lý Stored Procedures dưới thư mục `SqlScripts` và các bước thực hiện Migration EF Core.
4. **[Luồng Kỹ thuật Trọng yếu](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20lu%E1%BB%93ng%20k%E1%BB%B9%20thu%E1%BA%ADt)**
   - Chi tiết luồng xác thực cấp/gia hạn JWT token và luồng đặt sân thể thao (chặn race-condition kiểm tra khung giờ trống đồng thời).

---

## 2. Tuyến đọc nhanh theo nhu cầu

- **Khi mới Onboard / Setup Local**: Đọc [Kiến trúc](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/Ki%E1%BA%BFn%20tr%C3%BAc.md) và [Quy trình phát triển tính năng](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20quy%20tr%C3%ACnh/Quy%20tr%C3%ACnh%20ph%C3%A1t%20tri%E1%BB%83n%20t%C3%ADnh%20n%C4%83ng.md).
- **Khi làm việc với API / Database**: Đọc [Schema](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20database/Schema.md) và [Stored Procedures](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20database/Stored%20Procedures.md).
- **Khi thêm nghiệp vụ / API mới**: Đọc [Coding Guide Backend](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20backend/Coding%20Guide%20%E2%80%94%20T%E1%BA%A1o%20module%20m%E1%BB%9Bi.md).
- **Khi dựng UI / Gọi API**: Đọc [Hook và Provider Frontend](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/T%C3%A0i%20li%E1%BB%87u%20k%E1%BB%B9%20thu%E1%BA%ADt/T%C3%A0i%20li%E1%BB%87u%20frontend/Hook%20v%C3%A0%20Provider.md).
