import { Divider, Drawer, Button, Tag, Space, Popconfirm, App } from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  CloseOutlined,
} from '@ant-design/icons'

import {
  MOCK_CUSTOMERS,
  MOCK_COURTS,
  MOCK_SERVICES,
  STATUS_CONFIG,
  PAYMENT_CONFIG,
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

  const cust = MOCK_CUSTOMERS.find((c) => c.customerID === booking.customerID)
  const court = MOCK_COURTS.find((c) => c.courtID === booking.courtID)
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
      <div className="flex items-center gap-3 py-4 border-b border-slate-100 mb-4">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0"
          style={{ background: statusCfg.color }}
        >
          {cust?.avatar ?? '?'}
        </div>
        <div>
          <h4 className="m-0 text-base font-semibold text-slate-800 leading-tight">
            {cust?.fullName ?? 'Khách vãng lai'}
          </h4>
          <p className="mt-1 flex items-center gap-1">
            <Tag
              color={statusCfg.color}
              bordered={false}
              style={{ fontSize: 11, marginRight: 0 }}
            >
              {statusCfg.label}
            </Tag>
            {cust?.customerType && (
              <Tag bordered={false} style={{ fontSize: 11 }}>
                {cust.customerType}
              </Tag>
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
      <div className="flex justify-between items-center py-2.5 border-b border-slate-50 text-slate-700">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <CalendarOutlined /> Ngày đặt
        </span>
        <span className="text-xs text-slate-800 font-semibold text-right">
          {new Date(booking.bookingDate).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="flex justify-between items-center py-2.5 border-b border-slate-50 text-slate-700">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          Sân
        </span>
        <span className="text-xs text-slate-800 font-semibold text-right">
          {court?.courtName ?? `Sân #${booking.courtID}`}
        </span>
      </div>
      <div className="flex justify-between items-center py-2.5 border-b border-slate-50 text-slate-700">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          Thanh toán
        </span>
        <span
          className="text-xs font-semibold text-right"
          style={{ color: payCfg.color }}
        >
          {payCfg.label}
        </span>
      </div>
      <div className="flex justify-between items-center py-2.5 border-b border-slate-50 text-slate-700">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          Mã booking
        </span>
        <span className="text-xs text-slate-800 font-semibold text-right font-mono">
          {booking.bookingID}
        </span>
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* Slots */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <ClockCircleOutlined /> Khung giờ đã đặt
        </p>
        <div className="flex flex-col gap-1.5 mt-2">
          {booking.slots.map((sl) => (
            <div
              key={sl.timeSlotID}
              className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600"
            >
              <span>
                {sl.startTime} – {sl.endTime}
              </span>
              <span className="text-emerald-600 font-bold">
                {formatCompactCurrency(sl.price)}
              </span>
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
            {booking.services.map((sv) => {
              const svc = MOCK_SERVICES.find((s) => s.serviceID === sv.serviceID)
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
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Ghi chú
          </p>
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
          <Button
            type="primary"
            block
            onClick={() => message.success('Đã xác nhận booking')}
          >
            Xác nhận booking
          </Button>
        )}
        {(booking.status === 'confirmed' || booking.status === 'playing') &&
          booking.paymentStatus !== 'paid' && (
            <Button
              block
              style={{ borderColor: '#10b981', color: '#10b981' }}
              onClick={() => message.success('Đã ghi nhận thanh toán')}
            >
              Ghi nhận thanh toán
            </Button>
          )}
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <Popconfirm
            title="Xác nhận hủy booking?"
            onConfirm={() => message.info('Đã hủy booking')}
          >
            <Button danger block>
              Hủy booking
            </Button>
          </Popconfirm>
        )}
      </Space>
    </Drawer>
  )
}
