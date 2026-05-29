import { Drawer, Button, Tag, Divider, Descriptions, Timeline, Spin } from 'antd'
import {
  CloseOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import type {
  BookingGroup,
  BookingGroupStatus,
  BookingGroupType,
} from '@/features/bookings/model/types'
import { formatCompactCurrency } from '@/utils/format'
import { useBookingGroupQuery } from '@/features/bookings/api/useBookingGroupQueries'

interface BookingGroupDetailDrawerProps {
  group: BookingGroup | null
  open: boolean
  onClose: () => void
}

const STATUS_MAP: Record<BookingGroupStatus, { label: string; color: string }> = {
  Active: { label: 'Đang hoạt động', color: 'green' },
  Paused: { label: 'Tạm dừng', color: 'orange' },
  Cancelled: { label: 'Đã hủy', color: 'red' },
  Completed: { label: 'Hoàn thành', color: 'default' },
}

const GROUP_TYPE_MAP: Record<BookingGroupType, string> = {
  recurring: 'Lịch định kỳ',
  tournament: 'Giải đấu',
  corporate: 'Doanh nghiệp',
}

const DAY_MAP: Record<string, string> = {
  '0': 'CN',
  '1': 'T2',
  '2': 'T3',
  '3': 'T4',
  '4': 'T5',
  '5': 'T6',
  '6': 'T7',
}

export function BookingGroupDetailDrawer({
  group,
  open,
  onClose,
}: BookingGroupDetailDrawerProps) {
  const { data: fullGroup, isLoading } = useBookingGroupQuery(group?.bookingGroupID ?? 0)

  const detail = fullGroup ?? group
  if (!detail) return null

  const statusMeta = STATUS_MAP[detail.status]
  const rc = detail.recurringConfig

  const parsedDays = rc?.daysOfWeek
    ? rc.daysOfWeek
        .split(',')
        .map((d) => DAY_MAP[d.trim()] ?? d)
        .join(', ')
    : null

  const debtAmount = detail.totalAmount - detail.paidAmount

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={440}
      title={null}
      closeIcon={null}
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-50">
          <Spin />
        </div>
      ) : (
        <>
          {/* Header band */}
          <div className="bg-slate-50 border-b border-slate-200 p-5 pb-5 relative">
            <div className="absolute top-3 right-3">
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={onClose}
              />
            </div>
            <div className="flex flex-col gap-1.5 pr-9">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                {detail.groupType === 'recurring' ? <ReloadOutlined /> : <TeamOutlined />}
                &nbsp;{GROUP_TYPE_MAP[detail.groupType] ?? detail.groupType}
              </div>
              <h2 className="m-0 text-lg font-bold text-slate-900 leading-tight">
                {detail.groupName}
              </h2>
              <Tag
                color={statusMeta?.color}
                className="self-start rounded-full font-semibold text-[11px] px-2.5 py-0.5"
              >
                {statusMeta?.label ?? detail.status}
              </Tag>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto">
            {/* Finance summary */}
            <div className="flex items-stretch bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="flex-1 flex flex-col items-center gap-0.75 py-3 px-2">
                <span className="text-[11px] font-medium text-slate-400 text-center">
                  Tổng tiền
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatCompactCurrency(detail.totalAmount)}
                </span>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="flex-1 flex flex-col items-center gap-0.75 py-3 px-2">
                <span className="text-[11px] font-medium text-slate-400 text-center">
                  Đã thanh toán
                </span>
                <span className="text-sm font-bold text-emerald-500">
                  {formatCompactCurrency(detail.paidAmount)}
                </span>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="flex-1 flex flex-col items-center gap-0.75 py-3 px-2">
                <span className="text-[11px] font-medium text-slate-400 text-center">
                  Còn nợ
                </span>
                <span
                  className={`text-sm font-bold ${debtAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}
                >
                  {formatCompactCurrency(Math.max(0, debtAmount))}
                </span>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Basic info */}
            <Descriptions
              column={1}
              size="small"
              labelStyle={{ color: '#94a3b8', fontWeight: 500, fontSize: 12, width: 120 }}
              contentStyle={{ color: '#1e293b', fontWeight: 600, fontSize: 13 }}
              colon={false}
            >
              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined /> Ngày tạo
                  </span>
                }
              >
                {dayjs(detail.createdDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              {detail.customerID && (
                <Descriptions.Item label="Khách hàng">
                  #{detail.customerID}
                </Descriptions.Item>
              )}
              {detail.comboID && (
                <Descriptions.Item label="Combo áp dụng">
                  #{detail.comboID}
                </Descriptions.Item>
              )}
              {detail.note && (
                <Descriptions.Item label="Ghi chú">
                  <span style={{ fontStyle: 'italic', fontWeight: 400 }}>
                    {detail.note}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Recurring config */}
            {rc && (
              <>
                <Divider style={{ margin: '16px 0' }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <ClockCircleOutlined /> Cấu hình định kỳ
                  </span>
                </Divider>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                  <div className="flex flex-col gap-0.75">
                    <span className="text-[11px] font-medium text-slate-400">
                      Mã Sân đặt
                    </span>
                    <span className="text-[13px] text-slate-800 font-bold text-teal-650">
                      Sân #{rc.courtID}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.75">
                    <span className="text-[11px] font-medium text-slate-400">
                      Khung giờ
                    </span>
                    <span className="text-[13px] font-semibold text-indigo-650 text-indigo-600">
                      {rc.startTime?.substring(0, 5)} – {rc.endTime?.substring(0, 5)}
                    </span>
                  </div>
                  {parsedDays && (
                    <div className="flex flex-col gap-0.75 col-span-2">
                      <span className="text-[11px] font-medium text-slate-400">
                        Các ngày trong tuần
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {rc.daysOfWeek.split(',').map((d) => (
                          <span
                            key={d.trim()}
                            className="inline-flex items-center justify-center w-8 h-6 rounded bg-sky-100 text-sky-700 text-[11px] font-bold"
                          >
                            {DAY_MAP[d.trim()] ?? d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.75">
                    <span className="text-[11px] font-medium text-slate-400">
                      Ngày bắt đầu
                    </span>
                    <span className="text-[13px] font-semibold text-slate-800">
                      {dayjs(rc.startDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.75">
                    <span className="text-[11px] font-medium text-slate-400">
                      Ngày kết thúc
                    </span>
                    <span className="text-[13px] font-semibold text-slate-800">
                      {dayjs(rc.endDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.75 col-span-2">
                    <span className="text-[11px] font-medium text-slate-400">
                      Thời gian hoạt động
                    </span>
                    <span className="text-[13px] font-semibold text-slate-800">
                      Còn {Math.max(0, dayjs(rc.endDate).diff(dayjs(), 'day'))} ngày nữa
                    </span>
                  </div>
                </div>
              </>
            )}

            <Divider style={{ margin: '16px 0' }} />

            {/* Timeline progress */}
            <p
              className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"
              style={{ marginBottom: 12 }}
            >
              <DollarOutlined /> Trạng thái tài chính
            </p>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-0.5">
                        Đặt cọc / thanh toán trước
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {formatCompactCurrency(detail.paidAmount)}
                      </div>
                    </div>
                  ),
                },
                {
                  color: debtAmount > 0 ? 'red' : 'green',
                  children: (
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-0.5">
                        {debtAmount > 0 ? 'Còn nợ' : 'Đã thanh toán đủ'}
                      </div>
                      <div
                        className="text-sm font-bold text-slate-800"
                        style={{ color: debtAmount > 0 ? '#ef4444' : '#10b981' }}
                      >
                        {debtAmount > 0
                          ? `– ${formatCompactCurrency(debtAmount)}`
                          : '✓ Đầy đủ'}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </Drawer>
  )
}
