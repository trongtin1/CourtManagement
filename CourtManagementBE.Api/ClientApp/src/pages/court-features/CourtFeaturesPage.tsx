import { useState } from 'react'
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
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
  useCourtFeaturesQuery,
  useCreateCourtFeatureMutation,
  useDeleteCourtFeatureMutation,
  useToggleCourtFeatureMutation,
  useUpdateCourtFeatureMutation,
} from '@/features/courts/api/useCourtFeatureQueries'
import type {
  CourtFeature,
  CreateCourtFeatureRequest,
  UpdateCourtFeatureRequest,
} from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

export function CourtFeaturesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useCourtFeaturesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateCourtFeatureMutation()
  const updateMut = useUpdateCourtFeatureMutation()
  const deleteMut = useDeleteCourtFeatureMutation()
  const toggleMut = useToggleCourtFeatureMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setOpen(true)
  }

  const openEdit = (record: CourtFeature) => {
    setEditingId(record.courtFeatureID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: UpdateCourtFeatureRequest = {
          featureCode: values.featureCode,
          featureName: values.featureName,
          category: values.category,
          description: values.description,
          isActive: values.isActive,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cap nhat dac diem san thanh cong')
      } else {
        await createMut.mutateAsync(values as CreateCourtFeatureRequest)
        message.success('Tao dac diem san thanh cong')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleToggle = async (record: CourtFeature) => {
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
      message.success('Xoa dac diem san thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Dang tai dac diem san..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Dac diem san</Typography.Title>
          <Typography.Paragraph type="secondary">
            Quan ly cac nhan nhu Indoor, Outdoor, VIP, Wooden Floor va Air Conditioned.
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
            Them dac diem
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'courtFeatureID', width: 80 },
            {
              title: 'Ma',
              dataIndex: 'featureCode',
              width: 170,
              render: (value: string) => <Tag color="blue">{value}</Tag>,
            },
            {
              title: 'Nhom',
              dataIndex: 'category',
              width: 150,
              render: (value: string) => <Tag color="purple">{value || 'Other'}</Tag>,
            },
            { title: 'Ten dac diem', dataIndex: 'featureName', width: 220 },
            { title: 'Mo ta', dataIndex: 'description' },
            {
              title: 'Active',
              dataIndex: 'isActive',
              width: 100,
              render: (value: boolean, record: CourtFeature) => (
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
              render: (_: unknown, record: CourtFeature) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xoa dac diem nay?"
                    onConfirm={() => handleDelete(record.courtFeatureID)}
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
          rowKey="courtFeatureID"
          scroll={{ x: 760 }}
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
        title={editingId ? 'Sua dac diem san' : 'Them dac diem san'}
        width={540}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Ma dac diem"
            name="featureCode"
            rules={[{ required: true, message: 'Nhap ma dac diem' }]}
          >
            <Input maxLength={20} placeholder="INDOOR" />
          </Form.Item>
          <Form.Item
            label="Ten dac diem"
            name="featureName"
            rules={[{ required: true, message: 'Nhap ten dac diem' }]}
          >
            <Input maxLength={100} placeholder="Indoor" />
          </Form.Item>
          <Form.Item
            label="Nhom"
            name="category"
            rules={[{ required: true, message: 'Chon nhom dac diem' }]}
          >
            <Select
              options={[
                { label: 'Environment', value: 'Environment' },
                { label: 'Surface', value: 'Surface' },
                { label: 'Property', value: 'Property' },
              ]}
              placeholder="Environment"
            />
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
