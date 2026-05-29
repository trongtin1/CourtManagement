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
        <div className="group-drawer-loading">
          <Spin />
        </div>
      ) : (
        <>
          {/* Header band */}
          <div className="group-drawer-header">
            <div className="group-drawer-close">
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={onClose}
              />
            </div>
            <div className="group-drawer-title-block">
              <div className="group-drawer-type">
                {detail.groupType === 'recurring' ? <ReloadOutlined /> : <TeamOutlined />}
                &nbsp;{GROUP_TYPE_MAP[detail.groupType] ?? detail.groupType}
              </div>
              <h2 className="group-drawer-name">{detail.groupName}</h2>
              <Tag color={statusMeta?.color} className="group-drawer-status-tag">
                {statusMeta?.label ?? detail.status}
              </Tag>
            </div>
          </div>

          {/* Body */}
          <div className="group-drawer-body">
            {/* Finance summary */}
            <div className="group-finance-row">
              <div className="group-finance-item">
                <span className="group-finance-label">Tổng tiền</span>
                <span className="group-finance-value">
                  {formatCompactCurrency(detail.totalAmount)}
                </span>
              </div>
              <div className="group-finance-divider" />
              <div className="group-finance-item">
                <span className="group-finance-label">Đã thanh toán</span>
                <span className="group-finance-value group-finance-value--paid">
                  {formatCompactCurrency(detail.paidAmount)}
                </span>
              </div>
              <div className="group-finance-divider" />
              <div className="group-finance-item">
                <span className="group-finance-label">Còn nợ</span>
                <span
                  className={`group-finance-value ${debtAmount > 0 ? 'group-finance-value--debt' : 'group-finance-value--clear'}`}
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
                  <span className="drawer-section-title">
                    <ClockCircleOutlined /> Cấu hình định kỳ
                  </span>
                </Divider>

                <div className="recurring-detail-grid">
                  <div className="recurring-detail-item">
                    <span className="recurring-detail-label">Mã Sân đặt</span>
                    <span className="recurring-detail-value font-bold text-teal-650">
                      Sân #{rc.courtID}
                    </span>
                  </div>
                  <div className="recurring-detail-item">
                    <span className="recurring-detail-label">Khung giờ</span>
                    <span className="recurring-detail-value text-indigo-600 font-bold">
                      {rc.startTime?.substring(0, 5)} – {rc.endTime?.substring(0, 5)}
                    </span>
                  </div>
                  {parsedDays && (
                    <div className="recurring-detail-item recurring-detail-item--full">
                      <span className="recurring-detail-label">Các ngày trong tuần</span>
                      <div className="recurring-days-list">
                        {rc.daysOfWeek.split(',').map((d) => (
                          <span key={d.trim()} className="recurring-day-chip">
                            {DAY_MAP[d.trim()] ?? d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="recurring-detail-item">
                    <span className="recurring-detail-label">Ngày bắt đầu</span>
                    <span className="recurring-detail-value">
                      {dayjs(rc.startDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="recurring-detail-item">
                    <span className="recurring-detail-label">Ngày kết thúc</span>
                    <span className="recurring-detail-value">
                      {dayjs(rc.endDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="recurring-detail-item recurring-detail-item--full">
                    <span className="recurring-detail-label">Thời gian hoạt động</span>
                    <span className="recurring-detail-value">
                      Còn {Math.max(0, dayjs(rc.endDate).diff(dayjs(), 'day'))} ngày nữa
                    </span>
                  </div>
                </div>
              </>
            )}

            <Divider style={{ margin: '16px 0' }} />

            {/* Timeline progress */}
            <p className="drawer-section-title" style={{ marginBottom: 12 }}>
              <DollarOutlined /> Trạng thái tài chính
            </p>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="timeline-item-label">
                        Đặt cọc / thanh toán trước
                      </div>
                      <div className="timeline-item-value">
                        {formatCompactCurrency(detail.paidAmount)}
                      </div>
                    </div>
                  ),
                },
                {
                  color: debtAmount > 0 ? 'red' : 'green',
                  children: (
                    <div>
                      <div className="timeline-item-label">
                        {debtAmount > 0 ? 'Còn nợ' : 'Đã thanh toán đủ'}
                      </div>
                      <div
                        className="timeline-item-value"
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
