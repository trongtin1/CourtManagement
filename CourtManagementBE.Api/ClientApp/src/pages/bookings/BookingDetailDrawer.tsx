import { Divider, Drawer, Button, Space, Popconfirm, App, Spin } from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CloseOutlined,
} from '@ant-design/icons'

import { formatCompactCurrency } from '@/utils/format'
import {
  useBookingSlotsQuery,
  useBookingServicesQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
} from '@/features/bookings/api/useBookingQueries'
import { useServicesQuery } from '@/features/services/api/useServiceQueries'

import type { Booking } from '@/features/bookings/model/types'
import type {
  CourtTimelineAvailability,
  TimelineBookingResponse,
} from '@/features/courts/model/types'

type AnyBooking = Booking | TimelineBookingResponse

interface BookingDetailDrawerProps {
  booking: AnyBooking | null
  open: boolean
  onClose: () => void
  courts: CourtTimelineAvailability[]
}

export function BookingDetailDrawer({
  booking: selectedBooking,
  open: isOpen,
  onClose,
  courts: courtList,
}: BookingDetailDrawerProps) {
  const { message } = App.useApp()
  const updateBooking = useUpdateBookingMutation()
  const cancelBooking = useCancelBookingMutation()

  // ─── Data Queries ───────────────────────────────────────────────────────────
  const { data: slotsData, isLoading: isSlotsLoading } = useBookingSlotsQuery(
    selectedBooking?.bookingID ?? null,
  )
  const { data: bookingServicesData, isLoading: isServicesLoading } = useBookingServicesQuery(
    selectedBooking?.bookingID ?? null,
  )
  const { data: availableServicesData } = useServicesQuery({ page: 1, pageSize: 100 })

  if (!selectedBooking) return null

  // Find the matching court details
  const matchedCourt = courtList.find((court) => court.courtID === selectedBooking.courtID)

  const bookingSlots = slotsData ?? []
  const bookingServices = bookingServicesData ?? []
  const availableServices = availableServicesData?.items ?? []

  // ─── Price Calculations ──────────────────────────────────────────────────────
  const totalServicesAmount = bookingServices.reduce(
    (sum, service) => sum + service.quantity * service.unitPrice,
    0,
  )
  const totalCourtAmount = Math.max(0, selectedBooking.totalAmount - totalServicesAmount)

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    try {
      await updateBooking.mutateAsync({
        id: selectedBooking.bookingID,
        data: { status: 'Confirmed' },
      })
      message.success('Đã xác nhận booking')
    } catch {
      message.error('Không thể xác nhận booking')
    }
  }

  const handlePayment = async () => {
    try {
      await updateBooking.mutateAsync({
        id: selectedBooking.bookingID,
        data: { status: 'Completed' },
      })
      message.success('Đã ghi nhận thanh toán và hoàn tất')
    } catch {
      message.error('Không thể ghi nhận thanh toán')
    }
  }

  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync({
        id: selectedBooking.bookingID,
        data: { cancellationReason: 'Khách yêu cầu hủy qua giao diện' },
      })
      message.success('Đã hủy booking thành công')
      onClose()
    } catch {
      message.error('Không thể hủy booking')
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width={400}
      title={null}
      closeIcon={null}
      styles={{ body: { padding: '0 20px 20px' }, header: { display: 'none' } }}
    >
      {/* Close Button */}
      <div className="flex justify-end pt-3">
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} size="small" />
      </div>

      {/* Booking Details Grid */}
      <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <CalendarOutlined /> Ngày đặt
        </span>
        <span className="text-xs text-slate-800 font-semibold">
          {new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
        <span className="text-xs text-slate-400 font-medium">Sân</span>
        <span className="text-xs text-slate-800 font-semibold">
          {matchedCourt?.courtName || `Sân #${selectedBooking.courtID}`}
        </span>
      </div>
      <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
        <span className="text-xs text-slate-400 font-medium">Mã booking</span>
        <span className="text-xs text-slate-800 font-semibold font-mono">
          {selectedBooking.bookingID}
        </span>
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* Booking Slots */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        <ClockCircleOutlined /> Khung giờ đã đặt
      </p>
      {isSlotsLoading ? (
        <div className="flex justify-center p-3">
          <Spin size="small" />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 mt-2">
          {bookingSlots.length === 0 && (
            <p className="text-xs text-slate-400 italic">Không có dữ liệu khung giờ</p>
          )}
          {bookingSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600"
            >
              <span>
                {slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Services */}
      <Divider style={{ margin: '14px 0' }} />
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Dịch vụ đi kèm
      </p>
      {isServicesLoading ? (
        <div className="flex justify-center p-3">
          <Spin size="small" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {bookingServices.length === 0 && (
            <p className="text-xs text-slate-400 italic">Không có dịch vụ đi kèm</p>
          )}
          {bookingServices.map((bookingService) => {
            const serviceDetail = availableServices.find(
              (service) => service.serviceID === bookingService.serviceID,
            )
            return (
              <div key={bookingService.bookingServiceID} className="flex justify-between text-xs">
                <span className="text-slate-700">
                  📦 {serviceDetail?.serviceName || `Dịch vụ #${bookingService.serviceID}`} × {bookingService.quantity}
                </span>
                <span className="font-bold text-slate-800">
                  {formatCompactCurrency(bookingService.quantity * bookingService.unitPrice)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Note */}
      {selectedBooking.note && (
        <>
          <Divider style={{ margin: '14px 0' }} />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Ghi chú
          </p>
          <p className="text-sm text-slate-600 italic">{selectedBooking.note}</p>
        </>
      )}

      {/* Total Calculations */}
      <Divider style={{ margin: '14px 0' }} />
      <div className="flex flex-col gap-1 text-sm mb-1">
        <div className="flex justify-between text-slate-500">
          <span>Tiền sân</span>
          <span>{formatCompactCurrency(totalCourtAmount)}</span>
        </div>
        {totalServicesAmount > 0 && (
          <div className="flex justify-between text-slate-500">
            <span>Dịch vụ</span>
            <span>{formatCompactCurrency(totalServicesAmount)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-base font-bold text-slate-800">
          <DollarOutlined /> Tổng cộng
        </span>
        <span className="text-xl font-extrabold text-teal-600">
          {formatCompactCurrency(selectedBooking.totalAmount)}
        </span>
      </div>

      {/* Action Buttons */}
      <Divider style={{ margin: '16px 0 12px' }} />
      <Space className="w-full" direction="vertical" size={8}>
        {selectedBooking.status === 'Pending' && (
          <Button
            type="primary"
            block
            loading={updateBooking.isPending}
            onClick={handleConfirm}
          >
            Xác nhận booking
          </Button>
        )}
        {selectedBooking.status === 'Confirmed' && (
          <Button
            block
            style={{ borderColor: '#10b981', color: '#10b981' }}
            loading={updateBooking.isPending}
            onClick={handlePayment}
          >
            Hoàn tất booking
          </Button>
        )}
        {selectedBooking.status !== 'Cancelled' && selectedBooking.status !== 'Completed' && (
          <Popconfirm
            title="Xác nhận hủy booking này?"
            onConfirm={handleCancel}
            okButtonProps={{ loading: cancelBooking.isPending }}
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
