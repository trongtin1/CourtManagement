import { useState } from 'react'
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useCreatePriceRuleTypeMutation,
  useDeletePriceRuleTypeMutation,
  usePriceRuleTypesQuery,
  useTogglePriceRuleTypeMutation,
  useUpdatePriceRuleTypeMutation,
} from '@/features/courts/api/usePriceRuleTypeQueries'
import type {
  CreatePriceRuleTypeRequest,
  PriceRuleType,
  UpdatePriceRuleTypeRequest,
} from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

export function PriceRuleTypesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  const query = usePriceRuleTypesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreatePriceRuleTypeMutation()
  const updateMut = useUpdatePriceRuleTypeMutation()
  const deleteMut = useDeletePriceRuleTypeMutation()
  const toggleMut = useTogglePriceRuleTypeMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      isActive: true,
      sortOrder: 0,
      colorCode: '#1677ff',
    })
    setOpen(true)
  }

  const openEdit = (record: PriceRuleType) => {
    setEditingId(record.priceRuleTypeID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: CreatePriceRuleTypeRequest = {
        code: values.code,
        name: values.name,
        description: values.description ?? '',
        sortOrder: values.sortOrder ?? 0,
        isActive: values.isActive ?? true,
        colorCode: values.colorCode ?? '',
      }

      if (editingId) {
        await updateMut.mutateAsync({
          id: editingId,
          data: payload as UpdatePriceRuleTypeRequest,
        })
        message.success('Cap nhat loai quy tac gia thanh cong')
      } else {
        await createMut.mutateAsync(payload)
        message.success('Tao loai quy tac gia thanh cong')
      }

      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleToggle = async (record: PriceRuleType) => {
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
      message.success('Xoa loai quy tac gia thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Dang tai loai quy tac gia..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Loai quy tac gia</Typography.Title>
          <Typography.Paragraph type="secondary">
            Quan ly nhan gia dung cho cau hinh gia san: cao diem, thap diem, ngay le.
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
            Them loai gia
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'priceRuleTypeID', width: 80 },
            {
              title: 'Ma',
              dataIndex: 'code',
              width: 160,
              render: (value: string) => <Tag>{value}</Tag>,
            },
            { title: 'Ten loai', dataIndex: 'name', width: 220 },
            {
              title: 'Mau',
              dataIndex: 'colorCode',
              width: 140,
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
            { title: 'Thu tu', dataIndex: 'sortOrder', width: 100 },
            {
              title: 'Active',
              dataIndex: 'isActive',
              width: 100,
              render: (value: boolean, record: PriceRuleType) => (
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
              render: (_: unknown, record: PriceRuleType) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xoa loai quy tac gia nay?"
                    onConfirm={() => handleDelete(record.priceRuleTypeID)}
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
          rowKey="priceRuleTypeID"
          scroll={{ x: 950 }}
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
        title={editingId ? 'Sua loai quy tac gia' : 'Them loai quy tac gia'}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Ma loai"
            name="code"
            rules={[{ required: true, message: 'Nhap ma loai' }]}
          >
            <Input maxLength={50} placeholder="PEAK" />
          </Form.Item>
          <Form.Item
            label="Ten loai"
            name="name"
            rules={[{ required: true, message: 'Nhap ten loai' }]}
          >
            <Input maxLength={100} placeholder="Gio cao diem" />
          </Form.Item>
          <Form.Item label="Mau hien thi" name="colorCode">
            <Input maxLength={10} type="color" />
          </Form.Item>
          <Form.Item label="Thu tu hien thi" name="sortOrder">
            <InputNumber className="w-full" min={0} precision={0} />
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
