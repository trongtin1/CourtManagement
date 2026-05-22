import { useState } from 'react'
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useCourtStatusesQuery,
  useCreateCourtStatusMutation,
  useDeleteCourtStatusMutation,
  useToggleCourtStatusMutation,
  useUpdateCourtStatusMutation,
} from '@/features/courts/api/useCourtStatusQueries'
import type {
  CourtStatus,
  CreateCourtStatusRequest,
  UpdateCourtStatusRequest,
} from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

export function CourtStatusesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useCourtStatusesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateCourtStatusMutation()
  const updateMut = useUpdateCourtStatusMutation()
  const deleteMut = useDeleteCourtStatusMutation()
  const toggleMut = useToggleCourtStatusMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true, colorCode: '#22c55e' })
    setOpen(true)
  }

  const openEdit = (record: CourtStatus) => {
    setEditingId(record.statusID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: UpdateCourtStatusRequest = {
          statusCode: values.statusCode,
          statusName: values.statusName,
          colorCode: values.colorCode,
          description: values.description,
          isActive: values.isActive,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cap nhat trang thai san thanh cong')
      } else {
        await createMut.mutateAsync(values as CreateCourtStatusRequest)
        message.success('Tao trang thai san thanh cong')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleToggle = async (record: CourtStatus) => {
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
      message.success('Xoa trang thai san thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Dang tai trang thai san..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Trang thai san</Typography.Title>
          <Typography.Paragraph type="secondary">
            Quan ly trang thai san: available, maintenance, closed.
          </Typography.Paragraph>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={query.isRefetching}
            onClick={() => query.refetch()}
          >
            Lam moi
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Them trang thai
          </Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'statusID', width: 80 },
            {
              title: 'Ma',
              dataIndex: 'statusCode',
              width: 160,
              render: (value: string) => <Tag>{value}</Tag>,
            },
            { title: 'Ten trang thai', dataIndex: 'statusName', width: 220 },
            {
              title: 'Mau',
              dataIndex: 'colorCode',
              width: 120,
              render: (value: string) => (
                <Space>
                  <span
                    className="inline-block size-4 rounded"
                    style={{ backgroundColor: value || '#d9d9d9' }}
                  />
                  {value}
                </Space>
              ),
            },
            { title: 'Mo ta', dataIndex: 'description' },
            {
              title: 'Active',
              dataIndex: 'isActive',
              width: 100,
              render: (value: boolean, record: CourtStatus) => (
                <Switch
                  checked={value}
                  loading={toggleMut.isPending}
                  onChange={() => handleToggle(record)}
                  size="small"
                />
              ),
            },
            {
              title: '',
              width: 110,
              render: (_: unknown, record: CourtStatus) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xoa trang thai nay?"
                    onConfirm={() => handleDelete(record.statusID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={query.data?.items ?? []}
          loading={query.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: query.data?.totalCount ?? 0,
            showTotal: (total) => `Tong ${total}`,
          }}
          rowKey="statusID"
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
      <Modal
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnClose
        okText={editingId ? 'Cap nhat' : 'Tao'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editingId ? 'Sua trang thai san' : 'Them trang thai san'}
        width={540}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Ma trang thai"
            name="statusCode"
            rules={[{ required: true, message: 'Nhap ma trang thai' }]}
          >
            <Input maxLength={20} placeholder="available" />
          </Form.Item>
          <Form.Item
            label="Ten trang thai"
            name="statusName"
            rules={[{ required: true, message: 'Nhap ten trang thai' }]}
          >
            <Input maxLength={100} placeholder="Available" />
          </Form.Item>
          <Form.Item label="Mau hien thi" name="colorCode">
            <Input maxLength={10} type="color" />
          </Form.Item>
          <Form.Item label="Mo ta" name="description">
            <Input.TextArea maxLength={500} rows={3} />
          </Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
