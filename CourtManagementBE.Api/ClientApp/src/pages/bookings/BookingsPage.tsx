import { useState } from 'react'
import { App, Button, Popconfirm, Space, Table, Tag, Typography } from 'antd'
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

// ─── Constants ────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
}

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}đ`

// ─── Component ────────────────────────────────────────────────────────────────

export function BookingsPage() {
  const { message } = App.useApp()
  const [open, setOpen] = useState(false)
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})

  const {
    data: bookingData,
    isPending: isPendingBookings,
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
      message.success('Đã huỷ booking')
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }

  if (isPendingBookings) return <LoadingSpin tip="Đang tải bookings..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Quản lý Đặt sân</Typography.Title>
          <Typography.Paragraph type="secondary">
            Danh sách lượt đặt sân
          </Typography.Paragraph>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={isPendingBookings}
            onClick={() => refetchBookings()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => setOpen(true)} type="primary">
            Tạo booking
          </Button>
        </Space>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <Table
          columns={[
            { title: 'Booking ID', dataIndex: 'bookingID', width: 280, ellipsis: true },
            { title: 'Sân', dataIndex: 'courtID', width: 70 },
            { title: 'KH', dataIndex: 'customerID', width: 70 },
            {
              title: 'Ngày đặt',
              dataIndex: 'bookingDate',
              width: 120,
              render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
            },
            {
              title: 'Tổng tiền',
              dataIndex: 'totalAmount',
              width: 120,
              render: (v: number) => formatCurrency(v ?? 0),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              width: 110,
              render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag>,
            },
            { title: 'Ghi chú', dataIndex: 'note', ellipsis: true },
            {
              title: '',
              width: 140,
              render: (_: unknown, r: Booking) => (
                <Space>
                  {r.status !== 'cancelled' && (
                    <Popconfirm
                      title="Huỷ booking?"
                      onConfirm={() => handleCancel(r.bookingID)}
                    >
                      <Button danger size="small">
                        Huỷ
                      </Button>
                    </Popconfirm>
                  )}
                  <Popconfirm title="Xoá?" onConfirm={() => deleteMut(r.bookingID)}>
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={bookingData?.items ?? []}
          loading={isPendingBookings}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: bookingData?.totalCount ?? 0,
            showTotal: (t) => `Tổng ${t}`,
          }}
          rowKey="bookingID"
          scroll={{ x: 1100 }}
          size="middle"
        />
      </div>

      {/* Create booking modal */}
      <CreateBookingModal open={open} onClose={() => setOpen(false)} />
    </Space>
  )
}
