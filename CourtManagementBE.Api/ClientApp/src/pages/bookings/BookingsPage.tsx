import { useState, useMemo } from 'react'
import { Button, Select, DatePicker, Spin, Tabs, Drawer } from 'antd'
import {
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { useNavigate, useLocation } from 'react-router-dom'

import { BookingTimeline } from './BookingTimeline'
import { BookingDetailDrawer } from './BookingDetailDrawer'
import { CreateBookingPage } from './create/CreateBookingPage'

import type { TimelineBookingResponse } from '@/features/courts/model/types'
import type { Booking } from '@/features/bookings/model/types'

import {
  useCourtsQuery,
  useCourtTimelineAvailabilityQuery,
} from '@/features/courts/api/useCourtQueries'

import { storage } from '@/utils/storage'
import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import { useFacilityQuery } from '@/features/facilities/api/useFacilityQueries'
import './bookings.css'
import { BookingGroupsTab } from './BookingGroupsTab'

type ActiveTab = 'timeline' | 'groups'

export function BookingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isCreateOpen = location.pathname.endsWith('/create')

  // ─── Tab State ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline')

  // ─── Timeline State ─────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [filterCourtType, setFilterCourtType] = useState<string>('All')

  // ─── Drawer State ────────────────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState<
    Booking | TimelineBookingResponse | null
  >(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // ─── Data Queries ───────────────────────────────────────────────────────────
  const { data: courtsData, isLoading: isCourtsLoading } = useCourtsQuery()

  const storedFacilityId = storage.get<string>(AUTH_STORAGE_KEYS.workingFacilityId)
  const facilityId = useMemo(() => {
    if (storedFacilityId) {
      const parsed = parseInt(storedFacilityId, 10)
      if (!isNaN(parsed)) return parsed
    }
    return courtsData?.items[0]?.facilityID ?? 1
  }, [storedFacilityId, courtsData])

  const { data: facility } = useFacilityQuery(facilityId)

  const { data: timelineData, isLoading: isTimelineLoading } =
    useCourtTimelineAvailabilityQuery(facilityId, selectedDate)

  const courtList = useMemo(() => timelineData ?? [], [timelineData])

  const filteredCourtList = useMemo(() => {
    if (filterCourtType === 'All') return courtList
    return courtList.filter(
      (c) => c.courtType?.toLowerCase() === filterCourtType.toLowerCase(),
    )
  }, [courtList, filterCourtType])

  const uniqueCourtTypes = useMemo(() => {
    const types = courtList.map((c) => c.courtType).filter(Boolean)
    return Array.from(new Set(types))
  }, [courtList])

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const isToday = selectedDate === dayjs().format('YYYY-MM-DD')

  const handleShiftDate = (direction: -1 | 1) =>
    setSelectedDate(dayjs(selectedDate).add(direction, 'day').format('YYYY-MM-DD'))

  const handleOpenDetail = (booking: Booking | TimelineBookingResponse) => {
    setSelectedBooking(booking)
    setIsDrawerOpen(true)
  }

  const facilityHours = facility
    ? `${facility.openingTime?.substring(0, 5)} – ${facility.closingTime?.substring(0, 5)}`
    : null

  return (
    <div className="bookings-root">
      {/* ── Page Header ── */}
      <div className="bookings-header">
        <div className="bookings-header-meta">
          <h1 className="bookings-title">Quản lý Đặt Sân</h1>
          <p className="bookings-subtitle">
            Xem lịch trực quan, quản lý lịch định kỳ và điều phối booking theo thời gian
            thực.
            {facilityHours && (
              <span className="bookings-facility-hours">
                &nbsp;·&nbsp;Giờ hoạt động: <strong>{facilityHours}</strong>
              </span>
            )}
          </p>
        </div>
        <div className="bookings-header-actions">
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate('/bookings/create')}
            className="btn-create-booking"
            type="primary"
          >
            Tạo booking
          </Button>
        </div>
      </div>

      {isCourtsLoading ? (
        <div className="bookings-loading">
          <Spin size="large" />
          <span>Đang tải dữ liệu sân bãi…</span>
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ActiveTab)}
          className="bookings-tabs"
          tabBarExtraContent={null}
          items={[
            {
              key: 'timeline',
              label: (
                <span className="tab-label">
                  <CalendarOutlined />
                  Lịch đặt sân
                </span>
              ),
              children: (
                <div className="tab-pane">
                  {/* Date & Filter Bar */}
                  <div className="timeline-control-bar">
                    {/* Date Nav */}
                    <div className="date-nav">
                      <button
                        className="date-nav-btn"
                        onClick={() => handleShiftDate(-1)}
                      >
                        <LeftOutlined />
                      </button>
                      <DatePicker
                        allowClear={false}
                        value={dayjs(selectedDate)}
                        onChange={(d) => d && setSelectedDate(d.format('YYYY-MM-DD'))}
                        format="ddd, DD/MM/YYYY"
                        className="date-picker-input"
                        variant="borderless"
                      />
                      <button className="date-nav-btn" onClick={() => handleShiftDate(1)}>
                        <RightOutlined />
                      </button>
                      {!isToday && (
                        <button
                          className="today-btn"
                          onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
                        >
                          Hôm nay
                        </button>
                      )}
                      {isToday && <span className="today-badge">Hôm nay</span>}
                    </div>

                    {/* Right-side filters */}
                    <div className="timeline-filters">
                      {uniqueCourtTypes.length > 0 && (
                        <div className="filter-group">
                          <span className="filter-label">Loại sân</span>
                          <Select
                            value={filterCourtType}
                            onChange={setFilterCourtType}
                            className="filter-select"
                            variant="borderless"
                            size="small"
                          >
                            <Select.Option value="All">Tất cả</Select.Option>
                            {uniqueCourtTypes.map((type) => (
                              <Select.Option key={type} value={type}>
                                {type}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      )}

                      {/* Legend */}
                      <div className="timeline-legend">
                        <span className="legend-dot legend-dot--booked" />
                        <span className="legend-text">Đã đặt</span>
                        <span className="legend-dot legend-dot--locked" />
                        <span className="legend-text">Khóa</span>
                        <span className="legend-dot legend-dot--free" />
                        <span className="legend-text">Trống</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {isTimelineLoading ? (
                    <div className="timeline-loading">
                      <Spin />
                      <span>Đang tải lịch sân…</span>
                    </div>
                  ) : (
                    <div className="timeline-container">
                      <BookingTimeline
                        facilityId={facilityId}
                        courts={filteredCourtList}
                        onBookingClick={handleOpenDetail}
                        onSlotClick={() => navigate('/bookings/create')}
                        searchTimeStart=""
                        searchTimeEnd=""
                        hasSearchedAvailable={false}
                      />
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'groups',
              label: (
                <span className="tab-label">
                  <UnorderedListOutlined />
                  Lịch định kỳ & nhóm
                </span>
              ),
              children: (
                <div className="tab-pane">
                  <BookingGroupsTab facilityId={facilityId} />
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        courts={courtList}
      />

      {/* Full Page Create Booking Drawer */}
      <Drawer
        title={null}
        placement="right"
        width="100%"
        open={isCreateOpen}
        onClose={() => navigate('/bookings')}
        destroyOnClose
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        <CreateBookingPage onClose={() => navigate('/bookings')} />
      </Drawer>
    </div>
  )
}
