import { useState, useMemo } from 'react'
import {
  Button,
  Input,
  Select,
  Table,
  Tag,
  Space,
  Card,
  Row,
  Col,
  TimePicker,
  Switch,
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

  const dateLabel = dayjs(selectedDate).format('dddd, DD/MM/YYYY')
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
    <Space className="w-full" direction="vertical" size={16}>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {/* View toggle */}
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

          {/* Date nav (timeline mode) */}
          {view === 'timeline' && (
            <div className="flex items-center gap-1">
              <Button
                icon={<LeftOutlined />}
                onClick={() => shiftDate(-1)}
              />
              <Button
                className="font-semibold text-slate-700"
                onClick={() => {
                  setSelectedDate(dayjs().format('YYYY-MM-DD'))
                }}
              >
                {isToday ? `Hôm nay · ${dateLabel}` : dateLabel}
              </Button>
              <Button
                icon={<RightOutlined />}
                onClick={() => shiftDate(1)}
              />
            </div>
          )}

          {/* Search (list mode) */}
          {view === 'list' && (
            <Space wrap>
              <Input.Search
                allowClear
                placeholder="Tìm booking, khách, sân..."
                style={{ width: 280 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                allowClear
                placeholder="Trạng thái"
                style={{ width: 160 }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({
                  value: k,
                  label: v.label,
                }))}
              />
            </Space>
          )}
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>
          Tạo booking
        </Button>
      </div>

 

      {/* ── ADVANCED AVAILABLE COURT FINDER WIDGET ── */}
      {view === 'timeline' && (
        <Card
          className="border border-slate-200 shadow-sm bg-white"
          styles={{ body: { padding: '16px 20px' } }}
          style={{
            borderRadius: 12,
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                  <ThunderboltOutlined /> Bộ lọc thời gian & loại sân khả dụng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Kích hoạt lọc giờ:
                </span>
                <Switch
                  checked={isFilterActive}
                  onChange={(checked) => setIsFilterActive(checked)}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </div>
            </div>

            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={7}>
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  Giờ bắt đầu
                </div>
                <TimePicker
                  format="HH:mm"
                  minuteStep={30}
                  className="w-full"
                  showNow={false}
                  disabled={!isFilterActive}
                  value={searchTimeStart ? dayjs(searchTimeStart, 'HH:mm') : null}
                  onChange={(time) => {
                    if (time) {
                      setSearchTimeStart(time.format('HH:mm'))
                    }
                  }}
                />
              </Col>
              <Col xs={24} sm={8} md={7}>
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  Giờ kết thúc
                </div>
                <TimePicker
                  format="HH:mm"
                  minuteStep={30}
                  className="w-full"
                  showNow={false}
                  disabled={!isFilterActive}
                  value={searchTimeEnd ? dayjs(searchTimeEnd, 'HH:mm') : null}
                  onChange={(time) => {
                    if (time) {
                      setSearchTimeEnd(time.format('HH:mm'))
                    }
                  }}
                />
              </Col>
              <Col xs={24} sm={8} md={6}>
                <div className="text-xs text-slate-500 font-semibold mb-1">Loại sân</div>
                <Select
                  className="w-full"
                  disabled={!isFilterActive}
                  value={searchCourtType}
                  onChange={(v) => setSearchCourtType(v)}
                  options={uniqueCourtTypes.map((t) => ({
                    value: t,
                    label: t === 'All' ? 'Tất cả loại sân' : t,
                  }))}
                />
              </Col>
              <Col xs={24} md={4} className="flex justify-end">
                <div className="hidden md:block mb-5" />
                <Button
                  className="w-full font-bold"
                  icon={<SyncOutlined />}
                  onClick={handleResetFilter}
                  disabled={!isFilterActive}
                >
                  Đặt lại
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
      )}

      {/* ── Status legend ── */}
      {view === 'timeline' && (
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-md">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ background: cfg.dot }}
              />
              <span className="text-[11px] font-semibold text-slate-500">{cfg.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Timeline view ── */}
      {view === 'timeline' && (
        <BookingTimeline
          selectedDate={selectedDate}
          onBookingClick={openDetail}
          onSlotClick={() => openCreate()}
          searchTimeStart={searchTimeStart}
          searchTimeEnd={searchTimeEnd}
          hasSearchedAvailable={isFilterActive}
        />
      )}

      {/* ── List view ── */}
      {view === 'list' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Table<MockBooking>
            columns={[
              {
                title: 'Khách hàng',
                width: 200,
                render: (_, r) => {
                  const c = MOCK_CUSTOMERS.find((x) => x.customerID === r.customerID)
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {c?.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {c?.fullName}
                        </div>
                        <div className="text-xs text-slate-400">{c?.phone}</div>
                      </div>
                    </div>
                  )
                },
              },
              {
                title: 'Sân',
                width: 140,
                render: (_, r) => {
                  const court = MOCK_COURTS.find((x) => x.courtID === r.courtID)
                  return <span className="text-sm font-semibold">{court?.courtName}</span>
                },
              },
              {
                title: 'Ngày',
                dataIndex: 'bookingDate',
                width: 120,
                render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
              },
              {
                title: 'Giờ',
                width: 120,
                render: (_, r) => {
                  if (!r.slots.length) return '-'
                  return `${r.slots[0].startTime}–${r.slots[r.slots.length - 1].endTime}`
                },
              },
              {
                title: 'Tổng tiền',
                dataIndex: 'totalAmount',
                width: 120,
                render: (v: number) => (
                  <span className="font-bold text-emerald-600">
                    {formatCompactCurrency(v)}
                  </span>
                ),
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                width: 130,
                render: (v: string) => {
                  const cfg = STATUS_CONFIG[v]
                  return (
                    <Tag
                      color={cfg?.color}
                      bordered={false}
                      style={{ fontWeight: 600, fontSize: 12 }}
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
                width: 150,
                render: (v: string) => {
                  const cfg = PAYMENT_CONFIG[v]
                  return (
                    <span className="text-xs font-semibold" style={{ color: cfg?.color }}>
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
    </Space>
  )
}
