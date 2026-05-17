import { useState } from 'react'
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import { useRefundReasonsQuery, useCreateRefundReasonMutation, useDeleteRefundReasonMutation, useToggleRefundReasonMutation, useUpdateRefundReasonMutation } from '@/features/refund-reasons/api/useRefundReasonQueries'
import type { RefundReason, CreateRefundReasonRequest, UpdateRefundReasonRequest } from '@/features/refund-reasons/model/types'
import { toApiError } from '@/utils/errors'

export function RefundReasonsPage() {
  const { message } = App.useApp(); const [form] = Form.useForm(); const [open, setOpen] = useState(false); const [editingId, setEditingId] = useState<number | null>(null); const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useRefundReasonsQuery(tablePagination.current && tablePagination.pageSize ? { page: tablePagination.current, pageSize: tablePagination.pageSize } : undefined)
  const createMut = useCreateRefundReasonMutation(); const updateMut = useUpdateRefundReasonMutation(); const deleteMut = useDeleteRefundReasonMutation(); const toggleMut = useToggleRefundReasonMutation()
  const openCreate = () => { setEditingId(null); form.resetFields(); form.setFieldsValue({ isActive: true }); setOpen(true) }
  const openEdit = (r: RefundReason) => { setEditingId(r.refundReasonID); form.setFieldsValue(r); setOpen(true) }
  const handleSubmit = async () => { try { const v = await form.validateFields(); if (editingId) { await updateMut.mutateAsync({ id: editingId, data: v as UpdateRefundReasonRequest }); message.success('Cập nhật thành công') } else { await createMut.mutateAsync(v as CreateRefundReasonRequest); message.success('Tạo thành công') }; setOpen(false) } catch (e) { if (e && typeof e === 'object' && 'errorFields' in e) return; message.error(toApiError(e).message) } }
  const handleToggle = async (r: RefundReason) => { try { await toggleMut.mutateAsync(r); message.success('Cập nhật thành công') } catch (e) { message.error(toApiError(e).message) } }
  const handleDelete = async (id: number) => { try { await deleteMut.mutateAsync(id); message.success('Xóa thành công') } catch (e) { message.error(toApiError(e).message) } }
  if (query.isPending) return <LoadingSpin tip="Đang tải..." />
  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between"><div><Typography.Title level={2}>Lý do hoàn tiền</Typography.Title><Typography.Paragraph type="secondary">Quản lý lý do hoàn tiền: hủy dịch vụ, lỗi hệ thống...</Typography.Paragraph></div><Space><Button icon={<ReloadOutlined />} loading={query.isRefetching} onClick={() => query.refetch()}>Làm mới</Button><Button icon={<PlusOutlined />} onClick={openCreate} type="primary">Thêm mới</Button></Space></div>
      <Card><Table columns={[
        { title: 'ID', dataIndex: 'refundReasonID', width: 80 },
        { title: 'Mã', dataIndex: 'code', width: 140, render: (v: string) => <Tag>{v}</Tag> },
        { title: 'Tên', dataIndex: 'name', width: 220 },
        { title: 'Mô tả', dataIndex: 'description' },
        { title: 'Active', dataIndex: 'isActive', width: 100, render: (v: boolean, r: RefundReason) => <Switch checked={v} loading={toggleMut.isPending} onChange={() => handleToggle(r)} size="small" /> },
        { title: '', width: 110, render: (_: unknown, r: RefundReason) => <Space><Button icon={<EditOutlined />} onClick={() => openEdit(r)} size="small" type="link" /><Popconfirm title="Xóa?" onConfirm={() => handleDelete(r.refundReasonID)}><Button danger icon={<DeleteOutlined />} size="small" type="link" /></Popconfirm></Space> },
      ]} dataSource={query.data?.items ?? []} loading={query.isFetching} onChange={(p) => setTablePagination(p)} pagination={{ current: tablePagination.current ?? 1, pageSize: tablePagination.pageSize ?? 10, total: query.data?.totalCount ?? 0, showTotal: (t) => `Tổng ${t}` }} rowKey="refundReasonID" scroll={{ x: 900 }} size="middle" /></Card>
      <Modal confirmLoading={createMut.isPending || updateMut.isPending} destroyOnClose okText={editingId ? 'Cập nhật' : 'Tạo'} onCancel={() => setOpen(false)} onOk={handleSubmit} open={open} title={editingId ? 'Sửa lý do hoàn tiền' : 'Thêm lý do hoàn tiền'} width={540}>
        <Form form={form} layout="vertical">
          <Form.Item label="Mã" name="code" rules={[{ required: true, message: 'Nhập mã' }]}><Input maxLength={50} /></Form.Item>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Nhập tên' }]}><Input maxLength={200} /></Form.Item>
          <Form.Item label="Mô tả" name="description"><Input.TextArea maxLength={500} rows={3} /></Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
