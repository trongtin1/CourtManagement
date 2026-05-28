import { useState, useMemo } from 'react'
import {
  Button,
  Select,
  Row,
  Col,
  TimePicker,
  Switch,
  DatePicker,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { useNavigate } from 'react-router-dom'

import { BookingTimeline } from './BookingTimeline'
import { BookingDetailDrawer } from './BookingDetailDrawer'

import type { TimelineBookingResponse } from '@/features/courts/model/types'
import type { Booking } from '@/features/bookings/model/types'

import {
  useCourtsQuery,
  useCourtTimelineAvailabilityQuery,
} from '@/features/courts/api/useCourtQueries'

import { storage } from '@/utils/storage'
import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import './bookings.css'

export function BookingsPage() {
  const navigate = useNavigate()

  // ─── State ──────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))

  // ─── Time & Court Filter State ──────────────────────────────────────────────
  const [filterStartTime, setFilterStartTime] = useState('17:00')
  const [filterEndTime, setFilterEndTime] = useState('19:00')
  const [filterCourtType, setFilterCourtType] = useState('All')
  const [isTimeFilterActive, setIsTimeFilterActive] = useState(false)

  // ─── Detail Drawer State ─────────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState<
    Booking | TimelineBookingResponse | null
  >(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // ─── Data Queries ───────────────────────────────────────────────────────────
  const { data: courtsData, isLoading: isCourtsLoading } = useCourtsQuery()

  // Determine active facility from storage or first court
  const storedFacilityId = storage.get<string>(AUTH_STORAGE_KEYS.workingFacilityId)
  const facilityId = useMemo(() => {
    if (storedFacilityId && storedFacilityId !== 'all') {
      const parsed = parseInt(storedFacilityId, 10)
      if (!isNaN(parsed)) return parsed
    }
    return courtsData?.items[0]?.facilityID ?? 1
  }, [storedFacilityId, courtsData])

  const { data: timelineData, isLoading: isTimelineLoading } = useCourtTimelineAvailabilityQuery(
    facilityId,
    selectedDate,
  )

  const courtList = useMemo(() => timelineData ?? [], [timelineData])

  // Filter court list by type if filter is active
  const filteredCourtList = useMemo(() => {
    if (!isTimeFilterActive || filterCourtType === 'All') return courtList
    return courtList.filter(
      (court) => court.courtType.toLowerCase() === filterCourtType.toLowerCase()
    )
  }, [courtList, isTimeFilterActive, filterCourtType])

  // Get unique court types for the filter options
  const uniqueCourtTypes = useMemo(() => {
    const types = courtList.map((court) => court.courtType).filter(Boolean)
    return Array.from(new Set(types))
  }, [courtList])

  // ─── Actions & Helpers ───────────────────────────────────────────────────────
  const isToday = selectedDate === dayjs().format('YYYY-MM-DD')

  const handleShiftDate = (direction: -1 | 1) => {
    setSelectedDate(dayjs(selectedDate).add(direction, 'day').format('YYYY-MM-DD'))
  }

  const handleOpenBookingDetail = (booking: Booking | TimelineBookingResponse) => {
    setSelectedBooking(booking)
    setIsDrawerOpen(true)
  }

  const handleResetFilters = () => {
    setIsTimeFilterActive(false)
    setFilterStartTime('17:00')
    setFilterEndTime('19:00')
    setFilterCourtType('All')
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight m-0">
            Quản lý Lịch Đặt Sân
          </h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-1">
            Theo dõi, tìm kiếm sân trống và điều phối lịch đặt sân trực quan.
          </p>
        </div>
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/bookings/create')}
            className="h-10 rounded-xl px-5 font-bold shadow-md shadow-blue-100 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 flex items-center gap-1.5"
          >
            Tạo booking
          </Button>
        </div>
      </div>

      {isCourtsLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <Spin size="large" />
          <span className="text-slate-400 font-medium text-xs">
            Đang đồng bộ dữ liệu sân bãi...
          </span>
        </div>
      ) : (
        <>
          {/* ── Timeline Controls ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Date Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => handleShiftDate(-1)}
                  className="flex items-center justify-center rounded-xl h-10 w-10 hover:text-blue-600 hover:border-blue-300 border-slate-200"
                />
                <DatePicker
                  allowClear={false}
                  picker="date"
                  value={dayjs(selectedDate)}
                  onChange={(date) => {
                    if (date) setSelectedDate(date.format('YYYY-MM-DD'))
                  }}
                  format="dddd, DD/MM/YYYY"
                  className="font-bold h-10 rounded-xl px-4 border-slate-200"
                  style={{ width: 240, borderRadius: '12px' }}
                />
                <Button
                  icon={<RightOutlined />}
                  onClick={() => handleShiftDate(1)}
                  className="flex items-center justify-center rounded-xl h-10 w-10 hover:text-blue-600 hover:border-blue-300 border-slate-200"
                />
                <Button
                  onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
                  disabled={isToday}
                  className={`rounded-xl px-3.5 font-semibold text-xs h-10 flex items-center justify-center transition-all cursor-pointer ${
                    isToday
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                  }`}
                >
                  {isToday ? '• Hôm nay' : 'Về hôm nay'}
                </Button>
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-2 px-4 rounded-xl">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <ThunderboltOutlined className="text-amber-500 text-sm" />
                  Bộ lọc thời gian &amp; loại sân
                </span>
                <Switch
                  checked={isTimeFilterActive}
                  onChange={setIsTimeFilterActive}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </div>
            </div>

            {/* Filter Detail Panel */}
            {isTimeFilterActive && (
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={8} md={7}>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      Giờ bắt đầu
                    </div>
                    <TimePicker
                      format="HH:mm"
                      minuteStep={30}
                      size="large"
                      className="w-full"
                      showNow={false}
                      value={filterStartTime ? dayjs(filterStartTime, 'HH:mm') : null}
                      onChange={(time) => {
                        if (time) setFilterStartTime(time.format('HH:mm'))
                      }}
                      style={{ borderRadius: '12px', height: '40px' }}
                    />
                  </Col>
                  <Col xs={24} sm={8} md={7}>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      Giờ kết thúc
                    </div>
                    <TimePicker
                      format="HH:mm"
                      minuteStep={30}
                      size="large"
                      className="w-full"
                      showNow={false}
                      value={filterEndTime ? dayjs(filterEndTime, 'HH:mm') : null}
                      onChange={(time) => {
                        if (time) setFilterEndTime(time.format('HH:mm'))
                      }}
                      style={{ borderRadius: '12px', height: '40px' }}
                    />
                  </Col>
                  <Col xs={24} sm={8} md={6}>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      Loại sân
                    </div>
                    <Select
                      className="w-full"
                      size="large"
                      value={filterCourtType}
                      onChange={setFilterCourtType}
                      style={{ borderRadius: '12px', height: '40px' }}
                    >
                      <Select.Option value="All">Tất cả</Select.Option>
                      {uniqueCourtTypes.map((type) => (
                        <Select.Option key={type} value={type}>
                          {type}
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} md={4} className="flex flex-col justify-end">
                    <div className="text-[10px] invisible hidden md:block mb-1.5">
                      &nbsp;
                    </div>
                    <Button
                      size="large"
                      icon={<SyncOutlined />}
                      onClick={handleResetFilters}
                      className="w-full font-bold hover:text-red-500 hover:border-red-300 border-slate-200"
                      style={{ borderRadius: '12px', height: '40px' }}
                    >
                      Đặt lại
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </div>

          {/* ── Timeline Grid ── */}
          <div className="timeline-container mt-1">
            {isTimelineLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-2 bg-white rounded-2xl border border-slate-200">
                <Spin />
                <span className="text-slate-400 text-xs">Đang đồng bộ đặt lịch...</span>
              </div>
            ) : (
              <BookingTimeline
                facilityId={facilityId}
                courts={filteredCourtList}
                onBookingClick={handleOpenBookingDetail}
                onSlotClick={(courtId, startTime) =>
                  navigate(
                    `/bookings/create?courtId=${courtId}&date=${selectedDate}&startTime=${startTime}`,
                  )
                }
                searchTimeStart={filterStartTime}
                searchTimeEnd={filterEndTime}
                hasSearchedAvailable={isTimeFilterActive}
              />
            )}
          </div>
        </>
      )}

      {/* Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        courts={courtList}
      />
    </div>
  )
}
