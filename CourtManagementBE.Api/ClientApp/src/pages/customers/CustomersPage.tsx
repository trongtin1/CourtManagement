import { useState } from 'react'
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import { useCustomersQuery, useCreateCustomerMutation, useUpdateCustomerMutation, useDeleteCustomerMutation } from '@/features/customers/api/useCustomerQueries'
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/features/customers/model/types'
import { toApiError } from '@/utils/errors'

export function CustomersPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useCustomersQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateCustomerMutation()
  const updateMut = useUpdateCustomerMutation()
  const deleteMut = useDeleteCustomerMutation()

  const openCreate = () => { setEditingId(null); form.resetFields(); form.setFieldsValue({ isActive: true, tenantID: 1, customerType: 'normal' }); setOpen(true) }
  const openEdit = (r: Customer) => { setEditingId(r.customerID); form.setFieldsValue(r); setOpen(true) }

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields()
      if (editingId) {
        const data: UpdateCustomerRequest = { customerName: v.customerName, phone: v.phone, email: v.email, customerType: v.customerType, note: v.note, isActive: v.isActive }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cập nhật khách hàng thành công')
      } else {
        await createMut.mutateAsync(v as CreateCustomerRequest)
        message.success('Tạo khách hàng thành công')
      }
      setOpen(false)
    } catch (e) { if (e && typeof e === 'object' && 'errorFields' in e) return; message.error(toApiError(e).message) }
  }

  if (query.isPending) return <LoadingSpin tip="Đang tải khách hàng..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Quản lý Khách hàng</Typography.Title>
          <Typography.Paragraph type="secondary">Danh sách khách hàng</Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} loading={query.isRefetching} onClick={() => query.refetch()}>Làm mới</Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">Thêm KH</Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'customerID', width: 70 },
            { title: 'Tên', dataIndex: 'customerName' },
            { title: 'SĐT', dataIndex: 'phone', width: 130 },
            { title: 'Email', dataIndex: 'email', ellipsis: true },
            { title: 'Loại', dataIndex: 'customerType', width: 100, render: (v: string) => <Tag>{v}</Tag> },
            { title: 'Active', dataIndex: 'isActive', width: 80, render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Có' : 'Không'}</Tag> },
            { title: '', width: 100, render: (_: unknown, r: Customer) => <Space><Button icon={<EditOutlined />} onClick={() => openEdit(r)} size="small" type="link" /><Popconfirm title="Xoá?" onConfirm={() => deleteMut.mutate(r.customerID)}><Button danger icon={<DeleteOutlined />} size="small" type="link" /></Popconfirm></Space> },
          ]}
          dataSource={query.data?.items ?? []} loading={query.isFetching} onChange={(pagination) => setTablePagination(pagination)} rowKey="customerID" pagination={{ current: tablePagination.current ?? 1, pageSize: tablePagination.pageSize ?? 10, total: query.data?.totalCount ?? 0, showTotal: (t) => `Tổng ${t}` }} scroll={{ x: 800 }} size="middle"
        />
      </Card>
      <Modal confirmLoading={createMut.isPending || updateMut.isPending} okText={editingId ? 'Cập nhật' : 'Tạo'} onCancel={() => setOpen(false)} onOk={handleSubmit} open={open} title={editingId ? 'Sửa KH' : 'Thêm KH'} width={560} destroyOnClose>
        <Form form={form} layout="vertical">
          {!editingId && <Form.Item label="Tenant ID" name="tenantID" rules={[{ required: true }]}><Input type="number" /></Form.Item>}
          <Form.Item label="Tên KH" name="customerName" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="SĐT" name="phone"><Input /></Form.Item>
          <Form.Item label="Email" name="email"><Input /></Form.Item>
          <Form.Item label="Loại KH" name="customerType"><Input /></Form.Item>
          <Form.Item label="Ghi chú" name="note"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
