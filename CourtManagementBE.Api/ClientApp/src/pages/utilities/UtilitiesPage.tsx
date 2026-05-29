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
  useCreateUtilityMutation,
  useDeleteUtilityMutation,
  useToggleUtilityMutation,
  useUpdateUtilityMutation,
  useUtilitiesQuery,
} from '@/features/services/api/useUtilityQueries'
import type {
  CreateUtilityRequest,
  UpdateUtilityRequest,
  Utility,
} from '@/features/services/model/types'
import { toApiError } from '@/utils/errors'

export function UtilitiesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useUtilitiesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateUtilityMutation()
  const updateMut = useUpdateUtilityMutation()
  const deleteMut = useDeleteUtilityMutation()
  const toggleMut = useToggleUtilityMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setOpen(true)
  }

  const openEdit = (record: Utility) => {
    setEditingId(record.utilityID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: UpdateUtilityRequest = {
          utilityCode: values.utilityCode,
          utilityName: values.utilityName,
          description: values.description,
          icon: values.icon,
          isActive: values.isActive,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cap nhat tien ich thanh cong')
      } else {
        await createMut.mutateAsync(values as CreateUtilityRequest)
        message.success('Tao tien ich thanh cong')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleToggle = async (record: Utility) => {
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
      message.success('Xoa tien ich thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Dang tai tien ich..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-end">
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={query.isRefetching}
            onClick={() => query.refetch()}
          >
            Lam moi
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Them tien ich
          </Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'utilityID', width: 80 },
            {
              title: 'Ma',
              dataIndex: 'utilityCode',
              width: 160,
              render: (value: string) => <Tag color="green">{value}</Tag>,
            },
            { title: 'Ten tien ich', dataIndex: 'utilityName', width: 220 },
            { title: 'Icon', dataIndex: 'icon', width: 120 },
            { title: 'Mo ta', dataIndex: 'description' },
            {
              title: 'Active',
              dataIndex: 'isActive',
              width: 100,
              render: (value: boolean, record: Utility) => (
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
              render: (_: unknown, record: Utility) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xoa tien ich nay?"
                    onConfirm={() => handleDelete(record.utilityID)}
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
          rowKey="utilityID"
          scroll={{ x: 860 }}
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
        title={editingId ? 'Sua tien ich' : 'Them tien ich'}
        width={540}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Ma tien ich"
            name="utilityCode"
            rules={[{ required: true, message: 'Nhap ma tien ich' }]}
          >
            <Input maxLength={20} placeholder="LIGHT" />
          </Form.Item>
          <Form.Item
            label="Ten tien ich"
            name="utilityName"
            rules={[{ required: true, message: 'Nhap ten tien ich' }]}
          >
            <Input maxLength={100} placeholder="Lighting" />
          </Form.Item>
          <Form.Item label="Icon" name="icon">
            <Input maxLength={100} placeholder="bulb" />
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
