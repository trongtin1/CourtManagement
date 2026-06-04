import { useMemo, useState } from 'react'

import './court-price.css'
import {
  App,
  Button,
  DatePicker,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
  Popover,
  Tag,
  TimePicker,
} from 'antd'
import {
  CalendarOutlined,
  SaveOutlined,
  WalletOutlined,
  ImportOutlined,
  LockOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import {
  useCourtPricesByCourtQuery,
  useCreateCourtPriceMutation,
  useDeleteCourtPriceMutation,
  useUpdateCourtPriceMutation,
} from '@/features/courts/api/useCourtPriceQueries'
import { usePriceRuleTypesQuery } from '@/features/courts/api/usePriceRuleTypeQueries'
import { useCourtDefaultPriceRulesQuery } from '@/features/courts/api/useCourtDefaultPriceRuleQueries'
import { useSystemSettingsQuery } from '@/features/facilities/api/useSystemSettingsQueries'
import type {
  CourtPrice,
  PriceRuleType,
  CourtDefaultPriceRule,
} from '@/features/courts/model/types'
import {
  formatCurrency,
  formatMinutesAsTime,
  formatTime,
  getMonday,
  gridDayLabel,
  toTimeSpan,
  getDisabledTime,
} from '@/utils/format'
import { CourtWeekCalendar, type EventInteractionArgs } from '@/components/calendar/CourtWeekCalendar'
import { COURT_WEEK_CALENDAR_FORMATS } from '@/components/calendar/courtWeekCalendarFormats'

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_PRICE = 150000
const INITIAL_MONDAY = getMonday()
const timeSlots = 1

export interface PriceBlock {
  id: string
  courtPriceRuleID?: number
  priceRuleTypeID?: number | null
  day: number // 0=Mon … 6=Sun
  start: number // minutes offset from START_HOUR
  end: number
  price: number
  label?: string
  specificDate?: string | null
  isMapping?: boolean
  isLocked?: boolean
  lockReason?: string | null
}

interface CourtPriceSectionProps {
  courtId: number
  setRules?: (rules: PriceBlock[]) => void
}

interface RbcEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: PriceBlock
}

const getMondayOfDate = (date: dayjs.Dayjs): dayjs.Dayjs => {
  const dow = date.day()
  const diff = dow === 0 ? -6 : 1 - dow
  return date.add(diff, 'day').startOf('day')
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const generateId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const formatApiTime = (value?: string): string => formatTime(value) || '00:00'
const apiDayToGridDay = (dow: number) => (dow === 0 ? 6 : dow - 1)
const gridDayToApiDay = (day: number) => (day === 6 ? 0 : day + 1)

const hasCollision = (blocks: PriceBlock[], candidate: PriceBlock, excludeId?: string) =>
  blocks.some(
    (b) =>
      b.id !== excludeId &&
      b.day === candidate.day &&
      b.start < candidate.end &&
      b.end > candidate.start,
  )


// ── Custom Event ──────────────────────────────────────────────────────────────
function PriceEventTooltipContent({
  block,
  startHour,
}: {
  block: PriceBlock
  startHour: number
}) {
  const timeStr = `${formatMinutesAsTime(startHour * 60 + block.start)} – ${formatMinutesAsTime(startHour * 60 + block.end)}`
  const durationMin = block.end - block.start

  return (
    <div className="p-1 space-y-2.5 min-w-52.5 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <CalendarOutlined className="text-blue-500 text-[13px]" />
          {gridDayLabel(block.day)}
        </span>
        <Tag
          color="blue"
          className="m-0 text-[10px] px-1.5 py-0 border-0 bg-blue-50 text-blue-600 font-semibold rounded-md"
        >
          {durationMin} phút
        </Tag>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Thời gian:</span>
          <span className="font-semibold text-slate-700">{timeStr}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Đơn giá:</span>
          <span className="font-extrabold text-blue-600 text-[13px]">
            {formatCurrency(block.price)}
          </span>
        </div>

        {block.label && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Loại khung giờ:
            </span>
            <Tag
              color="cyan"
              className="m-0 text-[10px] font-semibold border-0 rounded-md"
            >
              {block.label}
            </Tag>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Áp dụng:</span>
          {block.specificDate ? (
            <Tag
              color="orange"
              className="m-0 text-[10px] font-semibold border-0 rounded-md"
            >
              📌 {dayjs(block.specificDate).format('DD/MM/YYYY')}
            </Tag>
          ) : (
            <Tag
              color="green"
              className="m-0 text-[10px] font-semibold border-0 rounded-md"
            >
              🔄 Hằng tuần
            </Tag>
          )}
        </div>

        {block.isMapping && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Nguồn gốc:</span>
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              ⚙️ Giá hệ thống
            </span>
          </div>
        )}

        {block.isLocked && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-2 mt-2 space-y-1">
            <div className="text-[10px] font-bold text-red-600 flex items-center gap-1">
              <LockOutlined className="text-[11px]" /> Đã khóa
            </div>
            {block.lockReason && (
              <div className="text-[10px] text-red-500 leading-tight">
                Lý do: {block.lockReason}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PriceEvent({
  event,
  onDelete,
  startHour,
}: {
  event: RbcEvent
  onDelete: (id: string) => void
  startHour: number
}) {
  const block = event.resource
  const duration = block.end - block.start
  const isShort = duration <= 30

  const timeStr = `${formatMinutesAsTime(startHour * 60 + block.start)} – ${formatMinutesAsTime(startHour * 60 + block.end)}`
  const displayPrice = isShort ? `${block.price / 1000}k` : formatCurrency(block.price)

  const content = (
    <div
      className={`group relative h-full flex flex-col justify-between overflow-hidden px-1.5 py-1 gap-0.5 ${
        block.isLocked ? 'cursor-not-allowed opacity-90 font-medium' : ''
      }`}
      style={{ minHeight: '100%' }}
    >
      {isShort ? (
        <div className="flex items-center justify-between w-full h-full text-[10px] leading-none select-none font-bold">
          <div className="flex items-center gap-0.5 truncate mr-4">
            {block.isLocked && <LockOutlined className="text-red-500 text-[9px]" />}
            {block.specificDate && <span className="text-[8px]">📌</span>}
            {block.isMapping && <span className="text-[9px]">⚙️</span>}
            <span className="text-[10.5px] font-extrabold">{displayPrice}</span>
          </div>
          <span className="opacity-60 text-[8px] font-medium hidden sm:inline shrink-0">
            {formatMinutesAsTime(startHour * 60 + block.start)}
          </span>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-0.5">
            <p className="text-[9px] font-semibold leading-none truncate opacity-75 m-0 flex items-center justify-between">
              <span>{timeStr}</span>
              {block.isLocked && (
                <LockOutlined
                  className="text-[9px] text-red-500 shrink-0"
                  title={`Đã khóa: ${block.lockReason || 'Không có lý do'}`}
                />
              )}
            </p>
            <p className="text-xs font-bold leading-tight truncate m-0 flex items-center gap-0.5">
              {block.specificDate && (
                <span
                  title="Chỉ áp dụng cho ngày cụ thể này"
                  className="text-[9px] shrink-0"
                >
                  📌
                </span>
              )}
              {block.isMapping && (
                <span title="Giá mặc định của hệ thống" className="text-[10px] shrink-0">
                  ⚙️
                </span>
              )}
              <span className="font-extrabold text-[11.5px]">{displayPrice}</span>
            </p>
            {block.label && (
              <span className="text-[8.5px] font-bold truncate opacity-75 block leading-none">
                {block.label}
              </span>
            )}
          </div>
          {block.isLocked && block.lockReason && (
            <span
              className="text-[8px] font-bold truncate text-red-600 block mt-auto leading-none"
              title={block.lockReason}
            >
              🔒 {block.lockReason}
            </span>
          )}
        </div>
      )}

      {!block.isMapping && !block.isLocked && (
        <button
          className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-white/90 text-slate-800
                     opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center
                     hover:bg-red-500 hover:text-white z-20 font-black text-[9px] leading-none border border-slate-200 cursor-pointer shadow-sm"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(block.id)
          }}
        >
          ×
        </button>
      )}
    </div>
  )

  return (
    <Popover
      content={<PriceEventTooltipContent block={block} startHour={startHour} />}
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.15}
      overlayClassName="court-price-popover"
    >
      {content}
    </Popover>
  )
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({
  block,
  priceRuleTypes,
  open,
  currentMonday,
  facility,
  startHour,
  onSave,
  onCancel,
}: {
  block: PriceBlock | null
  priceRuleTypes: PriceRuleType[]
  open: boolean
  currentMonday: dayjs.Dayjs
  facility?: { openingTime: string; closingTime: string }
  startHour: number
  onSave: (data: {
    price: number
    priceRuleTypeID: number | null
    specificDate: string | null
    start?: number
    end?: number
  }) => void
  onCancel: () => void
}) {
  const { message } = App.useApp()
  const [prevBlockId, setPrevBlockId] = useState<string | null>(null)
  const [price, setPrice] = useState(block?.price ?? DEFAULT_PRICE)
  const [typeId, setTypeId] = useState<number | null>(block?.priceRuleTypeID ?? null)
  const [applyType, setApplyType] = useState<'weekly' | 'specific'>('weekly')
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null)
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null)

  const currentId = block?.id ?? null
  if (currentId !== prevBlockId) {
    setPrevBlockId(currentId)
    if (block) {
      setPrice(block.price)
      setTypeId(block.priceRuleTypeID ?? null)
      setApplyType(block.specificDate ? 'specific' : 'weekly')
      setStartTime(dayjs(formatMinutesAsTime(startHour * 60 + block.start), 'HH:mm'))
      setEndTime(dayjs(formatMinutesAsTime(startHour * 60 + block.end), 'HH:mm'))
    }
  }

  if (!block) return null

  // Calculate start/end offset in minutes from startHour
  const startMin = startTime
    ? (startTime.hour() - startHour) * 60 + startTime.minute()
    : block.start
  const endMin = endTime
    ? (endTime.hour() - startHour) * 60 + endTime.minute()
    : block.end

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={320}
      destroyOnClose
      title={
        <div>
          <div className="text-xs text-slate-400 font-normal mb-0.5">
            {gridDayLabel(block.day)}
          </div>
          <div className="text-base font-semibold text-slate-700">
            Chỉnh sửa khung giá
          </div>
        </div>
      }
    >
      <div className="pt-2 space-y-4">
        <div>
          <div className="mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Phạm vi áp dụng
          </div>
          <Radio.Group
            value={applyType}
            onChange={(e) => setApplyType(e.target.value)}
            className="w-full flex"
            buttonStyle="solid"
          >
            <Radio.Button value="weekly" className="flex-1 text-center text-xs">
              Mọi tuần
            </Radio.Button>
            <Radio.Button value="specific" className="flex-1 text-center text-xs">
              Chỉ ngày này ({currentMonday.add(block.day, 'day').format('DD/MM')})
            </Radio.Button>
          </Radio.Group>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Từ giờ
            </div>
            <TimePicker
              format="HH:mm"
              className="w-full"
              value={startTime}
              onChange={(v) => {
                if (v) setStartTime(v)
              }}
              allowClear={false}
              disabledTime={getDisabledTime(facility?.openingTime, facility?.closingTime)}
            />
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Đến giờ
            </div>
            <TimePicker
              format="HH:mm"
              className="w-full"
              value={endTime}
              onChange={(v) => {
                if (v) setEndTime(v)
              }}
              allowClear={false}
              disabledTime={getDisabledTime(facility?.openingTime, facility?.closingTime)}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Loại khung giờ
          </div>
          <Select
            className="w-full"
            allowClear
            value={typeId}
            onChange={(v) => setTypeId(v ?? null)}
            placeholder="VD: Giờ thấp điểm"
            options={priceRuleTypes.map((t) => ({
              value: t.priceRuleTypeID,
              label: t.name,
            }))}
          />
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Giá / Khung giờ
          </div>
          <InputNumber
            className="w-full font-bold"
            value={price}
            onChange={(v) => setPrice(v || 0)}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(v) => (v ? Number(v.replace(/\./g, '')) : 0)}
            addonAfter="đ"
            controls={false}
            size="large"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button className="flex-1" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            className="flex-1"
            onClick={() => {
              if (endMin <= startMin) {
                message.error('Giờ kết thúc phải sau giờ bắt đầu')
                return
              }
              if (facility) {
                const openStr = facility.openingTime.substring(0, 5)
                const closeStr = facility.closingTime.substring(0, 5)
                const startStr = startTime?.format('HH:mm') ?? ''
                const endStr = endTime?.format('HH:mm') ?? ''
                if (
                  startStr < openStr ||
                  startStr > closeStr ||
                  endStr < openStr ||
                  endStr > closeStr
                ) {
                  message.error(
                    `Giờ hoạt động của cơ sở là từ ${openStr} đến ${closeStr}`,
                  )
                  return
                }
              }
              onSave({
                price,
                priceRuleTypeID: typeId,
                specificDate:
                  applyType === 'specific'
                    ? currentMonday.add(block.day, 'day').format('YYYY-MM-DD')
                    : null,
                start: startMin,
                end: endMin,
              })
            }}
          >
            Lưu
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function CourtPriceSection({ courtId, setRules }: CourtPriceSectionProps) {
  const { message } = App.useApp()
  const [currentMonday, setCurrentMonday] = useState(INITIAL_MONDAY)

  // Query system settings
  const { data: facility } = useSystemSettingsQuery()

  // Derive startHour, endHour, totalMinutes dynamically
  const openingHourStr = facility?.openingTime ? facility.openingTime.split(':')[0] : '06'
  const closingHourStr = facility?.closingTime ? facility.closingTime.split(':')[0] : '22'
  const startHour = parseInt(openingHourStr, 10)
  const endHour = parseInt(closingHourStr, 10)
  const totalMinutes = (endHour - startHour) * 60

  const minTime = useMemo(() => new Date(0, 0, 0, startHour, 0, 0), [startHour])
  const maxTime = useMemo(() => new Date(0, 0, 0, endHour, 0, 0), [endHour])

  const snap = facility?.slotDurationMinutes || 60
  const snapMinutes = (min: number) => Math.round(min / snap) * snap

  const timeToGridMinutes = (value: string): number => {
    const [h, m] = formatApiTime(value).split(':').map(Number)
    return clamp((h - startHour) * 60 + m, 0, totalMinutes)
  }

  const gridMinutesToApiTime = (min: number) =>
    toTimeSpan(formatMinutesAsTime(startHour * 60 + min))

  const blockToEvent = (block: PriceBlock, mondayRef: dayjs.Dayjs): RbcEvent => {
    const date = mondayRef.add(block.day, 'day')
    const start = date.add(startHour * 60 + block.start, 'minute').toDate()
    const end = date.add(startHour * 60 + block.end, 'minute').toDate()
    return {
      id: block.id,
      title: formatCurrency(block.price),
      start,
      end,
      resource: block,
    }
  }

  const eventToGridInfo = (start: Date, end: Date) => {
    const s = dayjs(start)
    const e = dayjs(end)
    const dow = s.day()
    return {
      day: dow === 0 ? 6 : dow - 1,
      startMin: clamp(
        snapMinutes(s.hour() * 60 + s.minute() - startHour * 60),
        0,
        totalMinutes - snap,
      ),
      endMin: clamp(
        snapMinutes(e.hour() * 60 + e.minute() - startHour * 60),
        snap,
        totalMinutes,
      ),
    }
  }

  const courtPriceToBlock = (
    price: CourtPrice,
    ruleById: Map<number, PriceRuleType>,
  ): PriceBlock => {
    const dow =
      price.dayOfWeek ?? (price.specificDate ? dayjs(price.specificDate).day() : 1)
    const id = price.courtPriceRuleID
      ? String(price.courtPriceRuleID)
      : price.isLocked
        ? `locked-${price.specificDate || price.dayOfWeek}-${price.startTime}-${price.endTime}`
        : `mapping-${price.priceRuleTypeID}-${price.specificDate || price.dayOfWeek}-${price.startTime}-${price.endTime}`

    return {
      id,
      courtPriceRuleID: price.courtPriceRuleID,
      priceRuleTypeID: price.priceRuleTypeID ?? null,
      day: apiDayToGridDay(dow),
      start: timeToGridMinutes(price.startTime),
      end: timeToGridMinutes(price.endTime),
      price: price.price,
      label: price.priceRuleTypeID
        ? (ruleById.get(price.priceRuleTypeID)?.name ?? '')
        : '',
      specificDate: price.specificDate ?? null,
      isMapping: price.isMapping ?? false,
      isLocked: price.isLocked ?? false,
      lockReason: price.lockReason ?? null,
    }
  }

  const defaultPriceRuleToBlock = (
    rule: CourtDefaultPriceRule,
    ruleById: Map<number, PriceRuleType>,
  ): PriceBlock => {
    const dow = rule.dayOfWeek ?? (rule.specificDate ? dayjs(rule.specificDate).day() : 1)
    return {
      id: generateId(),
      priceRuleTypeID: rule.priceRuleTypeID ?? null,
      day: apiDayToGridDay(dow),
      start: timeToGridMinutes(rule.startTime),
      end: timeToGridMinutes(rule.endTime),
      price: rule.price,
      label: rule.priceRuleTypeID ? (ruleById.get(rule.priceRuleTypeID)?.name ?? '') : '',
      specificDate: rule.specificDate ?? null,
      isMapping: false,
    }
  }

  const buildPayload = (courtId: number, block: PriceBlock) => ({
    courtID: courtId,
    priceRuleTypeID: block.priceRuleTypeID ?? null,
    dayOfWeek: block.specificDate ? null : gridDayToApiDay(block.day),
    specificDate: block.specificDate ?? null,
    startTime: gridMinutesToApiTime(block.start),
    endTime: gridMinutesToApiTime(block.end),
    price: block.price,
    isActive: true,
  })

  const [saving, setSaving] = useState(false)
  const [draftBlocks, setDraftBlocks] = useState<PriceBlock[] | null>(null)
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [editingBlock, setEditingBlock] = useState<PriceBlock | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const targetDateStr = currentMonday.format('YYYY-MM-DD')
  const pricesQuery = useCourtPricesByCourtQuery(courtId, targetDateStr)
  const defaultRulesQuery = useCourtDefaultPriceRulesQuery()
  const ruleTypesQuery = usePriceRuleTypesQuery()
  const createMut = useCreateCourtPriceMutation()
  const updateMut = useUpdateCourtPriceMutation()
  const deleteMut = useDeleteCourtPriceMutation()
  const priceRuleTypes = [...(ruleTypesQuery.data?.items ?? [])]
    .filter((t) => t.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

  const ruleById = new Map(priceRuleTypes.map((t) => [t.priceRuleTypeID, t] as const))

  const serverBlocks = (pricesQuery.data ?? [])
    .filter((item) => item.isActive)
    .map((item) => courtPriceToBlock(item, ruleById))

  const blocks = draftBlocks ?? serverBlocks
  const events = blocks.map((b) => blockToEvent(b, currentMonday))

  const newBlocks = blocks.filter(
    (b) => !b.courtPriceRuleID && !b.isMapping && !b.isLocked,
  )
  const modifiedBlocks = blocks.filter((b) => {
    if (!b.courtPriceRuleID) return false
    const original = serverBlocks.find((s) => s.courtPriceRuleID === b.courtPriceRuleID)
    if (!original) return false
    return (
      b.price !== original.price ||
      b.priceRuleTypeID !== original.priceRuleTypeID ||
      b.day !== original.day ||
      b.start !== original.start ||
      b.end !== original.end ||
      b.specificDate !== original.specificDate
    )
  })

  const hasDraft =
    newBlocks.length > 0 || modifiedBlocks.length > 0 || deletedIds.length > 0
  const isCurrentWeek = currentMonday.isSame(INITIAL_MONDAY, 'day')
  const weekSunday = currentMonday.add(6, 'day')
  const weekLabel = `${currentMonday.format('DD/MM')} – ${weekSunday.format('DD/MM/YYYY')}`

  const stage = (next: PriceBlock[]) => {
    setDraftBlocks(next)
    setRules?.(next)
  }

  const goToday = () => {
    if (isCurrentWeek) return
    if (hasDraft) {
      message.warning('Vui lòng lưu hoặc hủy thay đổi trước khi chuyển tuần')
      return
    }
    setCurrentMonday(INITIAL_MONDAY)
    setDraftBlocks(null)
    setDeletedIds([])
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const saveChanges = async () => {
    setSaving(true)
    try {
      const currentDbIds = blocks
        .map((b) => b.courtPriceRuleID)
        .filter((id): id is number => typeof id === 'number' && id > 0)

      const dynamicDeletedIds = serverBlocks
        .map((s) => s.courtPriceRuleID)
        .filter(
          (id): id is number =>
            typeof id === 'number' && id > 0 && !currentDbIds.includes(id),
        )

      const allDeletedIds = Array.from(new Set([...deletedIds, ...dynamicDeletedIds]))

      await Promise.all([
        ...allDeletedIds.map((id) => deleteMut.mutateAsync({ courtId, id })),
        ...newBlocks.map((block) => createMut.mutateAsync(buildPayload(courtId, block))),
        ...modifiedBlocks.map((block) =>
          updateMut.mutateAsync({
            id: block.courtPriceRuleID!,
            data: buildPayload(courtId, block),
          }),
        ),
      ])
      setDeletedIds([])
      setDraftBlocks(null)
      message.success('Đã lưu cấu hình giá thành công')
    } catch {
      message.error('Lưu cấu hình giá thất bại')
    } finally {
      setSaving(false)
    }
  }

  const performLoadDefaults = async () => {
    try {
      let data = defaultRulesQuery.data
      if (!data) {
        const res = await defaultRulesQuery.refetch()
        data = res.data
      }

      if (!data) {
        message.error(
          'Dữ liệu cấu hình giá mặc định chưa sẵn sàng, vui lòng thử lại sau.',
        )
        return
      }

      const activeDefaults = (data.items ?? []).filter(
        (r) => r.isActive && r.isLoadDefault,
      )

      const mapped = activeDefaults.map((r) => defaultPriceRuleToBlock(r, ruleById))

      stage(mapped)
      message.success(
        'Đã tải cấu hình giá mặc định vào lịch (vui lòng nhấn "Lưu cấu hình" để hoàn tất)',
      )
    } catch {
      message.error('Tải cấu hình giá mặc định thất bại')
    }
  }

  const handleLoadDefaults = () => {
    if (hasDraft) {
      Modal.confirm({
        title: 'Xác nhận tải giá mặc định',
        content:
          'Bạn đang có thay đổi chưa lưu. Tải cấu hình giá mặc định sẽ ghi đè lên các thay đổi hiện tại của tuần này. Bạn có chắc chắn muốn tiếp tục?',
        okText: 'Tiếp tục',
        cancelText: 'Hủy',
        onOk: () => performLoadDefaults(),
      })
    } else {
      performLoadDefaults()
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const { day, startMin, endMin } = eventToGridInfo(start, end)
    if (endMin <= startMin) return
    const newBlock: PriceBlock = {
      id: generateId(),
      day,
      start: startMin,
      end: endMin,
      price: DEFAULT_PRICE,
      priceRuleTypeID: null,
      label: '',
    }
    if (hasCollision(blocks, newBlock)) return
    stage([...blocks, newBlock])
    setEditingBlock(newBlock)
    setModalOpen(true)
  }

  const handleSelectEvent = (event: object) => {
    const e = event as RbcEvent
    if (e.resource.isLocked) {
      Modal.info({
        title: 'Khung giờ bị khóa',
        content: (
          <div className="flex flex-col gap-2 pt-2">
            <p>Khung giờ này đã bị khóa và không thể chỉnh sửa giá.</p>
            {e.resource.lockReason && (
              <p className="text-slate-500 font-medium">
                Lý do khóa:{' '}
                <span className="text-slate-800">{e.resource.lockReason}</span>
              </p>
            )}
          </div>
        ),
        okText: 'Đóng',
      })
      return
    }
    setEditingBlock(e.resource)
    setModalOpen(true)
  }

  const updateBlockTime = (e: RbcEvent, start: Date, end: Date, isResize: boolean) => {
    if (e.resource.isLocked) {
      message.error(
        `Không thể ${isResize ? 'thay đổi kích thước' : 'di chuyển'} khung giờ đang bị khóa`,
      )
      return
    }
    const { day, startMin, endMin } = eventToGridInfo(start, end)
    let updated: PriceBlock = {
      ...e.resource,
      day: isResize ? e.resource.day : day,
      start: startMin,
      end: endMin,
    }
    if (e.resource.isMapping) {
      updated = {
        ...updated,
        id: generateId(),
        courtPriceRuleID: undefined,
        isMapping: false,
      }
    }
    if (hasCollision(blocks, updated, e.resource.id)) return
    stage(blocks.map((b) => (b.id === e.resource.id ? updated : b)))
  }

  const handleEventDrop = ({ event, start, end }: EventInteractionArgs<object>) =>
    updateBlockTime(event as RbcEvent, start as Date, end as Date, false)

  const handleEventResize = ({ event, start, end }: EventInteractionArgs<object>) =>
    updateBlockTime(event as RbcEvent, start as Date, end as Date, true)

  const handleDelete = (id: string) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    if (block.isLocked) {
      message.error('Không thể xóa khung giờ đang bị khóa')
      return
    }
    stage(blocks.filter((b) => b.id !== id))
    if (block.courtPriceRuleID) {
      setDeletedIds((prev) => Array.from(new Set([...prev, block.courtPriceRuleID!])))
    }
  }

  const handleEditSave = ({
    price,
    priceRuleTypeID,
    specificDate,
    start,
    end,
  }: {
    price: number
    priceRuleTypeID: number | null
    specificDate: string | null
    start?: number
    end?: number
  }) => {
    if (!editingBlock) return
    const label = priceRuleTypeID ? (ruleById.get(priceRuleTypeID)?.name ?? '') : ''
    const newStart = start !== undefined ? start : editingBlock.start
    const newEnd = end !== undefined ? end : editingBlock.end

    const updated: PriceBlock = {
      ...editingBlock,
      price,
      priceRuleTypeID,
      label,
      specificDate,
      start: newStart,
      end: newEnd,
      ...(editingBlock.isMapping
        ? { id: generateId(), courtPriceRuleID: undefined, isMapping: false }
        : {}),
    }

    if (hasCollision(blocks, updated, editingBlock.id)) return

    stage(blocks.map((b) => (b.id === editingBlock.id ? updated : b)))
    setModalOpen(false)
    setEditingBlock(null)
  }

  const handleModalCancel = () => {
    if (editingBlock && !editingBlock.courtPriceRuleID && !editingBlock.isMapping) {
      stage(blocks.filter((b) => b.id !== editingBlock.id))
    }
    setModalOpen(false)
    setEditingBlock(null)
  }

  const eventPropGetter = (event: object) => {
    const block = (event as RbcEvent).resource
    const type = priceRuleTypes.find((t) => t.priceRuleTypeID === block.priceRuleTypeID)
    const color = type?.colorCode || '#0ea5e9'
    const isSpecific = !!block.specificDate
    const isLocked = !!block.isLocked

    if (isLocked) {
      return {
        style: {
          background:
            'repeating-linear-gradient(45deg, #fef2f2 0px, #fef2f2 10px, #fff5f5 10px, #fff5f5 20px)',
          borderLeft: '4px solid #ef4444',
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          borderRadius: '8px',
          color: '#ef4444',
          padding: 0,
          boxShadow: '0 1px 4px rgba(239, 68, 68, 0.15)',
        },
      }
    }

    return {
      style: {
        backgroundColor: isSpecific ? '#fff7ed' : `${color}1a`,
        borderLeft: `4px ${isSpecific ? 'dashed' : 'solid'} ${isSpecific ? '#f97316' : color}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '8px',
        color: isSpecific ? '#ea580c' : color,
        padding: 0,
        boxShadow: isSpecific
          ? '0 1px 4px rgba(249, 115, 22, 0.15)'
          : `0 1px 4px ${color}22`,
      },
    }
  }

  const calendarComponents = {
    event: (props: { event: object }) => (
      <PriceEvent
        event={props.event as RbcEvent}
        onDelete={handleDelete}
        startHour={startHour}
      />
    ),
    toolbar: () => null as never,
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="font-sans bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <Space align="start" size={16}>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xl">
            <WalletOutlined />
          </div>
          <div>
            <Typography.Title level={4} className="m-0! mb-1!">
              Cấu hình giá
            </Typography.Title>
            <Typography.Text type="secondary">
              Kéo để tạo khung giá mới · Kéo thả để di chuyển · Kéo cạnh dưới để thay đổi
              thời lượng
            </Typography.Text>
          </div>
        </Space>
        <div className="flex items-center gap-2">
          {hasDraft && (
            <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
              Có thay đổi chưa lưu
            </span>
          )}
          <Button
            type="default"
            icon={<ImportOutlined />}
            loading={defaultRulesQuery.isFetching}
            onClick={handleLoadDefaults}
            className="border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 font-medium"
          >
            Tải giá mặc định
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving || createMut.isPending || updateMut.isPending}
            disabled={!hasDraft}
            onClick={saveChanges}
          >
            Lưu cấu hình
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 p-4 bg-slate-50/60 rounded-2xl border border-slate-100/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Today Button / Custom Pill */}
          <Button
            onClick={goToday}
            disabled={isCurrentWeek}
            type={isCurrentWeek ? 'default' : 'primary'}
            className={`rounded-xl px-4 font-semibold text-xs h-10 flex items-center justify-center transition-all cursor-pointer ${
              isCurrentWeek
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80 hover:bg-emerald-50! hover:text-emerald-600!'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isCurrentWeek ? (
              <span className="flex items-center gap-1.5">
                <span className=" bg-emerald-500" />
                Tuần hiện tại
              </span>
            ) : (
              'Về tuần hiện tại'
            )}
          </Button>

          {/* Week DatePicker - Quick Picker */}
          <DatePicker
            picker="week"
            value={currentMonday}
            onChange={(date) => {
              if (date) {
                if (hasDraft) {
                  message.warning('Vui lòng lưu hoặc hủy thay đổi trước khi chuyển tuần')
                  return
                }
                setCurrentMonday(getMondayOfDate(dayjs(date)))
                setDraftBlocks(null)
                setDeletedIds([])
              }
            }}
            allowClear={false}
            placeholder="Chọn tuần khác"
          />
        </div>

        {/* Date Display Card */}
        <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-xl shadow-sm border border-slate-100 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <CalendarOutlined className="text-sm" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">
                Khung thời gian
              </span>
              <span className="text-sm font-bold text-slate-700 leading-none">
                {weekLabel}
              </span>
            </div>
          </div>

          {/* Dynamic status tag */}
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
              isCurrentWeek
                ? 'bg-emerald-100 text-emerald-700'
                : currentMonday.isBefore(INITIAL_MONDAY)
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-blue-50 text-blue-600'
            }`}
          >
            {isCurrentWeek
              ? 'Hiện tại'
              : currentMonday.isBefore(INITIAL_MONDAY)
                ? 'Đã qua'
                : 'Sắp tới'}
          </span>
        </div>
      </div>

      {/* Calendar */}
      <CourtWeekCalendar
        events={events}
        date={currentMonday.toDate()}
        minTime={minTime}
        maxTime={maxTime}
        step={snap}
        timeslots={timeSlots}
        selectable
        resizable
        enableDragAndDrop
        components={calendarComponents}
        eventPropGetter={eventPropGetter}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        formats={COURT_WEEK_CALENDAR_FORMATS}
        className="h-240"
      />

      {/* Edit Modal */}
      <EditModal
        block={editingBlock}
        priceRuleTypes={priceRuleTypes}
        open={modalOpen}
        currentMonday={currentMonday}
        facility={facility}
        startHour={startHour}
        onSave={handleEditSave}
        onCancel={handleModalCancel}
      />
    </div>
  )
}
