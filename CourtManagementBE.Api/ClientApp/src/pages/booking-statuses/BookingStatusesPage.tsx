import { useState } from 'react'
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useBookingStatusesQuery,
  useCreateBookingStatusMutation,
  useDeleteBookingStatusMutation,
  useToggleBookingStatusMutation,
  useUpdateBookingStatusMutation,
} from '@/features/booking-statuses/api/useBookingStatusQueries'
import type { BookingStatus, CreateBookingStatusRequest, UpdateBookingStatusRequest } from '@/features/booking-statuses/model/types'
import { toApiError } from '@/utils/errors'

export function BookingStatusesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useBookingStatusesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateBookingStatusMutation()
  const updateMut = useUpdateBookingStatusMutation()
  const deleteMut = useDeleteBookingStatusMutation()
  const toggleMut = useToggleBookingStatusMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true, colorCode: '#22c55e' })
    setOpen(true)
  }

  const openEdit = (record: BookingStatus) => {
    setEditingId(record.bookingStatusID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: UpdateBookingStatusRequest = {
          code: values.code, name: values.name, colorCode: values.colorCode,
          description: values.description, isActive: values.isActive,
          sortOrder: values.sortOrder, canCancel: values.canCancel, isFinal: values.isFinal,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cập nhật trạng thái đặt lịch thành công')
      } else {
        await createMut.mutateAsync(values as CreateBookingStatusRequest)
        message.success('Tạo trạng thái đặt lịch thành công')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleToggle = async (record: BookingStatus) => {
    try {
      await toggleMut.mutateAsync(record)
      message.success('Cập nhật trạng thái thành công')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Xóa trạng thái đặt lịch thành công')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Đang tải trạng thái đặt lịch..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Trạng thái đặt lịch</Typography.Title>
          <Typography.Paragraph type="secondary">Quản lý trạng thái đặt lịch: pending, confirmed, cancelled...</Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} loading={query.isRefetching} onClick={() => query.refetch()}>Làm mới</Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">Thêm trạng thái</Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'bookingStatusID', width: 80 },
            { title: 'Mã', dataIndex: 'code', width: 140, render: (v: string) => <Tag>{v}</Tag> },
            { title: 'Tên', dataIndex: 'name', width: 200 },
            { title: 'Màu', dataIndex: 'colorCode', width: 120, render: (v: string) => <Space><span className="inline-block size-4 rounded" style={{ backgroundColor: v || '#d9d9d9' }} />{v}</Space> },
            { title: 'Cho hủy', dataIndex: 'canCancel', width: 90, render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Có' : 'Không'}</Tag> },
            { title: 'Kết thúc', dataIndex: 'isFinal', width: 90, render: (v: boolean) => <Tag color={v ? 'red' : 'default'}>{v ? 'Có' : 'Không'}</Tag> },
            { title: 'Mô tả', dataIndex: 'description' },
            { title: 'Active', dataIndex: 'isActive', width: 100, render: (v: boolean, record: BookingStatus) => <Switch checked={v} loading={toggleMut.isPending} onChange={() => handleToggle(record)} size="small" /> },
            { title: '', width: 110, render: (_: unknown, record: BookingStatus) => <Space><Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" type="link" /><Popconfirm title="Xóa trạng thái này?" onConfirm={() => handleDelete(record.bookingStatusID)}><Button danger icon={<DeleteOutlined />} size="small" type="link" /></Popconfirm></Space> },
          ]}
          dataSource={query.data?.items ?? []}
          loading={query.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{ current: tablePagination.current ?? 1, pageSize: tablePagination.pageSize ?? 10, total: query.data?.totalCount ?? 0, showTotal: (total) => `Tổng ${total}` }}
          rowKey="bookingStatusID"
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
      <Modal confirmLoading={createMut.isPending || updateMut.isPending} destroyOnClose okText={editingId ? 'Cập nhật' : 'Tạo'} onCancel={() => setOpen(false)} onOk={handleSubmit} open={open} title={editingId ? 'Sửa trạng thái đặt lịch' : 'Thêm trạng thái đặt lịch'} width={540}>
        <Form form={form} layout="vertical">
          <Form.Item label="Mã" name="code" rules={[{ required: true, message: 'Nhập mã' }]}><Input maxLength={50} placeholder="pending" /></Form.Item>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Nhập tên' }]}><Input maxLength={200} placeholder="Chờ xác nhận" /></Form.Item>
          <Form.Item label="Màu hiển thị" name="colorCode"><Input maxLength={10} type="color" /></Form.Item>
          <Form.Item label="Cho phép hủy" name="canCancel" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item label="Trạng thái kết thúc" name="isFinal" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item label="Mô tả" name="description"><Input.TextArea maxLength={500} rows={3} /></Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
