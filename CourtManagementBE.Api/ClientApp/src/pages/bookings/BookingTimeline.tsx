import { useMemo, useRef, useEffect } from 'react'
import { Tooltip } from 'antd'
import dayjs from 'dayjs'

import {
  MOCK_COURTS, MOCK_TIME_SLOTS, MOCK_CUSTOMERS, MOCK_BOOKINGS,
  MOCK_LOCKED_SLOTS,
  type MockBooking,
} from './mockData'
import { formatCompactCurrency } from '@/utils/format'

// ─── Color palette for booking blocks ─────────────────────────────────────────

const BLOCK_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  playing: '#10b981',
  completed: '#6b7280',
  cancelled: '#ef4444',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  selectedDate: string
  onBookingClick: (booking: MockBooking) => void
  onSlotClick: (courtID: number, startTime: string) => void
  searchTimeStart?: string
  searchTimeEnd?: string
  hasSearchedAvailable?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BookingTimeline({
  selectedDate,
  onBookingClick,
  onSlotClick,
  searchTimeStart,
  searchTimeEnd,
  hasSearchedAvailable,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Data for selected date
  const dayBookings = useMemo(
    () => MOCK_BOOKINGS.filter(b => b.bookingDate === selectedDate && b.status !== 'cancelled'),
    [selectedDate],
  )
  const dayLocks = useMemo(
    () => MOCK_LOCKED_SLOTS.filter(l => l.date === selectedDate),
    [selectedDate],
  )

  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

  // Dynamically compute min/max hour bounds based on the filter
  const minHour = useMemo(() => {
    if (hasSearchedAvailable && searchTimeStart) {
      const parsed = parseInt(searchTimeStart.split(':')[0], 10)
      if (!isNaN(parsed)) return parsed
    }
    const hours = MOCK_TIME_SLOTS.map(s => parseInt(s.startTime.split(':')[0], 10))
    return Math.min(...hours)
  }, [hasSearchedAvailable, searchTimeStart])

  const maxHour = useMemo(() => {
    if (hasSearchedAvailable && searchTimeEnd) {
      const parsed = parseInt(searchTimeEnd.split(':')[0], 10)
      if (!isNaN(parsed)) return parsed
    }
    const hours = MOCK_TIME_SLOTS.map(s => parseInt(s.startTime.split(':')[0], 10))
    return Math.max(...hours) + 1
  }, [hasSearchedAvailable, searchTimeEnd])

  const totalHours = useMemo(() => Math.max(1, maxHour - minHour), [minHour, maxHour])

  // Column sizing
  const labelW = 140
  const hourW = 100 // px per hour

  // Scroll to start hour on mount or filter change
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const targetHour = hasSearchedAvailable && searchTimeStart
      ? parseInt(searchTimeStart.split(':')[0], 10)
      : dayjs().hour()

    const xTarget = Math.max(0, (targetHour - minHour - 1) * hourW)
    el.scrollTo({
      left: xTarget,
      behavior: 'smooth',
    })
  }, [minHour, searchTimeStart, hasSearchedAvailable])

  // Grid template columns: label + N hour columns
  const gridCols = `${labelW}px repeat(${totalHours}, ${hourW}px)`
  const timeLabels = useMemo(() => {
    return Array.from({ length: totalHours }, (_, i) => {
      const h = minHour + i
      return `${String(h).padStart(2, '0')}:00`
    })
  }, [totalHours, minHour])

  // Calculate block positions and clipping widths based on visible range (minHour -> maxHour)
  const getBlockLeftAndWidth = (startTime: string, endTime: string) => {
    const startMin = toMin(startTime)
    const endMin = toMin(endTime)
    const viewStartMin = minHour * 60
    const viewEndMin = maxHour * 60

    // Out of bounds checking
    if (endMin <= viewStartMin || startMin >= viewEndMin) {
      return { left: 0, width: 0, visible: false }
    }

    const clampedStart = Math.max(startMin, viewStartMin)
    const clampedEnd = Math.min(endMin, viewEndMin)

    const left = ((clampedStart - viewStartMin) / 60) * hourW
    const width = ((clampedEnd - clampedStart) / 60) * hourW

    return { left, width, visible: width > 0 }
  }

  return (
    <div className="gantt-wrapper">
      <div className="gantt-header-bar">
        <h3>Lịch hoạt động</h3>
        <p>Kéo để di chuyển · click để xem chi tiết</p>
      </div>

      <div className="gantt-scroll" ref={scrollRef}>
        <div className="gantt-grid" style={{ gridTemplateColumns: gridCols }}>
          {/* ── Time header row ── */}
          <div className="gantt-corner" />
          {timeLabels.map(t => (
            <div
              key={t}
              className="gantt-time-cell"
              style={{
                background: hasSearchedAvailable ? '#f0fdfa' : '#fff',
                color: hasSearchedAvailable ? '#0d9488' : '#94a3b8',
                borderBottom: hasSearchedAvailable ? '2px solid #0d9488' : '1px solid #e2e8f0',
                fontWeight: hasSearchedAvailable ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
              }}
            >
              {t}
            </div>
          ))}

          {/* ── Court rows ── */}
          {MOCK_COURTS.map(court => {
            const courtBookings = dayBookings.filter(b => b.courtID === court.courtID)
            const courtLocks = dayLocks.filter(l => l.courtID === court.courtID)

            return (
              <div key={court.courtID} className="gantt-court-row">
                {/* Court label (sticky left) */}
                <div className="gantt-court-label">{court.courtName}</div>

                {/* Hour cells */}
                {timeLabels.map((t, i) => (
                  <div
                    key={t}
                    className="gantt-cell"
                    style={{
                      background: hasSearchedAvailable ? 'rgba(13, 148, 136, 0.02)' : undefined,
                    }}
                    onClick={() => onSlotClick(court.courtID, t)}
                  >
                    {/* Booking & lock blocks only rendered in first cell for positioning */}
                    {i === 0 && (
                      <div
                        className="gantt-block-layer"
                        style={{ width: totalHours * hourW }}
                      >
                        {/* Locked blocks */}
                        {courtLocks.map((lk, li) => {
                          const { left, width, visible } = getBlockLeftAndWidth(lk.startTime, lk.endTime)
                          if (!visible) return null
                          return (
                            <Tooltip key={`lock-${li}`} title={lk.reason}>
                              <div
                                className="gantt-locked-block"
                                style={{ left, width }}
                              >
                                <span className="lock-label">BẢO TRÌ</span>
                                <span className="lock-time">
                                  {lk.startTime} – {lk.endTime}
                                </span>
                              </div>
                            </Tooltip>
                          )
                        })}

                        {/* Booking blocks */}
                        {courtBookings.map(bk => {
                          const first = bk.slots[0]
                          const last = bk.slots[bk.slots.length - 1]
                          if (!first || !last) return null

                          const { left, width, visible } = getBlockLeftAndWidth(first.startTime, last.endTime)
                          if (!visible) return null

                          const color = BLOCK_COLORS[bk.status] ?? '#6b7280'
                          const cust = MOCK_CUSTOMERS.find(c => c.customerID === bk.customerID)
                          const displayName = cust
                            ? (bk.status === 'playing'
                              ? cust.fullName
                              : `${cust.fullName.split(' ').slice(-1)[0]}`)
                            : '—'

                          return (
                            <Tooltip
                              key={bk.bookingID}
                              title={`${cust?.fullName} · ${first.startTime}–${last.endTime} · ${formatCompactCurrency(bk.totalAmount)}`}
                            >
                              <div
                                className="gantt-booking-block"
                                style={{
                                  left,
                                  width,
                                  background: color,
                                }}
                                onClick={e => { e.stopPropagation(); onBookingClick(bk) }}
                              >
                                <span className="bk-name">
                                  {cust?.customerType === 'VIP' ? `VIP – ${displayName}` : displayName}
                                </span>
                                <span className="bk-time">
                                  {first.startTime} – {last.endTime}
                                </span>
                              </div>
                            </Tooltip>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
