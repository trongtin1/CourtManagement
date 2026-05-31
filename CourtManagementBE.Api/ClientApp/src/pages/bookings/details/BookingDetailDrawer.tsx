import { useState } from 'react'
import {
  Divider,
  Drawer,
  Button,
  App,
  Spin,
  Select,
  Tooltip,
  Input,
  Modal,
  Form,
  InputNumber,
  Tag,
  Alert,
} from 'antd'
import {
  CalendarOutlined,
  CloseOutlined,
  SyncOutlined,
  WalletOutlined,
  FieldTimeOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { formatCompactCurrency } from '@/utils/format'
import {
  useUpdateBookingStatusMutation,
  usePayBookingMutation,
  useRescheduleBookingMutation,
  useBookingStatusesQuery,
  useCreateBookingServiceMutation,
  useUpdateBookingServiceMutation,
  useDeleteBookingServiceMutation,
  useBookingQuery,
} from '@/features/bookings/api/useBookingQueries'
import { useServicesQuery } from '@/features/services/api/useServiceQueries'
import { useCombosQuery } from '@/features/combos/api/useComboQueries'
import { useCourtSlotsAvailabilityQuery } from '@/features/courts/api/useCourtQueries'

import type { Booking } from '@/features/bookings/model/types'
import type {
  CourtSlotAvailability,
  CourtTimelineAvailability,
  TimelineBookingResponse,
} from '@/features/courts/model/types'
import { BookingStatusConstants } from '@/features/bookings/constants/bookingStatusConstants'

const formatTimeSpan = (timeStr: string) => {
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0')
    const mm = parts[1].padStart(2, '0')
    const ss = parts[2] ? parts[2].substring(0, 2).padStart(2, '0') : '00'
    return `${hh}:${mm}:${ss}`
  }
  return timeStr
}

type AnyBooking = Booking | TimelineBookingResponse

interface BookingDetailDrawerProps {
  booking: AnyBooking | null
  open: boolean
  onClose: () => void
  courts: CourtTimelineAvailability[]
  onRefresh?: () => void
}

export function BookingDetailDrawer({
  booking: initialBooking,
  open: isOpen,
  onClose,
  courts: courtList,
  onRefresh,
}: BookingDetailDrawerProps) {
  const { message } = App.useApp()

  // ─── Data Query: Fetch complete booking detail by ID with eager-loaded relations ───
  const { data: dbBooking, isLoading: isBookingLoading } = useBookingQuery(
    initialBooking?.bookingID ?? '',
  )
  const selectedBooking = dbBooking || initialBooking

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
  const [selectedRescheduleSlots, setSelectedRescheduleSlots] = useState<number[]>([])
  const [optimisticStatus, setOptimisticStatus] = useState<{
    bookingId: string | number | null
    status: string | null
  }>({ bookingId: null, status: null })
  const selectedBookingDate = selectedBooking
    ? dayjs(selectedBooking.bookingDate).format('YYYY-MM-DD')
    : ''

  // Service Management Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [serviceForm] = Form.useForm()
  const [selectedAddServiceId, setSelectedAddServiceId] = useState<number | null>(null)

  // Booking Service Mutations
  const createServiceMutation = useCreateBookingServiceMutation()
  const updateServiceMutation = useUpdateBookingServiceMutation()
  const deleteServiceMutation = useDeleteBookingServiceMutation()

  const handleAddService = (serviceID: number, quantity: number) => {
    if (!selectedBooking) return

    const serviceDetail = availableServices.find((s) => s.serviceID === serviceID)
    if (!serviceDetail) return

    createServiceMutation.mutate(
      {
        bookingID: selectedBooking.bookingID as string,
        serviceID,
        quantity,
        unitPrice: serviceDetail.price,
        discountAmount: 0,
        status: 'active',
      },
      {
        onSuccess: () => {
          message.success('Thêm dịch vụ thành công!')
          onRefresh?.()
        },
        onError: (error) => {
          const fallback = 'Thêm dịch vụ thất bại!'
          const serverMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || fallback
          message.error(serverMessage)
        },
      },
    )
  }

  const handleUpdateServiceQty = (bookingServiceID: number, newQty: number) => {
    if (!selectedBooking) return

    if (newQty <= 0) {
      handleDeleteService(bookingServiceID)
      return
    }

    updateServiceMutation.mutate(
      {
        id: bookingServiceID,
        bookingID: selectedBooking.bookingID as string,
        data: {
          quantity: newQty,
        },
      },
      {
        onSuccess: () => {
          message.success('Cập nhật số lượng thành công!')
          onRefresh?.()
        },
        onError: (error) => {
          const fallback = 'Cập nhật số lượng thất bại!'
          const serverMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || fallback
          message.error(serverMessage)
        },
      },
    )
  }

  const handleDeleteService = (bookingServiceID: number) => {
    if (!selectedBooking) return

    deleteServiceMutation.mutate(
      {
        id: bookingServiceID,
        bookingID: selectedBooking.bookingID as string,
      },
      {
        onSuccess: () => {
          message.success('Xóa dịch vụ thành công!')
          onRefresh?.()
        },
        onError: (error) => {
          const fallback = 'Xóa dịch vụ thất bại!'
          const serverMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || fallback
          message.error(serverMessage)
        },
      },
    )
  }

  // ─── Data Queries ───────────────────────────────────────────────────────────
  const { data: availableServicesData } = useServicesQuery()
  const { data: availableCombosData } = useCombosQuery()
  const { data: statusesData, isLoading: isStatusesLoading } = useBookingStatusesQuery()
  const rescheduleSlotsQuery = useCourtSlotsAvailabilityQuery(
    selectedBooking?.courtID ?? null,
    selectedBookingDate,
  )

  const isSlotsLoading = isBookingLoading
  const isServicesLoading = isBookingLoading

  if (!selectedBooking) return null

  const matchedCourt = courtList.find(
    (court) => court.courtID === selectedBooking.courtID,
  )
  const bookingSlots = (selectedBooking as Booking).bookingSlots ?? []
  const rescheduleSlots = rescheduleSlotsQuery.data ?? []
  const bookingServices = (selectedBooking as Booking).bookingServices ?? []
  const availableServices = availableServicesData?.items ?? []
  const bookingCombos = (selectedBooking as Booking).bookingCombos ?? []
  const availableCombos = availableCombosData?.items ?? []
  const displayStatus =
    optimisticStatus.bookingId === selectedBooking.bookingID && optimisticStatus.status
      ? optimisticStatus.status
      : selectedBooking.status

  const matchedStatusOption = (statusesData ?? []).find(
    (opt) =>
      opt.code === displayStatus ||
      opt.value.toLowerCase() === displayStatus.toLowerCase(),
  )
  const selectValue = matchedStatusOption ? matchedStatusOption.code : displayStatus
  const isTerminalStatus = matchedStatusOption ? matchedStatusOption.isTerminal : false
  const isRescheduleAllowed = matchedStatusOption
    ? matchedStatusOption.canReschedule
    : false
  const isAddServiceAllowed = matchedStatusOption
    ? matchedStatusOption.canService
    : false

  const statusOptions = (statusesData ?? []).map((option) => {
    const currentCode = matchedStatusOption
      ? matchedStatusOption.code
      : BookingStatusConstants.Pending
    const isFinishedWorkflowStatus =
      option.code <= currentCode && option.code !== currentCode

    return {
      label: option.label,
      value: option.code,
      disabled: isTerminalStatus || isFinishedWorkflowStatus,
    }
  })

  const totalServicesAmount = bookingServices.reduce(
    (sum, service) => sum + service.quantity * service.unitPrice,
    0,
  )
  const totalCombosAmount = bookingCombos.reduce(
    (sum, combo) => sum + combo.quantity * combo.unitPrice,
    0,
  )
  const totalCourtAmount = Math.max(
    0,
    selectedBooking.totalAmount - totalServicesAmount - totalCombosAmount,
  )
  const paidAmount = (selectedBooking as Booking).paidAmount ?? 0
  const remainingAmount = Math.max(0, selectedBooking.totalAmount - paidAmount)
  const isPaymentAllowed =
    (!matchedStatusOption || !matchedStatusOption.isTerminal) && remainingAmount > 0

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(
      { id: selectedBooking.bookingID, status: newStatus },
      {
        onSuccess: () => {
          setOptimisticStatus({
            bookingId: selectedBooking.bookingID,
            status: newStatus,
          })
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
  }

  const isCurrentBookingSlot = (slot: CourtSlotAvailability) =>
    bookingSlots.some(
      (bookingSlot) =>
        formatTimeSpan(bookingSlot.startTime) === formatTimeSpan(slot.startTime) &&
        formatTimeSpan(bookingSlot.endTime) === formatTimeSpan(slot.endTime),
    )

  const isRescheduleSlotLocked = (slot: CourtSlotAvailability) => {
    if (isCurrentBookingSlot(slot)) return false
    return slot.isLocked || slot.isBooked
  }

  const toggleRescheduleSlot = (slotIndex: number) => {
    setSelectedRescheduleSlots((current) =>
      current.includes(slotIndex)
        ? current.filter((id) => id !== slotIndex)
        : [...current, slotIndex],
    )
  }

  // Partial Payment
  const handlePaymentSubmit = (values: FormValues) => {
    if (!isPaymentAllowed) {
      message.warning('Đơn này không thể ghi nhận thêm thanh toán.')
      return
    }

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
        onError: (error) => {
          const fallbackMessage = 'Thanh toán thất bại!'
          const serverMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? fallbackMessage
          message.error(serverMessage)
        },
      },
    )
  }

  // Reschedule Booking
  const handleRescheduleSubmit = () => {
    if (selectedRescheduleSlots.length === 0) {
      message.warning('Vui lòng chọn khung giờ mới!')
      return
    }

    const selectedSlots = selectedRescheduleSlots
      .map((slotIndex) => rescheduleSlots.find((slot) => slot.slotIndex === slotIndex))
      .filter((slot): slot is CourtSlotAvailability => !!slot)
      .sort((a, b) => a.slotIndex - b.slotIndex)

    if (selectedSlots.length === 0) {
      message.warning('Không tìm thấy dữ liệu khung giờ đã chọn!')
      return
    }

    for (let i = 1; i < selectedSlots.length; i++) {
      if (selectedSlots[i].slotIndex !== selectedSlots[i - 1].slotIndex + 1) {
        message.warning('Vui lòng chọn các khung giờ liền nhau.')
        return
      }
    }

    const startSlot = selectedSlots[0]
    const endSlot = selectedSlots[selectedSlots.length - 1]

    rescheduleMutation.mutate(
      {
        id: selectedBooking.bookingID,
        data: {
          courtID: selectedBooking.courtID,
          bookingDate: selectedBookingDate,
          startTime: formatTimeSpan(startSlot.startTime),
          endTime: formatTimeSpan(endSlot.endTime),
        },
      },
      {
        onSuccess: () => {
          message.success('Dời lịch chơi thành công!')
          setIsRescheduleModalOpen(false)
          rescheduleForm.resetFields()
          setSelectedRescheduleSlots([])
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
      <div className="flex justify-end items-center pt-4 pb-2">
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
          value={selectValue}
          loading={isActionLoading || isStatusesLoading}
          disabled={isTerminalStatus || isStatusesLoading}
          onChange={handleStatusChange}
          options={statusOptions}
        />
      </div>

      <Divider style={{ margin: '14px 0' }} />

      {/* Booking Slots */}
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
        <span>Khung giờ chơi</span>
        {isRescheduleAllowed && (
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              const defaultSelectedSlotIndexes = rescheduleSlots
                .filter((slot) => isCurrentBookingSlot(slot))
                .map((slot) => slot.slotIndex)
              setSelectedRescheduleSlots(defaultSelectedSlotIndexes)
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
                {slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Services */}
      <Divider style={{ margin: '14px 0' }} />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
        <span>Dịch vụ đi kèm</span>
        {isAddServiceAllowed && (
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setIsServiceModalOpen(true)
            }}
          >
            Quản lý dịch vụ
          </Button>
        )}
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

      {/* Combos */}
      <Divider style={{ margin: '14px 0' }} />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
        <span>Combo dịch vụ áp dụng</span>
      </p>
      <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        {bookingCombos.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-2">
            Không có combo dịch vụ áp dụng
          </p>
        )}
        {bookingCombos.map((bookingCombo) => {
          const comboDetail = availableCombos.find(
            (c) => c.comboID === bookingCombo.comboID,
          )
          return (
            <div
              key={bookingCombo.bookingComboID}
              className="flex justify-between text-xs items-center"
            >
              <span className="text-slate-700 font-medium">
                {comboDetail?.comboName || `Combo #${bookingCombo.comboID}`} ×{' '}
                {bookingCombo.quantity}
              </span>
              <span className="font-bold text-slate-800">
                {formatCompactCurrency(bookingCombo.quantity * bookingCombo.unitPrice)}
              </span>
            </div>
          )
        })}
      </div>

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
        {totalCombosAmount > 0 && (
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Combo dịch vụ</span>
            <span>{formatCompactCurrency(totalCombosAmount)}</span>
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

        {isPaymentAllowed && (
          <Button
            type="primary"
            size="medium"
            icon={<WalletOutlined />}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              payForm.setFieldsValue({ amount: remainingAmount, paymentMethod: 'cash' })
              setIsPayModalOpen(true)
            }}
          >
            Ghi nhận thanh toán
          </Button>
        )}
        {!isPaymentAllowed && (
          <Alert
            type="info"
            showIcon
            className="mt-2"
            message={
              isTerminalStatus
                ? `Đơn ở trạng thái ${matchedStatusOption?.label || 'kết thúc'}, không thể ghi nhận thanh toán.`
                : 'Đơn đã thanh toán đủ.'
            }
          />
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
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền!' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null) return Promise.resolve()
                  if (value <= 0)
                    return Promise.reject(new Error('Số tiền phải lớn hơn 0.'))
                  if (value > remainingAmount) {
                    return Promise.reject(
                      new Error('Số tiền thanh toán không được vượt quá số còn lại.'),
                    )
                  }
                  return Promise.resolve()
                },
              },
            ]}
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
              <Select.Option value="cash">💵 Tiền mặt (cash)</Select.Option>
              <Select.Option value="bank_transfer">
                🏦 Chuyển khoản (Bank Transfer)
              </Select.Option>
              <Select.Option value="qr_manual">
                📱 Quét QR nội bộ (không gateway)
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
        width={760}
      >
        <Form form={rescheduleForm} layout="vertical" onFinish={handleRescheduleSubmit}>
          <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <p className="m-0 text-slate-400 font-semibold">Sân chơi</p>
                <p className="m-0 text-slate-700 font-bold">
                  {matchedCourt?.courtName || `Sân #${selectedBooking.courtID}`}
                </p>
              </div>
              <div>
                <p className="m-0 text-slate-400 font-semibold">Ngày chơi</p>
                <p className="m-0 text-slate-700 font-bold">
                  {dayjs(selectedBooking.bookingDate).format('DD/MM/YYYY')}
                </p>
              </div>
            </div>
          </div>

          <Form.Item
            label={
              <span className="text-xs font-bold text-slate-600 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  Chọn giờ chơi mới
                  <Tooltip title="Chỉ thay đổi giờ chơi. Sân và ngày được giữ nguyên. Hệ thống tự tính lại tiền sân theo giờ mới; các dịch vụ và số tiền đã thanh toán vẫn giữ nguyên.">
                    <InfoCircleOutlined className="text-slate-400 cursor-help" />
                  </Tooltip>
                </span>
                <span className="font-semibold text-slate-400 normal-case">
                  {selectedRescheduleSlots.length} khung giờ đã chọn
                </span>
              </span>
            }
          >
            {rescheduleSlotsQuery.isPending ? (
              <div className="flex justify-center py-6">
                <Spin size="small" />
              </div>
            ) : rescheduleSlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
                Không có dữ liệu khung giờ cho sân/ngày đã chọn.
              </div>
            ) : (
              <div className="max-h-[42vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {rescheduleSlots.map((slot) => {
                    const locked = isRescheduleSlotLocked(slot)
                    const selected = selectedRescheduleSlots.includes(slot.slotIndex)

                    let cardClass =
                      'relative border border-slate-200 rounded-xl p-3 text-center cursor-pointer bg-white transition duration-150 hover:border-slate-300 hover:shadow-sm'
                    let priceClass = 'text-[10px] mt-0.5 font-semibold text-slate-400'

                    if (selected) {
                      cardClass =
                        'relative border border-slate-900 bg-slate-900 text-white rounded-xl p-3 text-center cursor-pointer transition duration-150 shadow-sm'
                      priceClass = 'text-[10px] mt-0.5 font-semibold text-slate-300'
                    } else if (locked) {
                      cardClass =
                        'relative border border-slate-200 bg-slate-50 opacity-40 rounded-xl p-3 text-center cursor-not-allowed select-none'
                    }

                    return (
                      <div
                        key={slot.slotIndex}
                        className={cardClass}
                        onClick={() => !locked && toggleRescheduleSlot(slot.slotIndex)}
                        title={slot.lockReason ?? undefined}
                      >
                        {locked && (
                          <span className="text-[10px] text-red-500 font-bold block absolute top-1 right-2">
                            [Bận]
                          </span>
                        )}
                        <div className="text-sm font-bold">
                          {slot.startTime.substring(0, 5)}–{slot.endTime.substring(0, 5)}
                        </div>
                        <div className={priceClass}>
                          {formatCompactCurrency(slot.price ?? 0)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </Form.Item>

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

      {/* Form Modal Quản lý dịch vụ đi kèm */}
      <Modal
        title={
          <span className="flex items-center gap-2 font-extrabold text-slate-800 text-base">
            <PlusOutlined className="text-indigo-650 text-indigo-600" /> Quản lý dịch vụ
            đi kèm
          </span>
        }
        open={isServiceModalOpen}
        onCancel={() => {
          setIsServiceModalOpen(false)
          setSelectedAddServiceId(null)
          serviceForm.resetFields()
        }}
        footer={null}
        destroyOnClose
        width={520}
        className="rounded-2xl overflow-hidden"
      >
        <div className="space-y-4">
          {/* Section: Thêm dịch vụ mới */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Thêm dịch vụ mới
            </p>
            <Form
              form={serviceForm}
              layout="inline"
              onFinish={(values) => {
                if (!values.serviceID) return
                handleAddService(values.serviceID, values.quantity || 1)
                serviceForm.resetFields()
                setSelectedAddServiceId(null)
              }}
              className="flex items-end gap-2"
            >
              <Form.Item
                name="serviceID"
                className="flex-1 mb-0"
                rules={[{ required: true, message: 'Chọn dịch vụ' }]}
              >
                <Select
                  placeholder="Chọn dịch vụ mới..."
                  onChange={(val) => setSelectedAddServiceId(val)}
                  showSearch
                  optionFilterProp="label"
                  style={{ width: '100%' }}
                >
                  {availableServices
                    .filter(
                      (s) =>
                        !bookingServices.some((bs) => bs.serviceID === s.serviceID) &&
                        s.isActive,
                    )
                    .map((svc) => {
                      const stockText = svc.isTrackStock
                        ? ` (Kho: ${svc.stockQuantity})`
                        : ''
                      return (
                        <Select.Option
                          key={svc.serviceID}
                          value={svc.serviceID}
                          label={svc.serviceName}
                        >
                          {svc.serviceName} - {formatCompactCurrency(svc.price)}{' '}
                          {stockText}
                        </Select.Option>
                      )
                    })}
                </Select>
              </Form.Item>

              <Form.Item
                name="quantity"
                className="mb-0"
                initialValue={1}
                rules={[{ required: true }]}
              >
                <InputNumber min={1} placeholder="SL" style={{ width: 80 }} />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  loading={createServiceMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Thêm
                </Button>
              </Form.Item>
            </Form>

            {(() => {
              const chosen = availableServices.find(
                (s) => s.serviceID === selectedAddServiceId,
              )
              if (chosen && chosen.isTrackStock) {
                return (
                  <div className="mt-2 text-xs text-cyan-600 font-semibold bg-cyan-50 p-2 rounded border border-cyan-100 flex items-center gap-1">
                    <InfoCircleOutlined /> Mặt hàng theo dõi kho. Hiện còn:{' '}
                    {chosen.stockQuantity} {chosen.unit || 'sản phẩm'}
                  </div>
                )
              }
              return null
            })()}
          </div>

          {/* Section: Danh sách dịch vụ hiện tại */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Dịch vụ hiện tại ({bookingServices.length})
            </p>
            <div className="max-h-[45vh] overflow-y-auto pr-1 flex flex-col gap-2.5">
              {bookingServices.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Chưa có dịch vụ nào trong hóa đơn này
                </p>
              ) : (
                bookingServices.map((bs) => {
                  const svcDetail = availableServices.find(
                    (s) => s.serviceID === bs.serviceID,
                  )
                  const isSvcLoading =
                    createServiceMutation.isPending ||
                    updateServiceMutation.isPending ||
                    deleteServiceMutation.isPending

                  return (
                    <div
                      key={bs.bookingServiceID}
                      className="flex justify-between items-center p-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm rounded-xl transition duration-150"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div
                          className="text-xs font-bold text-slate-800 truncate"
                          title={svcDetail?.serviceName}
                        >
                          {svcDetail?.serviceName || `Dịch vụ #${bs.serviceID}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {formatCompactCurrency(bs.unitPrice)} /{' '}
                          {svcDetail?.unit || 'lượt'}
                          {svcDetail?.isTrackStock &&
                            ` · Kho: ${svcDetail.stockQuantity}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-inner">
                          <Button
                            type="text"
                            size="small"
                            disabled={isSvcLoading}
                            icon={<MinusOutlined className="text-[10px]" />}
                            onClick={() =>
                              handleUpdateServiceQty(bs.bookingServiceID, bs.quantity - 1)
                            }
                            className="hover:bg-white text-slate-500"
                          />
                          <span className="text-xs font-bold text-slate-800 px-1.5 min-w-6 text-center select-none">
                            {bs.quantity}
                          </span>
                          <Button
                            type="text"
                            size="small"
                            disabled={isSvcLoading}
                            icon={<PlusOutlined className="text-[10px]" />}
                            onClick={() =>
                              handleUpdateServiceQty(bs.bookingServiceID, bs.quantity + 1)
                            }
                            className="hover:bg-white text-slate-500"
                          />
                        </div>

                        <Button
                          type="text"
                          size="small"
                          danger
                          disabled={isSvcLoading}
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteService(bs.bookingServiceID)}
                          className="hover:bg-red-50"
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <Button
            type="primary"
            onClick={() => setIsServiceModalOpen(false)}
            className="bg-slate-800 hover:bg-slate-900 border-none rounded-lg"
          >
            Hoàn tất
          </Button>
        </div>
      </Modal>
    </Drawer>
  )
}
