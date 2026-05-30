import { useState } from 'react'
import {
  Divider,
  Drawer,
  Button,
  Space,
  App,
  Spin,
  Select,
  DatePicker,
  Input,
  Modal,
  Form,
  InputNumber,
  Tag,
  Badge,
  Alert,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  SyncOutlined,
  WalletOutlined,
  FieldTimeOutlined,
  EditOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { formatCompactCurrency } from '@/utils/format'
import {
  useBookingSlotsQuery,
  useBookingServicesQuery,
  useUpdateBookingStatusMutation,
  usePayBookingMutation,
  useRescheduleBookingMutation,
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
  onRefresh?: () => void // Để load lại lịch sau khi thay đổi thành công
}

export function BookingDetailDrawer({
  booking: selectedBooking,
  open: isOpen,
  onClose,
  courts: courtList,
  onRefresh,
}: BookingDetailDrawerProps) {
  const { message } = App.useApp()

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const updateStatusMutation = useUpdateBookingStatusMutation()
  const payMutation = usePayBookingMutation()
  const rescheduleMutation = useRescheduleBookingMutation()

  const isActionLoading =
    updateStatusMutation.isPending ||
    payMutation.isPending ||
    rescheduleMutation.isPending

  // ─── States ──────────────────────────────────────────────────────────────────

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [payForm] = Form.useForm()

  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [rescheduleForm] = Form.useForm()

  // ─── Data Queries ───────────────────────────────────────────────────────────
  const { data: slotsData, isLoading: isSlotsLoading } = useBookingSlotsQuery(
    selectedBooking?.bookingID ?? null,
  )
  const { data: bookingServicesData, isLoading: isServicesLoading } =
    useBookingServicesQuery(selectedBooking?.bookingID ?? null)
  const { data: availableServicesData } = useServicesQuery({ page: 1, pageSize: 100 })

  if (!selectedBooking) return null

  const matchedCourt = courtList.find(
    (court) => court.courtID === selectedBooking.courtID,
  )
  const bookingSlots = slotsData ?? []
  const bookingServices = bookingServicesData ?? []
  const availableServices = availableServicesData?.items ?? []

  // ─── Price & Payment Info ────────────────────────────────────────────────────
  const totalServicesAmount = bookingServices.reduce(
    (sum, service) => sum + service.quantity * service.unitPrice,
    0,
  )
  const totalCourtAmount = Math.max(0, selectedBooking.totalAmount - totalServicesAmount)
  const paidAmount = (selectedBooking as Booking).paidAmount ?? 0
  const remainingAmount = Math.max(0, selectedBooking.totalAmount - paidAmount)

  // Get dynamic state color
  const getStatusBadgeStatus = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'warning'
      case 'Confirmed':
        return 'processing'
      case 'CheckedIn':
        return 'success'
      case 'Completed':
        return 'success'
      case 'Cancelled':
        return 'error'
      case 'NoShow':
        return 'default'
      default:
        return 'default'
    }
  }

  // Update Status directly
  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(
      { id: selectedBooking.bookingID, status: newStatus },
      {
        onSuccess: () => {
          message.success('Cập nhật trạng thái thành công!')
          onRefresh?.()
        },
        onError: () => message.error('Cập nhật trạng thái thất bại!'),
      },
    )
  }

  interface FormValues {
    amount?: number
    paymentMethod?: string
    note?: string
    courtId?: number
    bookingDate?: dayjs.Dayjs
    timeRange?: [dayjs.Dayjs, dayjs.Dayjs]
  }

  // Partial Payment
  const handlePaymentSubmit = (values: FormValues) => {
    payMutation.mutate(
      {
        id: selectedBooking.bookingID,
        data: {
          amount: values.amount!,
          paymentMethod: values.paymentMethod!,
          note: values.note || '',
        },
      },
      {
        onSuccess: () => {
          message.success('Ghi nhận thanh toán thành công!')
          setIsPayModalOpen(false)
          payForm.resetFields()
          onRefresh?.()
        },
        onError: () => message.error('Thanh toán thất bại!'),
      },
    )
  }

  // Reschedule Booking
  const handleRescheduleSubmit = (values: FormValues) => {
    rescheduleMutation.mutate(
      {
        id: selectedBooking.bookingID,
        data: {
          courtId: values.courtId!,
          bookingDate: values.bookingDate!.format('YYYY-MM-DD'),
          startTime: values.timeRange![0].format('HH:00:00'),
          endTime: values.timeRange![1].format('HH:00:00'),
        },
      },
      {
        onSuccess: () => {
          message.success('Dời lịch chơi thành công!')
          setIsRescheduleModalOpen(false)
          rescheduleForm.resetFields()
          onRefresh?.()
        },
        onError: () => message.error('Dời lịch chơi thất bại!'),
      },
    )
  }

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width={460}
      title={null}
      closeIcon={null}
      styles={{ body: { padding: '0 20px 20px' }, header: { display: 'none' } }}
    >
      {/* Header bar */}
      <div className="flex justify-between items-center pt-4 pb-2">
        <Space>
          <Badge status={getStatusBadgeStatus(selectedBooking.status)} />
          <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {selectedBooking.status}
          </span>
        </Space>
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} size="small" />
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Main Details */}
      <div className="flex justify-between items-center py-2 border-b border-slate-50">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
          <CalendarOutlined /> Ngày đặt
        </span>
        <span className="text-xs text-slate-800 font-bold">
          {new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-slate-50">
        <span className="text-xs text-slate-400 font-semibold">Sân chơi</span>
        <span className="text-xs text-slate-800 font-bold">
          {matchedCourt?.courtName || `Sân #${selectedBooking.courtID}`}
        </span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-slate-50">
        <span className="text-xs text-slate-400 font-semibold">Mã đơn hàng</span>
        <span className="text-xs text-slate-700 font-bold font-mono">
          {selectedBooking.bookingID}
        </span>
      </div>

      {/* Advanced Status Control Panel */}
      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
          <SyncOutlined /> Chuyển trạng thái nhanh
        </p>
        <Select
          className="w-full"
          placeholder="Chọn trạng thái mới..."
          value={selectedBooking.status}
          loading={isActionLoading}
          onChange={handleStatusChange}
          options={[
            { label: 'Chờ duyệt / Chờ cọc (Pending)', value: 'Pending' },
            { label: 'Đã xác nhận (Confirmed)', value: 'Confirmed' },
            { label: 'Đã nhận sân (CheckedIn)', value: 'CheckedIn' },
            { label: 'Hoàn tất buổi chơi (Completed)', value: 'Completed' },
            { label: 'Khách không đến (NoShow)', value: 'NoShow' },
            { label: 'Hủy đơn hàng (Cancelled)', value: 'Cancelled' },
          ]}
        />
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* Booking Slots */}
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
        <span>
          <ClockCircleOutlined /> Khung giờ chơi
        </span>
        {selectedBooking.status !== 'Completed' &&
          selectedBooking.status !== 'Cancelled' && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                rescheduleForm.setFieldsValue({
                  courtId: selectedBooking.courtID,
                  bookingDate: dayjs(selectedBooking.bookingDate),
                })
                setIsRescheduleModalOpen(true)
              }}
            >
              Dời lịch chơi
            </Button>
          )}
      </p>
      {isSlotsLoading ? (
        <div className="flex justify-center p-3">
          <Spin size="small" />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {bookingSlots.length === 0 && (
            <p className="text-xs text-slate-400 italic">Không có dữ liệu khung giờ</p>
          )}
          {bookingSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex justify-between items-center px-3 py-2 rounded-lg bg-teal-50/50 border border-teal-100 text-xs font-bold text-teal-800"
            >
              <span>
                ⏱️ {slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Services */}
      <Divider style={{ margin: '14px 0' }} />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        📦 Dịch vụ đi kèm & Quản lý kho
      </p>
      {isServicesLoading ? (
        <div className="flex justify-center p-3">
          <Spin size="small" />
        </div>
      ) : (
        <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          {bookingServices.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-2">
              Không có dịch vụ đi kèm
            </p>
          )}
          {bookingServices.map((bookingService) => {
            const serviceDetail = availableServices.find(
              (service) => service.serviceID === bookingService.serviceID,
            )
            return (
              <div
                key={bookingService.bookingServiceID}
                className="flex justify-between text-xs items-center"
              >
                <span className="text-slate-700 font-medium">
                  {serviceDetail?.serviceName || `Dịch vụ #${bookingService.serviceID}`} ×{' '}
                  {bookingService.quantity}
                  {serviceDetail?.isTrackStock && (
                    <Tag color="cyan" className="ml-2 scale-90">
                      Theo dõi Kho ({serviceDetail.stockQuantity})
                    </Tag>
                  )}
                </span>
                <span className="font-bold text-slate-800">
                  {formatCompactCurrency(
                    bookingService.quantity * bookingService.unitPrice,
                  )}
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
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Ghi chú đơn
          </p>
          <p className="text-xs text-slate-600 bg-amber-50 p-2 rounded border border-amber-100 italic">
            {selectedBooking.note}
          </p>
        </>
      )}

      {/* Financial Calculations & Payment */}
      <Divider style={{ margin: '14px 0' }} />
      <div className="flex flex-col gap-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Tiền sân chơi</span>
          <span>{formatCompactCurrency(totalCourtAmount)}</span>
        </div>
        {totalServicesAmount > 0 && (
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Dịch vụ bán kèm</span>
            <span>{formatCompactCurrency(totalServicesAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1.5 text-sm">
          <span>Tổng tiền hóa đơn</span>
          <span className="text-teal-600">
            {formatCompactCurrency(selectedBooking.totalAmount)}
          </span>
        </div>
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Đã thanh toán (PaidAmount)</span>
          <span className="text-emerald-600 font-bold">
            {formatCompactCurrency(paidAmount)}
          </span>
        </div>
        <div className="flex justify-between text-slate-800 font-extrabold border-t border-dashed border-slate-200 pt-1.5 text-sm bg-teal-50/20 px-1 py-0.5">
          <span>Còn lại phải thu</span>
          <span className="text-rose-600">{formatCompactCurrency(remainingAmount)}</span>
        </div>

        {remainingAmount > 0 && selectedBooking.status !== 'Cancelled' && (
          <Button
            type="primary"
            size="small"
            icon={<WalletOutlined />}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              payForm.setFieldsValue({ amount: remainingAmount, paymentMethod: 'Cash' })
              setIsPayModalOpen(true)
            }}
          >
            Ghi nhận thanh toán
          </Button>
        )}
      </div>

      {/* Form Modal Thanh toán cọc */}
      <Modal
        title={
          <span className="flex items-center gap-2 font-extrabold text-slate-800 text-base">
            <WalletOutlined className="text-emerald-600" /> Ghi nhận thanh toán hóa đơn
          </span>
        }
        open={isPayModalOpen}
        onCancel={() => setIsPayModalOpen(false)}
        footer={null}
        destroyOnClose
        className="rounded-2xl overflow-hidden"
      >
        <Form form={payForm} layout="vertical" onFinish={handlePaymentSubmit}>
          <Form.Item
            name="amount"
            label={
              <span className="text-xs font-bold text-slate-600">
                Số tiền thanh toán (VNĐ)
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
          >
            <InputNumber
              className="w-full"
              min={1}
              max={remainingAmount}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label={
              <span className="text-xs font-bold text-slate-600">
                Phương thức thanh toán
              </span>
            }
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Select.Option value="Cash">💵 Tiền mặt (Cash)</Select.Option>
              <Select.Option value="BankTransfer">
                🏦 Chuyển khoản (Bank Transfer)
              </Select.Option>
              <Select.Option value="CreditCard">
                💳 Thẻ tín dụng (Credit Card)
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="note"
            label={
              <span className="text-xs font-bold text-slate-600">Ghi chú giao dịch</span>
            }
          >
            <Input.TextArea
              rows={2}
              placeholder="Ví dụ: Khách chuyển khoản đặt cọc 50%..."
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsPayModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isActionLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Ghi nhận thanh toán
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Form Modal Dời lịch chơi */}
      <Modal
        title={
          <span className="flex items-center gap-2 font-extrabold text-slate-800 text-base">
            <FieldTimeOutlined className="text-purple-600" /> Dời lịch chơi đặt sân
          </span>
        }
        open={isRescheduleModalOpen}
        onCancel={() => setIsRescheduleModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={rescheduleForm} layout="vertical" onFinish={handleRescheduleSubmit}>
          <Form.Item
            name="courtId"
            label={
              <span className="text-xs font-bold text-slate-600">Chọn sân chơi mới</span>
            }
            rules={[{ required: true }]}
          >
            <Select size="large">
              {courtList.map((c) => (
                <Select.Option key={c.courtID} value={c.courtID}>
                  🏟️ {c.courtName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="bookingDate"
            label={
              <span className="text-xs font-bold text-slate-600">Ngày chơi mới</span>
            }
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" size="large" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label={
              <span className="text-xs font-bold text-slate-600">
                Khung giờ mới (Mỗi slot 1 tiếng)
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng chọn khung giờ mới!' }]}
          >
            <DatePicker.RangePicker
              className="w-full"
              size="large"
              picker="time"
              format="HH:00"
              placeholder={['Giờ bắt đầu', 'Giờ kết thúc']}
            />
          </Form.Item>

          <Alert
            message="Lưu ý quan trọng"
            description="Hệ thống sẽ tự động tính toán lại tiền sân dựa trên bảng giá tại thời điểm mới. Các dịch vụ đi kèm và số tiền đã thanh toán trước đó sẽ được giữ nguyên."
            type="info"
            showIcon
            className="mb-4 text-xs"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsRescheduleModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isActionLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Cập nhật lịch chơi
            </Button>
          </div>
        </Form>
      </Modal>
    </Drawer>
  )
}
