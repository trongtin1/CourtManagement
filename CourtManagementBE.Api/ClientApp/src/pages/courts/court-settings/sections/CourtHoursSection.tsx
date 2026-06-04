import { useMemo, useState, useCallback } from 'react'
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar'
import _withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './court-hours.css'
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Space,
  Switch,
  TimePicker,
  Typography,
  Badge,
  Spin,
} from 'antd'
import { CalendarOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import {
  useCourtLockedSlotsByCourtQuery,
  useCreateCourtLockedSlotMutation,
  useDeleteCourtLockedSlotMutation,
  useUpdateCourtLockedSlotMutation,
} from '@/features/courts/api/useCourtLockedSlotQueries'
import type {
  CourtLockedSlot as CourtLockedSlotDto,
  CreateCourtLockedSlotRequest,
} from '@/features/courts/model/types'
import { formatTime, toTimeSpan } from '@/utils/format'
import { useSystemSettingsQuery } from '@/features/facilities/api/useSystemSettingsQueries'
import { getDisabledTime } from '@/utils/format'

const withDragAndDrop: typeof _withDragAndDrop =
  (_withDragAndDrop as unknown as { default: typeof _withDragAndDrop }).default ??
  _withDragAndDrop
const localizer = dayjsLocalizer(dayjs)
const DnDCalendar = withDragAndDrop(Calendar)

const { Title, Text } = Typography

// ── Constants ─────────────────────────────────────────────────────────────────
const INITIAL_MONDAY = dayjs().startOf('week').add(1, 'day') // Monday

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface LockedSlot {
  id: string
  courtLockedSlotID?: number
  dayOfWeek?: number | null // 0 = CN, 1 = T2 ... (C# DayOfWeek)
  specificDate?: string | null // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  lockReason: string
  isWeekly: boolean
  isAllDay: boolean // Khóa cả ngày (Đóng cửa)
}

interface CourtHoursSectionProps {
  courtId: number
}

interface LockFormValues {
  applyType: 'weekly' | 'specific'
  isAllDay: boolean
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs]
  lockReason: string
}

interface RbcEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: LockedSlot
}

// ── Helper Conversions ────────────────────────────────────────────────────────
const apiDayToGridDay = (dow: number) => (dow === 0 ? 6 : dow - 1)
const gridDayToApiDay = (day: number) => (day === 6 ? 0 : day + 1)

const mapApiLockedSlot = (slot: CourtLockedSlotDto): LockedSlot => ({
  id: String(slot.courtLockedSlotID),
  courtLockedSlotID: slot.courtLockedSlotID,
  dayOfWeek: slot.dayOfWeek ?? null,
  specificDate: slot.specificDate ? dayjs(slot.specificDate).format('YYYY-MM-DD') : null,
  startTime: formatTime(slot.startTime),
  endTime: formatTime(slot.endTime),
  lockReason: slot.lockReason,
  isWeekly: slot.isWeekly,
  isAllDay: slot.isAllDay,
})

export function CourtHoursSection({ courtId }: CourtHoursSectionProps) {
  const { data: facility } = useSystemSettingsQuery()

  const startHour = facility?.openingTime
    ? parseInt(facility.openingTime.split(':')[0], 10)
    : 6

  const endHour = facility?.closingTime
    ? parseInt(facility.closingTime.split(':')[0], 10)
    : 22

  const totalMinutes = (endHour - startHour) * 60
  const snap = facility?.slotDurationMinutes || 60

  const minTime = useMemo(() => new Date(0, 0, 0, startHour, 0, 0), [startHour])
  const maxTime = useMemo(() => new Date(0, 0, 0, endHour, 0, 0), [endHour])

  const timeToMinutes = useCallback(
    (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number)
      return Math.max(0, Math.min(totalMinutes, (h - startHour) * 60 + m))
    },
    [startHour, totalMinutes],
  )

  const { message } = App.useApp()
  const [currentMonday, setCurrentMonday] = useState(INITIAL_MONDAY)
  const lockedSlotsQuery = useCourtLockedSlotsByCourtQuery(courtId)
  const createLockedSlotMutation = useCreateCourtLockedSlotMutation()
  const updateLockedSlotMutation = useUpdateCourtLockedSlotMutation()
  const deleteLockedSlotMutation = useDeleteCourtLockedSlotMutation()

  // ── State Modals ────────────────────────────────────────────────────────────
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [editingLock, setEditingLock] = useState<Partial<LockedSlot> | null>(null)
  const [form] = Form.useForm()

  const lockedSlots = useMemo(
    () => (lockedSlotsQuery.data ?? []).map(mapApiLockedSlot),
    [lockedSlotsQuery.data],
  )

  const isSaving =
    createLockedSlotMutation.isPending ||
    updateLockedSlotMutation.isPending ||
    deleteLockedSlotMutation.isPending

  // ── Mapping Sang Calendar Events ─────────────────────────────────────────────
  const events = useMemo<RbcEvent[]>(() => {
    const mapped: RbcEvent[] = []

    lockedSlots.forEach((lock) => {
      if (lock.isWeekly && lock.dayOfWeek !== undefined && lock.dayOfWeek !== null) {
        const gridDay = apiDayToGridDay(lock.dayOfWeek)
        const targetDate = currentMonday.add(gridDay, 'day')
        const [sh, sm] = lock.startTime.split(':').map(Number)
        const [eh, em] = lock.endTime.split(':').map(Number)

        mapped.push({
          id: lock.id,
          title: lock.isAllDay
            ? `🔒 ĐÓNG CỬA CẢ NGÀY: ${lock.lockReason}`
            : `🔒 KHÓA: ${lock.lockReason}`,
          start: targetDate.hour(sh).minute(sm).toDate(),
          end: targetDate.hour(eh).minute(em).toDate(),
          resource: lock,
        })
      } else if (lock.specificDate) {
        const lockDate = dayjs(lock.specificDate)
        const isThisWeek =
          lockDate.isAfter(currentMonday.subtract(1, 'day')) &&
          lockDate.isBefore(currentMonday.add(7, 'day'))

        if (isThisWeek) {
          const [sh, sm] = lock.startTime.split(':').map(Number)
          const [eh, em] = lock.endTime.split(':').map(Number)

          mapped.push({
            id: lock.id,
            title: lock.isAllDay
              ? `🔒 ĐÓNG CỬA CẢ NGÀY: ${lock.lockReason}`
              : `🔒 KHÓA: ${lock.lockReason}`,
            start: lockDate.hour(sh).minute(sm).toDate(),
            end: lockDate.hour(eh).minute(em).toDate(),
            resource: lock,
          })
        }
      }
    })

    return mapped
  }, [currentMonday, lockedSlots])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const s = dayjs(start)
    const e = dayjs(end)
    const gridDay = s.day() === 0 ? 6 : s.day() - 1

    setEditingLock({
      id: '',
      dayOfWeek: gridDayToApiDay(gridDay),
      specificDate: s.format('YYYY-MM-DD'),
      startTime: s.format('HH:mm'),
      endTime: e.format('HH:mm'),
      lockReason: '',
      isWeekly: false,
      isAllDay: false,
    })
    setIsLockModalOpen(true)
  }

  const handleSelectEvent = (event: object) => {
    const rbcEv = event as RbcEvent
    setEditingLock(rbcEv.resource)
    setIsLockModalOpen(true)
  }

  const handleSaveLock = async (values: LockFormValues) => {
    if (!editingLock) return

    const isAllDay = !!values.isAllDay
    const defaultStart = facility?.openingTime
      ? facility.openingTime.substring(0, 5)
      : '06:00'
    const defaultEnd = facility?.closingTime
      ? facility.closingTime.substring(0, 5)
      : '22:00'
    const newLock: LockedSlot = {
      id: editingLock.id || `lock-${Date.now()}`,
      startTime:
        isAllDay || !values.timeRange
          ? defaultStart
          : values.timeRange[0].format('HH:mm'),
      endTime:
        isAllDay || !values.timeRange ? defaultEnd : values.timeRange[1].format('HH:mm'),
      lockReason: values.lockReason,
      isWeekly: values.applyType === 'weekly',
      isAllDay,
      dayOfWeek: values.applyType === 'weekly' ? editingLock.dayOfWeek : null,
      specificDate: values.applyType === 'specific' ? editingLock.specificDate : null,
    }

    // Kiểm tra va chạm khung giờ khóa trùng nhau
    const hasOverlap = lockedSlots.some((lk) => {
      if (lk.id === newLock.id) return false

      const dayMatches =
        (newLock.isWeekly && lk.isWeekly && lk.dayOfWeek === newLock.dayOfWeek) ||
        (!newLock.isWeekly && !lk.isWeekly && lk.specificDate === newLock.specificDate) ||
        (newLock.isWeekly &&
          !lk.isWeekly &&
          dayjs(lk.specificDate).day() === newLock.dayOfWeek) ||
        (!newLock.isWeekly &&
          lk.isWeekly &&
          dayjs(newLock.specificDate).day() === lk.dayOfWeek)

      if (!dayMatches) return false

      const s1 = timeToMinutes(newLock.startTime)
      const e1 = timeToMinutes(newLock.endTime)
      const s2 = timeToMinutes(lk.startTime)
      const e2 = timeToMinutes(lk.endTime)

      return s1 < e2 && e1 > s2
    })

    if (hasOverlap) {
      message.error('Khung giờ này đã bị khóa bởi một lịch biểu khác!')
      return
    }

    const payload: CreateCourtLockedSlotRequest = {
      courtID: courtId,
      dayOfWeek: newLock.isWeekly ? (newLock.dayOfWeek ?? null) : null,
      specificDate: newLock.isWeekly ? null : (newLock.specificDate ?? null),
      startTime: toTimeSpan(newLock.startTime),
      endTime: toTimeSpan(newLock.endTime),
      isWeekly: newLock.isWeekly,
      isAllDay: newLock.isAllDay,
      lockReason: newLock.lockReason,
      isActive: true,
    }

    try {
      if (editingLock.courtLockedSlotID) {
        await updateLockedSlotMutation.mutateAsync({
          id: editingLock.courtLockedSlotID,
          data: payload,
        })
      } else {
        await createLockedSlotMutation.mutateAsync(payload)
      }

      await lockedSlotsQuery.refetch()
      setIsLockModalOpen(false)
      setEditingLock(null)
      form.resetFields()
      message.success(
        isAllDay
          ? 'Đã đóng cửa sân cả ngày thành công!'
          : 'Đã lưu cấu hình khóa khung giờ!',
      )
    } catch (error) {
      console.error(error)
      message.error('Không thể lưu lịch khóa sân. Vui lòng thử lại.')
    }
  }

  const handleDeleteLock = async () => {
    if (!editingLock?.courtLockedSlotID) return
    try {
      await deleteLockedSlotMutation.mutateAsync(editingLock.courtLockedSlotID)
      await lockedSlotsQuery.refetch()
      setIsLockModalOpen(false)
      setEditingLock(null)
      form.resetFields()
      message.success('Đã mở khóa khung giờ thành công!')
    } catch (error) {
      console.error(error)
      message.error('Không thể mở khóa khung giờ. Vui lòng thử lại.')
    }
  }

  // ── Styling / Custom Render trên Lịch ─────────────────────────────────────────
  const eventPropGetter = (event: object) => {
    const ev = event as RbcEvent
    if (ev.resource.isAllDay) {
      return {
        style: {
          background:
            'repeating-linear-gradient(45deg, #fee2e2, #fee2e2 10px, #fecaca 10px, #fecaca 20px)',
          border: '1.5px solid #f87171',
          color: '#b91c1c',
          opacity: 0.95,
          fontWeight: 700,
          fontSize: '11px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center' as const,
          boxShadow: 'inset 0 0 10px rgba(220, 38, 38, 0.05)',
        },
      }
    }

    const isWeekly = ev.resource.isWeekly
    return {
      style: {
        background: isWeekly ? '#fff1f2' : '#fff7ed',
        borderLeft: `4px solid ${isWeekly ? '#f43f5e' : '#f97316'}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        color: isWeekly ? '#e11d48' : '#ea580c',
        borderRadius: '8px',
        padding: '4px 8px',
        fontWeight: 600,
        fontSize: '11px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
      },
    }
  }

  const calendarComponents = {
    toolbar: () => null as never,
  }

  // ── Render ──
  return (
    <div className="font-sans bg-white rounded-3xl p-6 shadow-xs border border-slate-100 text-left">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <Space align="start" size={16}>
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white text-2xl shadow-md shadow-rose-100">
            <CalendarOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
              Lịch khả dụng & Khóa sân
            </Title>
            <Text type="secondary" className="text-sm">
              Xem chi tiết lịch biểu của sân và thiết lập các khoảng thời gian đóng cửa
              hoặc khóa sân (Cả ngày hoặc theo giờ).
            </Text>
          </div>
        </Space>

        {/* Quick Action */}
        <Button
          type="primary"
          danger
          icon={<LockOutlined />}
          onClick={() => {
            setEditingLock({
              id: '',
              dayOfWeek: 1,
              specificDate: dayjs().format('YYYY-MM-DD'),
              startTime: '08:00',
              endTime: '10:00',
              lockReason: '',
              isWeekly: false,
              isAllDay: false,
            })
            setIsLockModalOpen(true)
          }}
          className="rounded-xl font-semibold h-11 bg-linear-to-r from-rose-500 to-rose-600 border-0"
        >
          Khóa giờ / Đóng cửa sân
        </Button>
      </div>

      <div className="space-y-5 animate-in fade-in duration-300">
        {lockedSlotsQuery.isLoading && (
          <div className="flex items-center justify-center py-10">
            <Spin />
          </div>
        )}

        {lockedSlotsQuery.isError && (
          <Card size="small" className="rounded-2xl border-red-100 bg-red-50/30">
            <Text type="danger">Không thể tải dữ liệu khóa sân. Vui lòng thử lại.</Text>
          </Card>
        )}

        {/* Week Navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentMonday(INITIAL_MONDAY)}
              disabled={currentMonday.isSame(INITIAL_MONDAY, 'day')}
              type={currentMonday.isSame(INITIAL_MONDAY, 'day') ? 'default' : 'primary'}
              className="rounded-xl font-bold text-xs h-10"
            >
              Về tuần hiện tại
            </Button>
            <DatePicker
              picker="week"
              value={currentMonday}
              onChange={(date) =>
                date && setCurrentMonday(dayjs(date).startOf('week').add(1, 'day'))
              }
              allowClear={false}
              className="rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-xl shadow-xs border border-slate-100">
            <CalendarOutlined className="text-rose-500 text-base" />
            <span className="text-sm font-bold text-slate-700">
              Tuần: {currentMonday.format('DD/MM')} –{' '}
              {currentMonday.add(6, 'day').format('DD/MM/YYYY')}
            </span>
          </div>
        </div>

        {/* Interactive Info Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card size="small" className="rounded-2xl border-rose-100 bg-rose-50/20">
            <Badge
              status="processing"
              color="#f43f5e"
              text={
                <span className="font-bold text-slate-700 text-xs">
                  Khóa hàng tuần (Weekly Lock)
                </span>
              }
            />
            <p className="text-[11px] text-slate-500 m-0 mt-1 pl-4">
              Khóa cố định khung giờ cụ thể lặp lại vào mọi tuần.
            </p>
          </Card>
          <Card size="small" className="rounded-2xl border-orange-100 bg-orange-50/20">
            <Badge
              status="warning"
              color="#f97316"
              text={
                <span className="font-bold text-slate-700 text-xs">
                  Khóa ngày cụ thể (One-time Lock)
                </span>
              }
            />
            <p className="text-[11px] text-slate-500 m-0 mt-1 pl-4">
              Khóa khung giờ duy nhất trên 1 ngày cụ thể được chọn.
            </p>
          </Card>
          <Card size="small" className="rounded-2xl border-red-200 bg-red-50/30">
            <Badge
              status="error"
              color="#dc2626"
              text={
                <span className="font-bold text-slate-700 text-xs">
                  Sân đóng cửa cả ngày (All Day Closed)
                </span>
              }
            />
            <p className="text-[11px] text-slate-500 m-0 mt-1 pl-4">
              Đóng cửa toàn bộ sân nguyên ngày (Ví dụ: Bảo trì, Lễ tết).
            </p>
          </Card>
        </div>

        {/* Calendar Wrapper */}
        <div className="rbc-court-wrapper rounded-3xl border border-slate-100 shadow-sm overflow-hidden court-hours-calendar-container">
          <DnDCalendar
            localizer={localizer}
            events={events}
            defaultView={Views.WEEK}
            views={[Views.WEEK]}
            date={currentMonday.toDate()}
            min={minTime}
            max={maxTime}
            step={snap}
            timeslots={1}
            selectable
            resizable={false}
            components={calendarComponents}
            eventPropGetter={eventPropGetter}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            scrollToTime={minTime}
            formats={{
              dayFormat: (date: Date) => {
                const d = dayjs(date)
                const label = d.day() === 0 ? 'CN' : `T${d.day() + 1}`
                const isClosed = lockedSlots.some(
                  (lk) => lk.isAllDay && lk.specificDate === d.format('YYYY-MM-DD'),
                )
                return `${label} (${d.format('DD/MM')}) ${isClosed ? '🚫' : ''}`
              },
              timeGutterFormat: (date: Date) => dayjs(date).format('HH:mm'),
            }}
          />
        </div>
      </div>

      {/* ─────────────────── MODAL KHÓA KHUNG GIỜ / ĐÓNG CỬA SÂN ─────────────────── */}
      <Modal
        open={isLockModalOpen}
        onCancel={() => {
          setIsLockModalOpen(false)
          setEditingLock(null)
          form.resetFields()
        }}
        footer={null}
        width={380}
        destroyOnClose
        confirmLoading={isSaving}
        title={
          <div className="pb-2 border-b border-slate-100 text-left">
            <Title
              level={4}
              style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <LockOutlined className="text-rose-500" />
              <span>
                {editingLock?.courtLockedSlotID
                  ? 'Chi tiết khung giờ đang khóa'
                  : 'Chặn lịch / Đóng cửa sân'}
              </span>
            </Title>
            <Text type="secondary" className="text-xs mt-1 block">
              {editingLock?.courtLockedSlotID
                ? 'Thông tin chi tiết về khung giờ đang bị khóa và tùy chọn mở khóa.'
                : 'Thiết lập khóa khung giờ hoặc đóng cửa sân nguyên ngày để ngăn chặn đặt lịch.'}
            </Text>
          </div>
        }
      >
        {editingLock &&
          (editingLock.courtLockedSlotID ? (
            /* View & Unlock Mode for Existing Locks */
            <div className="pt-4 space-y-4 text-left">
              <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge status="error" color="#f43f5e" />
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Trạng thái: Đang khóa sân
                  </span>
                </div>

                <div className="border-t border-rose-100/50 pt-2 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kiểu áp dụng:
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {editingLock.isWeekly
                        ? 'Lặp lại hàng tuần (Cố định)'
                        : 'Chỉ một ngày duy nhất'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Thời gian áp dụng:
                    </span>
                    <span className="text-xs font-bold text-slate-750">
                      {editingLock.isWeekly
                        ? `Thứ ${editingLock.dayOfWeek === 0 ? 'Chủ Nhật' : (editingLock.dayOfWeek ?? 1) + 1}`
                        : `Ngày ${dayjs(editingLock.specificDate).format('DD/MM/YYYY')}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Khung giờ khóa:
                    </span>
                    <span className="text-xs font-bold text-slate-750">
                      {editingLock.isAllDay
                        ? `🚫 Đóng cửa cả ngày (${facility?.openingTime ? facility.openingTime.substring(0, 5) : '06:00'} – ${facility?.closingTime ? facility.closingTime.substring(0, 5) : '22:00'})`
                        : `⏰ ${editingLock.startTime} – ${editingLock.endTime}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Lý do khóa sân:
                    </span>
                    <span className="text-xs font-semibold text-slate-600 italic block mt-0.5">
                      "{editingLock.lockReason || 'Không có lý do cụ thể'}"
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  onClick={() => {
                    setIsLockModalOpen(false)
                    setEditingLock(null)
                  }}
                  className="rounded-xl font-bold flex-1 h-11 border-slate-200 text-slate-500 hover:text-slate-700"
                >
                  Đóng
                </Button>
                <Button
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteLock}
                  loading={deleteLockedSlotMutation.isPending}
                  className="rounded-xl font-bold flex-1 h-11 bg-linear-to-r from-rose-500 to-rose-600 border-0 flex items-center justify-center gap-1.5 shadow-md shadow-rose-100"
                >
                  Mở khóa sân
                </Button>
              </div>
            </div>
          ) : (
            /* Create Mode Form for New Locks */
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                applyType: editingLock.isWeekly ? 'weekly' : 'specific',
                isAllDay: editingLock.isAllDay,
                timeRange: [
                  dayjs(
                    editingLock.startTime ||
                      (facility?.openingTime
                        ? facility.openingTime.substring(0, 5)
                        : '06:00'),
                    'HH:mm',
                  ),
                  dayjs(
                    editingLock.endTime ||
                      (facility?.closingTime
                        ? facility.closingTime.substring(0, 5)
                        : '22:00'),
                    'HH:mm',
                  ),
                ],
                lockReason: editingLock.lockReason,
              }}
              onFinish={handleSaveLock}
              className="pt-4 space-y-4 text-left"
            >
              {/* Kiểu Áp Dụng */}
              <Form.Item
                label={
                  <span className="text-xs font-bold text-slate-600">Kiểu áp dụng</span>
                }
                name="applyType"
              >
                <Radio.Group className="w-full flex" buttonStyle="solid">
                  <Radio.Button
                    value="weekly"
                    className="flex-1 text-center text-xs font-bold"
                  >
                    Hàng tuần
                  </Radio.Button>
                  <Radio.Button
                    value="specific"
                    className="flex-1 text-center text-xs font-bold"
                  >
                    Chỉ ngày{' '}
                    {editingLock.specificDate
                      ? dayjs(editingLock.specificDate).format('DD/MM')
                      : dayjs().format('DD/MM')}
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              {/* Switch Khóa Cả Ngày */}
              <div
                className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
                style={{ marginBottom: 12 }}
              >
                <div>
                  <div className="text-xs font-bold text-slate-700">
                    🚫 Khóa cả ngày (Đóng cửa sân)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Khóa toàn bộ thời gian hoạt động của ngày
                  </div>
                </div>
                <Form.Item name="isAllDay" valuePropName="checked" noStyle>
                  <Switch
                    onChange={(checked) => {
                      if (checked) {
                        form.setFieldsValue({
                          timeRange: [
                            dayjs(
                              facility?.openingTime
                                ? facility.openingTime.substring(0, 5)
                                : '06:00',
                              'HH:mm',
                            ),
                            dayjs(
                              facility?.closingTime
                                ? facility.closingTime.substring(0, 5)
                                : '22:00',
                              'HH:mm',
                            ),
                          ],
                        })
                      }
                    }}
                  />
                </Form.Item>
              </div>

              {/* Chọn Khung Giờ (Chỉ hiển thị khi không khóa cả ngày) */}
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.isAllDay !== curr.isAllDay}
              >
                {({ getFieldValue }) => {
                  const isAllDay = getFieldValue('isAllDay')
                  if (isAllDay) return null

                  return (
                    <Form.Item
                      label={
                        <span className="text-xs font-bold text-slate-600">
                          Khoảng thời gian khóa
                        </span>
                      }
                      name="timeRange"
                      rules={[
                        { required: true, message: 'Vui lòng chọn khung giờ khóa!' },
                      ]}
                    >
                      <TimePicker.RangePicker
                        format="HH:mm"
                        className="w-full rounded-xl py-2 px-4"
                        allowClear={false}
                        disabledTime={getDisabledTime(
                          facility?.openingTime,
                          facility?.closingTime,
                        )}
                      />
                    </Form.Item>
                  )
                }}
              </Form.Item>

              {/* Lý Do */}
              <Form.Item
                label={
                  <span className="text-xs font-bold text-slate-600">
                    Lý do khóa sân / Đóng cửa
                  </span>
                }
                name="lockReason"
                rules={[{ required: true, message: 'Vui lòng điền lý do!' }]}
              >
                <Input.TextArea
                  placeholder="Ví dụ: Dành riêng cho Học viện tập luyện cố định, Bảo trì mặt sân, Nghỉ lễ..."
                  rows={3}
                  className="rounded-xl"
                />
              </Form.Item>

              <div className="flex gap-2.5 pt-2">
                <Button
                  onClick={() => {
                    setIsLockModalOpen(false)
                    setEditingLock(null)
                    form.resetFields()
                  }}
                  className="rounded-xl font-bold flex-1 h-11 border-slate-200 text-slate-500 hover:text-slate-700"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="rounded-xl font-bold flex-1 h-11 bg-linear-to-r from-rose-500 to-rose-600 border-0 flex items-center justify-center shadow-md shadow-rose-100"
                >
                  Lưu cấu hình
                </Button>
              </div>
            </Form>
          ))}
      </Modal>
    </div>
  )
}
