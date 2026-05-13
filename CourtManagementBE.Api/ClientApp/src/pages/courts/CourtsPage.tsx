import { useState } from 'react'
import { App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import { useCourtsQuery, useCreateCourtMutation, useUpdateCourtMutation, useDeleteCourtMutation, useToggleCourtMutation } from '@/features/courts/api/useCourtQueries'
import type { Court, CreateCourtRequest, UpdateCourtRequest } from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

export function CourtsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const courtsQuery = useCourtsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateCourtMutation()
  const updateMut = useUpdateCourtMutation()
  const deleteMut = useDeleteCourtMutation()
  const toggleMut = useToggleCourtMutation()

  const openCreate = () => { setEditingId(null); form.resetFields(); form.setFieldsValue({ isActive: true }); setOpen(true) }
  const openEdit = (r: Court) => { setEditingId(r.courtID); form.setFieldsValue(r); setOpen(true) }

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields()
      if (editingId) {
        const data: UpdateCourtRequest = {
          areaID: v.areaID,
          courtTypeID: v.courtTypeID,
          courtCode: v.courtCode,
          courtName: v.courtName,
          statusID: v.statusID,
          length: v.length,
          width: v.width,
          capacity: v.capacity,
          sortOrder: v.sortOrder,
          description: v.description,
          imageURL: v.imageURL,
          isActive: v.isActive,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cập nhật sân thành công')
      } else {
        await createMut.mutateAsync(v as CreateCourtRequest)
        message.success('Tạo sân thành công')
      }
      setOpen(false)
    } catch (e) { if (e && typeof e === 'object' && 'errorFields' in e) return; message.error(toApiError(e).message) }
  }

  if (courtsQuery.isPending) return <LoadingSpin tip="Đang tải sân..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Quản lý Sân</Typography.Title>
          <Typography.Paragraph type="secondary">Danh sách sân thể thao</Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} loading={courtsQuery.isRefetching} onClick={() => courtsQuery.refetch()}>Làm mới</Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">Thêm sân</Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'courtID', width: 70 },
            { title: 'Mã', dataIndex: 'courtCode', width: 100 },
            { title: 'Tên sân', dataIndex: 'courtName' },
            { title: 'Cơ sở', dataIndex: 'facilityID', width: 80 },
            { title: 'Kích thước', render: (_: unknown, r: Court) => `${r.length}×${r.width}m`, width: 110 },
            { title: 'Sức chứa', dataIndex: 'capacity', width: 80 },
            { title: 'Active', dataIndex: 'isActive', width: 90, render: (v: boolean, r: Court) => <Switch checked={v} size="small" onChange={() => toggleMut.mutate(r.courtID)} /> },
            { title: '', width: 100, render: (_: unknown, r: Court) => <Space><Button icon={<EditOutlined />} onClick={() => openEdit(r)} size="small" type="link" /><Popconfirm title="Xoá?" onConfirm={() => deleteMut.mutate(r.courtID)}><Button danger icon={<DeleteOutlined />} size="small" type="link" /></Popconfirm></Space> },
          ]}
          dataSource={courtsQuery.data?.items ?? []} loading={courtsQuery.isFetching} onChange={(pagination) => setTablePagination(pagination)} rowKey="courtID" pagination={{ current: tablePagination.current ?? 1, pageSize: tablePagination.pageSize ?? 10, total: courtsQuery.data?.totalCount ?? 0, showTotal: (t) => `Tổng ${t}` }} scroll={{ x: 900 }} size="middle"
        />
      </Card>
      <Modal confirmLoading={createMut.isPending || updateMut.isPending} okText={editingId ? 'Cập nhật' : 'Tạo'} onCancel={() => setOpen(false)} onOk={handleSubmit} open={open} title={editingId ? 'Sửa Sân' : 'Thêm Sân'} width={600} destroyOnClose>
        <Form form={form} layout="vertical">
          {!editingId && <Form.Item label="Cơ sở ID" name="facilityID" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>}
          <Form.Item label="Loại sân ID" name="courtTypeID" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>
          <Form.Item label="Trạng thái ID" name="statusID" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>
          <Form.Item label="Mã sân" name="courtCode" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Tên sân" name="courtName" rules={[{ required: true }]}><Input /></Form.Item>
          <Space><Form.Item label="Dài" name="length"><InputNumber /></Form.Item><Form.Item label="Rộng" name="width"><InputNumber /></Form.Item><Form.Item label="Sức chứa" name="capacity"><InputNumber /></Form.Item></Space>
          <Form.Item label="Mô tả" name="description"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
