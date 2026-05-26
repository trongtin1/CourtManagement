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
import { CreateBookingModal } from './CreateBookingModal'
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
  const [createOpen, setCreateOpen] = useState(false)
  const [createInit, setCreateInit] = useState<{ courtID?: number; slotTime?: string }>(
    {},
  )

  const openDetail = (booking: MockBooking) => {
    setDetailBooking(booking)
    setDetailOpen(true)
  }
  const openCreate = (courtID?: number, slotTime?: string) => {
    setCreateInit({ courtID, slotTime })
    setCreateOpen(true)
  }

  // Summary stats
  const todayBookings = useMemo(
    () => MOCK_BOOKINGS.filter((b) => b.bookingDate === selectedDate),
    [selectedDate],
  )
  const stats = useMemo(() => {
    const active = todayBookings.filter((b) => b.status !== 'cancelled')
    return {
      total: todayBookings.length,
      pending: todayBookings.filter((b) => b.status === 'pending').length,
      playing: todayBookings.filter((b) => b.status === 'playing').length,
      revenue: active.reduce((s, b) => s + b.totalAmount, 0),
    }
  }, [todayBookings])

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
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${view === 'timeline' ? 'active' : ''}`}
              onClick={() => setView('timeline')}
            >
              <CalendarOutlined /> Lịch biểu
            </button>
            <button
              className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <UnorderedListOutlined /> Danh sách
            </button>
          </div>

          {/* Date nav (timeline mode) */}
          {view === 'timeline' && (
            <div className="flex items-center gap-1">
              <Button
                size="small"
                icon={<LeftOutlined />}
                onClick={() => shiftDate(-1)}
              />
              <button
                className="px-3 py-1 rounded-lg text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 transition"
                onClick={() => {
                  setSelectedDate(dayjs().format('YYYY-MM-DD'))
                }}
              >
                {isToday ? `Hôm nay · ${dateLabel}` : dateLabel}
              </button>
              <Button
                size="small"
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

      {/* ── Summary cards ── */}
      {view === 'timeline' && (
        <div className="summary-card-grid">
          <div className="summary-card">
            <div
              className="card-icon"
              style={{ background: '#eff6ff', color: '#3b82f6' }}
            >
              📋
            </div>
            <div className="card-content">
              <h4>{stats.total}</h4>
              <p>Tổng booking</p>
            </div>
          </div>
          <div className="summary-card">
            <div
              className="card-icon"
              style={{ background: '#fffbeb', color: '#f59e0b' }}
            >
              ⏳
            </div>
            <div className="card-content">
              <h4>{stats.pending}</h4>
              <p>Chờ xử lý</p>
            </div>
          </div>
          <div className="summary-card">
            <div
              className="card-icon"
              style={{ background: '#ecfdf5', color: '#10b981' }}
            >
              🏃
            </div>
            <div className="card-content">
              <h4>{stats.playing}</h4>
              <p>Đang chơi</p>
            </div>
          </div>
          <div className="summary-card">
            <div
              className="card-icon"
              style={{ background: '#f0fdfa', color: '#14b8a6' }}
            >
              💰
            </div>
            <div className="card-content">
              <h4>{formatCompactCurrency(stats.revenue)}</h4>
              <p>Doanh thu ngày</p>
            </div>
          </div>
        </div>
      )}

      {/* ── ADVANCED AVAILABLE COURT FINDER WIDGET ── */}
      {view === 'timeline' && (
        <Card
          className="border border-teal-100 shadow-sm"
          styles={{ body: { padding: '16px 20px' } }}
          style={{
            background: 'linear-gradient(to right, #f9fdfd, #f0fdfa)',
            borderRadius: 12,
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-teal-800 tracking-wide uppercase flex items-center gap-1.5">
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
        <div className="quick-stat-bar" style={{ marginTop: 8 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="quick-stat-item">
              <span
                className={`status-dot ${key === 'playing' ? 'is-playing' : ''}`}
                style={{ background: cfg.dot }}
              />
              <span className="stat-label">{cfg.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Timeline view ── */}
      {view === 'timeline' && (
        <BookingTimeline
          selectedDate={selectedDate}
          onBookingClick={openDetail}
          onSlotClick={(courtID, startTime) => openCreate(courtID, startTime)}
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

      {/* ── Drawers / Modals ── */}
      <BookingDetailDrawer
        booking={detailBooking}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
      <CreateBookingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialCourtID={createInit.courtID}
        initialSlotTime={createInit.slotTime}
        initialDate={selectedDate}
      />
    </Space>
  )
}
