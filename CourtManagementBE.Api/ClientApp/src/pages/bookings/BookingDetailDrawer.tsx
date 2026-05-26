import { Divider, Drawer, Button, Tag, Space, Popconfirm, App } from 'antd'
import {
  CalendarOutlined, ClockCircleOutlined, PhoneOutlined,
  MailOutlined, DollarOutlined, CloseOutlined,
} from '@ant-design/icons'

import {
  MOCK_CUSTOMERS, MOCK_COURTS, MOCK_SERVICES,
  STATUS_CONFIG, PAYMENT_CONFIG,
  type MockBooking,
} from './mockData'
import { formatCompactCurrency } from '@/utils/format'

interface Props {
  booking: MockBooking | null
  open: boolean
  onClose: () => void
}

export function BookingDetailDrawer({ booking, open, onClose }: Props) {
  const { message } = App.useApp()
  if (!booking) return null

  const cust = MOCK_CUSTOMERS.find(c => c.customerID === booking.customerID)
  const court = MOCK_COURTS.find(c => c.courtID === booking.courtID)
  const statusCfg = STATUS_CONFIG[booking.status]
  const payCfg = PAYMENT_CONFIG[booking.paymentStatus]
  const slotsTotal = booking.slots.reduce((s, sl) => s + sl.price, 0)
  const svcTotal = booking.services.reduce((s, sv) => s + sv.quantity * sv.unitPrice, 0)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={400}
      title={null}
      closeIcon={null}
      styles={{ body: { padding: '0 20px 20px' }, header: { display: 'none' } }}
    >
      {/* Close */}
      <div className="flex justify-end pt-3">
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} size="small" />
      </div>

      {/* Customer header */}
      <div className="booking-detail-header">
        <div
          className="booking-detail-avatar"
          style={{ background: statusCfg.color }}
        >
          {cust?.avatar ?? '?'}
        </div>
        <div className="booking-detail-info">
          <h4>{cust?.fullName ?? 'Khách vãng lai'}</h4>
          <p>
            <Tag color={statusCfg.color} bordered={false} style={{ fontSize: 11, marginRight: 4 }}>
              {statusCfg.label}
            </Tag>
            {cust?.customerType && (
              <Tag bordered={false} style={{ fontSize: 11 }}>{cust.customerType}</Tag>
            )}
          </p>
        </div>
      </div>

      {/* Contact */}
      {cust && (
        <div className="mb-3 flex flex-col gap-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <PhoneOutlined /> {cust.phone}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <MailOutlined /> {cust.email}
          </span>
        </div>
      )}

      {/* Info rows */}
      <div className="detail-row">
        <span className="detail-label"><CalendarOutlined /> Ngày đặt</span>
        <span className="detail-value">
          {new Date(booking.bookingDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Sân</span>
        <span className="detail-value">{court?.courtName ?? `Sân #${booking.courtID}`}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Thanh toán</span>
        <span className="detail-value" style={{ color: payCfg.color }}>{payCfg.label}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Mã booking</span>
        <span className="detail-value font-mono text-xs">{booking.bookingID}</span>
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* Slots */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <ClockCircleOutlined /> Khung giờ đã đặt
        </p>
        <div className="detail-slots-list">
          {booking.slots.map(sl => (
            <div key={sl.timeSlotID} className="detail-slot-chip">
              <span>{sl.startTime} – {sl.endTime}</span>
              <span className="chip-price">{formatCompactCurrency(sl.price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      {booking.services.length > 0 && (
        <>
          <Divider style={{ margin: '14px 0' }} />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Dịch vụ đi kèm
          </p>
          <div className="flex flex-col gap-2">
            {booking.services.map(sv => {
              const svc = MOCK_SERVICES.find(s => s.serviceID === sv.serviceID)
              return (
                <div key={sv.serviceID} className="flex justify-between text-sm">
                  <span className="text-slate-700">
                    {svc?.icon} {svc?.serviceName} × {sv.quantity}
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatCompactCurrency(sv.quantity * sv.unitPrice)}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Note */}
      {booking.note && (
        <>
          <Divider style={{ margin: '14px 0' }} />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ghi chú</p>
          <p className="text-sm text-slate-600 italic">{booking.note}</p>
        </>
      )}

      {/* Total */}
      <Divider style={{ margin: '14px 0' }} />
      <div className="flex flex-col gap-1 text-sm mb-1">
        <div className="flex justify-between text-slate-500">
          <span>Tiền sân</span>
          <span>{formatCompactCurrency(slotsTotal)}</span>
        </div>
        {svcTotal > 0 && (
          <div className="flex justify-between text-slate-500">
            <span>Dịch vụ</span>
            <span>{formatCompactCurrency(svcTotal)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-base font-bold text-slate-800">
          <DollarOutlined /> Tổng cộng
        </span>
        <span className="text-xl font-extrabold text-teal-600">
          {formatCompactCurrency(booking.totalAmount)}
        </span>
      </div>

      {/* Actions */}
      <Divider style={{ margin: '16px 0 12px' }} />
      <Space className="w-full" direction="vertical" size={8}>
        {booking.status === 'pending' && (
          <Button type="primary" block onClick={() => message.success('Đã xác nhận booking')}>
            Xác nhận booking
          </Button>
        )}
        {(booking.status === 'confirmed' || booking.status === 'playing') && booking.paymentStatus !== 'paid' && (
          <Button block style={{ borderColor: '#10b981', color: '#10b981' }}
            onClick={() => message.success('Đã ghi nhận thanh toán')}>
            Ghi nhận thanh toán
          </Button>
        )}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <Popconfirm title="Xác nhận hủy booking?" onConfirm={() => message.info('Đã hủy booking')}>
            <Button danger block>Hủy booking</Button>
          </Popconfirm>
        )}
      </Space>
    </Drawer>
  )
}
