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
  useTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
} from '@/features/tenants/api/useTenantQueries'
import type { Tenant, CreateTenantRequest, UpdateTenantRequest } from '@/features/tenants/model/types'
import { toApiError } from '@/utils/errors'

type FormValues = CreateTenantRequest & { isActive: boolean }

export function TenantsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  const tenantsQuery = useTenantsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMutation = useCreateTenantMutation()
  const updateMutation = useUpdateTenantMutation()
  const deleteMutation = useDeleteTenantMutation()

  const loading = createMutation.isPending || updateMutation.isPending

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setOpen(true)
  }

  const openEdit = (record: Tenant) => {
    setEditingId(record.tenantID)
    form.setFieldsValue({
      tenantName: record.tenantName,
      domain: record.domain,
      isActive: record.isActive,
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: UpdateTenantRequest = {
          tenantName: values.tenantName,
          domain: values.domain,
          isActive: values.isActive,
        }
        await updateMutation.mutateAsync({ id: editingId, data })
        message.success('Cập nhật tenant thành công')
      } else {
        await createMutation.mutateAsync(values)
        message.success('Tạo tenant thành công')
      }
      setOpen(false)
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      message.error(toApiError(err).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      message.success('Xoá tenant thành công')
    } catch (err) {
      message.error(toApiError(err).message)
    }
  }

  if (tenantsQuery.isPending) return <LoadingSpin tip="Đang tải tenants..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Quản lý Tenant</Typography.Title>
          <Typography.Paragraph type="secondary">
            Danh sách đơn vị thuê hệ thống
          </Typography.Paragraph>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={tenantsQuery.isRefetching}
            onClick={() => tenantsQuery.refetch()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Thêm mới
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'tenantID', width: 80, sorter: (a: Tenant, b: Tenant) => a.tenantID - b.tenantID },
            { title: 'Tên Tenant', dataIndex: 'tenantName', sorter: (a: Tenant, b: Tenant) => a.tenantName.localeCompare(b.tenantName) },
            { title: 'Domain', dataIndex: 'domain' },
            {
              title: 'Trạng thái',
              dataIndex: 'isActive',
              render: (val: boolean) => (
                <Tag color={val ? 'green' : 'default'}>{val ? 'Hoạt động' : 'Tắt'}</Tag>
              ),
              filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Tắt', value: false },
              ],
              onFilter: (value: unknown, record: Tenant) => record.isActive === value,
            },
            {
              title: 'Ngày tạo',
              dataIndex: 'createdDate',
              render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—',
            },
            {
              title: 'Thao tác',
              width: 120,
              render: (_: unknown, record: Tenant) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xoá tenant này?"
                    onConfirm={() => handleDelete(record.tenantID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={tenantsQuery.data?.items ?? []}
          loading={tenantsQuery.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: tenantsQuery.data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t}`,
          }}
          rowKey="tenantID"
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>

      <Modal
        confirmLoading={loading}
        okText={editingId ? 'Cập nhật' : 'Tạo mới'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editingId ? 'Chỉnh sửa Tenant' : 'Thêm Tenant mới'}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên Tenant" name="tenantName" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Nhập tên tenant" />
          </Form.Item>
          <Form.Item label="Domain" name="domain">
            <Input placeholder="Nhập domain" />
          </Form.Item>
          <Form.Item label="Hoạt động" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
