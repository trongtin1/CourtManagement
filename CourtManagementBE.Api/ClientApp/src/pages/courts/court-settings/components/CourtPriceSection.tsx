import { useState } from 'react'

import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar'
import _withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import type { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
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
} from 'antd'
import { CalendarOutlined, SaveOutlined, WalletOutlined, ImportOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import {
  useCourtPricesByCourtQuery,
  useCreateCourtPriceMutation,
  useDeleteCourtPriceMutation,
  useUpdateCourtPriceMutation,
} from '@/features/courts/api/useCourtPriceQueries'
import { usePriceRuleTypesQuery } from '@/features/courts/api/usePriceRuleTypeQueries'
import { courtDefaultPriceRuleApi } from '@/features/courts/api/courtDefaultPriceRuleApi'
import type { CourtPrice, PriceRuleType, CourtDefaultPriceRule } from '@/features/courts/model/types'
import {
  formatCurrency,
  formatMinutesAsTime,
  formatTime,
  getMonday,
  gridDayLabel,
  toTimeSpan,
} from '@/utils/format'

const withDragAndDrop: typeof _withDragAndDrop =
  (_withDragAndDrop as unknown as { default: typeof _withDragAndDrop }).default ??
  _withDragAndDrop
const localizer = dayjsLocalizer(dayjs)
const DnDCalendar = withDragAndDrop(Calendar)

// ── Constants ─────────────────────────────────────────────────────────────────
const START_HOUR = 6
const END_HOUR = 22
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60
const SNAP = 30
const DEFAULT_PRICE = 150000
const INITIAL_MONDAY = getMonday()
const MIN_TIME = new Date(0, 0, 0, START_HOUR, 0, 0)
const MAX_TIME = new Date(0, 0, 0, END_HOUR, 0, 0)

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

// ── Helpers ───────────────────────────────────────────────────────────────────
const getMondayOfDate = (date: dayjs.Dayjs): dayjs.Dayjs => {
  const dow = date.day()
  const diff = dow === 0 ? -6 : 1 - dow
  return date.add(diff, 'day').startOf('day')
}

const snapMinutes = (min: number) => Math.round(min / SNAP) * SNAP
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const generateId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const formatApiTime = (value?: string): string => formatTime(value) || '00:00'
const apiDayToGridDay = (dow: number) => (dow === 0 ? 6 : dow - 1)
const gridDayToApiDay = (day: number) => (day === 6 ? 0 : day + 1)

const timeToGridMinutes = (value: string): number => {
  const [h, m] = formatApiTime(value).split(':').map(Number)
  return clamp((h - START_HOUR) * 60 + m, 0, TOTAL_MINUTES)
}

const gridMinutesToApiTime = (min: number) =>
  toTimeSpan(formatMinutesAsTime(START_HOUR * 60 + min))

const blockToEvent = (block: PriceBlock, mondayRef: dayjs.Dayjs): RbcEvent => {
  const date = mondayRef.add(block.day, 'day')
  const start = date.add(START_HOUR * 60 + block.start, 'minute').toDate()
  const end = date.add(START_HOUR * 60 + block.end, 'minute').toDate()
  return { id: block.id, title: formatCurrency(block.price), start, end, resource: block }
}

const eventToGridInfo = (start: Date, end: Date) => {
  const s = dayjs(start)
  const e = dayjs(end)
  const dow = s.day()
  return {
    day: dow === 0 ? 6 : dow - 1,
    startMin: clamp(
      snapMinutes(s.hour() * 60 + s.minute() - START_HOUR * 60),
      0,
      TOTAL_MINUTES - SNAP,
    ),
    endMin: clamp(
      snapMinutes(e.hour() * 60 + e.minute() - START_HOUR * 60),
      SNAP,
      TOTAL_MINUTES,
    ),
  }
}

const courtPriceToBlock = (
  price: CourtPrice,
  ruleById: Map<number, PriceRuleType>,
): PriceBlock => {
  const dow =
    price.dayOfWeek ?? (price.specificDate ? dayjs(price.specificDate).day() : 1)
  return {
    id: String(price.courtPriceRuleID),
    courtPriceRuleID: price.courtPriceRuleID,
    priceRuleTypeID: price.priceRuleTypeID ?? null,
    day: apiDayToGridDay(dow),
    start: timeToGridMinutes(price.startTime),
    end: timeToGridMinutes(price.endTime),
    price: price.price,
    label: price.priceRuleTypeID ? (ruleById.get(price.priceRuleTypeID)?.name ?? '') : '',
    specificDate: price.specificDate ?? null,
    isMapping: price.isMapping ?? false,
  }
}

const defaultPriceRuleToBlock = (
  rule: CourtDefaultPriceRule,
  ruleById: Map<number, PriceRuleType>,
): PriceBlock => {
  const dow =
    rule.dayOfWeek ?? (rule.specificDate ? dayjs(rule.specificDate).day() : 1)
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

const hasCollision = (blocks: PriceBlock[], candidate: PriceBlock, excludeId?: string) =>
  blocks.some(
    (b) =>
      b.id !== excludeId &&
      b.day === candidate.day &&
      b.start < candidate.end &&
      b.end > candidate.start,
  )

const FORMATS = {
  dayFormat: (date: Date) => {
    const d = dayjs(date)
    const dow = d.day()
    const label = dow === 0 ? 'CN' : `T${dow + 1}`
    return `${label} (${d.format('DD/MM')})`
  },
  timeGutterFormat: (date: Date) => dayjs(date).format('HH:mm'),
}

// ── Custom Event ──────────────────────────────────────────────────────────────
function PriceEvent({
  event,
  onDelete,
}: {
  event: RbcEvent
  onDelete: (id: string) => void
}) {
  const block = event.resource
  const timeStr = `${formatMinutesAsTime(START_HOUR * 60 + block.start)} – ${formatMinutesAsTime(START_HOUR * 60 + block.end)}`

  return (
    <div className="group relative h-full flex flex-col justify-start overflow-hidden px-2 py-1.5 gap-0.5">
      <p className="text-[10px] font-semibold leading-none truncate opacity-75 m-0">
        {timeStr}
      </p>
      <p className="text-xs font-bold leading-tight truncate m-0 flex items-center gap-1">
        {block.specificDate && (
          <span title="Chỉ áp dụng cho ngày cụ thể này" style={{ fontSize: '10px' }}>
            📌
          </span>
        )}
        {block.isMapping && (
          <span title="Giá mặc định của hệ thống" style={{ fontSize: '12px' }}>
            ⚙️
          </span>
        )}
        {formatCurrency(block.price)}
      </p>
      {block.label && (
        <span className="text-[9px] font-semibold truncate opacity-70">
          {block.label}
        </span>
      )}
      {!block.isMapping && (
        <button
          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white/60 text-inherit
                     opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center
                     hover:bg-red-500 hover:text-white z-20 font-bold text-[11px] leading-none border-0 cursor-pointer"
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
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({
  block,
  priceRuleTypes,
  open,
  currentMonday,
  onSave,
  onCancel,
}: {
  block: PriceBlock | null
  priceRuleTypes: PriceRuleType[]
  open: boolean
  currentMonday: dayjs.Dayjs
  onSave: (data: {
    price: number
    priceRuleTypeID: number | null
    specificDate: string | null
  }) => void
  onCancel: () => void
}) {
  const [prevBlockId, setPrevBlockId] = useState<string | null>(null)
  const [price, setPrice] = useState(block?.price ?? DEFAULT_PRICE)
  const [typeId, setTypeId] = useState<number | null>(block?.priceRuleTypeID ?? null)
  const [applyType, setApplyType] = useState<'weekly' | 'specific'>('weekly')

  const currentId = block?.id ?? null
  if (currentId !== prevBlockId) {
    setPrevBlockId(currentId)
    if (block) {
      setPrice(block.price)
      setTypeId(block.priceRuleTypeID ?? null)
      setApplyType(block.specificDate ? 'specific' : 'weekly')
    }
  }

  if (!block) return null

  const timeStr = `${formatMinutesAsTime(START_HOUR * 60 + block.start)} – ${formatMinutesAsTime(START_HOUR * 60 + block.end)}`

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
          <div className="text-base font-semibold text-slate-700">{timeStr}</div>
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
            onClick={() =>
              onSave({
                price,
                priceRuleTypeID: typeId,
                specificDate:
                  applyType === 'specific'
                    ? currentMonday.add(block.day, 'day').format('YYYY-MM-DD')
                    : null,
              })
            }
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
  const [saving, setSaving] = useState(false)
  const [loadingDefaults, setLoadingDefaults] = useState(false)
  const [draftBlocks, setDraftBlocks] = useState<PriceBlock[] | null>(null)
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [editingBlock, setEditingBlock] = useState<PriceBlock | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const targetDateStr = currentMonday.format('YYYY-MM-DD')
  const pricesQuery = useCourtPricesByCourtQuery(courtId, targetDateStr)
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

  const newBlocks = blocks.filter((b) => !b.courtPriceRuleID)
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
      await Promise.all([
        ...deletedIds.map((id) => deleteMut.mutateAsync({ courtId, id })),
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
    setLoadingDefaults(true)
    try {
      const response = await courtDefaultPriceRuleApi.getAll({ page: 1, pageSize: 1000 })
      const activeDefaults = (response.items ?? [])
        .filter((r) => r.isActive && r.isLoadDefault)
      
      const mapped = activeDefaults.map((r) => defaultPriceRuleToBlock(r, ruleById))
      
      stage(mapped)
      message.success('Đã tải cấu hình giá mặc định vào lịch (vui lòng nhấn "Lưu cấu hình" để hoàn tất)')
    } catch (err) {
      message.error('Tải cấu hình giá mặc định thất bại')
    } finally {
      setLoadingDefaults(false)
    }
  }

  const handleLoadDefaults = async () => {
    if (hasDraft) {
      Modal.confirm({
        title: 'Xác nhận tải giá mặc định',
        content: 'Bạn đang có thay đổi chưa lưu. Tải cấu hình giá mặc định sẽ ghi đè lên các thay đổi hiện tại của tuần này. Bạn có chắc chắn muốn tiếp tục?',
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
    setEditingBlock(e.resource)
    setModalOpen(true)
  }

  const handleEventDrop = ({ event, start, end }: EventInteractionArgs<object>) => {
    const e = event as RbcEvent
    const { day, startMin, endMin } = eventToGridInfo(start as Date, end as Date)
    let updated: PriceBlock = { ...e.resource, day, start: startMin, end: endMin }
    if (e.resource.isMapping) {
      updated = {
        ...updated,
        id: generateId(),
        courtPriceRuleID: undefined,
        isMapping: false,
      }
    }
    if (hasCollision(blocks, updated, e.resource.id)) return
    if (e.resource.isMapping) {
      stage(blocks.map((b) => (b.id === e.resource.id ? updated : b)))
    } else {
      stage(blocks.map((b) => (b.id === updated.id ? updated : b)))
    }
  }

  const handleEventResize = ({ event, start, end }: EventInteractionArgs<object>) => {
    const e = event as RbcEvent
    const { startMin, endMin } = eventToGridInfo(start as Date, end as Date)
    let updated: PriceBlock = { ...e.resource, start: startMin, end: endMin }
    if (e.resource.isMapping) {
      updated = {
        ...updated,
        id: generateId(),
        courtPriceRuleID: undefined,
        isMapping: false,
      }
    }
    if (hasCollision(blocks, updated, e.resource.id)) return
    if (e.resource.isMapping) {
      stage(blocks.map((b) => (b.id === e.resource.id ? updated : b)))
    } else {
      stage(blocks.map((b) => (b.id === updated.id ? updated : b)))
    }
  }

  const handleDelete = (id: string) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    stage(blocks.filter((b) => b.id !== id))
    if (block.courtPriceRuleID) {
      setDeletedIds((prev) => Array.from(new Set([...prev, block.courtPriceRuleID!])))
    }
  }

  const handleEditSave = ({
    price,
    priceRuleTypeID,
    specificDate,
  }: {
    price: number
    priceRuleTypeID: number | null
    specificDate: string | null
  }) => {
    if (!editingBlock) return
    const label = priceRuleTypeID ? (ruleById.get(priceRuleTypeID)?.name ?? '') : ''
    
    if (editingBlock.isMapping) {
      const newBlock: PriceBlock = {
        id: generateId(),
        day: editingBlock.day,
        start: editingBlock.start,
        end: editingBlock.end,
        price,
        priceRuleTypeID,
        label,
        specificDate,
        isMapping: false,
      }
      stage(blocks.map((b) => (b.id === editingBlock.id ? newBlock : b)))
    } else {
      stage(
        blocks.map((b) =>
          b.id === editingBlock.id
            ? { ...b, price, priceRuleTypeID, label, specificDate }
            : b,
        ),
      )
    }
    setModalOpen(false)
    setEditingBlock(null)
  }

  const handleModalCancel = () => {
    if (editingBlock && !editingBlock.courtPriceRuleID) {
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
      <PriceEvent event={props.event as RbcEvent} onDelete={handleDelete} />
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
            loading={loadingDefaults}
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
      <div className="rbc-court-wrapper rounded-2xl border border-slate-100 shadow-sm overflow-y-auto overflow-hidden">
        <DnDCalendar
          localizer={localizer}
          events={events}
          defaultView={Views.WEEK}
          views={[Views.WEEK]}
          date={currentMonday.toDate()}
          min={MIN_TIME}
          max={MAX_TIME}
          step={30}
          timeslots={2}
          selectable
          resizable
          components={calendarComponents}
          eventPropGetter={eventPropGetter}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          scrollToTime={MIN_TIME}
          formats={FORMATS}
          className="h-240"
        />
      </div>

      {/* Edit Modal */}
      <EditModal
        block={editingBlock}
        priceRuleTypes={priceRuleTypes}
        open={modalOpen}
        currentMonday={currentMonday}
        onSave={handleEditSave}
        onCancel={handleModalCancel}
      />
    </div>
  )
}
