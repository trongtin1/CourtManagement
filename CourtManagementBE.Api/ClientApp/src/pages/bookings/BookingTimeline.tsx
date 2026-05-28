import { useMemo, useRef, useEffect } from 'react'
import { Tooltip, Spin } from 'antd'
import { LockOutlined } from '@ant-design/icons'

import { useFacilityQuery } from '@/features/facilities/api/useFacilityQueries'
import type { CourtTimelineAvailability, TimelineBookingResponse } from '@/features/courts/model/types'
import { formatCompactCurrency } from '@/utils/format'

interface BookingTimelineProps {
  facilityId: number
  courts: CourtTimelineAvailability[]
  onBookingClick: (booking: TimelineBookingResponse) => void
  onSlotClick: (courtId: number, startTime: string, endTime: string, price: number) => void
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
  facilityId,
  courts: courtList,
  onBookingClick,
  onSlotClick,
  searchTimeStart,
  searchTimeEnd,
  hasSearchedAvailable: isFilterActive,
}: BookingTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ─── Fetch Facility Configuration ──────────────────────────────────────────
  const { data: facilityData, isLoading: isFacilityLoading } = useFacilityQuery(facilityId)

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
      const nextMinutes = Math.min(currentMinutes + slotDurationMinutes, viewportEndMinutes)
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
      Math.floor((currentMinutesFromMidnight - viewportStartMinutes) / slotDurationMinutes) - 1,
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

    const left = ((clampedStartMinutes - viewportStartMinutes) / slotDurationMinutes) * slotWidthPx
    const width = ((clampedEndMinutes - clampedStartMinutes) / slotDurationMinutes) * slotWidthPx

    return { left, width, visible: width > 0 }
  }

  if (isFacilityLoading) {
    return (
      <div className="gantt-loading">
        <Spin tip="Đang tải cấu hình cơ sở…" />
      </div>
    )
  }

  return (
    <div className="gantt-wrapper">
      {/* ── Header ── */}
      <div className="gantt-header-bar">
        <div className="gantt-header-meta">
          <h3 className="gantt-title">Lịch hoạt động</h3>
          <span className="gantt-subtitle">
            {facilityData
              ? `${formatTimeHHMM(facilityData.openingTime)} – ${formatTimeHHMM(facilityData.closingTime)} · Slot ${slotDurationMinutes} phút`
              : 'Kéo để di chuyển · click để xem chi tiết'}
          </span>
        </div>
        <div className="gantt-legend">
          <span className="legend-item legend-available">Trống</span>
          <span className="legend-item legend-booked">Đã đặt</span>
          <span className="legend-item legend-locked">Bảo trì</span>
        </div>
      </div>

      {/* ── Scrollable Grid ── */}
      <div className="gantt-scroll" ref={scrollContainerRef}>
        <div className="gantt-grid" style={{ gridTemplateColumns }}>
          {/* Corner cell */}
          <div className="gantt-corner" />

          {/* Time Headers */}
          {timeLabels.map((timeSlot) => (
            <div key={timeSlot.label} className="gantt-time-cell">
              {timeSlot.label}
            </div>
          ))}

          {/* Court Rows */}
          {courtList.map((court) => (
            <div key={court.courtID} className="gantt-court-row">
              {/* Court Label Column */}
              <div className="gantt-court-label">
                <div className="court-label-text">
                  <span className="court-name">{court.courtName}</span>
                  <span className="court-type">{court.courtType}</span>
                </div>
              </div>

              {/* Court Timeline Grid Cells */}
              {timeLabels.map((timeSlot, cellIndex) => {
                const matchedAvailableSlot = court.availableSlots?.find((slot) => {
                  const startMin = timeToMinutes(slot.startTime)
                  const endMin = timeToMinutes(slot.endTime)
                  return timeSlot.startMinutes >= startMin && timeSlot.endMinutes <= endMin
                })
                const isSlotAvailable = !!matchedAvailableSlot

                return (
                  <div
                    key={timeSlot.label}
                    className={`gantt-cell ${isSlotAvailable ? 'gantt-cell--available' : ''}`}
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
                    {isSlotAvailable && (
                      <span className="gantt-price-tag">
                        {formatCompactCurrency(matchedAvailableSlot.price)}
                      </span>
                    )}

                    {/* Block layer: absolutely positioned across the entire row width (only drawn once in first cell) */}
                    {cellIndex === 0 && (
                      <div
                        className="gantt-block-layer"
                        style={{ width: totalTimeSlots * slotWidthPx }}
                      >
                        {court.locks.map((lock, lockIndex) => {
                          const openTime = formatTimeHHMM(facilityData?.openingTime ?? '06:00')
                          const closeTime = formatTimeHHMM(facilityData?.closingTime ?? '22:00')
                          const isAllDay =
                            formatTimeHHMM(lock.startTime) === openTime &&
                            formatTimeHHMM(lock.endTime) === closeTime

                          const blockPosition = calculateBlockPosition(lock.startTime, lock.endTime)

                          if (!blockPosition.visible) return null

                          return (
                            <Tooltip
                              key={`lock-${lockIndex}`}
                              title={
                                <span>
                                  <LockOutlined /> {lock.reason}
                                  {isAllDay ? ' · Cả ngày' : ` · ${formatTimeHHMM(lock.startTime)} – ${formatTimeHHMM(lock.endTime)}`}
                                </span>
                              }
                            >
                              <div
                                className={`gantt-locked-block ${isAllDay ? 'gantt-locked-block--allday' : ''}`}
                                style={{ left: blockPosition.left, width: blockPosition.width }}
                              >
                                <LockOutlined className="lock-icon" />
                                <span className="lock-label">
                                  {isAllDay ? 'CẢ NGÀY' : 'BẢO TRÌ'}
                                </span>
                                {!isAllDay && (
                                  <span className="lock-time">
                                    {formatTimeHHMM(lock.startTime)} – {formatTimeHHMM(lock.endTime)}
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

                          const blockPosition = calculateBlockPosition(firstSlot.startTime, lastSlot.endTime)
                          if (!blockPosition.visible) return null

                          const customer = booking.customer
                          const customerShortName = customer
                            ? customer.customerName.split(' ').slice(-1)[0]
                            : '—'

                          return (
                            <Tooltip
                              key={booking.bookingID}
                              title={
                                <span>
                                  {customer?.customerName ?? 'Khách'} · {formatTimeHHMM(firstSlot.startTime)}–{formatTimeHHMM(lastSlot.endTime)} · {formatCompactCurrency(booking.totalAmount)}
                                </span>
                              }
                            >
                              <div
                                className={`gantt-booking-block bk-${booking.status}`}
                                style={{ left: blockPosition.left, width: blockPosition.width }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onBookingClick(booking)
                                }}
                              >
                                <span className="bk-name">
                                  {customer?.customerType === 'vip' ? `VIP – ${customerShortName}` : customerShortName}
                                </span>
                                <span className="bk-time">
                                  {formatTimeHHMM(firstSlot.startTime)} – {formatTimeHHMM(lastSlot.endTime)}
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
