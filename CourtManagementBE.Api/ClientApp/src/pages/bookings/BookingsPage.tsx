import { useState } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd'
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useBookingsQuery,
  useCancelBookingMutation,
  useDeleteBookingMutation,
} from '@/features/bookings/api/useBookingQueries'
import type { Booking } from '@/features/bookings/model/types'
import { toApiError } from '@/utils/errors'
import { CreateBookingModal } from './CreateBookingModal'

const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
}

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function BookingsPage() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  const {
    data: bookingData,
    isPending: isPendingBookings,
    isFetching: isFetchingBookings,
    refetch: refetchBookings,
  } = useBookingsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const { mutateAsync: cancelMut } = useCancelBookingMutation()
  const { mutate: deleteMut } = useDeleteBookingMutation()

  const handleCancel = async (id: string) => {
    try {
      await cancelMut({ id, data: { cancellationReason: 'Admin cancelled' } })
      message.success('Đã hủy booking')
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }

  if (isPendingBookings) return <LoadingSpin tip="Đang tải booking..." />

  const bookings = bookingData?.items ?? []
  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      !normalizedSearch ||
      booking.bookingID.toLowerCase().includes(normalizedSearch) ||
      String(booking.courtID).includes(normalizedSearch) ||
      String(booking.customerID).includes(normalizedSearch) ||
      booking.note?.toLowerCase().includes(normalizedSearch)

    const matchesStatus = !statusFilter || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })
  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length
  const activeCount = bookings.filter((booking) => booking.status !== 'cancelled').length
  const totalAmount = bookings.reduce(
    (sum, booking) => sum + (booking.totalAmount ?? 0),
    0,
  )

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Space wrap>
          <Input.Search
            allowClear
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm booking, sân, khách..."
            style={{ width: 280 }}
            value={searchText}
          />
          <Select
            allowClear
            onChange={setStatusFilter}
            options={[
              { label: 'Chờ xử lý', value: 'pending' },
              { label: 'Đã xác nhận', value: 'confirmed' },
              { label: 'Hoàn tất', value: 'completed' },
              { label: 'Đã hủy', value: 'cancelled' },
            ]}
            placeholder="Trạng thái"
            style={{ width: 160 }}
            value={statusFilter}
          />
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={isFetchingBookings}
            onClick={() => refetchBookings()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => setOpen(true)} type="primary">
            Tạo booking
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Booking đang hiển thị" value={filteredBookings.length} />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Cần xử lý" value={pendingCount} />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Tổng tiền"
              value={totalAmount}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="border-slate-200 shadow-sm"
        title={`Danh sách booking (${activeCount} đang hoạt động)`}
      >
        <Table
          columns={[
            { title: 'Booking ID', dataIndex: 'bookingID', width: 280, ellipsis: true },
            { title: 'Sân', dataIndex: 'courtID', width: 70 },
            { title: 'KH', dataIndex: 'customerID', width: 70 },
            {
              title: 'Ngày đặt',
              dataIndex: 'bookingDate',
              width: 120,
              render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
            },
            {
              title: 'Tổng tiền',
              dataIndex: 'totalAmount',
              width: 120,
              render: (value: number) => formatCurrency(value ?? 0),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              width: 110,
              render: (value: string) => (
                <Tag color={statusColors[value] || 'default'}>{value}</Tag>
              ),
            },
            { title: 'Ghi chú', dataIndex: 'note', ellipsis: true },
            {
              title: '',
              width: 140,
              render: (_: unknown, record: Booking) => (
                <Space>
                  {record.status !== 'cancelled' && (
                    <Popconfirm
                      title="Hủy booking?"
                      onConfirm={() => handleCancel(record.bookingID)}
                    >
                      <Button danger size="small">
                        Hủy
                      </Button>
                    </Popconfirm>
                  )}
                  <Popconfirm
                    title="Xóa booking?"
                    onConfirm={() => deleteMut(record.bookingID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={filteredBookings}
          loading={isFetchingBookings}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: bookingData?.totalCount ?? 0,
            showTotal: (total) => `Tổng ${total}`,
          }}
          rowKey="bookingID"
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>

      <CreateBookingModal open={open} onClose={() => setOpen(false)} />
    </Space>
  )
}
