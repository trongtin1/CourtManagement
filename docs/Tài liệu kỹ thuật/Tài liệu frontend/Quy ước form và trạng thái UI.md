# Quy ước Thiết kế Form và Trạng thái Giao diện (UI & Forms Conventions)

Để duy trì trải nghiệm người dùng đồng nhất và thiết kế giao diện cao cấp, dự án kết hợp sức mạnh của **Ant Design v6** (cung cấp cấu trúc component cao cấp) và **Tailwind CSS v4** (cung cấp khả năng tinh chỉnh style linh hoạt).

---

## 1. Kết hợp Ant Design v6 & Tailwind CSS v4

Quy tắc phân công vai trò thiết kế:
- **Ant Design (Antd)**: Chịu trách nhiệm về cấu trúc logic và các UI Components chính như Table, Form, Drawer, Modal, Input, Button, Select, Switch, Pagination.
- **Tailwind CSS**: Chịu trách nhiệm căn lề, khoảng cách (margin, padding), bố cục (flex, grid), màu sắc tùy chỉnh và các hiệu ứng động (micro-animations).

*Ví dụ:*
```tsx
import { Card, Table } from 'antd';

export const AreaList = ({ data, loading }) => (
  <Card className="shadow-md rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
    <Table
      dataSource={data}
      loading={loading}
      columns={columns}
      pagination={{ pageSize: 10 }}
    />
  </Card>
);
```

---

## 2. Trạng thái tải dữ liệu (Loading) & Giao diện Trống (Empty State)

Để nâng cao trải nghiệm người dùng:
- **Loading State**: Luôn hiển thị component loading hoặc Spinner (`<Spin />` hoặc custom `<LoadingSpin />`) trong quá trình gọi API lấy dữ liệu.
- **Empty State**: Khi danh sách dữ liệu rỗng, bắt buộc sử dụng component `<Empty />` của Antd thay vì để trống màn hình:
  ```tsx
  if (!data || data.length === 0) {
    return <Empty description="Không có khu vực nào được tìm thấy." />;
  }
  ```

---

## 3. Quy tắc Thiết kế Form & Xác thực (Validation)

- **Cấu trúc Form**: Sử dụng `<Form>` của Antd với thuộc tính `layout="vertical"` để tối ưu hiển thị trên cả thiết bị di động và desktop.
- **Validation**: Tận dụng thuộc tính `rules` của `<Form.Item>` để cấu hình kiểm tra tính hợp lệ của dữ liệu đầu vào. Tuyệt đối không kiểm tra thủ công bằng state tự chế:
  ```tsx
  <Form.Item
    label="Tên khu vực"
    name="name"
    rules={[{ required: true, message: 'Vui lòng nhập tên khu vực!' }]}
  >
    <Input placeholder="Nhập tên khu vực (ví dụ: Sân Tennis)" />
  </Form.Item>
  ```
- **Xử lý Submit**: Nút submit form phải phản ánh trạng thái gọi API bằng cách truyền cờ `loading` của Mutation React Query (ví dụ: `loading={mutation.isPending}`).
