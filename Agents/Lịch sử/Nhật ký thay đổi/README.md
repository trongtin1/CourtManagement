# Nhật ký thay đổi tài liệu (Pending Changelogs)

## Mục đích
Nơi lưu giữ các đề xuất thay đổi tài liệu trước khi chúng được áp dụng vào file gốc trong thư mục `docs/`. Điều này giúp đảm bảo tài liệu được review bởi Repository Owner trước khi cập nhật.

## Quy trình
1. Tạo một tệp nhật ký hàng ngày tại thư mục này với định dạng `YYYY-MM-DD.md` thông qua lệnh `/log-change <description>`.
2. Định dạng các đề xuất sửa đổi dưới dạng các checkbox chưa hoàn thành `- [ ]`.
3. Khi chủ dự án duyệt, chạy `/merge-docs` để AI tự động parse các mục `[ ]`, apply vào tài liệu gốc, và cập nhật thành `[x]`.
