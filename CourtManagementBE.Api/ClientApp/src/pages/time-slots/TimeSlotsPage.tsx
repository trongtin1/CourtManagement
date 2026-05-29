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
  useCreateTimeSlotMutation,
  useDeleteTimeSlotMutation,
  useTimeSlotsQuery,
  useToggleTimeSlotMutation,
  useUpdateTimeSlotMutation,
} from '@/features/courts/api/useTimeSlotQueries'
import type {
  CreateTimeSlotRequest,
  TimeSlot,
  UpdateTimeSlotRequest,
} from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'

export function TimeSlotsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = useTimeSlotsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const createMut = useCreateTimeSlotMutation()
  const updateMut = useUpdateTimeSlotMutation()
  const deleteMut = useDeleteTimeSlotMutation()
  const toggleMut = useToggleTimeSlotMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      isActive: true,
      startTime: '06:00:00',
      endTime: '08:00:00',
    })
    setOpen(true)
  }

  const openEdit = (record: TimeSlot) => {
    setEditingId(record.timeSlotID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        const data: UpdateTimeSlotRequest = {
          slotName: values.slotName,
          startTime: values.startTime,
          endTime: values.endTime,
          isActive: values.isActive,
        }
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cap nhat khung gio thanh cong')
      } else {
        await createMut.mutateAsync(values as CreateTimeSlotRequest)
        message.success('Tao khung gio thanh cong')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleToggle = async (record: TimeSlot) => {
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
      message.success('Xoa khung gio thanh cong')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Dang tai khung gio..." />

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
            Them khung gio
          </Button>
        </Space>
      </div>
      <Card>
        <Table
          columns={[
            { title: 'ID', dataIndex: 'timeSlotID', width: 80 },
            { title: 'Ten slot', dataIndex: 'slotName', width: 220 },
            { title: 'Bat dau', dataIndex: 'startTime', width: 120 },
            { title: 'Ket thuc', dataIndex: 'endTime', width: 120 },
            {
              title: 'Active',
              dataIndex: 'isActive',
              width: 100,
              render: (value: boolean, record: TimeSlot) => (
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
              render: (_: unknown, record: TimeSlot) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openEdit(record)}
                    size="small"
                    type="link"
                  />
                  <Popconfirm
                    title="Xoa khung gio nay?"
                    onConfirm={() => handleDelete(record.timeSlotID)}
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
          rowKey="timeSlotID"
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
        title={editingId ? 'Sua khung gio' : 'Them khung gio'}
        width={540}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Ten slot"
            name="slotName"
            rules={[{ required: true, message: 'Nhap ten slot' }]}
          >
            <Input maxLength={100} placeholder="06:00 - 08:00" />
          </Form.Item>
          <Form.Item
            label="Bat dau"
            name="startTime"
            rules={[{ required: true, message: 'Nhap gio bat dau' }]}
          >
            <Input placeholder="06:00:00" />
          </Form.Item>
          <Form.Item
            label="Ket thuc"
            name="endTime"
            rules={[{ required: true, message: 'Nhap gio ket thuc' }]}
          >
            <Input placeholder="08:00:00" />
          </Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
