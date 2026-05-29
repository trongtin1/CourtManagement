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
  useCourtFeatureCategoriesQuery,
  useCreateCourtFeatureCategoryMutation,
  useDeleteCourtFeatureCategoryMutation,
  useToggleCourtFeatureCategoryMutation,
  useUpdateCourtFeatureCategoryMutation,
} from '@/features/court-feature-categories/api/useCourtFeatureCategoryQueries'
import type {
  CourtFeatureCategory,
  CourtFeatureCategoryRequest,
} from '@/features/court-feature-categories/model/types'
import { toApiError } from '@/utils/errors'

export function CourtFeatureCategoriesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useCourtFeatureCategoriesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateCourtFeatureCategoryMutation()
  const updateMut = useUpdateCourtFeatureCategoryMutation()
  const deleteMut = useDeleteCourtFeatureCategoryMutation()
  const toggleMut = useToggleCourtFeatureCategoryMutation()
  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setOpen(true)
  }
  const openEdit = (r: CourtFeatureCategory) => {
    setEditingId(r.courtFeatureCategoryID)
    form.setFieldsValue(r)
    setOpen(true)
  }
  const handleSubmit = async () => {
    try {
      const v = await form.validateFields()
      if (editingId) {
        await updateMut.mutateAsync({
          id: editingId,
          data: v as CourtFeatureCategoryRequest,
        })
        message.success('Cập nhật thành công')
      } else {
        await createMut.mutateAsync(v as CourtFeatureCategoryRequest)
        message.success('Tạo thành công')
      }
      setOpen(false)
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      message.error(toApiError(e).message)
    }
  }
  const handleToggle = async (r: CourtFeatureCategory) => {
    try {
      await toggleMut.mutateAsync(r)
      message.success('Cập nhật thành công')
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }
  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Xóa thành công')
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }
  if (query.isPending) return <LoadingSpin tip="Đang tải..." />
  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-end">
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={query.isRefetching}
            onClick={() => query.refetch()}
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
            { title: 'ID', dataIndex: 'courtFeatureCategoryID', width: 80 },
            {
              title: 'Mã',
              dataIndex: 'code',
              width: 140,
              render: (v: string) => <Tag>{v}</Tag>,
            },
            { title: 'Tên', dataIndex: 'name', width: 220 },
            { title: 'Mô tả', dataIndex: 'description' },
            {
              title: 'Active',
              dataIndex: 'isActive',
              width: 100,
              render: (v: boolean, r: CourtFeatureCategory) => (
                <Switch
                  checked={v}
                  loading={toggleMut.isPending}
                  onChange={() => handleToggle(r)}
                  size="small"
                />
              ),
            },
            {
              title: '',
              width: 110,
              render: (_: unknown, r: CourtFeatureCategory) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(r)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xóa?"
                    onConfirm={() => handleDelete(r.courtFeatureCategoryID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={query.data?.items ?? []}
          loading={query.isFetching}
          onChange={(p) => setTablePagination(p)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: query.data?.totalCount ?? 0,
            showTotal: (t) => `Tổng ${t}`,
          }}
          rowKey="courtFeatureCategoryID"
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
      <Modal
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnClose
        okText={editingId ? 'Cập nhật' : 'Tạo'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editingId ? 'Sửa loại tiện ích sân' : 'Thêm loại tiện ích sân'}
        width={540}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã"
            name="code"
            rules={[{ required: true, message: 'Nhập mã' }]}
          >
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: 'Nhập tên' }]}
          >
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
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
