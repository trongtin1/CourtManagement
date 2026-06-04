import { useState, useMemo, useCallback } from 'react'
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Badge,
  Tabs,
  Pagination,
  Empty,
  DatePicker,
  TimePicker,
  Modal,
} from 'antd'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import type { Event } from 'react-big-calendar'
import '@/pages/courts/court-settings/sections/court-price.css'
import { CalendarOutlined, DoubleRightOutlined } from '@ant-design/icons'

import { useCombosQuery } from '@/features/combos/api/useComboQueries'
import type { Combo } from '@/features/combos/model/types'
import {
  useCourtsQuery,
  useCourtWeeklyTimelineQuery,
} from '@/features/courts/api/useCourtQueries'
import type {
  WeeklyPriceRuleResponse,
  WeeklyBookingResponse,
} from '@/features/courts/model/types'
import { useServicesQuery } from '@/features/services/api/useServiceQueries'
import { useCustomersQuery } from '@/features/customers/api/useCustomerQueries'
import { useSystemSettingsQuery } from '@/features/facilities/api/useSystemSettingsQueries'
import { bookingApi } from '@/features/bookings/api/bookingApi'
import { formatCompactCurrency, getDisabledTime } from '@/utils/format'
import { CourtWeekCalendar } from '@/components/calendar/CourtWeekCalendar'
import { COURT_WEEK_CALENDAR_FORMATS } from '@/components/calendar/courtWeekCalendarFormats'

type SelectedSvc = { quantity: number; unitPrice: number }

interface BookingCalendarEvent extends Event {
  id: string
  title: string
  start: Date
  end: Date
  resource?: {
    isBooking?: boolean
    isBuffer?: boolean
    isLock?: boolean
    isSelection?: boolean
    booking?: WeeklyBookingResponse
    draftSlotId?: string
  }
}

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

const getMondayOfDate = (date: dayjs.Dayjs): dayjs.Dayjs => {
  const dow = date.day()
  const diff = dow === 0 ? -6 : 1 - dow
  return date.add(diff, 'day').startOf('day')
}

const INITIAL_MONDAY = getMondayOfDate(dayjs())

const calculateCourtPrice = (
  startStr: string,
  endStr: string,
  priceRules: WeeklyPriceRuleResponse[],
): number => {
  if (!startStr || !endStr || !priceRules || priceRules.length === 0) return 0

  const parseToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const startMin = parseToMinutes(startStr)
  const endMin = parseToMinutes(endStr)
  if (endMin <= startMin) return 0

  let totalCost = 0

  for (const rule of priceRules) {
    const ruleStart = parseToMinutes(rule.startTime)
    const ruleEnd = parseToMinutes(rule.endTime)

    const intersectStart = Math.max(startMin, ruleStart)
    const intersectEnd = Math.min(endMin, ruleEnd)

    if (intersectStart < intersectEnd) {
      const durationHours = (intersectEnd - intersectStart) / 60
      totalCost += durationHours * rule.price
    }
  }

  return totalCost
}

interface CreateBookingPageProps {
  onClose?: () => void
}

export function CreateBookingPage({ onClose }: CreateBookingPageProps) {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [courtID, setCourtID] = useState<number | null>(null)
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))

  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfDate(dayjs(date)))
  interface DraftSlot {
    id: string
    startTime: Date
    endTime: Date
  }
  const [draftSlots, setDraftSlots] = useState<DraftSlot[]>([])
  const [selectedDraftSlotId, setSelectedDraftSlotId] = useState<string | null>(null)

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [modalStartTime, setModalStartTime] = useState<dayjs.Dayjs | null>(null)
  const [modalEndTime, setModalEndTime] = useState<dayjs.Dayjs | null>(null)

  const [services, setServices] = useState<Record<number, SelectedSvc>>({})
  const [customerID, setCustomerID] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [selectedComboID, setSelectedComboID] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isCurrentWeek = currentMonday.isSame(INITIAL_MONDAY, 'day')
  const weekSunday = currentMonday.add(6, 'day')
  const weekLabel = `${currentMonday.format('DD/MM')} – ${weekSunday.format('DD/MM/YYYY')}`

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    } else {
      navigate('/bookings')
    }
  }, [onClose, navigate])

  // Pagination states for combos and services
  const [comboPage, setComboPage] = useState(1)
  const [servicePage, setServicePage] = useState(1)

  // Fetch real data from React Query hooks
  const combosQuery = useCombosQuery()
  const courtsQuery = useCourtsQuery({ page: 1, pageSize: 100 })
  const servicesQuery = useServicesQuery({ page: servicePage })
  const customersQuery = useCustomersQuery({ page: 1, pageSize: 100 })
  const weeklyTimelineQuery = useCourtWeeklyTimelineQuery(
    courtID,
    currentMonday.format('YYYY-MM-DD'),
  )
  const systemSettingsQuery = useSystemSettingsQuery()

  const courts = courtsQuery.data?.items ?? []
  const serviceItems = servicesQuery.data?.items ?? []
  const customers = customersQuery.data?.items ?? []

  // Store full combo object to persist across page changes
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null)

  const toggleCombo = (combo: Combo) => {
    if (selectedComboID === combo.comboID) {
      setSelectedComboID(null)
      setSelectedCombo(null)
    } else {
      setSelectedComboID(combo.comboID)
      setSelectedCombo(combo)
    }
  }

  const getClampedServiceQuantity = useCallback(
    (quantity: number, maxQuantity?: number) => {
      const normalizedMax = maxQuantity != null ? Math.max(1, maxQuantity) : undefined
      return normalizedMax != null ? Math.min(quantity, normalizedMax) : quantity
    },
    [],
  )

  const updateServiceQuantity = useCallback(
    (serviceID: number, unitPrice: number, quantity: number, maxQuantity?: number) => {
      const nextQuantity = getClampedServiceQuantity(quantity, maxQuantity)

      setServices((current) => {
        if (nextQuantity <= 0) {
          const next = { ...current }
          delete next[serviceID]
          return next
        }

        return {
          ...current,
          [serviceID]: {
            quantity: nextQuantity,
            unitPrice,
          },
        }
      })
    },
    [getClampedServiceQuantity],
  )

  const facility = systemSettingsQuery.data
  const openingHourStr = facility?.openingTime ? facility.openingTime.split(':')[0] : '06'
  const closingHourStr = facility?.closingTime ? facility.closingTime.split(':')[0] : '22'
  const startHour = parseInt(openingHourStr, 10)
  const endHour = parseInt(closingHourStr, 10)

  const minTime = useMemo(() => new Date(0, 0, 0, startHour, 0, 0), [startHour])
  const maxTime = useMemo(() => new Date(0, 0, 0, endHour, 0, 0), [endHour])

  const calendarComponents = useMemo(
    () => ({
      toolbar: () => null as never,
    }),
    [],
  )

  const events = useMemo(() => {
    if (!weeklyTimelineQuery.data?.timeline) return []

    const evts: BookingCalendarEvent[] = []

    weeklyTimelineQuery.data.timeline.forEach((day) => {
      const dayDate = dayjs(day.date)

      // 1. Map bookings
      day.bookings.forEach((b) => {
        const [sh, sm] = b.startTime.split(':').map(Number)
        const [eh, em] = b.endTime.split(':').map(Number)
        evts.push({
          id: `booking-${b.bookingID}`,
          title: `Đã đặt - ${b.customerName} (${b.phone})`,
          start: dayDate.hour(sh).minute(sm).second(0).toDate(),
          end: dayDate.hour(eh).minute(em).second(0).toDate(),
          resource: { isBooking: true, booking: b },
        })

        // Booking buffer time
        if (b.timeBuffer) {
          const [bsh, bsm] = b.timeBuffer.startTime.split(':').map(Number)
          const [beh, bem] = b.timeBuffer.endTime.split(':').map(Number)
          evts.push({
            id: `buffer-${b.bookingID}`,
            title: `Đệm dọn dẹp`,
            start: dayDate.hour(bsh).minute(bsm).second(0).toDate(),
            end: dayDate.hour(beh).minute(bem).second(0).toDate(),
            resource: { isBuffer: true },
          })
        }
      })

      // 2. Map locks
      day.locks.forEach((l, idx) => {
        const [sh, sm] = l.startTime.split(':').map(Number)
        const [eh, em] = l.endTime.split(':').map(Number)
        evts.push({
          id: `lock-${day.date}-${idx}`,
          title: `Đã khóa: ${l.reason || 'Bảo trì'}`,
          start: dayDate.hour(sh).minute(sm).second(0).toDate(),
          end: dayDate.hour(eh).minute(em).second(0).toDate(),
          resource: { isLock: true },
        })
      })
    })

    // 3. Add proposed selection events for all draft slots
    draftSlots.forEach((slot) => {
      const selStart = dayjs(slot.startTime)
      if (
        selStart.isAfter(currentMonday.subtract(1, 'second')) &&
        selStart.isBefore(currentMonday.add(7, 'day'))
      ) {
        evts.push({
          id: `draft-${slot.id}`,
          title: `Khung giờ đang chọn`,
          start: slot.startTime,
          end: slot.endTime,
          resource: { isSelection: true, draftSlotId: slot.id },
        })
      }
    })

    return evts
  }, [weeklyTimelineQuery.data, draftSlots, currentMonday])

  const eventPropGetter = useCallback((event: BookingCalendarEvent) => {
    if (event.resource?.isSelection) {
      return {
        style: {
          backgroundColor: '#e0e7ff',
          borderLeft: '4px solid #4f46e5',
          color: '#4338ca',
          fontWeight: 'bold' as const,
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(79, 70, 229, 0.2)',
          padding: '2px 6px',
        },
      }
    }
    if (event.resource?.isBooking) {
      return {
        style: {
          backgroundColor: '#e0f2fe',
          borderLeft: '4px solid #0284c7',
          color: '#0369a1',
          borderRadius: '8px',
          padding: '2px 6px',
        },
      }
    }
    if (event.resource?.isBuffer) {
      return {
        style: {
          backgroundColor: '#fff7ed',
          borderLeft: '4px dashed #f97316',
          color: '#c2410c',
          borderRadius: '8px',
          opacity: 0.8,
          fontSize: '10px',
          padding: '2px 6px',
        },
      }
    }
    if (event.resource?.isLock) {
      return {
        style: {
          background:
            'repeating-linear-gradient(45deg, #fef2f2 0px, #fef2f2 10px, #fff5f5 10px, #fff5f5 20px)',
          borderLeft: '4px solid #dc2626',
          color: '#b91c1c',
          borderRadius: '8px',
          padding: '2px 6px',
        },
      }
    }
    return {}
  }, [])

  const slotPropGetter = useCallback((date: Date) => {
    if (dayjs(date).isBefore(dayjs(), 'minute')) {
      return {
        style: {
          backgroundColor: '#f1f5f9',
          opacity: 0.55,
          cursor: 'not-allowed',
        },
      }
    }
    return {}
  }, [])

  const previewPrice = useMemo(() => {
    if (!modalStartTime || !modalEndTime) return 0
    const startStr = modalStartTime.format('HH:mm')
    const endStr = modalEndTime.format('HH:mm')
    const targetDateStr = modalStartTime.format('YYYY-MM-DD')
    const dailyTimeline = weeklyTimelineQuery.data?.timeline?.find(
      (t) => t.date === targetDateStr,
    )
    const rules = dailyTimeline?.priceRules ?? []
    return calculateCourtPrice(startStr, endStr, rules)
  }, [modalStartTime, modalEndTime, weeklyTimelineQuery.data])

  const modalDayLabel = useMemo(() => {
    if (!modalStartTime) return ''
    const dow = modalStartTime.day()
    const label = dow === 0 ? 'Chủ Nhật' : `Thứ ${dow + 1}`
    return `${label} (${modalStartTime.format('DD/MM/YYYY')})`
  }, [modalStartTime])

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (dayjs(start).isBefore(dayjs())) {
        return
      }
      setSelectedDraftSlotId(null)
      setModalStartTime(dayjs(start))
      setModalEndTime(dayjs(end))
      setConfirmModalOpen(true)
    },
    [],
  )

  const handleSelectEvent = useCallback((event: BookingCalendarEvent) => {
    if (event.resource?.isSelection && event.resource?.draftSlotId) {
      setSelectedDraftSlotId(event.resource.draftSlotId)
      setModalStartTime(dayjs(event.start))
      setModalEndTime(dayjs(event.end))
      setConfirmModalOpen(true)
    }
  }, [])

  const handleConfirmSelection = useCallback(() => {
    if (!modalStartTime || !modalEndTime) return

    if (modalStartTime.isBefore(dayjs())) {
      message.error('Không thể đặt lịch trong quá khứ')
      return
    }

    const diffMinutes = modalEndTime.diff(modalStartTime, 'minute')
    if (diffMinutes < 30) {
      message.error('Thời lượng đặt sân tối thiểu là 30 phút')
      return
    }

    const targetDateStr = modalStartTime.format('YYYY-MM-DD')
    
    // Clear draft slots if date changes
    let activeDraftSlots = [...draftSlots]
    if (activeDraftSlots.length > 0) {
      const currentSlotsDate = dayjs(activeDraftSlots[0].startTime).format('YYYY-MM-DD')
      if (currentSlotsDate !== targetDateStr) {
        activeDraftSlots = []
      }
    }

    // Check collision with other draft slots
    const isCollidingWithDraft = activeDraftSlots.some((s) => {
      if (selectedDraftSlotId && s.id === selectedDraftSlotId) return false
      const sStart = dayjs(s.startTime)
      const sEnd = dayjs(s.endTime)
      return modalStartTime.isBefore(sEnd) && modalEndTime.isAfter(sStart)
    })

    if (isCollidingWithDraft) {
      message.error('Khung giờ này trùng với một khung giờ khác đã chọn')
      return
    }

    const dailyTimeline = weeklyTimelineQuery.data?.timeline?.find(
      (t) => t.date === targetDateStr,
    )

    if (dailyTimeline) {
      const startMin = modalStartTime.hour() * 60 + modalStartTime.minute()
      const endMin = modalEndTime.hour() * 60 + modalEndTime.minute()

      const parseToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number)
        return h * 60 + m
      }

      // Check locks
      const isLocked = dailyTimeline.locks.some((l) => {
        const lStart = parseToMinutes(l.startTime)
        const lEnd = parseToMinutes(l.endTime)
        return startMin < lEnd && endMin > lStart
      })

      if (isLocked) {
        message.error('Khung giờ này đã bị khóa')
        return
      }

      // Check bookings (including their buffer times!)
      const isBooked = dailyTimeline.bookings.some((b) => {
        const bStart = parseToMinutes(b.startTime)
        const bEnd = b.timeBuffer
          ? parseToMinutes(b.timeBuffer.endTime)
          : parseToMinutes(b.endTime)
        return startMin < bEnd && endMin > bStart
      })

      if (isBooked) {
        message.error('Trùng lịch với ca chơi hoặc thời gian đệm dọn dẹp của khách khác')
        return
      }

      // Check proposed buffer collision
      const bufferDuration = weeklyTimelineQuery.data?.bufferDurationMinutes ?? 10
      const proposedBufferStart = endMin
      const proposedBufferEnd = endMin + bufferDuration

      const isBufferCollision = dailyTimeline.bookings.some((b) => {
        const bStart = parseToMinutes(b.startTime)
        const bEnd = parseToMinutes(b.endTime)
        return proposedBufferStart < bEnd && proposedBufferEnd > bStart
      })

      if (isBufferCollision) {
        message.error(
          'Thời gian đệm dọn dẹp (sau ca chơi) bị trùng với ca chơi tiếp theo. Vui lòng chọn giờ khác.',
        )
        return
      }
    }

    if (selectedDraftSlotId) {
      // Update existing
      setDraftSlots(
        activeDraftSlots.map((s) =>
          s.id === selectedDraftSlotId
            ? { ...s, startTime: modalStartTime.toDate(), endTime: modalEndTime.toDate() }
            : s,
        ),
      )
      message.success('Đã cập nhật khung giờ chọn')
    } else {
      // Add new
      const newSlot = {
        id: Math.random().toString(36).substr(2, 9),
        startTime: modalStartTime.toDate(),
        endTime: modalEndTime.toDate(),
      }
      setDraftSlots([...activeDraftSlots, newSlot])
      message.success('Đã thêm khung giờ đặt sân')
    }

    setDate(targetDateStr)
    setConfirmModalOpen(false)
    setSelectedDraftSlotId(null)
  }, [modalStartTime, modalEndTime, draftSlots, selectedDraftSlotId, weeklyTimelineQuery.data, message])

  const slotTotal = useMemo(() => {
    if (draftSlots.length === 0) return 0
    let totalCost = 0

    draftSlots.forEach((slot) => {
      const startStr = dayjs(slot.startTime).format('HH:mm')
      const endStr = dayjs(slot.endTime).format('HH:mm')
      const targetDateStr = dayjs(slot.startTime).format('YYYY-MM-DD')
      const dailyTimeline = weeklyTimelineQuery.data?.timeline?.find(
        (t) => t.date === targetDateStr,
      )
      const rules = dailyTimeline?.priceRules ?? []
      const baseCost = calculateCourtPrice(startStr, endStr, rules)

      if (selectedCombo) {
        const comboPrice = selectedCombo.comboPrice
        const comboHours = selectedCombo.durationHours
        const durationHours =
          dayjs(slot.endTime).diff(dayjs(slot.startTime), 'minute') / 60

        if (durationHours <= comboHours) {
          totalCost += comboPrice
        } else {
          const extraHours = durationHours - comboHours
          const averageHourlyRate = durationHours > 0 ? baseCost / durationHours : 0
          totalCost += comboPrice + extraHours * averageHourlyRate
        }
      } else {
        totalCost += baseCost
      }
    })

    return totalCost
  }, [draftSlots, selectedCombo, weeklyTimelineQuery.data])

  const svcTotal = Object.values(services).reduce(
    (s, v) => s + v.quantity * v.unitPrice,
    0,
  )
  const total = slotTotal + svcTotal

  const court = courts.find((c) => c.courtID === courtID)
  const customer = customers.find((c) => c.customerID === customerID)

  const canNext = () => {
    if (step === 0) return !!courtID
    if (step === 1) return draftSlots.length > 0
    return true
  }
  const handleSubmit = async () => {
    if (!courtID) {
      message.warning('Vui lòng chọn sân trước')
      return
    }
    if (draftSlots.length === 0) {
      message.warning('Vui lòng chọn khung giờ')
      return
    }
    if (!customerID) {
      message.warning('Vui lòng chọn khách hàng')
      return
    }

    try {
      setSubmitting(true)

      await bookingApi.createFull({
        courtID: courtID,
        customerID: customerID,
        bookingDate: date,
        note: note,
        slots: draftSlots.map((s) => ({
          startTime: formatTimeSpan(dayjs(s.startTime).format('HH:mm:00')),
          endTime: formatTimeSpan(dayjs(s.endTime).format('HH:mm:00')),
        })),
        services: Object.entries(services).map(([svcId, svc]) => ({
          serviceID: Number(svcId),
          quantity: svc.quantity,
        })),
        combos: selectedComboID ? [{ comboID: selectedComboID, quantity: 1 }] : [],
      })

      await queryClient.invalidateQueries()
      message.success('Tạo booking thành công!')
      handleClose()
    } catch (err) {
      console.error(err)
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo booking'
      message.error(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Bar */}
     <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleClose}
          icon={<DoubleRightOutlined className="rotate-180" />}
          className="inline-flex items-center justify-center"
        >
          Quay lại
        </Button> 
      
    <div>
      <div className="flex items-center gap-2">
        <CalendarOutlined className="text-blue-500 text-xl" />
        <h1 className="m-0 text-xl font-bold text-slate-800">
          Tạo lịch đặt sân
        </h1>
      </div>
      <p className="m-0 text-sm text-slate-500">
        Nhập thông tin để tạo đơn đặt sân mới
      </p>
    </div>
  </div>
</div>

      {/* Main Grid Layout - Natural Full Window Scroll */}
      <div className="max-w-375 w-full mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Step Content (spans 3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form Step Content Box */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            {/* Step navigation header with arrows */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <Button
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
                icon={<DoubleRightOutlined className="rotate-180" />}
                className="flex items-center justify-center text-xs font-semibold text-slate-600 border-slate-200 hover:text-slate-800"
              >
                Trước
              </Button>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-450">
                Bước {step + 1} / 4:{' '}
                {['Chọn sân', 'Chọn giờ', 'Dịch vụ', 'Xác nhận'][step]}
              </span>
              <Button
                disabled={!canNext() || step === 3}
                onClick={() => setStep((s) => s + 1)}
                icon={<DoubleRightOutlined />}
                iconPosition="end"
                className="flex items-center justify-center text-xs font-semibold text-slate-600 border-slate-200 hover:text-slate-800"
              >
                Sau
              </Button>
            </div>
            {/* Step 0: Court picker */}
            {step === 0 && (
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Chọn sân</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Chọn sân muốn đặt cho khách hàng
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {courts.map((c) => (
                    <div
                      key={c.courtID}
                      className={`flex flex-col gap-1.5 border rounded-xl p-4 cursor-pointer bg-white transition duration-150 ${
                        courtID === c.courtID
                          ? 'border-slate-850 bg-slate-50 shadow-sm ring-1 ring-slate-800'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                      onClick={() => setCourtID(c.courtID)}
                    >
                      <span className="text-sm font-bold text-slate-800">
                        {c.courtName}
                      </span>
                      <div className="flex gap-1 items-center">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {c.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{c.courtCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Slot picker */}
            {step === 1 && (
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Chọn khung giờ
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Sân: <strong className="text-teal-600">{court?.courtName}</strong> · Kéo
                  chọn hoặc click khung giờ trống trên lịch tuần
                </p>

                {/* Navigation Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 p-4 bg-slate-50/60 rounded-2xl border border-slate-100/80">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Today Button / Custom Pill */}
                    <Button
                      onClick={() => {
                        setCurrentMonday(INITIAL_MONDAY)
                      }}
                      disabled={isCurrentWeek}
                      type={isCurrentWeek ? 'default' : 'primary'}
                      className={`rounded-xl px-4 font-semibold text-xs h-10 flex items-center justify-center transition-all cursor-pointer ${
                        isCurrentWeek
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80 hover:bg-emerald-50! hover:text-emerald-600!'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isCurrentWeek ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Tuần hiện tại
                        </span>
                      ) : (
                        'Về tuần hiện tại'
                      )}
                    </Button>

                    <DatePicker
                      picker="week"
                      value={currentMonday}
                      onChange={(date) => {
                        if (date) {
                          setCurrentMonday(getMondayOfDate(dayjs(date)))
                        }
                      }}
                      allowClear={false}
                      placeholder="Chọn tuần khác"
                    />
                  </div>

                  {/* Date Display Card */}
                  <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-xl shadow-sm border border-slate-100 self-stretch sm:self-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                        <CalendarOutlined className="text-sm" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">
                          Khung thời gian
                        </span>
                        <span className="text-sm font-bold text-slate-700 leading-none">
                          {weekLabel}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic status tag */}
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        isCurrentWeek
                          ? 'bg-emerald-100 text-emerald-700'
                          : currentMonday.isBefore(INITIAL_MONDAY)
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {isCurrentWeek
                        ? 'Hiện tại'
                        : currentMonday.isBefore(INITIAL_MONDAY)
                          ? 'Đã qua'
                          : 'Sắp tới'}
                    </span>
                  </div>
                </div>

                {/* Calendar */}
                <CourtWeekCalendar
                  events={events}
                  date={currentMonday.toDate()}
                  minTime={minTime}
                  maxTime={maxTime}
                  step={facility?.slotDurationMinutes || 60}
                  timeslots={1}
                  selectable
                  components={calendarComponents}
                  eventPropGetter={eventPropGetter}
                  slotPropGetter={slotPropGetter}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  formats={COURT_WEEK_CALENDAR_FORMATS}
                  className="h-240"
                />

                {/* Selection Confirm Modal */}
                <Modal
                  open={confirmModalOpen}
                  onCancel={() => setConfirmModalOpen(false)}
                  footer={null}
                  width={320}
                  destroyOnClose
                  title={
                    <div>
                      <div className="text-xs text-slate-400 font-normal mb-0.5">
                        {modalDayLabel}
                      </div>
                      <div className="text-base font-semibold text-slate-700">
                        Xác nhận giờ đặt sân
                      </div>
                    </div>
                  }
                >
                  <div className="pt-2 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Từ giờ
                        </div>
                        <TimePicker
                          format="HH:mm"
                          minuteStep={15}
                          className="w-full"
                          value={modalStartTime}
                          onChange={(v) => {
                            if (v && modalStartTime) {
                              setModalStartTime(
                                modalStartTime.hour(v.hour()).minute(v.minute()),
                              )
                            }
                          }}
                          allowClear={false}
                          disabledTime={getDisabledTime(
                            facility?.openingTime,
                            facility?.closingTime,
                          )}
                        />
                      </div>
                      <div>
                        <div className="mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Đến giờ
                        </div>
                        <TimePicker
                          format="HH:mm"
                          minuteStep={15}
                          className="w-full"
                          value={modalEndTime}
                          onChange={(v) => {
                            if (v && modalEndTime) {
                              setModalEndTime(
                                modalEndTime.hour(v.hour()).minute(v.minute()),
                              )
                            }
                          }}
                          allowClear={false}
                          disabledTime={getDisabledTime(
                            facility?.openingTime,
                            facility?.closingTime,
                          )}
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50/65 rounded-xl p-3 border border-blue-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Xem trước tiền sân:
                      </span>
                      <span className="text-base font-extrabold text-blue-600">
                        {formatCompactCurrency(previewPrice)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      {selectedDraftSlotId ? (
                        <div className="flex gap-2">
                          <Button
                            danger
                            className="flex-1"
                            onClick={() => {
                              setDraftSlots((prev) => prev.filter((s) => s.id !== selectedDraftSlotId))
                              setConfirmModalOpen(false)
                              setSelectedDraftSlotId(null)
                              message.success('Đã xóa khung giờ đã chọn')
                            }}
                          >
                            Xóa khung giờ
                          </Button>
                          <Button
                            type="primary"
                            className="flex-1 bg-slate-900 hover:bg-slate-800"
                            onClick={handleConfirmSelection}
                          >
                            Cập nhật
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => setConfirmModalOpen(false)}
                          >
                            Hủy
                          </Button>
                          <Button
                            type="primary"
                            className="flex-1 bg-slate-900 hover:bg-slate-800"
                            onClick={handleConfirmSelection}
                          >
                            Xác nhận
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Modal>
              </div>
            )}

            {/* Step 2: Services */}
            {step === 2 && (
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Dịch vụ đi kèm
                </h3>
                <p className="text-sm text-slate-400 mb-4">Tùy chọn – có thể bỏ qua</p>

                <Tabs
                  defaultActiveKey="services"
                  className="custom-booking-tabs"
                  items={[
                    {
                      key: 'combos',
                      label: (
                        <span className="font-semibold text-sm">Gói Combo ưu đãi</span>
                      ),
                      children: (
                        <div>
                          {combosQuery.isPending ? (
                            <div className="py-8 text-center text-slate-400">
                              Đang tải danh sách combo...
                            </div>
                          ) : (combosQuery.data?.items ?? []).length === 0 ? (
                            <Empty
                              description="Không có gói combo nào hoạt động"
                              className="py-8"
                            />
                          ) : (
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(combosQuery.data?.items ?? []).map((combo: Combo) => {
                                  const isSel = selectedComboID === combo.comboID
                                  return (
                                    <div
                                      key={combo.comboID}
                                      className={`relative flex flex-col justify-between p-4 bg-white border-2 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer min-h-42.5 ${
                                        isSel
                                          ? 'border-indigo-500 bg-indigo-50/10 shadow-sm'
                                          : 'border-slate-100 hover:border-indigo-200'
                                      }`}
                                      onClick={() => toggleCombo(combo)}
                                    >
                                      {isSel && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                          <span className="text-[10px] font-semibold text-indigo-600">
                                            [Đang chọn]
                                          </span>
                                          <Badge
                                            count={1}
                                            style={{ backgroundColor: '#6366f1' }}
                                          />
                                        </div>
                                      )}

                                      <div className="flex flex-col mb-3">
                                        <div
                                          className="font-semibold text-slate-800 text-sm w-full truncate"
                                          title={combo.comboName}
                                        >
                                          {combo.comboName}
                                        </div>
                                        <div className="text-xs font-bold text-orange-500 mt-1">
                                          {combo.durationHours} giờ chơi
                                        </div>
                                        <div className="text-xs font-semibold text-emerald-600 mt-1">
                                          {formatCompactCurrency(combo.comboPrice)}
                                        </div>
                                      </div>

                                      <div
                                        className="w-full"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Button
                                          type={isSel ? 'primary' : 'dashed'}
                                          block
                                          className={
                                            isSel
                                              ? 'bg-indigo-600 hover:bg-indigo-700'
                                              : 'text-slate-500 hover:text-indigo-600 hover:border-indigo-500'
                                          }
                                          onClick={() => toggleCombo(combo)}
                                        >
                                          {isSel ? 'Đã chọn' : 'Chọn combo'}
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              <Pagination
                                current={comboPage}
                                pageSize={combosQuery.data?.pageSize ?? 10}
                                total={combosQuery.data?.totalCount ?? 0}
                                onChange={(p) => setComboPage(p)}
                                size="small"
                                showSizeChanger={false}
                                className="mt-6 flex justify-end"
                              />
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'services',
                      label: (
                        <span className="font-semibold text-sm">Dịch vụ riêng lẻ</span>
                      ),
                      children: (
                        <div>
                          {servicesQuery.isPending ? (
                            <div className="py-8 text-center text-slate-400">
                              Đang tải danh sách dịch vụ...
                            </div>
                          ) : serviceItems.length === 0 ? (
                            <Empty
                              description="Không có dịch vụ nào khả dụng"
                              className="py-8"
                            />
                          ) : (
                            <div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {serviceItems.map((svc) => {
                                  const sel = services[svc.serviceID]
                                  const quantity = sel?.quantity || 0
                                  const svcPrice = svc.price ?? 0
                                  const maxServiceQuantity =
                                    svc.maxQuantity != null
                                      ? Math.max(1, svc.maxQuantity)
                                      : undefined

                                  return (
                                    <div
                                      key={svc.serviceID}
                                      className={`relative flex flex-col justify-between p-4 bg-white border-2 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer ${
                                        quantity > 0
                                          ? 'border-indigo-500 bg-indigo-50/10 shadow-sm'
                                          : 'border-slate-100 hover:border-indigo-200'
                                      }`}
                                      onClick={() => {
                                        if (quantity > 0) {
                                          setServices((c) => {
                                            const next = { ...c }
                                            delete next[svc.serviceID]
                                            return next
                                          })
                                        } else {
                                          updateServiceQuantity(
                                            svc.serviceID,
                                            svcPrice,
                                            1,
                                            maxServiceQuantity,
                                          )
                                        }
                                      }}
                                    >
                                      {quantity > 0 && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                          <span className="text-[10px] font-semibold text-indigo-650 text-indigo-600">
                                            [Đã chọn]
                                          </span>
                                          <Badge
                                            count={quantity}
                                            style={{ backgroundColor: '#6366f1' }}
                                          />
                                        </div>
                                      )}

                                      <div className="flex flex-col mb-3">
                                        <div
                                          className="font-semibold text-slate-800 text-sm w-full truncate"
                                          title={svc.serviceName}
                                        >
                                          {svc.serviceName}
                                        </div>
                                        <div className="text-xs font-semibold text-emerald-600 mt-1">
                                          {svc.price == null
                                            ? 'Chưa có giá'
                                            : `${formatCompactCurrency(svcPrice)} / ${svc.baseUnit?.name}`}
                                        </div>
                                      </div>

                                      <div
                                        className="w-full"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {quantity === 0 ? (
                                          <Button
                                            type="dashed"
                                            block
                                            className="text-slate-500 hover:text-indigo-600 hover:border-indigo-500"
                                            onClick={() => {
                                              updateServiceQuantity(
                                                svc.serviceID,
                                                svcPrice,
                                                1,
                                                maxServiceQuantity,
                                              )
                                            }}
                                          >
                                            Thêm
                                          </Button>
                                        ) : (
                                          <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1.5 bg-white">
                                            <Button
                                              type="text"
                                              size="small"
                                              className="text-slate-400 hover:text-red-500 font-bold"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                updateServiceQuantity(
                                                  svc.serviceID,
                                                  svcPrice,
                                                  quantity - 1,
                                                  maxServiceQuantity,
                                                )
                                              }}
                                            >
                                              -
                                            </Button>
                                            <InputNumber
                                              className="flex-1"
                                              min={1}
                                              max={maxServiceQuantity}
                                              value={quantity}
                                              controls={false}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(value) => {
                                                if (
                                                  typeof value === 'number' &&
                                                  value > 0
                                                ) {
                                                  updateServiceQuantity(
                                                    svc.serviceID,
                                                    svcPrice,
                                                    value,
                                                    maxServiceQuantity,
                                                  )
                                                }
                                              }}
                                            />
                                            <Button
                                              type="text"
                                              size="small"
                                              className="text-indigo-600 font-bold"
                                              disabled={
                                                maxServiceQuantity != null &&
                                                quantity >= maxServiceQuantity
                                              }
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                updateServiceQuantity(
                                                  svc.serviceID,
                                                  svcPrice,
                                                  quantity + 1,
                                                  maxServiceQuantity,
                                                )
                                              }}
                                            >
                                              +
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              <Pagination
                                current={servicePage}
                                pageSize={servicesQuery.data?.pageSize ?? 10}
                                total={servicesQuery.data?.totalCount ?? 0}
                                onChange={(p) => setServicePage(p)}
                                size="small"
                                showSizeChanger={false}
                                className="mt-6 flex justify-end"
                              />
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Xác nhận & Khách hàng
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Kiểm tra lại thông tin trước khi tạo
                </p>
                <Form layout="vertical" style={{ maxWidth: 400 }}>
                  <Form.Item label="Chọn khách hàng" required>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {customers.map((c) => {
                        const getInitials = (name: string) => {
                          return name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        }
                        return (
                          <div
                            key={c.customerID}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition ${
                              customerID === c.customerID
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-slate-200 hover:border-teal-300'
                            }`}
                            onClick={() => setCustomerID(c.customerID)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold text-teal-600">
                              {getInitials(c.customerName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {c.customerName}
                              </div>
                              <div className="text-xs text-slate-400">{c.phone}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Form.Item>
                  <Form.Item label="Ghi chú">
                    <Input.TextArea
                      rows={3}
                      placeholder="Ghi chú thêm..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </Form.Item>
                </Form>
              </div>
            )}
          </div>
        </div>

        {/* Summary sidebar (sticky top) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Tóm tắt booking
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                    Sân
                  </div>
                  <div className="font-bold text-slate-800">
                    {court?.courtName ?? 'Chưa chọn'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                    Ngày
                  </div>
                  <div className="font-bold text-slate-800">{date}</div>
                </div>
                <div>
                  <div className="text-slate-450 text-slate-400 text-xs font-medium mb-1">
                    Khung giờ ({draftSlots.length})
                  </div>
                  {draftSlots.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {draftSlots.map((s, idx) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-xs font-bold bg-slate-50 border border-slate-100 rounded-lg p-2"
                        >
                          <span className="text-slate-700">
                            #{idx + 1}: {dayjs(s.startTime).format('HH:mm')} – {dayjs(s.endTime).format('HH:mm')}
                          </span>
                          <button
                            onClick={() => setDraftSlots((prev) => prev.filter((ds) => ds.id !== s.id))}
                            className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer border-0 bg-transparent text-[11px]"
                            title="Xóa"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="font-bold text-slate-400 text-xs italic">
                      Chưa chọn
                    </div>
                  )}
                </div>
                {selectedCombo && (
                  <div>
                    <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                      Gói Combo
                    </div>
                    <div className="font-bold text-rose-600">
                      {selectedCombo.comboName}
                    </div>
                  </div>
                )}
                {customer && (
                  <div>
                    <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                      Khách hàng
                    </div>
                    <div className="font-bold text-slate-800">
                      {customer.customerName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>
                  {selectedCombo
                    ? 'Tiền Combo & Sân'
                    : `Tiền sân (${draftSlots.reduce((acc, s) => acc + dayjs(s.endTime).diff(dayjs(s.startTime), 'minute') / 60, 0).toFixed(1)} giờ)`}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatCompactCurrency(slotTotal)}
                </span>
              </div>

              {Object.entries(services).length > 0 && (
                <div className="pt-3 border-t border-dashed border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Chi tiết dịch vụ
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {Object.entries(services).map(([idStr, selectedSvc]) => {
                      const svcId = Number(idStr)
                      const item = serviceItems.find((s) => s.serviceID === svcId)
                      if (!item) return null
                      return (
                        <div
                          key={svcId}
                          className="flex justify-between text-xs text-slate-600"
                        >
                          <span>
                            {item.serviceName}{' '}
                            <span className="font-semibold text-indigo-550 text-indigo-500">
                              x{selectedSvc.quantity}
                            </span>
                          </span>
                          <span className="font-medium text-slate-700">
                            {formatCompactCurrency(
                              selectedSvc.quantity * selectedSvc.unitPrice,
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {svcTotal > 0 && (
                <div className="flex justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                  <span>Tổng tiền dịch vụ</span>
                  <span className="font-semibold text-slate-800">
                    {formatCompactCurrency(svcTotal)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 bg-white mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  Tổng cộng
                </span>
                <span className="text-xl font-extrabold text-teal-600">
                  {formatCompactCurrency(total)}
                </span>
              </div>

              <div className="flex gap-2">
                {step > 0 && (
                  <Button onClick={() => setStep((s) => s - 1)} className="flex-1">
                    Quay lại
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="primary"
                    disabled={!canNext()}
                    onClick={() => setStep((s) => s + 1)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border-0 font-semibold"
                  >
                    Tiếp theo
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={submitting}
                    className="flex-1 bg-teal-600 hover:bg-teal-500 border-0 font-semibold"
                  >
                    Tạo booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
