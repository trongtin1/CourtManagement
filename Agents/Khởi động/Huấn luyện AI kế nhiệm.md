# Huấn luyện AI kế nhiệm (Next-Agent Onboarding Guide)

> Đây là file AI kế nhiệm đọc thay cho toàn bộ lịch sử để hiểu trạng thái hiện tại của dự án.  
> Tệp này được cập nhật tự động vào cuối mỗi phiên làm việc bằng lệnh `/end-session`.

---

## 1. TL;DR (Trạng thái hiện tại)
- **Trạng thái**: Tài liệu 100% · Linter 100% · Backlog 0 task mở
- **Đang làm**: Không có (Sẵn sàng cho task tiếp theo)
- **Module/tính năng mới trong phiên này**: Thiết lập hệ thống AI Agent & Skills workflow.
- **Còn mở**: Không có

---

## 2. Nguồn sự thật nhanh (Quick References)
- Bản đồ tài liệu: [INDEX.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/INDEX.md)
- Quy chuẩn code: [CODING_CONVENTIONS.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/CODING_CONVENTIONS.md)
- Checklist review: [CHECKLIST_REVIEW.md](file:///c:/Users/DELL/Desktop/CourtManagment/CourtManagementBE/docs/CHECKLIST_REVIEW.md)

---

## 3. Tầng hiểu & Ghi nhớ (Memory)
- **Clean Architecture**: 4 project (`.Domain`, `.Application`, `.Infrastructure`, `.Api`).
- **ClientApp**: React 19 + Tailwind v4 + Ant Design v6 + React Query v5.
- **Logging**: Tiếng Việt + local constant `loggingHeader`.
- **Facility isolation**: Luôn validate `X-Facility-Id` header và `CanAccessFacility(facilityId)`.
- **Idempotency**: Requests ghi dữ liệu (POST/PUT/DELETE) từ ClientApp cần `idempotent: true`.
