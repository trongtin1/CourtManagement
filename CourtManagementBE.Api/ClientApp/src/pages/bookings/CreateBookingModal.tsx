import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  App,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Tag,
} from 'antd'
import {
  AppstoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'

import { bookingApi } from '@/features/bookings/api/bookingApi'
import { bookingServiceApi } from '@/features/bookings/api/bookingServiceApi'
import { bookingSlotApi } from '@/features/bookings/api/bookingSlotApi'
import { useCreateBookingMutation } from '@/features/bookings/api/useBookingQueries'
import type { CreateBookingRequest } from '@/features/bookings/model/types'
import { courtPriceApi } from '@/features/courts/api/courtPriceApi'
import { timeSlotApi } from '@/features/courts/api/timeSlotApi'
import { useCourtsQuery } from '@/features/courts/api/useCourtQueries'
import type { Court, TimeSlot } from '@/features/courts/model/types'
import { useServicesQuery } from '@/features/services/api/useServiceQueries'
import type { Service } from '@/features/services/model/types'
import { toApiError } from '@/utils/errors'

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingFormValues = CreateBookingRequest & {
  email?: string
}

type SelectedService = {
  quantity: number
  unitPrice: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10)

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}đ`

const formatTime = (value: string) => value?.slice(0, 5)

const getDayOfWeek = (date?: string) => {
  if (!date) return new Date().getDay()
  return new Date(date).getDay()
}

const getServicePrice = (service: Service) => {
  const type = service.serviceType?.toLowerCase() ?? ''
  if (type.includes('premium') || type.includes('cao')) return 50000
  return 30000
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateBookingModalProps {
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateBookingModal({ open, onClose }: CreateBookingModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<BookingFormValues>()

  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null)
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([])
  const [selectedServices, setSelectedServices] = useState<
    Record<number, SelectedService>
  >({})

  const bookingDate = Form.useWatch('bookingDate', form)

  // ── Queries ──────────────────────────────────────────────────────────────

  const courtsQuery = useCourtsQuery()
  const servicesQuery = useServicesQuery()
  const timeSlotsQuery = useQuery({
    queryKey: ['timeSlots', 'booking-picker'],
    queryFn: () => timeSlotApi.getAll(),
  })
  const courtPricesQuery = useQuery({
    queryKey: ['courtPrices', 'booking-picker'],
    queryFn: () => courtPriceApi.getAll(),
  })
  const bookingsByDateQuery = useQuery({
    queryKey: ['bookings', 'date', bookingDate],
    queryFn: () => bookingApi.getByDate(bookingDate),
    enabled: !!bookingDate,
  })

  const createMut = useCreateBookingMutation()

  // ── Derived data ─────────────────────────────────────────────────────────

  const courts = useMemo(() => courtsQuery.data?.items ?? [], [courtsQuery.data?.items])
  const services = useMemo(
    () => servicesQuery.data?.items ?? [],
    [servicesQuery.data?.items],
  )
  const timeSlots = useMemo(
    () => timeSlotsQuery.data?.items ?? [],
    [timeSlotsQuery.data?.items],
  )
  const courtPrices = useMemo(
    () => courtPricesQuery.data?.items ?? [],
    [courtPricesQuery.data?.items],
  )

  const bookedCourtIds = useMemo(
    () =>
      new Set(
        (bookingsByDateQuery.data ?? [])
          .filter((b) => b.status !== 'cancelled')
          .map((b) => b.courtID),
      ),
    [bookingsByDateQuery.data],
  )

  // ── Pricing helpers ───────────────────────────────────────────────────────

  const getCourtBasePrice = useCallback(
    (courtId: number) => {
      const prices = courtPrices.filter((p) => p.courtID === courtId && p.isActive)
      if (prices.length === 0) return 200000
      return Math.min(...prices.map((p) => p.price))
    },
    [courtPrices],
  )

  const getSlotPrice = useCallback(
    (timeSlotId: number) => {
      if (!selectedCourtId) return 0
      const dayOfWeek = getDayOfWeek(bookingDate)
      const price = courtPrices.find(
        (item) =>
          item.courtID === selectedCourtId &&
          item.timeSlotID === timeSlotId &&
          item.dayOfWeek === dayOfWeek &&
          item.isActive,
      )
      return price?.price ?? getCourtBasePrice(selectedCourtId)
    },
    [bookingDate, courtPrices, getCourtBasePrice, selectedCourtId],
  )

  const totalAmount = useMemo(() => {
    const courtTotal = selectedSlotIds.reduce((sum, id) => sum + getSlotPrice(id), 0)
    const serviceTotal = Object.values(selectedServices).reduce(
      (sum, s) => sum + s.quantity * s.unitPrice,
      0,
    )
    return courtTotal + serviceTotal
  }, [getSlotPrice, selectedServices, selectedSlotIds])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const resetState = () => {
    form.resetFields()
    form.setFieldsValue({ bookingDate: today, status: 'pending' })
    setSelectedCourtId(null)
    setSelectedSlotIds([])
    setSelectedServices({})
  }

  const handleCancel = () => {
    onClose()
  }

  const handleSlotToggle = (slotId: number) => {
    setSelectedSlotIds((cur) =>
      cur.includes(slotId) ? cur.filter((id) => id !== slotId) : [...cur, slotId],
    )
  }

  const handleServiceToggle = (service: Service, checked: boolean) => {
    setSelectedServices((cur) => {
      const next = { ...cur }
      if (!checked) {
        delete next[service.serviceID]
        return next
      }
      next[service.serviceID] = {
        quantity: Math.max(service.minQuantity || 1, 1),
        unitPrice: getServicePrice(service),
      }
      return next
    })
  }

  const handleServiceQuantityChange = (serviceId: number, quantity: number | null) => {
    setSelectedServices((cur) => ({
      ...cur,
      [serviceId]: { ...cur[serviceId], quantity: quantity ?? 1 },
    }))
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (!selectedCourtId) {
        message.warning('Vui lòng chọn sân')
        return
      }
      if (selectedSlotIds.length === 0) {
        message.warning('Vui lòng chọn ít nhất một khung giờ')
        return
      }

      const booking = await createMut.mutateAsync({
        courtID: selectedCourtId,
        customerID: values.customerID,
        bookingDate: values.bookingDate,
        totalAmount,
        status: 'pending',
        note: values.note,
      })

      await Promise.all(
        selectedSlotIds.map((timeSlotID) =>
          bookingSlotApi.create({
            bookingID: booking.bookingID,
            courtID: selectedCourtId,
            bookingDate: values.bookingDate,
            timeSlotID,
          }),
        ),
      )

      await Promise.all(
        Object.entries(selectedServices).map(([serviceId, service]) =>
          bookingServiceApi.create({
            bookingID: booking.bookingID,
            serviceID: Number(serviceId),
            quantity: service.quantity,
            unitPrice: service.unitPrice,
            status: 'pending',
          }),
        ),
      )

      message.success('Tạo booking thành công')
      onClose()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      message.error(toApiError(e).message)
    }
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderCourtCard = (court: Court) => {
    const booked = bookedCourtIds.has(court.courtID)
    const selected = selectedCourtId === court.courtID

    return (
      <button
        key={court.courtID}
        className={[
          'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition',
          selected
            ? 'border-teal-500 bg-teal-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-teal-400',
          booked ? 'pointer-events-none border-rose-200 bg-rose-50 opacity-60' : '',
        ].join(' ')}
        disabled={booked}
        onClick={() => {
          setSelectedCourtId(court.courtID)
          setSelectedSlotIds([])
        }}
        type="button"
      >
        <AppstoreOutlined
          className={
            selected ? 'text-teal-500' : booked ? 'text-slate-300' : 'text-slate-400'
          }
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-800">
            {court.courtName}
          </div>
          <div className="text-xs text-emerald-600">
            {formatCurrency(getCourtBasePrice(court.courtID))}
          </div>
        </div>
        <Tag
          color={booked ? 'red' : selected ? 'cyan' : 'green'}
          className="shrink-0 m-0!"
        >
          {booked ? 'Đặt rồi' : selected ? 'Đã chọn' : 'Trống'}
        </Tag>
      </button>
    )
  }

  const renderTimeSlot = (slot: TimeSlot) => {
    const selected = selectedSlotIds.includes(slot.timeSlotID)

    return (
      <button
        key={slot.timeSlotID}
        className={[
          'rounded-md border px-2 py-1.5 text-center text-xs transition',
          selected
            ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
            : 'border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50',
          !selectedCourtId ? 'cursor-not-allowed opacity-40' : '',
        ].join(' ')}
        disabled={!selectedCourtId}
        onClick={() => handleSlotToggle(slot.timeSlotID)}
        type="button"
      >
        <div className="font-semibold">
          {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
        </div>
        <div className={selected ? 'text-teal-100' : 'text-emerald-600'}>
          {formatCurrency(getSlotPrice(slot.timeSlotID))}
        </div>
      </button>
    )
  }

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <Drawer
      afterOpenChange={(isOpen) => {
        if (isOpen) resetState()
      }}
      open={open}
      onClose={handleCancel}
      width="100%"
      placement="right"
      destroyOnClose
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-teal-500" />
          <span>Đặt sân mới</span>
        </div>
      }
      styles={{
        body: { padding: 0 },
        header: { padding: '16px 24px' },
        footer: { padding: '12px 24px' },
      }}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" loading={createMut.isPending} onClick={handleSubmit}>
            Tạo booking
          </Button>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-57px-57px)] bg-slate-50">
        {/* LEFT – Booking info */}
        <div className="w-80 shrink-0 border-r border-slate-200 bg-white px-6 py-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Thông tin đặt sân
          </p>

          <Form form={form} layout="vertical">
            <Form.Item label="Email KH" name="email">
              <Input placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="ID Khách hàng"
              name="customerID"
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <InputNumber className="w-full" min={1} placeholder="ID khách" />
            </Form.Item>

            <Form.Item
              label="Ngày đặt"
              name="bookingDate"
              rules={[{ required: true, message: 'Bắt buộc' }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={4} placeholder="Ghi chú thêm..." />
            </Form.Item>
          </Form>
        </div>

        {/* CENTER – Court / slot / service */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="m-0 text-base font-semibold text-slate-800">Chọn sân</h3>

            <Button
              icon={<SearchOutlined />}
              loading={bookingsByDateQuery.isFetching}
              onClick={() => bookingsByDateQuery.refetch()}
            >
              Kiểm tra trống
            </Button>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {courts.map(renderCourtCard)}
          </div>

          <div className="mb-3 flex items-center gap-2">
            <ClockCircleOutlined className="text-orange-400" />
            <h3 className="m-0 text-base font-semibold text-slate-800">Chọn khung giờ</h3>
            {!selectedCourtId && (
              <span className="text-sm text-slate-400">Chọn sân trước</span>
            )}
          </div>

          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
            {timeSlots.map(renderTimeSlot)}
          </div>

          <div className="mb-3 flex items-center gap-2">
            <ShoppingOutlined className="text-indigo-400" />
            <h3 className="m-0 text-base font-semibold text-slate-800">Dịch vụ đi kèm</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {services.map((service) => {
              const sel = selectedServices[service.serviceID]
              const price = sel?.unitPrice ?? getServicePrice(service)

              return (
                <div
                  key={service.serviceID}
                  className={[
                    'flex items-center gap-3 rounded-xl border px-4 py-3 transition',
                    sel
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-indigo-200',
                  ].join(' ')}
                >
                  <Checkbox
                    checked={!!sel}
                    onChange={(e) => handleServiceToggle(service, e.target.checked)}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      {service.serviceName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {service.serviceType || 'Dịch vụ'}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(price)}
                    </div>

                    {sel && (
                      <InputNumber
                        className="mt-1 w-20"
                        min={1}
                        size="small"
                        value={sel.quantity}
                        onChange={(v) =>
                          handleServiceQuantityChange(service.serviceID, v)
                        }
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT – Summary */}
        <div className="w-86 shrink-0 border-l border-slate-200 bg-white px-6 py-5">
          <h3 className="mb-5 text-base font-semibold text-slate-800">Tóm tắt booking</h3>

          <div className="space-y-4 text-sm">
            <div>
              <div className="text-slate-400">Sân</div>
              <div className="font-semibold text-slate-800">
                {selectedCourtId
                  ? courts.find((c) => c.courtID === selectedCourtId)?.courtName
                  : 'Chưa chọn sân'}
              </div>
            </div>

            <div>
              <div className="text-slate-400">Ngày đặt</div>
              <div className="font-semibold text-slate-800">{bookingDate || today}</div>
            </div>

            <div>
              <div className="text-slate-400">Khung giờ</div>
              <div className="font-semibold text-slate-800">
                {selectedSlotIds.length > 0
                  ? `${selectedSlotIds.length} khung giờ`
                  : 'Chưa chọn khung giờ'}
              </div>
            </div>

            <Divider />

            <div>
              <div className="mb-2 font-semibold text-slate-800">Dịch vụ đã chọn</div>

              {Object.keys(selectedServices).length === 0 ? (
                <div className="text-slate-400">Chưa chọn dịch vụ</div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(selectedServices).map(([serviceId, item]) => {
                    const service = services.find(
                      (s) => s.serviceID === Number(serviceId),
                    )

                    return (
                      <div key={serviceId} className="flex justify-between text-sm">
                        <span>
                          {service?.serviceName ?? `Dịch vụ #${serviceId}`} x
                          {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Tổng cộng</span>
              <span className="text-2xl font-bold text-teal-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
