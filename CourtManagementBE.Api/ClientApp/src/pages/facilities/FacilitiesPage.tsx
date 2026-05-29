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
  useFacilitiesQuery,
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
  useDeleteFacilityMutation,
  useToggleFacilityMutation,
} from '@/features/facilities/api/useFacilityQueries'
import type { Facility, FacilityRequest } from '@/features/facilities/model/types'
import { toApiError } from '@/utils/errors'

export function FacilitiesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  const facilitiesQuery = useFacilitiesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMutation = useCreateFacilityMutation()
  const updateMutation = useUpdateFacilityMutation()
  const deleteMutation = useDeleteFacilityMutation()
  const toggleMutation = useToggleFacilityMutation()

  const loading = createMutation.isPending || updateMutation.isPending

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setOpen(true)
  }

  const openEdit = (record: Facility) => {
    setEditingId(record.facilityID)
    form.setFieldsValue({
      facilityName: record.facilityName,
      address: record.address,
      phone: record.phone,
      email: record.email,
      description: record.description,
      imageURL: record.imageURL,
      isActive: record.isActive,
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: FacilityRequest = {
          facilityName: values.facilityName,
          address: values.address,
          phone: values.phone,
          email: values.email,
          description: values.description,
          imageURL: values.imageURL,
          isActive: values.isActive,
        }
        await updateMutation.mutateAsync({ id: editingId, data })
        message.success('Cập nhật cơ sở thành công')
      } else {
        const data: FacilityRequest = {
          facilityName: values.facilityName,
          address: values.address,
          phone: values.phone,
          email: values.email,
          description: values.description,
          imageURL: values.imageURL,
          isActive: values.isActive,
        }
        await createMutation.mutateAsync(data)
        message.success('Tạo cơ sở thành công')
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
      message.success('Xoá cơ sở thành công')
    } catch (err) {
      message.error(toApiError(err).message)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await toggleMutation.mutateAsync(id)
      message.success('Đã cập nhật trạng thái')
    } catch (err) {
      message.error(toApiError(err).message)
    }
  }

  if (facilitiesQuery.isPending) return <LoadingSpin tip="Đang tải cơ sở..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-end">
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={facilitiesQuery.isRefetching}
            onClick={() => facilitiesQuery.refetch()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Thêm cơ sở
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={[
            {
              title: 'ID',
              dataIndex: 'facilityID',
              width: 70,
              sorter: (a: Facility, b: Facility) => a.facilityID - b.facilityID,
            },
            {
              title: 'Tên cơ sở',
              dataIndex: 'facilityName',
              sorter: (a: Facility, b: Facility) =>
                a.facilityName.localeCompare(b.facilityName),
            },
            { title: 'Địa chỉ', dataIndex: 'address', ellipsis: true },
            { title: 'SĐT', dataIndex: 'phone', width: 130 },
            { title: 'Email', dataIndex: 'email', ellipsis: true },
            {
              title: 'Trạng thái',
              dataIndex: 'isActive',
              width: 120,
              render: (val: boolean, record: Facility) => (
                <Switch
                  checked={val}
                  loading={toggleMutation.isPending}
                  onChange={() => handleToggle(record.facilityID)}
                  size="small"
                />
              ),
            },
            {
              title: 'Thao tác',
              width: 120,
              render: (_: unknown, record: Facility) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xoá cơ sở này?"
                    onConfirm={() => handleDelete(record.facilityID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={facilitiesQuery.data?.items ?? []}
          loading={facilitiesQuery.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: facilitiesQuery.data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (t) => `Tổng ${t}`,
          }}
          rowKey="facilityID"
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>

      <Modal
        confirmLoading={loading}
        okText={editingId ? 'Cập nhật' : 'Tạo mới'}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editingId ? 'Chỉnh sửa Cơ sở' : 'Thêm Cơ sở mới'}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên cơ sở"
            name="facilityName"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Nhập tên cơ sở" />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="Nhập SĐT" />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả cơ sở" />
          </Form.Item>
          <Form.Item label="URL ảnh" name="imageURL">
            <Input placeholder="URL ảnh cơ sở" />
          </Form.Item>
          <Form.Item label="Hoạt động" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
