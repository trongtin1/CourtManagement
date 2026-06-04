import { useMemo, useRef, useEffect } from 'react'
import { Tooltip, Spin } from 'antd'
import { LockOutlined } from '@ant-design/icons'

import { useSystemSettingsQuery } from '@/features/facilities/api/useSystemSettingsQueries'
import type {
  CourtTimelineAvailability,
  TimelineBookingResponse,
} from '@/features/courts/model/types'
import { formatCompactCurrency } from '@/utils/format'

interface BookingTimelineProps {
  facilityId: number
  courts: CourtTimelineAvailability[]
  onBookingClick: (booking: TimelineBookingResponse) => void
  onSlotClick: (
    courtId: number,
    startTime: string,
    endTime: string,
    price: number,
  ) => void
  searchTimeStart?: string
  searchTimeEnd?: string
  hasSearchedAvailable?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "HH:MM:SS" or "HH:MM" → total minutes from midnight */
const timeToMinutes = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + (minutes ?? 0)
}

/** "HH:MM:SS" or "HH:MM" → "HH:MM" */
const formatTimeHHMM = (timeString: string) => timeString.substring(0, 5)

export function BookingTimeline({
  courts: courtList,
  onBookingClick,
  onSlotClick,
  searchTimeStart,
  searchTimeEnd,
  hasSearchedAvailable: isFilterActive,
}: BookingTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ─── Fetch System Configuration ──────────────────────────────────────────
  const { data: facilityData, isLoading: isFacilityLoading } = useSystemSettingsQuery()

  const openingTimeInMinutes = useMemo(
    () => (facilityData ? timeToMinutes(facilityData.openingTime) : 6 * 60),
    [facilityData],
  )
  const closingTimeInMinutes = useMemo(
    () => (facilityData ? timeToMinutes(facilityData.closingTime) : 22 * 60),
    [facilityData],
  )
  const slotDurationMinutes = useMemo(
    () => facilityData?.slotDurationMinutes ?? 60,
    [facilityData],
  )

  // ─── Compute Visible Viewport Range ─────────────────────────────────────────
  const viewportStartMinutes = useMemo(() => {
    if (isFilterActive && searchTimeStart) {
      const minutes = timeToMinutes(searchTimeStart)
      if (!isNaN(minutes)) return Math.max(minutes, openingTimeInMinutes)
    }
    return openingTimeInMinutes
  }, [isFilterActive, searchTimeStart, openingTimeInMinutes])

  const viewportEndMinutes = useMemo(() => {
    if (isFilterActive && searchTimeEnd) {
      const minutes = timeToMinutes(searchTimeEnd)
      if (!isNaN(minutes)) return Math.min(minutes, closingTimeInMinutes)
    }
    return closingTimeInMinutes
  }, [isFilterActive, searchTimeEnd, closingTimeInMinutes])

  // ─── Generate Timeline Column Headers ──────────────────────────────────────
  const timeLabels = useMemo(() => {
    const labels: { label: string; startMinutes: number; endMinutes: number }[] = []
    let currentMinutes = viewportStartMinutes

    while (currentMinutes < viewportEndMinutes) {
      const nextMinutes = Math.min(
        currentMinutes + slotDurationMinutes,
        viewportEndMinutes,
      )
      const hoursStr = String(Math.floor(currentMinutes / 60)).padStart(2, '0')
      const minutesStr = String(currentMinutes % 60).padStart(2, '0')

      labels.push({
        label: `${hoursStr}:${minutesStr}`,
        startMinutes: currentMinutes,
        endMinutes: nextMinutes,
      })
      currentMinutes = nextMinutes
    }
    return labels
  }, [viewportStartMinutes, viewportEndMinutes, slotDurationMinutes])

  const totalTimeSlots = timeLabels.length
  const slotWidthPx = 88
  const courtLabelWidthPx = 148
  const gridTemplateColumns = `${courtLabelWidthPx}px repeat(${totalTimeSlots}, ${slotWidthPx}px)`

  // Scroll to the current hour on mount
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || timeLabels.length === 0) return

    const now = new Date()
    const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes()
    const scrollOffsetSlots = Math.max(
      0,
      Math.floor(
        (currentMinutesFromMidnight - viewportStartMinutes) / slotDurationMinutes,
      ) - 1,
    )

    container.scrollTo({
      left: scrollOffsetSlots * slotWidthPx,
      behavior: 'smooth',
    })
  }, [viewportStartMinutes, slotDurationMinutes, timeLabels])

  // Helper: converts time slot boundaries to px coordinates
  const calculateBlockPosition = (startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)

    if (endMinutes <= viewportStartMinutes || startMinutes >= viewportEndMinutes) {
      return { left: 0, width: 0, visible: false }
    }

    const clampedStartMinutes = Math.max(startMinutes, viewportStartMinutes)
    const clampedEndMinutes = Math.min(endMinutes, viewportEndMinutes)

    const left =
      ((clampedStartMinutes - viewportStartMinutes) / slotDurationMinutes) * slotWidthPx
    const width =
      ((clampedEndMinutes - clampedStartMinutes) / slotDurationMinutes) * slotWidthPx

    return { left, width, visible: width > 0 }
  }

  if (isFacilityLoading) {
    return (
      <div className="flex items-center justify-center py-16 px-5 bg-white rounded-lg border border-slate-200">
        <Spin tip="Đang tải cấu hình cơ sở…" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <h3 className="m-0 text-sm font-bold text-slate-900">Lịch hoạt động</h3>
          <span className="text-xs text-slate-500">
            {facilityData
              ? `${formatTimeHHMM(facilityData.openingTime)} – ${formatTimeHHMM(facilityData.closingTime)} · Slot ${slotDurationMinutes} phút`
              : 'Kéo để di chuyển · click để xem chi tiết'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
            Trống
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
            Đã đặt
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-zinc-300 bg-zinc-50 text-zinc-600">
            Bảo trì
          </span>
        </div>
      </div>

      {/* ── Scrollable Grid ── */}
      <div
        className="overflow-x-auto overflow-y-visible relative"
        ref={scrollContainerRef}
      >
        <div className="grid min-w-275 relative" style={{ gridTemplateColumns }}>
          {/* Corner cell */}
          <div className="sticky left-0 z-40 bg-white border-b border-b-slate-200 border-r border-r-slate-100" />

          {/* Time Headers */}
          {timeLabels.map((timeSlot) => (
            <div
              key={timeSlot.label}
              className="border-b border-b-slate-200 border-r border-r-slate-100 flex items-end justify-start pb-2 pl-2 text-[11px] font-medium text-slate-400 relative bg-white"
            >
              {timeSlot.label}
            </div>
          ))}

          {/* Court Rows */}
          {courtList.map((court) => (
            <div key={court.courtID} className="contents">
              {/* Court Label Column */}
              <div className="sticky left-0 z-30 bg-white border-r border-r-slate-200 border-b border-b-slate-100 flex items-center px-4 min-h-15 gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                    {court.courtName}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                    {court.courtType}
                  </span>
                </div>
              </div>

              {/* Court Timeline Grid Cells */}
              {timeLabels.map((timeSlot, cellIndex) => {
                const matchedAvailableSlot = court.availableSlots?.find((slot) => {
                  const startMin = timeToMinutes(slot.startTime)
                  const endMin = timeToMinutes(slot.endTime)
                  return (
                    timeSlot.startMinutes >= startMin && timeSlot.endMinutes <= endMin
                  )
                })
                const isSlotAvailable = !!matchedAvailableSlot
                const cellClass = isSlotAvailable
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/40 hover:from-emerald-100 hover:to-emerald-100/60'
                  : 'bg-white hover:bg-slate-50'

                return (
                  <div
                    key={timeSlot.label}
                    className={`relative min-h-15 cursor-pointer border-r border-b border-slate-100 transition ${cellClass}`}
                    onClick={() => {
                      if (matchedAvailableSlot) {
                        const cellHoursEnd = Math.floor(timeSlot.endMinutes / 60)
                        const cellMinutesEnd = timeSlot.endMinutes % 60
                        const cellEndTime = `${String(cellHoursEnd).padStart(2, '0')}:${String(cellMinutesEnd).padStart(2, '0')}`
                        onSlotClick(
                          court.courtID,
                          timeSlot.label,
                          cellEndTime,
                          matchedAvailableSlot.price,
                        )
                      }
                    }}
                  >
                    <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-slate-50" />
                    {isSlotAvailable && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-10">
                        {formatCompactCurrency(matchedAvailableSlot.price)}
                      </span>
                    )}

                    {/* Block layer: absolutely positioned across the entire row width (only drawn once in first cell) */}
                    {cellIndex === 0 && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ width: totalTimeSlots * slotWidthPx }}
                      >
                        {court.locks.map((lock, lockIndex) => {
                          const openTime = formatTimeHHMM(
                            facilityData?.openingTime ?? '06:00',
                          )
                          const closeTime = formatTimeHHMM(
                            facilityData?.closingTime ?? '22:00',
                          )
                          const isAllDay =
                            formatTimeHHMM(lock.startTime) === openTime &&
                            formatTimeHHMM(lock.endTime) === closeTime

                          const blockPosition = calculateBlockPosition(
                            lock.startTime,
                            lock.endTime,
                          )

                          if (!blockPosition.visible) return null

                          const lockBaseStyle = isAllDay
                            ? {
                                background:
                                  'repeating-linear-gradient(45deg, #fff7ed, #fff7ed 10px, #fef3c7 10px, #fef3c7 20px)',
                                borderColor: '#fbbf24',
                              }
                            : {
                                background:
                                  'repeating-linear-gradient(45deg, #fafafa, #fafafa 10px, #f4f4f5 10px, #f4f4f5 20px)',
                                borderColor: '#d4d4d8',
                              }

                          return (
                            <Tooltip
                              key={`lock-${lockIndex}`}
                              title={
                                <span>
                                  <LockOutlined /> {lock.reason}
                                  {isAllDay
                                    ? ' · Cả ngày'
                                    : ` · ${formatTimeHHMM(lock.startTime)} – ${formatTimeHHMM(lock.endTime)}`}
                                </span>
                              }
                            >
                              <div
                                className="absolute top-1.5 bottom-1.5 rounded-lg border border-dashed px-3 py-1 flex flex-col justify-center gap-0.5 pointer-events-auto cursor-not-allowed z-10 min-w-12.5 overflow-hidden"
                                style={{
                                  left: blockPosition.left,
                                  width: blockPosition.width,
                                  ...lockBaseStyle,
                                }}
                              >
                                <LockOutlined className="text-[11px] mb-0.5 opacity-60" />
                                <span
                                  className={`text-[11px] font-semibold uppercase whitespace-nowrap overflow-hidden text-ellipsis ${
                                    isAllDay ? 'text-amber-900' : 'text-slate-600'
                                  }`}
                                >
                                  {isAllDay ? 'CẢ NGÀY' : 'BẢO TRÌ'}
                                </span>
                                {!isAllDay && (
                                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                    {formatTimeHHMM(lock.startTime)} –{' '}
                                    {formatTimeHHMM(lock.endTime)}
                                  </span>
                                )}
                              </div>
                            </Tooltip>
                          )
                        })}

                        {/* Booking Blocks */}
                        {court.bookings.map((booking) => {
                          const firstSlot = booking.slots[0]
                          const lastSlot = booking.slots[booking.slots.length - 1]
                          if (!firstSlot || !lastSlot) return null

                          const blockPosition = calculateBlockPosition(
                            firstSlot.startTime,
                            lastSlot.endTime,
                          )
                          if (!blockPosition.visible) return null

                          const customer = booking.customer
                          const customerShortName = customer
                            ? customer.customerName.split(' ').slice(-1)[0]
                            : '—'

                          const statusKey = String(booking.status ?? '').toLowerCase()
                          const statusClass =
                            statusKey === 'pending'
                              ? 'bg-amber-50 border border-amber-400 text-amber-900'
                              : statusKey === 'confirmed'
                                ? 'bg-blue-50 border border-blue-300 text-blue-700'
                                : statusKey === 'completed'
                                  ? 'bg-slate-50 border border-slate-300 text-slate-500'
                                  : statusKey === 'cancelled'
                                    ? 'bg-red-50 border border-red-300 text-red-700'
                                    : 'bg-slate-50 border border-slate-300 text-slate-600'

                          return (
                            <Tooltip
                              key={booking.bookingID}
                              title={
                                <span>
                                  {customer?.customerName ?? 'Khách'} ·{' '}
                                  {formatTimeHHMM(firstSlot.startTime)}–
                                  {formatTimeHHMM(lastSlot.endTime)} ·{' '}
                                  {formatCompactCurrency(booking.totalAmount)}
                                </span>
                              }
                            >
                              <div
                                className={`absolute top-1.5 bottom-1.5 rounded-lg px-2.5 py-1 flex flex-col justify-center gap-0.5 cursor-pointer pointer-events-auto transition overflow-hidden z-10 min-w-12.5 hover:brightness-95 hover:shadow-sm ${statusClass}`}
                                style={{
                                  left: blockPosition.left,
                                  width: blockPosition.width,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onBookingClick(booking)
                                }}
                              >
                                <span className="text-[11px] font-semibold leading-snug truncate">
                                  {customer?.customerType === 'vip'
                                    ? `VIP – ${customerShortName}`
                                    : customerShortName}
                                </span>
                                <span className="text-[10px] font-medium opacity-80 whitespace-nowrap">
                                  {formatTimeHHMM(firstSlot.startTime)} –{' '}
                                  {formatTimeHHMM(lastSlot.endTime)}
                                </span>
                              </div>
                            </Tooltip>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
