import { useState, useMemo, useCallback, useEffect } from 'react'

import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar'
import _withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import type { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './court-price.css'
import { App, Button, InputNumber, Modal, Select, Space, Typography } from 'antd'
import { SaveOutlined, WalletOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import {
  useCourtPricesByCourtQuery,
  useCreateCourtPriceMutation,
  useDeleteCourtPriceMutation,
  useUpdateCourtPriceMutation,
} from '@/features/courts/api/useCourtPriceQueries'
import { usePriceRuleTypesQuery } from '@/features/courts/api/usePriceRuleTypeQueries'
import type { CourtPrice, PriceRuleType } from '@/features/courts/model/types'
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

export interface PriceBlock {
  id: string
  courtPriceRuleID?: number
  priceRuleTypeID?: number | null
  day: number // 0=Mon … 6=Sun
  start: number // minutes offset from START_HOUR
  end: number
  price: number
  label?: string
}

interface CourtPriceSectionProps {
  courtId: number
  rules?: PriceBlock[]
  setRules?: (rules: PriceBlock[]) => void
}

interface RbcEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: PriceBlock
}

const MONDAY = getMonday()

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

const blockToEvent = (block: PriceBlock): RbcEvent => {
  const date = MONDAY.add(block.day, 'day')
  const start = date.add(START_HOUR * 60 + block.start, 'minute').toDate()
  const end = date.add(START_HOUR * 60 + block.end, 'minute').toDate()
  return { id: block.id, title: formatCurrency(block.price), start, end, resource: block }
}

const eventToGridInfo = (
  start: Date,
  end: Date,
): { day: number; startMin: number; endMin: number } => {
  const s = dayjs(start)
  const e = dayjs(end)
  const dow = s.day()
  const day = dow === 0 ? 6 : dow - 1
  const startMin = clamp(
    snapMinutes(s.hour() * 60 + s.minute() - START_HOUR * 60),
    0,
    TOTAL_MINUTES - SNAP,
  )
  const endMin = clamp(
    snapMinutes(e.hour() * 60 + e.minute() - START_HOUR * 60),
    SNAP,
    TOTAL_MINUTES,
  )
  return { day, startMin, endMin }
}

const courtPriceToBlock = (
  price: CourtPrice,
  ruleById: Map<number, PriceRuleType>,
): PriceBlock => ({
  id: String(price.courtPriceRuleID),
  courtPriceRuleID: price.courtPriceRuleID,
  priceRuleTypeID: price.priceRuleTypeID ?? null,
  day: apiDayToGridDay(price.dayOfWeek),
  start: timeToGridMinutes(price.startTime),
  end: timeToGridMinutes(price.endTime),
  price: price.price,
  label: price.priceRuleTypeID ? (ruleById.get(price.priceRuleTypeID)?.name ?? '') : '',
})

const buildPayload = (courtId: number, block: PriceBlock) => ({
  courtID: courtId,
  priceRuleTypeID: block.priceRuleTypeID ?? null,
  dayOfWeek: gridDayToApiDay(block.day),
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

// ── Custom Event ──────────────────────────────────────────────────────────────
const PriceEvent = ({
  event,
  onDelete,
}: {
  event: RbcEvent
  onDelete: (id: string) => void
}) => {
  const block = event.resource
  const timeStr = `${formatMinutesAsTime(START_HOUR * 60 + block.start)} – ${formatMinutesAsTime(START_HOUR * 60 + block.end)}`

  return (
    <div className="group relative h-full flex flex-col justify-start overflow-hidden px-2 py-1.5 gap-0.5">
      <p className="text-[10px] font-semibold leading-none truncate opacity-75 m-0">
        {timeStr}
      </p>
      <p className="text-xs font-bold leading-tight truncate m-0">
        {formatCurrency(block.price)}
      </p>
      {block.label && (
        <span className="text-[9px] font-semibold truncate opacity-70">
          {block.label}
        </span>
      )}
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
    </div>
  )
}

const EditModal = ({
  block,
  priceRuleTypes,
  open,
  onSave,
  onCancel,
}: {
  block: PriceBlock | null
  priceRuleTypes: PriceRuleType[]
  open: boolean
  onSave: (data: { price: number; priceRuleTypeID: number | null }) => void
  onCancel: () => void
}) => {
  const [price, setPrice] = useState(block?.price ?? DEFAULT_PRICE)
  const [typeId, setTypeId] = useState<number | null>(block?.priceRuleTypeID ?? null)

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
            onClick={() => onSave({ price, priceRuleTypeID: typeId })}
          >
            Lưu
          </Button>
        </div>
      </div>
    </Modal>
  )
}
export function CourtPriceSection({ courtId, setRules }: CourtPriceSectionProps) {
  const { message } = App.useApp()
  const targetDateStr = useMemo(() => MONDAY.format('YYYY-MM-DD'), [])
  const pricesQuery = useCourtPricesByCourtQuery(courtId, targetDateStr)
  const ruleTypesQuery = usePriceRuleTypesQuery({ page: 1, pageSize: 1000 })
  const createMut = useCreateCourtPriceMutation()
  const updateMut = useUpdateCourtPriceMutation()
  const deleteMut = useDeleteCourtPriceMutation()
  const [saving, setSaving] = useState(false)
  const [draftBlocks, setDraftBlocks] = useState<PriceBlock[] | null>(null)
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [editingBlock, setEditingBlock] = useState<PriceBlock | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [conflictModalOpen, setConflictModalOpen] = useState(false)

  const priceRuleTypes = useMemo(
    () =>
      [...(ruleTypesQuery.data?.items ?? [])]
        .filter((t) => t.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [ruleTypesQuery.data?.items],
  )

  const ruleById = useMemo(
    () => new Map(priceRuleTypes.map((t) => [t.priceRuleTypeID, t] as const)),
    [priceRuleTypes],
  )

  const serverBlocks = useMemo(
    () =>
      (pricesQuery.data ?? [])
        .filter((item) => item.isActive)
        .map((item) => courtPriceToBlock(item, ruleById)),
    [pricesQuery.data, ruleById],
  )

  const blocks = draftBlocks ?? serverBlocks
  const events = useMemo(() => blocks.map(blockToEvent), [blocks])

  const newBlocks = useMemo(() => {
    return blocks.filter((b) => !b.courtPriceRuleID)
  }, [blocks])

  const modifiedBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (!b.courtPriceRuleID) return false
      const original = serverBlocks.find((s) => s.courtPriceRuleID === b.courtPriceRuleID)
      if (!original) return false
      return (
        b.price !== original.price ||
        b.priceRuleTypeID !== original.priceRuleTypeID ||
        b.day !== original.day ||
        b.start !== original.start ||
        b.end !== original.end
      )
    })
  }, [blocks, serverBlocks])

  const stageBlocks = useCallback(
    (next: PriceBlock[]) => {
      setDraftBlocks(next)
      setRules?.(next)
      return next
    },
    [setRules],
  )

  useEffect(() => {
    if (!draftBlocks) {
      console.log('[CourtPriceSection] No active draft changes')
      return
    }
    console.log('[CourtPriceSection] Staged changes:', {
      added: newBlocks,
      modified: modifiedBlocks,
      deleted: deletedIds,
    })
  }, [draftBlocks, newBlocks, modifiedBlocks, deletedIds])

  const saveChanges = useCallback(async () => {
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
  }, [
    courtId,
    createMut,
    deletedIds,
    deleteMut,
    message,
    newBlocks,
    modifiedBlocks,
    updateMut,
  ])

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
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
      stageBlocks([...blocks, newBlock])
      setEditingBlock(newBlock)
      setModalOpen(true)
    },
    [blocks, stageBlocks],
  )

  const handleSelectEvent = useCallback((event: object) => {
    const e = event as RbcEvent
    setEditingBlock(e.resource)
    setModalOpen(true)
  }, [])

  const handleEventDrop = useCallback(
    ({ event, start, end }: EventInteractionArgs<object>) => {
      const e = event as RbcEvent
      const { day, startMin, endMin } = eventToGridInfo(start as Date, end as Date)
      const updated: PriceBlock = { ...e.resource, day, start: startMin, end: endMin }
      if (hasCollision(blocks, updated, updated.id)) return
      stageBlocks(blocks.map((b) => (b.id === updated.id ? updated : b)))
    },
    [blocks, stageBlocks],
  )

  const handleEventResize = useCallback(
    ({ event, start, end }: EventInteractionArgs<object>) => {
      const e = event as RbcEvent
      const { startMin, endMin } = eventToGridInfo(start as Date, end as Date)
      const updated: PriceBlock = { ...e.resource, start: startMin, end: endMin }
      if (hasCollision(blocks, updated, updated.id)) return
      stageBlocks(blocks.map((b) => (b.id === updated.id ? updated : b)))
    },
    [blocks, stageBlocks],
  )

  const handleDelete = useCallback(
    (id: string) => {
      const block = blocks.find((b) => b.id === id)
      if (!block) return
      stageBlocks(blocks.filter((b) => b.id !== id))
      if (block.courtPriceRuleID) {
        setDeletedIds((prev) => Array.from(new Set([...prev, block.courtPriceRuleID!])))
      }
    },
    [blocks, stageBlocks],
  )

  const handleEditSave = useCallback(
    ({ price, priceRuleTypeID }: { price: number; priceRuleTypeID: number | null }) => {
      if (!editingBlock) return
      const label = priceRuleTypeID ? (ruleById.get(priceRuleTypeID)?.name ?? '') : ''
      stageBlocks(
        blocks.map((b) =>
          b.id === editingBlock.id ? { ...b, price, priceRuleTypeID, label } : b,
        ),
      )
      setModalOpen(false)
      setEditingBlock(null)
    },
    [blocks, editingBlock, ruleById, stageBlocks],
  )

  const hasDraft =
    newBlocks.length > 0 || modifiedBlocks.length > 0 || deletedIds.length > 0

  const minTime = useMemo(() => new Date(0, 0, 0, START_HOUR, 0, 0), [])
  const maxTime = useMemo(() => new Date(0, 0, 0, END_HOUR, 0, 0), [])
  const scrollToTime = useMemo(() => new Date(0, 0, 0, START_HOUR, 0, 0), [])

  const components = useMemo(
    () => ({
      event: (props: { event: object }) => (
        <PriceEvent event={props.event as RbcEvent} onDelete={handleDelete} />
      ),
      toolbar: () => null,
    }),
    [handleDelete],
  )

  const eventPropGetter = useCallback(
    (event: object) => {
      const e = event as RbcEvent
      const block = e.resource
      const type = priceRuleTypes.find((t) => t.priceRuleTypeID === block.priceRuleTypeID)
      const color = type?.colorCode || '#0ea5e9'
      return {
        style: {
          backgroundColor: `${color}1a`,
          borderLeft: `4px solid ${color}`,
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          borderRadius: '8px',
          color,
          padding: 0,
          boxShadow: `0 1px 4px ${color}22`,
        },
      }
    },
    [priceRuleTypes],
  )

  const formats = useMemo(
    () => ({
      dayFormat: (date: Date) => {
        const d = dayjs(date)
        const dow = d.day()
        const label = dow === 0 ? 'CN' : `T${dow + 1}`
        return `${label} (${d.format('DD/MM')})`
      },
      timeGutterFormat: (date: Date) => dayjs(date).format('HH:mm'),
    }),
    [],
  )

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
          <Button
            danger
            icon={<WarningOutlined />}
            onClick={() => setConflictModalOpen(true)}
          >
            Mô phỏng Trùng Ngày
          </Button>
          {hasDraft && (
            <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
              Có thay đổi chưa lưu
            </span>
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving || createMut.isPending || updateMut.isPending}
            disabled={!hasDraft}
            onClick={() => saveChanges()}
          >
            Lưu cấu hình
          </Button>
        </div>
      </div>

      {/* Calendar — wrapper scroll để tránh giật khi kéo dài */}
      <div className="rbc-court-wrapper rounded-2xl border border-slate-100 shadow-sm overflow-y-auto overflow-hidden">
        <DnDCalendar
          localizer={localizer}
          events={events}
          defaultView={Views.WEEK}
          views={[Views.WEEK]}
          defaultDate={MONDAY.toDate()}
          min={minTime}
          max={maxTime}
          step={30}
          timeslots={2}
          selectable
          resizable
          components={components}
          eventPropGetter={eventPropGetter}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          scrollToTime={scrollToTime}
          formats={formats}
          className="h-240"
        />
      </div>

      {/* Edit Modal */}
      <EditModal
        block={editingBlock}
        priceRuleTypes={priceRuleTypes}
        open={modalOpen}
        onSave={handleEditSave}
        onCancel={() => {
          // Rollback nếu block vừa tạo mới chưa được lưu
          if (editingBlock && !editingBlock.courtPriceRuleID) {
            stageBlocks(blocks.filter((b) => b.id !== editingBlock.id))
          }
          setModalOpen(false)
          setEditingBlock(null)
        }}
      />

      {/* Conflict Resolution Simulation Modal */}
      <Modal
        open={conflictModalOpen}
        onCancel={() => setConflictModalOpen(false)}
        footer={null}
        width={550}
        styles={{ body: { padding: '12px 0 0 0' } }}
        destroyOnClose
        title={
          <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
            <WarningOutlined style={{ fontSize: '20px' }} /> Phát hiện trùng lấn khung giờ!
          </div>
        }
      >
        <div className="space-y-4 pt-3">
          <Typography.Paragraph className="text-slate-600 mb-0">
            Hệ thống phát hiện thấy cấu hình giá mặc định bạn đang muốn nạp (mapping) bị trùng lấn thời gian với các khung giờ đã được tùy biến riêng của sân này.
          </Typography.Paragraph>

          {/* Section: Incoming rules */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <Typography.Text strong className="text-blue-700 block mb-1 text-xs">
              📥 Cấu hình mặc định muốn nạp:
            </Typography.Text>
            <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-blue-100/50">
              <span className="font-semibold text-slate-700 text-sm">Khung giờ: 10:00 - 14:00 (Thứ 2)</span>
              <span className="font-bold text-blue-600 text-sm">Giá: 100.000 đ</span>
            </div>
          </div>

          {/* Section: Conflicting rules */}
          <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
            <Typography.Text strong className="text-rose-700 block mb-2 text-xs">
              🚨 Cấu hình hiện tại của Sân bị trùng lấn:
            </Typography.Text>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-rose-100/50 text-xs">
                <div>
                  <div className="font-semibold text-slate-700 text-sm">Khung 1: 06:00 - 11:00</div>
                  <div className="text-rose-500 font-medium mt-0.5 text-xs">⚠️ Bị trùng lấn 60 phút (Từ 10:00 - 11:00)</div>
                </div>
                <span className="font-bold text-slate-600 text-sm">Giá: 30.000 đ</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-rose-100/50 text-xs">
                <div>
                  <div className="font-semibold text-slate-700 text-sm">Khung 2: 13:00 - 21:00</div>
                  <div className="text-rose-500 font-medium mt-0.5 text-xs">⚠️ Bị trùng lấn 60 phút (Từ 13:00 - 14:00)</div>
                </div>
                <span className="font-bold text-slate-600 text-sm">Giá: 50.000 đ</span>
              </div>
            </div>
          </div>

          {/* Instruction */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-bold block mb-1">💡 Hướng dẫn xử lý:</span>
            Hệ thống tôn trọng các cấu hình riêng của bạn. Để tiếp tục, vui lòng chọn một trong các phương án giải quyết xung đột dưới đây:
          </div>

          {/* Conflict Resolution Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              type="primary" 
              className="w-full text-left flex justify-between items-center p-4 h-auto hover:scale-[1.01] transition-transform"
              onClick={() => {
                setConflictModalOpen(false);
                message.info("Bạn đã chọn: Tự động chia nhỏ & đè giờ (Kết quả: 6h-10h: 30k, 10h-14h: 100k, 14h-21h: 50k)");
              }}
            >
              <div className="text-left">
                <span className="font-bold block text-sm">Phương án 1: Tự động cắt giờ & Đè lên</span>
                <span className="text-[11px] font-normal opacity-85 block text-left mt-0.5">Tự động chia nhỏ các khung giờ cũ bị trùng để nhường chỗ cho khung mới.</span>
              </div>
              <span className="font-semibold text-xs bg-white/20 px-2 py-0.5 rounded shrink-0 ml-4">Khuyên dùng ⭐</span>
            </Button>

            <Button 
              danger 
              className="w-full text-left flex flex-col justify-center p-4 h-auto hover:scale-[1.01] transition-transform border border-rose-200"
              onClick={() => {
                setConflictModalOpen(false);
                message.warning("Bạn đã chọn: Xóa sạch khung giờ trùng của sân để nạp giá mặc định");
              }}
            >
              <span className="font-bold block text-sm text-rose-600">Phương án 2: Xóa cấu hình cũ & Đè toàn bộ</span>
              <span className="text-[11px] font-normal opacity-85 block text-left mt-0.5 text-rose-500">Xóa bỏ hoàn toàn khung 6h-11h và 13h-21h của sân để nạp trọn vẹn khung 10h-14h.</span>
            </Button>

            <Button 
              type="default"
              className="w-full py-2.5 h-auto text-slate-600 hover:text-slate-800"
              onClick={() => {
                setConflictModalOpen(false);
                message.info("Đã giữ nguyên cấu hình cũ của sân.");
              }}
            >
              Hủy nạp - Giữ nguyên cấu hình hiện tại của sân
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
