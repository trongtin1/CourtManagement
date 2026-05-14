import { useState } from 'react'
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useCourtTypesQuery,
  useCreateCourtTypeMutation,
  useDeleteCourtTypeMutation,
  useToggleCourtTypeMutation,
  useUpdateCourtTypeMutation,
} from '@/features/courts/api/useCourtTypeQueries'
import type { CourtType, CreateCourtTypeRequest, UpdateCourtTypeRequest } from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

export function CourtTypesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useCourtTypesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateCourtTypeMutation()
  const updateMut = useUpdateCourtTypeMutation()
  const deleteMut = useDeleteCourtTypeMutation()
  const toggleMut = useToggleCourtTypeMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setOpen(true)
  }

  const openEdit = (record: CourtType) => {
    setEditingId(record.courtTypeID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: UpdateCourtTypeRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cap nhat loai san thanh cong')
      } else {
        await createMut.mutateAsync(values as CreateCourtTypeRequest)
        message.success('Tao loai san thanh cong')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleToggle = async (record: CourtType) => {
    try {
      await toggleMut.mutateAsync(record)
      message.success('Cap nhat trang thai thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Xoa loai san thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Dang tai loai san..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Loai san</Typography.Title>
          <Typography.Paragraph type="secondary">Quan ly badminton, tennis, pickleball va cac loai san khac.</Typography.Paragraph>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} loading={query.isRefetching} onClick={() => query.refetch()}>Lam moi</Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">Them loai san</Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'courtTypeID', width: 80 },
            { title: 'Ma', dataIndex: 'code', width: 160, render: (value: string) => <Tag color="blue">{value}</Tag> },
            { title: 'Ten loai san', dataIndex: 'name', width: 220 },
            { title: 'Mo ta', dataIndex: 'description' },
            { title: 'Active', dataIndex: 'isActive', width: 100, render: (value: boolean, record: CourtType) => <Switch checked={value} loading={toggleMut.isPending} onChange={() => handleToggle(record)} size="small" /> },
            { title: '', width: 110, render: (_: unknown, record: CourtType) => <Space><Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" type="link" /><Popconfirm title="Xoa loai san nay?" onConfirm={() => handleDelete(record.courtTypeID)}><Button danger icon={<DeleteOutlined />} size="small" type="link" /></Popconfirm></Space> },
          ]}
          dataSource={query.data?.items ?? []}
          loading={query.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{ current: tablePagination.current ?? 1, pageSize: tablePagination.pageSize ?? 10, total: query.data?.totalCount ?? 0, showTotal: (total) => `Tong ${total}` }}
          rowKey="courtTypeID"
          scroll={{ x: 760 }}
          size="middle"
        />
      </Card>
      <Modal confirmLoading={createMut.isPending || updateMut.isPending} destroyOnClose okText={editingId ? 'Cap nhat' : 'Tao'} onCancel={() => setOpen(false)} onOk={handleSubmit} open={open} title={editingId ? 'Sua loai san' : 'Them loai san'} width={540}>
        <Form form={form} layout="vertical">
          <Form.Item label="Ma loai san" name="code" rules={[{ required: true, message: 'Nhap ma loai san' }]}><Input maxLength={20} placeholder="BADMINTON" /></Form.Item>
          <Form.Item label="Ten loai san" name="name" rules={[{ required: true, message: 'Nhap ten loai san' }]}><Input maxLength={100} placeholder="Badminton" /></Form.Item>
          <Form.Item label="Mo ta" name="description"><Input.TextArea maxLength={500} rows={3} /></Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
