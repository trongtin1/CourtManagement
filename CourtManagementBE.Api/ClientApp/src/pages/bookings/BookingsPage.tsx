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

  return (
    <div className="flex flex-col gap-0 font-sans">
      <div className="flex items-center justify-end gap-2 w-full">
        <Button
          icon={<PlusOutlined />}
          onClick={() => navigate('/bookings/create')}
          className="h-9 rounded-lg font-semibold text-xs px-4"
          type="primary"
        >
          Tạo booking
        </Button>
      </div>

      {isCourtsLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 px-5 text-slate-400 text-xs">
          <Spin size="large" />
          <span>Đang tải dữ liệu sân bãi…</span>
        </div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ActiveTab)}
          className="w-full"
          tabBarExtraContent={null}
          tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #f1f5f9' }}
          tabBarGutter={24}
          items={[
            {
              key: 'timeline',
              label: (
                <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                  <CalendarOutlined />
                  Lịch đặt sân
                </span>
              ),
              children: (
                <div className="pt-4">
                  {/* Date & Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 mb-3">
                    {/* Date Nav */}
                    <div className="flex items-center gap-1">
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-500 text-xs transition hover:border-slate-400 hover:text-slate-800 hover:bg-slate-50"
                        onClick={() => handleShiftDate(-1)}
                      >
                        <LeftOutlined />
                      </button>
                      <DatePicker
                        allowClear={false}
                        value={dayjs(selectedDate)}
                        onChange={(d) => d && setSelectedDate(d.format('YYYY-MM-DD'))}
                        format="ddd, DD/MM/YYYY"
                        className="w-52.5 text-sm font-semibold text-slate-900"
                        variant="borderless"
                      />
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-500 text-xs transition hover:border-slate-400 hover:text-slate-800 hover:bg-slate-50"
                        onClick={() => handleShiftDate(1)}
                      >
                        <RightOutlined />
                      </button>
                      {!isToday && (
                        <button
                          className="h-7.5 px-3 text-xs font-semibold border border-slate-200 rounded-md bg-slate-50 text-slate-500 transition hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700"
                          onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
                        >
                          Hôm nay
                        </button>
                      )}
                      {isToday && (
                        <span className="h-7.5 px-3 text-xs font-semibold border border-emerald-200 rounded-md bg-emerald-50 text-emerald-700 inline-flex items-center">
                          Hôm nay
                        </span>
                      )}
                    </div>

                    {/* Right-side filters */}
                    <div className="flex items-center gap-4">
                      {uniqueCourtTypes.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                            Loại sân
                          </span>
                          <Select
                            value={filterCourtType}
                            onChange={setFilterCourtType}
                            className="w-32.5 text-xs"
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
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[11px] font-medium text-slate-400 mr-1.5">
                          Đã đặt
                        </span>
                        <span className="w-2 h-2 rounded-full bg-zinc-300" />
                        <span className="text-[11px] font-medium text-slate-400 mr-1.5">
                          Khóa
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-300" />
                        <span className="text-[11px] font-medium text-slate-400 mr-1.5">
                          Trống
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {isTimelineLoading ? (
                    <div className="flex flex-col items-center justify-center gap-2.5 py-15 px-5 bg-white border border-slate-200 rounded-lg text-slate-400 text-xs">
                      <Spin />
                      <span>Đang tải lịch sân…</span>
                    </div>
                  ) : (
                    <div>
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
                <span className="inline-flex items-center gap-1.5 font-medium text-xs">
                  <UnorderedListOutlined />
                  Lịch định kỳ & nhóm
                </span>
              ),
              children: (
                <div className="pt-4">
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
