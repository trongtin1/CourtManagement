import { useState } from 'react'
import { Button, Table, Tag, Popconfirm, App, Input, Select, Empty } from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  StopOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

import {
  useBookingGroupsQuery,
  useCancelBookingGroupMutation,
  useDeleteBookingGroupMutation,
} from '@/features/bookings/api/useBookingGroupQueries'
import type {
  BookingGroup,
  BookingGroupStatus,
  BookingGroupType,
} from '@/features/bookings/model/types'
import { formatCompactCurrency } from '@/utils/format'

import { BookingGroupCreateDrawer } from './BookingGroupCreateDrawer'
import { BookingGroupDetailDrawer } from './BookingGroupDetailDrawer'

interface BookingGroupsTabProps {
  facilityId: number
}

const STATUS_MAP: Record<BookingGroupStatus, { label: string; color: string }> = {
  Active: { label: 'Đang hoạt động', color: 'green' },
  Paused: { label: 'Tạm dừng', color: 'orange' },
  Cancelled: { label: 'Đã hủy', color: 'red' },
  Completed: { label: 'Hoàn thành', color: 'default' },
}

const GROUP_TYPE_MAP: Record<BookingGroupType, { label: string; icon: React.ReactNode }> =
  {
    recurring: { label: 'Định kỳ', icon: <ClockCircleOutlined /> },
    tournament: { label: 'Giải đấu', icon: <TeamOutlined /> },
    corporate: { label: 'Doanh nghiệp', icon: <TeamOutlined /> },
  }

const DAY_LABELS: Record<string, string> = {
  '1': 'T2',
  '2': 'T3',
  '3': 'T4',
  '4': 'T5',
  '5': 'T6',
  '6': 'T7',
  '0': 'CN',
}

export function BookingGroupsTab({ facilityId }: BookingGroupsTabProps) {
  const { message } = App.useApp()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingGroupStatus | 'All'>('All')
  const [selectedGroup, setSelectedGroup] = useState<BookingGroup | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useBookingGroupsQuery({ page, pageSize: 10 })
  const cancelMutation = useCancelBookingGroupMutation()
  const deleteMutation = useDeleteBookingGroupMutation()

  const groups = data?.items ?? []
  const total = data?.totalCount ?? 0

  // Client-side filter for search + status
  const filtered = groups.filter((g) => {
    const matchSearch =
      !search ||
      g.groupName.toLowerCase().includes(search.toLowerCase()) ||
      String(g.bookingGroupID).includes(search)
    const matchStatus = statusFilter === 'All' || g.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleCancel = async (id: number) => {
    try {
      await cancelMutation.mutateAsync({ id, reason: 'Quản trị viên hủy qua giao diện' })
      message.success('Đã hủy nhóm đặt sân thành công')
    } catch {
      message.error('Không thể hủy nhóm đặt sân')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      message.success('Đã xóa nhóm đặt sân')
    } catch {
      message.error('Không thể xóa nhóm đặt sân')
    }
  }

  const columns: ColumnsType<BookingGroup> = [
    {
      key: 'groupName',
      title: 'Tên nhóm',
      render: (_, record) => (
        <div
          className="flex flex-col gap-px cursor-pointer group"
          onClick={() => {
            setSelectedGroup(record)
            setIsDrawerOpen(true)
          }}
        >
          <span className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-blue-500 group-hover:underline group-hover:underline-offset-2">
            {record.groupName}
          </span>
          <span className="text-[11px] text-slate-400 font-medium font-mono">
            #{record.bookingGroupID}
          </span>
        </div>
      ),
    },
    {
      key: 'groupType',
      title: 'Loại',
      width: 130,
      render: (_, record) => {
        const meta = GROUP_TYPE_MAP[record.groupType]
        return (
          <span className="inline-flex items-center gap-1.25 text-[12px] font-medium text-slate-500">
            {meta?.icon}
            {meta?.label ?? record.groupType}
          </span>
        )
      },
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: 140,
      render: (_, record) => {
        const meta = STATUS_MAP[record.status]
        return (
          <Tag
            color={meta?.color}
            style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}
          >
            {meta?.label ?? record.status}
          </Tag>
        )
      },
    },
    {
      key: 'recurring',
      title: 'Lịch lặp',
      width: 180,
      render: (_, record) => {
        if (!record.recurringConfig)
          return <span className="text-slate-400 text-xs">—</span>
        const { startDate, endDate, daysOfWeek } = record.recurringConfig
        const dayLabels = daysOfWeek
          ? daysOfWeek
              .split(',')
              .map((d) => DAY_LABELS[d.trim()] || d)
              .join(', ')
          : 'Hàng tuần'

        return (
          <div className="flex flex-col gap-px">
            <span className="text-[12px] font-semibold text-teal-600">{dayLabels}</span>
            <span className="text-[11px] text-slate-400">
              {dayjs(startDate).format('DD/MM')} – {dayjs(endDate).format('DD/MM/YYYY')}
            </span>
          </div>
        )
      },
    },
    {
      key: 'amount',
      title: 'Tổng tiền',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div className="flex flex-col items-end gap-px">
          <span className="text-[13px] font-bold text-slate-800">
            {formatCompactCurrency(record.totalAmount)}
          </span>
          {record.paidAmount > 0 && (
            <span className="text-[11px] text-emerald-500 font-medium">
              Đã trả: {formatCompactCurrency(record.paidAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdDate',
      title: 'Ngày tạo',
      width: 110,
      render: (_, record) => (
        <span className="text-[12px] text-slate-500">
          {dayjs(record.createdDate).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center gap-0.5 justify-center">
          {record.status !== 'Cancelled' && record.status !== 'Completed' && (
            <Popconfirm
              title="Hủy toàn bộ lịch trong nhóm này?"
              description="Tất cả booking đang hoạt động sẽ bị hủy."
              onConfirm={() => handleCancel(record.bookingGroupID)}
              okText="Hủy nhóm"
              cancelText="Không"
              okButtonProps={{ danger: true, loading: cancelMutation.isPending }}
            >
              <Button
                type="text"
                size="small"
                icon={<StopOutlined />}
                className="w-7 h-7 rounded-md inline-flex items-center justify-center text-orange-500 hover:bg-orange-50"
                title="Hủy nhóm"
              />
            </Popconfirm>
          )}
          <Popconfirm
            title="Xóa nhóm này?"
            description="Toàn bộ booking và cấu hình sẽ bị xóa vĩnh viễn."
            onConfirm={() => handleDelete(record.bookingGroupID)}
            okText="Xóa"
            cancelText="Không"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="w-7 h-7 rounded-md inline-flex items-center justify-center"
              title="Xóa nhóm"
            />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-3.5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-130">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên hoặc mã nhóm…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="flex-1 rounded-lg text-[13px] h-8"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-42.5 text-[13px]"
            variant="outlined"
          >
            <Select.Option value="All">Tất cả trạng thái</Select.Option>
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <Select.Option key={key} value={key}>
                {val.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          className="h-8 rounded-lg font-semibold text-[13px]"
          ghost
          onClick={() => setIsCreateOpen(true)}
        >
          Tạo nhóm đặt sân
        </Button>
      </div>

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="py-15 px-5 bg-white border border-slate-200 rounded-lg text-center">
          <Empty
            image={<CalendarOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />}
            description={
              <span className="text-[13px] text-slate-400 font-normal">
                {search || statusFilter !== 'All'
                  ? 'Không tìm thấy nhóm đặt sân phù hợp'
                  : 'Chưa có nhóm đặt sân nào. Hãy tạo lịch định kỳ đầu tiên!'}
              </span>
            }
          />
        </div>
      )}

      {/* Table */}
      {(isLoading || filtered.length > 0) && (
        <Table<BookingGroup>
          dataSource={filtered}
          columns={columns}
          rowKey="bookingGroupID"
          loading={isLoading}
          className="[&_.ant-table]:rounded-xl! [&_.ant-table]:overflow-hidden! [&_.ant-table-thead_tr_th]:bg-slate-50! [&_.ant-table-thead_tr_th]:text-[11px]! [&_.ant-table-thead_tr_th]:font-bold! [&_.ant-table-thead_tr_th]:uppercase! [&_.ant-table-thead_tr_th]:tracking-wider! [&_.ant-table-thead_tr_th]:text-slate-500! [&_.ant-table-thead_tr_th]:border-b! [&_.ant-table-thead_tr_th]:border-slate-200! [&_.ant-table-thead_tr_th]:py-2.5! [&_.ant-table-thead_tr_th]:px-3! [&_.ant-table-tbody_tr_td]:py-2.5! [&_.ant-table-tbody_tr_td]:px-3! [&_.ant-table-tbody_tr_td]:text-[13px]! [&_.ant-table-tbody_tr_td]:border-b! [&_.ant-table-tbody_tr_td]:border-slate-50! [&_.ant-table-tbody_tr_td]:align-middle! hover:[&_.ant-table-tbody_tr_td]:bg-slate-50!"
          pagination={{
            total,
            current: page,
            pageSize: 10,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (t) => `${t} nhóm`,
          }}
          onRow={(record) => ({
            onDoubleClick: () => {
              setSelectedGroup(record)
              setIsDrawerOpen(true)
            },
          })}
          size="middle"
        />
      )}

      {/* Detail Drawer */}
      <BookingGroupDetailDrawer
        group={selectedGroup}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Create Drawer */}
      <BookingGroupCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        facilityId={facilityId}
      />
    </div>
  )
}
