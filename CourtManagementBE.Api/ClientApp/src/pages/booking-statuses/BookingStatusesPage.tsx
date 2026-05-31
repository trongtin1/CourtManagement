import { useState } from 'react'
import {
  App,
  Button,
  Card,
  Checkbox,
  ColorPicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
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
  useBookingStatusesQuery,
  useCreateBookingStatusMutation,
  useDeleteBookingStatusMutation,
  useUpdateBookingStatusMutation,
} from '@/features/booking-statuses/api/useBookingStatusQueries'
import type {
  BookingStatus,
  BookingStatusRequest,
} from '@/features/booking-statuses/model/types'
import { toApiError } from '@/utils/errors'

export function BookingStatusesPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  const query = useBookingStatusesQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )

  const createMut = useCreateBookingStatusMutation()
  const updateMut = useUpdateBookingStatusMutation()
  const deleteMut = useDeleteBookingStatusMutation()

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      code: '',
      statusName: '',
      labelName: '',
      isTerminal: false,
      canReschedule: false,
      canCombo: false,
      canService: false,
      colorCode: '#22c55e',
    })
    setOpen(true)
  }

  const openEdit = (record: BookingStatus) => {
    setEditingId(record.bookingStatusID)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: BookingStatusRequest = {
        code: values.code,
        statusName: values.statusName,
        labelName: values.labelName,
        colorCode: values.colorCode || '#22c55e',
        isTerminal: !!values.isTerminal,
        canReschedule: !!values.canReschedule,
        canCombo: !!values.canCombo,
        canService: !!values.canService,
      }

      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data })
        message.success('Cập nhật trạng thái đặt lịch thành công')
      } else {
        await createMut.mutateAsync(data)
        message.success('Tạo trạng thái đặt lịch thành công')
      }
      setOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Xóa trạng thái đặt lịch thành công')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (query.isPending) return <LoadingSpin tip="Đang tải danh sách trạng thái..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800 m-0">
            Quản lý cấu hình Trạng thái Đặt sân
          </h1>
          <p className="text-xs text-slate-500 mt-1 mb-0">
            Thiết lập các trạng thái đặt sân, quyền hạn dời lịch chơi và trạng thái kết
            thúc luồng.
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={query.isRefetching}
            onClick={() => query.refetch()}
          >
            Làm mới
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={openCreate}
            type="primary"
            className="bg-purple-600 hover:bg-purple-700"
          >
            Thêm trạng thái
          </Button>
        </Space>
      </div>

      <Card className="rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <Table
          columns={[
            {
              title: 'Mã Code',
              dataIndex: 'code',
              width: 120,
              render: (v: string) => (
                <span className="font-mono font-bold text-slate-700">{v}</span>
              ),
            },
            {
              title: 'Tên Technical (BE)',
              dataIndex: 'statusName',
              width: 180,
              render: (v: string) => <Tag color="blue">{v}</Tag>,
            },
            {
              title: 'Nhãn hiển thị (FE)',
              dataIndex: 'labelName',
              width: 220,
              render: (v: string, record: BookingStatus) => {
                // Determine Tag color if we have matchers
                return (
                  <Tag
                    style={{
                      backgroundColor: `${record.colorCode}15`,
                      color: record.colorCode,
                      borderColor: record.colorCode,
                    }}
                    className="font-semibold px-2 py-0.5"
                  >
                    {v}
                  </Tag>
                )
              },
            },
            {
              title: 'Màu hiển thị',
              dataIndex: 'colorCode',
              width: 140,
              render: (v: string) => (
                <Space>
                  <span
                    className="inline-block size-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: v || '#d9d9d9' }}
                  />
                  <span className="font-mono text-xs">{v}</span>
                </Space>
              ),
            },
            {
              title: 'Thao tác',
              width: 110,
              fixed: 'right',
              render: (_: unknown, record: BookingStatus) => {
                const isSystemStatus = [
                  '001',
                  '002',
                  '003',
                  '004',
                  '005',
                  '006',
                ].includes(record.code)
                return (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEdit(record)}
                      size="small"
                      type="link"
                      className="text-purple-600 hover:text-purple-700"
                    />
                    <Popconfirm
                      title="Xóa trạng thái này?"
                      description={
                        isSystemStatus
                          ? 'Đây là trạng thái hệ thống cốt lõi và không được phép xóa.'
                          : 'Hành động này không thể hoàn tác.'
                      }
                      disabled={isSystemStatus}
                      onConfirm={() => handleDelete(record.bookingStatusID)}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        type="link"
                        disabled={isSystemStatus}
                      />
                    </Popconfirm>
                  </Space>
                )
              },
            },
          ]}
          dataSource={query.data?.items ?? []}
          loading={query.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: query.data?.totalCount ?? 0,
            showTotal: (total) => `Tổng số ${total} trạng thái`,
          }}
          rowKey="bookingStatusID"
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      <Modal
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnClose
        okText={editingId ? 'Cập nhật' : 'Tạo'}
        okButtonProps={{ className: 'bg-purple-600 hover:bg-purple-700' }}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        title={editingId ? 'Sửa trạng thái đặt lịch' : 'Thêm trạng thái đặt lịch'}
        width={500}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label={
              <span className="text-xs font-bold text-slate-600">
                Mã Code (Không trùng lặp, ví dụ: 001)
              </span>
            }
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã code!' }]}
          >
            <Input maxLength={50} placeholder="007" disabled={!!editingId} />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold text-slate-600">
                Tên Technical (Dùng cho logic BE, ví dụ: Pending)
              </span>
            }
            name="statusName"
            rules={[{ required: true, message: 'Vui lòng nhập tên technical!' }]}
          >
            <Input maxLength={200} placeholder="Rescheduled" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-xs font-bold text-slate-600">
                Nhãn hiển thị (Tiếng Việt trên FE, ví dụ: Chờ xác nhận)
              </span>
            }
            name="labelName"
            rules={[{ required: true, message: 'Vui lòng nhập nhãn hiển thị!' }]}
          >
            <Input maxLength={200} placeholder="Đã dời lịch" />
          </Form.Item>

          <Form.Item
            label={<span className="text-xs font-bold text-slate-600">Màu hiển thị</span>}
            name="colorCode"
            rules={[{ required: true, message: 'Vui lòng chọn màu hiển thị!' }]}
            getValueFromEvent={(color) =>
              typeof color === 'string' ? color : color.toHexString()
            }
            trigger="onChange"
          >
            <ColorPicker showText />
          </Form.Item>

          <div className="flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
            <Form.Item
              name="canReschedule"
              valuePropName="checked"
              className="mb-0 flex-1"
            >
              <Checkbox>
                <span className="text-xs font-bold text-slate-700">
                  Cho phép dời lịch chơi
                </span>
              </Checkbox>
            </Form.Item>

            <Form.Item name="canCombo" valuePropName="checked" className="mb-0 flex-1">
              <Checkbox>
                <span className="text-xs font-bold text-slate-700">
                  Cho phép áp dụng combo
                </span>
              </Checkbox>
            </Form.Item>

            <Form.Item name="canService" valuePropName="checked" className="mb-0 flex-1">
              <Checkbox>
                <span className="text-xs font-bold text-slate-700">
                  Cho phép áp dụng dịch vụ
                </span>
              </Checkbox>
            </Form.Item>

            <Form.Item name="isTerminal" valuePropName="checked" className="mb-0 flex-1">
              <Checkbox>
                <span className="text-xs font-bold text-slate-700">
                  Trạng thái kết thúc (Terminal)
                </span>
              </Checkbox>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Space>
  )
}
