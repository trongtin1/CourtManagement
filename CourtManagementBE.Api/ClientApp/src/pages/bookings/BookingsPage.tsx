import { useState, useMemo } from 'react'
import {
  Button,
  Input,
  Select,
  Table,
  Tag,
  Row,
  Col,
  TimePicker,
  Switch,
  DatePicker,
} from 'antd'
import {
  PlusOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

import { useNavigate } from 'react-router-dom'
import {
  MOCK_BOOKINGS,
  MOCK_CUSTOMERS,
  MOCK_COURTS,
  STATUS_CONFIG,
  PAYMENT_CONFIG,
  type MockBooking,
} from './mockData'
import { formatCompactCurrency } from '@/utils/format'
import { BookingTimeline } from './BookingTimeline'
import { BookingDetailDrawer } from './BookingDetailDrawer'
import './bookings.css'

type ViewMode = 'timeline' | 'list'

export function BookingsPage() {
  const [view, setView] = useState<ViewMode>('timeline')
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  // Available court quick search/filter state
  const [searchTimeStart, setSearchTimeStart] = useState<string>('17:00')
  const [searchTimeEnd, setSearchTimeEnd] = useState<string>('19:00')
  const [searchCourtType, setSearchCourtType] = useState<string>('All')
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false)

  // Drawers / modals
  const [detailBooking, setDetailBooking] = useState<MockBooking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const navigate = useNavigate()

  const openDetail = (booking: MockBooking) => {
    setDetailBooking(booking)
    setDetailOpen(true)
  }

  const openCreate = () => {
    navigate('/bookings/create')
  }

  // List view filtering (across all dates)
  const filteredBookings = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return MOCK_BOOKINGS.filter((b) => {
      const cust = MOCK_CUSTOMERS.find((c) => c.customerID === b.customerID)
      const court = MOCK_COURTS.find((c) => c.courtID === b.courtID)
      const matchSearch =
        !q ||
        b.bookingID.toLowerCase().includes(q) ||
        cust?.fullName.toLowerCase().includes(q) ||
        court?.courtName.toLowerCase().includes(q) ||
        b.note?.toLowerCase().includes(q)
      const matchStatus = !statusFilter || b.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [searchText, statusFilter])

  const isToday = selectedDate === dayjs().format('YYYY-MM-DD')
  const shiftDate = (dir: -1 | 1) => {
    setSelectedDate(dayjs(selectedDate).add(dir, 'day').format('YYYY-MM-DD'))
  }

  const uniqueCourtTypes = useMemo(() => {
    const types = new Set(MOCK_COURTS.map((c) => c.courtType))
    return ['All', ...Array.from(types)]
  }, [])

  const handleResetFilter = () => {
    setIsFilterActive(false)
    setSearchTimeStart('17:00')
    setSearchTimeEnd('19:00')
    setSearchCourtType('All')
  }

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* ── Main Dashboard Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight m-0">
            Quản lý Lịch Đặt Sân
          </h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-1">
            Theo dõi, tìm kiếm sân trống và điều phối lịch đặt sân trực quan.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* View Switcher Segmented Control */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 border-none rounded-md text-xs font-semibold cursor-pointer transition-all duration-150 ${
                view === 'timeline'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => setView('timeline')}
            >
              <CalendarOutlined /> Lịch biểu
            </button>
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 border-none rounded-md text-xs font-semibold cursor-pointer transition-all duration-150 ${
                view === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => setView('list')}
            >
              <UnorderedListOutlined /> Danh sách
            </button>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openCreate()}
            className="h-10 rounded-xl px-5 font-bold shadow-md shadow-blue-100 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 flex items-center gap-1.5"
          >
            Tạo booking
          </Button>
        </div>
      </div>

      {/* ── Control & Filter Card (for Timeline View) ── */}
      {view === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Date Selector Group */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                icon={<LeftOutlined />}
                onClick={() => shiftDate(-1)}
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
                className="font-bold text-slate-750 h-10 rounded-xl px-4 border-slate-200 shadow-xs hover:border-blue-400 focus:border-blue-500 cursor-pointer"
                style={{ width: 240, borderRadius: '12px' }}
              />
              <Button
                icon={<RightOutlined />}
                onClick={() => shiftDate(1)}
                className="flex items-center justify-center rounded-xl h-10 w-10 hover:text-blue-600 hover:border-blue-300 border-slate-200"
              />

              {/* Về hôm nay Button */}
              <Button
                onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
                disabled={isToday}
                className={`rounded-xl px-3.5 font-semibold text-xs h-10 flex items-center justify-center transition-all cursor-pointer ${
                  isToday
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80 hover:bg-emerald-50! hover:text-emerald-600!'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                }`}
              >
                {isToday ? '• Hôm nay' : 'Về hôm nay'}
              </Button>
            </div>

            {/* Right: Quick Switch Finder */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-2 px-4 rounded-xl self-start lg:self-auto">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <ThunderboltOutlined className="text-amber-500 text-sm" />
                Bộ lọc thời gian & loại sân khả dụng
              </span>
              <Switch
                checked={isFilterActive}
                onChange={(checked) => setIsFilterActive(checked)}
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
                className="bg-slate-350"
              />
            </div>
          </div>

          {/* Sub-row: Availability Details Filter (Collapsible) */}
          {isFilterActive && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 transition-all duration-300 ease-in-out">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8} md={7}>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Giờ bắt đầu
                  </div>
                  <TimePicker
                    format="HH:mm"
                    minuteStep={30}
                    size="large"
                    className="w-full rounded-xl"
                    showNow={false}
                    value={searchTimeStart ? dayjs(searchTimeStart, 'HH:mm') : null}
                    onChange={(time) => {
                      if (time) {
                        setSearchTimeStart(time.format('HH:mm'))
                      }
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
                    className="w-full rounded-xl"
                    showNow={false}
                    value={searchTimeEnd ? dayjs(searchTimeEnd, 'HH:mm') : null}
                    onChange={(time) => {
                      if (time) {
                        setSearchTimeEnd(time.format('HH:mm'))
                      }
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
                    value={searchCourtType}
                    onChange={(v) => setSearchCourtType(v)}
                    options={uniqueCourtTypes.map((t) => ({
                      value: t,
                      label: t === 'All' ? 'Tất cả loại sân' : t,
                    }))}
                    style={{ borderRadius: '12px', height: '40px' }}
                  />
                </Col>
                <Col xs={24} md={4} className="flex flex-col justify-end">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 invisible hidden md:block">
                    &nbsp;
                  </div>
                  <Button
                    size="large"
                    className="w-full font-bold hover:text-red-500 hover:border-red-300 border-slate-200 flex items-center justify-center gap-1.5"
                    icon={<SyncOutlined />}
                    onClick={handleResetFilter}
                    style={{ borderRadius: '12px', height: '40px' }}
                  >
                    Đặt lại
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </div>
      )}

      {/* ── Search & Filters for List View ── */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 flex flex-wrap items-center gap-3">
          <Input.Search
            allowClear
            placeholder="Tìm kiếm mã booking, tên khách, số điện thoại, tên sân..."
            className="max-w-md w-full"
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: '12px' }}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            size="large"
            style={{ width: 180, borderRadius: '12px' }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
          />
          {statusFilter || searchText ? (
            <Button
              type="text"
              onClick={() => {
                setStatusFilter(undefined)
                setSearchText('')
              }}
              className="text-slate-400 hover:text-red-500 font-bold"
            >
              Xóa bộ lọc
            </Button>
          ) : null}
        </div>
      )}

      {/* ── Status Legend (Placed right above timeline/list for quick scanning) ── */}
      {view === 'timeline' && (
        <div className="flex flex-wrap items-center gap-2.5 px-1 mt-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1.5">
            Chú thích lịch:
          </span>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/50 rounded-xl shadow-3xs"
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ background: cfg.dot }}
              />
              <span className="text-xs font-bold text-slate-600">{cfg.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Timeline view ── */}
      {view === 'timeline' && (
        <div className="timeline-container mt-1">
          <BookingTimeline
            selectedDate={selectedDate}
            onBookingClick={openDetail}
            onSlotClick={() => openCreate()}
            searchTimeStart={searchTimeStart}
            searchTimeEnd={searchTimeEnd}
            hasSearchedAvailable={isFilterActive}
          />
        </div>
      )}

      {/* ── List view ── */}
      {view === 'list' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Table<MockBooking>
            columns={[
              {
                title: 'Khách hàng',
                width: 220,
                render: (_, r) => {
                  const c = MOCK_CUSTOMERS.find((x) => x.customerID === r.customerID)
                  return (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
                        {c?.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 leading-tight">
                          {c?.fullName}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                          {c?.phone}
                        </div>
                      </div>
                    </div>
                  )
                },
              },
              {
                title: 'Sân',
                width: 150,
                render: (_, r) => {
                  const court = MOCK_COURTS.find((x) => x.courtID === r.courtID)
                  return (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        {court?.courtName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {court?.courtType}
                      </span>
                    </div>
                  )
                },
              },
              {
                title: 'Ngày',
                dataIndex: 'bookingDate',
                width: 130,
                render: (v: string) => (
                  <span className="text-sm font-semibold text-slate-700">
                    {dayjs(v).format('DD/MM/YYYY')}
                  </span>
                ),
              },
              {
                title: 'Khung giờ',
                width: 135,
                render: (_, r) => {
                  if (!r.slots.length) return '-'
                  return (
                    <Tag className="m-0 font-bold border-0 bg-slate-100 text-slate-700 rounded-md text-xs px-2 py-0.5">
                      {r.slots[0].startTime} – {r.slots[r.slots.length - 1].endTime}
                    </Tag>
                  )
                },
              },
              {
                title: 'Tổng tiền',
                dataIndex: 'totalAmount',
                width: 130,
                render: (v: number) => (
                  <span className="font-extrabold text-emerald-650 text-sm">
                    {formatCompactCurrency(v)}
                  </span>
                ),
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                width: 140,
                render: (v: string) => {
                  const cfg = STATUS_CONFIG[v]
                  return (
                    <Tag
                      color={cfg?.color}
                      bordered={false}
                      style={{ fontWeight: 700, fontSize: 11, borderRadius: '6px' }}
                      className="m-0 px-2.5 py-0.5"
                    >
                      <span
                        className={`status-dot ${v === 'playing' ? 'is-playing' : ''}`}
                        style={{
                          background: cfg?.dot,
                          marginRight: 6,
                          verticalAlign: 'middle',
                        }}
                      />
                      {cfg?.label}
                    </Tag>
                  )
                },
              },
              {
                title: 'Thanh toán',
                dataIndex: 'paymentStatus',
                width: 155,
                render: (v: string) => {
                  const cfg = PAYMENT_CONFIG[v]
                  return (
                    <span className="text-xs font-bold" style={{ color: cfg?.color }}>
                      {cfg?.label}
                    </span>
                  )
                },
              },
              { title: 'Ghi chú', dataIndex: 'note', ellipsis: true },
            ]}
            dataSource={filteredBookings}
            rowKey="bookingID"
            size="middle"
            scroll={{ x: 1100 }}
            pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} booking` }}
            onRow={(record) => ({
              onClick: () => openDetail(record),
              style: { cursor: 'pointer' },
            })}
          />
        </div>
      )}

      {/* Drawers / Modals */}
      <BookingDetailDrawer
        booking={detailBooking}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
