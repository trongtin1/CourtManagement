import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { App, Typography, Space, Popover, InputNumber, Button, Select } from 'antd'
import { WalletOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
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
  toTimeSpan,
} from '@/utils/format'

export interface PriceBlock {
  id: string
  courtPriceRuleID?: number
  priceRuleTypeID?: number | null
  day: number // Day index: 0 = Mon, 1 = Tue, ..., 6 = Sun
  start: number // Start time in minutes from START_HOUR
  end: number // End time in minutes from START_HOUR
  price: number // Price of this slot in VND
  label?: string
}

/**
 * Prop interface for the main CourtPriceSection scheduler.
 */
interface CourtPriceSectionProps {
  courtId: number
  rules?: PriceBlock[]
  setRules?: (rules: PriceBlock[]) => void
}

/**
 * Prop interface for editing popover content.
 */
interface PricePopoverContentProps {
  block: PriceBlock
  priceRuleTypes: PriceRuleType[]
  onSave: (data: { price: number; priceRuleTypeID?: number | null }) => void
  onCancel: () => void
}

/**
 * Prop interface for an individual time slot block.
 */
interface TimeBlockProps {
  block: PriceBlock
  isSelected: boolean
  isEditing: boolean
  onClick: (id: string) => void
  onDelete: (id: string) => void
  onDragStart: (e: ReactMouseEvent<HTMLDivElement>, block: PriceBlock) => void
  onResizeStart: (e: ReactMouseEvent<HTMLDivElement>, block: PriceBlock) => void
  priceRuleTypes: PriceRuleType[]
  onUpdatePrice: (
    id: string,
    data: { price: number; priceRuleTypeID?: number | null },
  ) => void
  onCloseEdit: () => void
}

/**
 * Prop interface for an individual day's column.
 */
interface DayColumnProps {
  dayIndex: number
  blocks: PriceBlock[]
  selectedId: string | null
  editingId: string | null
  dragOver: number | null
  onSelectBlock: (id: string) => void
  onDelete: (id: string) => void
  onDragStart: (e: ReactMouseEvent<HTMLDivElement>, block: PriceBlock) => void
  onResizeStart: (e: ReactMouseEvent<HTMLDivElement>, block: PriceBlock) => void
  onColumnMouseDown: (e: ReactMouseEvent<HTMLDivElement>, dayIndex: number) => void
  priceRuleTypes: PriceRuleType[]
  onUpdatePrice: (
    id: string,
    data: { price: number; priceRuleTypeID?: number | null },
  ) => void
  onCloseEdit: () => void
}

const START_HOUR = 6
const END_HOUR = 22
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60
const SNAP = 30
const PX_PER_MIN = 1.5
const DEFAULT_PRICE = 150000

const getWeekDatesShort = (): string[] => {
  const currentDayIndex = dayjs().day()
  const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex
  const currentMonday = dayjs().add(mondayOffset, 'day')
  return Array.from({ length: 7 }, (_, i) => {
    const date = currentMonday.add(i, 'day')
    const dayName = i === 6 ? 'CN' : `T${i + 2}`
    return `${dayName} (${date.format('DD/MM')})`
  })
}

const DAYS = getWeekDatesShort()

const snapMinutes = (min: number): number => Math.round(min / SNAP) * SNAP
const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val))

const formatApiTime = (value?: string): string => formatTime(value) || '00:00'

const apiDayToGridDay = (dayOfWeek: number): number =>
  dayOfWeek === 0 ? 6 : dayOfWeek - 1

const gridDayToApiDay = (day: number): number => (day === 6 ? 0 : day + 1)

const timeToGridMinutes = (value: string): number => {
  const [hours, minutes] = formatApiTime(value).split(':').map(Number)
  return clamp((hours - START_HOUR) * 60 + minutes, 0, TOTAL_MINUTES)
}

const gridMinutesToApiTime = (minutes: number): string =>
  toTimeSpan(formatMinutesAsTime(START_HOUR * 60 + minutes))

const courtPriceToBlock = (
  price: CourtPrice,
  priceRuleTypeById: Map<number, PriceRuleType>,
): PriceBlock => ({
  id: String(price.courtPriceRuleID),
  courtPriceRuleID: price.courtPriceRuleID,
  priceRuleTypeID: price.priceRuleTypeID ?? null,
  day: apiDayToGridDay(price.dayOfWeek),
  start: timeToGridMinutes(price.startTime),
  end: timeToGridMinutes(price.endTime),
  price: price.price,
  label: price.priceRuleTypeID
    ? (priceRuleTypeById.get(price.priceRuleTypeID)?.name ?? '')
    : '',
})

const buildCourtPricePayload = (courtId: number, block: PriceBlock) => ({
  courtID: courtId,
  priceRuleTypeID: block.priceRuleTypeID ?? null,
  dayOfWeek: gridDayToApiDay(block.day),
  startTime: gridMinutesToApiTime(block.start),
  endTime: gridMinutesToApiTime(block.end),
  price: block.price,
  isActive: true,
})

/**
 * Maps minutes into visual grid pixel offsets.
 */
const minutesToPx = (min: number): number => min * PX_PER_MIN

/**
 * Maps grid pixel offsets back into minute values.
 */
const pxToMinutes = (px: number): number => px / PX_PER_MIN

const generateId = (): string =>
  `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const hasCollision = (
  blocks: PriceBlock[],
  candidate: Omit<PriceBlock, 'id'>,
  excludeId: string | null = null,
): boolean => {
  return blocks.some(
    (b) =>
      b.id !== excludeId &&
      b.day === candidate.day &&
      b.start < candidate.end &&
      b.end > candidate.start,
  )
}

const hasBlockLayoutChanged = (
  blocks: PriceBlock[],
  original?: PriceBlock | null,
  includeDay = true,
): boolean => {
  if (!original) return false
  const changed = blocks.find((block) => block.id === original.id)
  if (!changed) return false

  return (
    changed.start !== original.start ||
    changed.end !== original.end ||
    (includeDay && changed.day !== original.day)
  )
}

const addPendingDeleteId = (ids: number[], id?: number): number[] =>
  id ? Array.from(new Set([...ids, id])) : ids

const PricePopoverContent = ({
  block,
  priceRuleTypes,
  onSave,
  onCancel,
}: PricePopoverContentProps) => {
  const [price, setPrice] = useState<number>(block.price)
  const [priceRuleTypeID, setPriceRuleTypeID] = useState<number | null>(
    block.priceRuleTypeID ?? null,
  )

  const dateStr = DAYS[block.day]
  const dayStr = dateStr.includes('CN')
    ? `CHỦ NHẬT ${dateStr.substring(2)}`
    : `THỨ ${dateStr.replace('T', '')}`

  const timeStr = `${formatMinutesAsTime(START_HOUR * 60 + block.start)} - ${formatMinutesAsTime(START_HOUR * 60 + block.end)}`

  return (
    <div className="w-56" onMouseDown={(e) => e.stopPropagation()}>
      {/* Popover Header */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-2 items-center">
          <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600 text-[10px] font-bold uppercase">
            {dayStr}
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600" onClick={onCancel}>
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      </div>

      <div className="text-[15px] font-medium text-slate-700 mb-3">{timeStr}</div>

      {/* Pricing Label Selection */}
      <div className="mb-1 text-[10px] font-bold text-slate-500 uppercase">
        Loại khung giờ
      </div>
      <div className="mb-3">
        <Select
          className="w-full"
          allowClear
          value={priceRuleTypeID}
          onChange={(value) => setPriceRuleTypeID(value ?? null)}
          placeholder="VD: Giờ thấp điểm"
          options={priceRuleTypes.map((type) => ({
            value: type.priceRuleTypeID,
            label: type.name,
          }))}
        />
      </div>

      {/* Pricing Value Input */}
      <div className="mb-1 text-[10px] font-bold text-slate-500 uppercase">
        Giá / Khung giờ
      </div>
      <div className="mb-4">
        <InputNumber
          className="w-full font-bold"
          value={price}
          onChange={(val) => setPrice(val || 0)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          parser={(value) => (value ? Number(value.replace(/\./g, '')) : 0)}
          addonAfter="đ"
          controls={false}
          size="large"
        />
      </div>

      {/* Popover Actions */}
      <div className="flex gap-2 justify-between">
        <Button onClick={onCancel} className="flex-1">
          Hủy
        </Button>
        <Button
          type="primary"
          style={{ background: '#f97316', borderColor: '#f97316' }}
          onClick={() => onSave({ price, priceRuleTypeID })}
          className="flex-1"
        >
          Lưu
        </Button>
      </div>
    </div>
  )
}

const TimeBlock = ({
  block,
  isSelected,
  isEditing,
  onClick,
  onDelete,
  onDragStart,
  onResizeStart,
  onUpdatePrice,
  priceRuleTypes,
  onCloseEdit,
}: TimeBlockProps) => {
  const top = minutesToPx(block.start)
  const height = minutesToPx(block.end - block.start)
  const duration = block.end - block.start
  const priceRuleType = priceRuleTypes.find(
    (type) => type.priceRuleTypeID === block.priceRuleTypeID,
  )
  const color = priceRuleType?.colorCode || '#0ea5e9'

  return (
    <Popover
      open={isEditing}
      placement="right"
      trigger="click"
      destroyTooltipOnHide
      onOpenChange={(open) => {
        if (!open) onCloseEdit()
      }}
      content={
        <PricePopoverContent
          block={block}
          priceRuleTypes={priceRuleTypes}
          onSave={(data) => onUpdatePrice(block.id, data)}
          onCancel={onCloseEdit}
        />
      }
    >
      <div
        className="absolute left-1 right-1 group cursor-grab active:cursor-grabbing select-none"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          zIndex: isSelected ? 30 : 10,
        }}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement
          if (target.dataset && target.dataset.resize) return
          e.stopPropagation()
          onDragStart(e, block)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick(block.id)
        }}
      >
        <div
          className={[
            'relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border bg-white shadow-sm',
            isSelected ? 'outline outline-offset-1' : 'hover:bg-slate-50',
          ].join(' ')}
          style={{
            minHeight: 28,
            borderColor: color,
            borderLeftWidth: 4,
            outlineColor: isSelected ? color : undefined,
          }}
        >
          {/* Time & Price Information */}
          <div className="px-2 pt-1.5 flex-1 overflow-hidden">
            {height > 44 && (
              <p
                className="text-[10px] font-semibold leading-none tracking-wide uppercase mb-0.5"
                style={{ color }}
              >
                {formatMinutesAsTime(START_HOUR * 60 + block.start)} –{' '}
                {formatMinutesAsTime(START_HOUR * 60 + block.end)}
              </p>
            )}
            {height > 32 && (
              <p className="text-xs font-bold leading-tight truncate" style={{ color }}>
                {formatCurrency(block.price)}
              </p>
            )}
            {block.label && height > 50 && (
              <span
                className="inline-block mt-0.5 px-1 py-0.5 text-[9px] font-bold rounded truncate max-w-full bg-slate-100"
                style={{ color }}
              >
                {block.label}
              </span>
            )}
            {!block.label && height > 60 && (
              <p className="text-[10px] mt-0.5" style={{ color }}>
                {duration} phút
              </p>
            )}
          </div>

          {/* Delete Action button */}
          <button
            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-100 text-red-400 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-150 
                       flex items-center justify-center hover:bg-red-200 hover:text-red-600 z-20"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(block.id)
            }}
          >
            <svg
              className="w-2.5 h-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Resize dragging handle */}
          <div
            data-resize="true"
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeStart(e, block)
            }}
            className="absolute bottom-0 left-0 right-0 h-2.5 cursor-s-resize 
                       flex items-end justify-center pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: color }} />
          </div>
        </div>
      </div>
    </Popover>
  )
}

/**
 * Grid Column containing blocks configured for a specific weekday.
 */
const DayColumn = ({
  dayIndex,
  blocks,
  selectedId,
  editingId,
  dragOver,
  onSelectBlock,
  onDelete,
  onDragStart,
  onResizeStart,
  onColumnMouseDown,
  onUpdatePrice,
  priceRuleTypes,
  onCloseEdit,
}: DayColumnProps) => {
  const isHovered = dragOver === dayIndex

  return (
    <div className="flex-1 min-w-0 relative">
      <div
        className={`
          relative w-full transition-colors duration-150 rounded-lg
          ${isHovered ? 'bg-sky-50/80' : 'bg-transparent'}
        `}
        style={{ height: `${minutesToPx(TOTAL_MINUTES)}px` }}
        onMouseDown={(e) => onColumnMouseDown(e, dayIndex)}
      >
        {/* Hour background grid lines */}
        {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-slate-100"
            style={{ top: `${minutesToPx(i * 60)}px` }}
          />
        ))}

        {/* 30-minute minor background grid lines */}
        {Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => (
          <div
            key={`half-${i}`}
            className="absolute left-2 right-2 border-t border-slate-50"
            style={{ top: `${minutesToPx(i * 30)}px` }}
          />
        ))}

        {/* Renders each configured TimeBlock */}
        {blocks.map((block) => (
          <TimeBlock
            key={block.id}
            block={block}
            isSelected={selectedId === block.id}
            isEditing={editingId === block.id}
            onClick={onSelectBlock}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onResizeStart={onResizeStart}
            onUpdatePrice={onUpdatePrice}
            priceRuleTypes={priceRuleTypes}
            onCloseEdit={onCloseEdit}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// ─── MAIN COURT PRICE COMPONENT ─────────────────────────────────────────────
// ============================================================================

/**
 * Main Interactive drag-and-drop Court Settings scheduler component.
 */
export function CourtPriceSection({ courtId, setRules }: CourtPriceSectionProps) {
  const { message, modal } = App.useApp()
  const pricesQuery = useCourtPricesByCourtQuery(courtId)
  const priceRuleTypesQuery = usePriceRuleTypesQuery({ page: 1, pageSize: 1000 })
  const createMut = useCreateCourtPriceMutation()
  const updateMut = useUpdateCourtPriceMutation()
  const deleteMut = useDeleteCourtPriceMutation()
  const [saving, setSaving] = useState(false)

  // --- States ---
  const priceRuleTypes = useMemo(
    () =>
      [...(priceRuleTypesQuery.data?.items ?? [])]
        .filter((type) => type.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [priceRuleTypesQuery.data?.items],
  )
  const priceRuleTypeById = useMemo(
    () => new Map(priceRuleTypes.map((type) => [type.priceRuleTypeID, type] as const)),
    [priceRuleTypes],
  )
  const priceBlocks = useMemo(
    () =>
      (pricesQuery.data ?? [])
        .filter((item) => item.isActive)
        .map((item) => courtPriceToBlock(item, priceRuleTypeById)),
    [priceRuleTypeById, pricesQuery.data],
  )
  const [draftBlocks, setDraftBlocks] = useState<PriceBlock[] | null>(null)
  const [pendingDeletedRuleIds, setPendingDeletedRuleIds] = useState<number[]>([])
  const blocks = draftBlocks ?? priceBlocks
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  // --- Interaction States ---
  const [dragState, setDragState] = useState<{
    block: PriceBlock
    originDay: number
    offsetMin: number
  } | null>(null)
  const [resizeState, setResizeState] = useState<{ block: PriceBlock } | null>(null)
  const [createState, setCreateState] = useState<{
    dayIndex: number
    startMin: number
    endMin: number
  } | null>(null)

  // --- DOM Refs ---
  const gridRef = useRef<HTMLDivElement | null>(null)
  const columnsRef = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number | null>(null)
  const blocksRef = useRef<PriceBlock[]>([])

  useEffect(() => {
    blocksRef.current = blocks
  }, [blocks])

  const stageBlocks = useCallback(
    (updater: (current: PriceBlock[]) => PriceBlock[]) => {
      const next = updater(blocks)
      setDraftBlocks(next)
      setRules?.(next)
      return next
    },
    [blocks, setRules],
  )

  const saveChanges = useCallback(
    async (nextBlocks: PriceBlock[], deletedRuleIds: number[]) => {
      setSaving(true)
      try {
        await Promise.all([
          ...deletedRuleIds.map((id) => deleteMut.mutateAsync({ courtId, id })),
          ...nextBlocks.map((block) => {
            if (block.courtPriceRuleID) {
              return updateMut.mutateAsync({
                id: block.courtPriceRuleID,
                data: buildCourtPricePayload(courtId, block),
              })
            }

            return createMut.mutateAsync(buildCourtPricePayload(courtId, block))
          }),
        ])
        setPendingDeletedRuleIds([])
        setDraftBlocks(null)
        setRules?.(nextBlocks)
        message.success('Đã lưu cấu hình giá thành công')
      } catch (error) {
        message.error('Lưu cấu hình giá thất bại')
        throw error
      } finally {
        setSaving(false)
      }
    },
    [courtId, createMut, deleteMut, message, setRules, updateMut],
  )

  const confirmSave = useCallback(
    (nextBlocks: PriceBlock[], actionLabel: string, deletedRuleIds: number[]) => {
      modal.confirm({
        title: 'Lưu thay đổi giá sân?',
        content: `Bạn vừa ${actionLabel}. Bạn có muốn lưu thay đổi này không?`,
        okText: 'Lưu ngay',
        cancelText: 'Để sau',
        onOk: () => saveChanges(nextBlocks, deletedRuleIds),
      })
    },
    [modal, saveChanges],
  )

  // --- Interaction Coordinate Translators ---

  /**
   * Identifies which day column index matches a clientX horizontal pixel coordinate.
   */
  const getColumnFromX = useCallback((clientX: number): number | null => {
    for (let i = 0; i < columnsRef.current.length; i++) {
      const col = columnsRef.current[i]
      if (!col) continue
      const rect = col.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) return i
    }
    return null
  }, [])

  /**
   * Translates clientY vertical pixel coordinates into snapped minute offsets inside the grid container.
   */
  const getMinutesFromY = useCallback((clientY: number): number => {
    const grid = gridRef.current
    if (!grid) return 0
    const rect = grid.getBoundingClientRect()
    const relY = clientY - rect.top
    const raw = pxToMinutes(relY)
    return clamp(snapMinutes(raw), 0, TOTAL_MINUTES)
  }, [])

  // --- Interactive Callback Handlers ---

  const handleDragStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>, block: PriceBlock) => {
      e.preventDefault()
      const startMin = getMinutesFromY(e.clientY)
      const offsetMin = startMin - block.start
      setDragState({ block, originDay: block.day, offsetMin })
      setSelectedId(block.id)
      setEditingId(null)
    },
    [getMinutesFromY],
  )

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>, block: PriceBlock) => {
      e.preventDefault()
      setResizeState({ block })
      setEditingId(null)
    },
    [],
  )

  const handleColumnMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>, dayIndex: number) => {
      if (e.button !== 0) return // Left click only
      if (dragState || resizeState) return
      const startMin = getMinutesFromY(e.clientY)
      setCreateState({ dayIndex, startMin, endMin: startMin + SNAP })
      setSelectedId(null)
      setEditingId(null)
    },
    [dragState, resizeState, getMinutesFromY],
  )

  // --- Global Window Drag & Resize Mouse Handlers ---
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const curMin = getMinutesFromY(e.clientY)
        const curDay = getColumnFromX(e.clientX)

        // Handles Drag & Drop translation
        if (dragState) {
          setDragOver(curDay)
          const newStart = clamp(
            snapMinutes(curMin - dragState.offsetMin),
            0,
            TOTAL_MINUTES - SNAP,
          )
          const duration = dragState.block.end - dragState.block.start
          const newEnd = clamp(newStart + duration, SNAP, TOTAL_MINUTES)
          const targetDay = curDay !== null ? curDay : dragState.originDay

          stageBlocks((current) =>
            current.map((b) =>
              b.id === dragState.block.id
                ? { ...b, day: targetDay, start: newStart, end: newEnd }
                : b,
            ),
          )
        }

        // Handles bottom edge Resizing translation
        if (resizeState) {
          const minEnd = resizeState.block.start + SNAP
          const newEnd = clamp(snapMinutes(curMin), minEnd, TOTAL_MINUTES)
          stageBlocks((current) =>
            current.map((b) =>
              b.id === resizeState.block.id ? { ...b, end: newEnd } : b,
            ),
          )
        }

        // Handles dynamic creation preview drawing
        if (createState) {
          const newEnd = clamp(
            snapMinutes(curMin),
            createState.startMin + SNAP,
            TOTAL_MINUTES,
          )
          setCreateState((s) => (s ? { ...s, endMin: newEnd } : s))
        }
      })
    }

    const onMouseUp = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setDragOver(null)
      const draggedBlock = dragState?.block
      const resizedBlock = resizeState?.block

      // Finalizes Creation of new Price block on mouse release
      if (createState && createState.endMin > createState.startMin) {
        const newBlock: PriceBlock = {
          id: generateId(),
          day: createState.dayIndex,
          start: createState.startMin,
          end: createState.endMin,
          price: DEFAULT_PRICE,
          priceRuleTypeID: null,
          label: '',
        }
        if (!hasCollision(blocks, newBlock)) {
          const nextBlocks = stageBlocks((current) => [...current, newBlock])
          setSelectedId(newBlock.id)
          setEditingId(newBlock.id)
          confirmSave(nextBlocks, 'thêm một khung giá mới', pendingDeletedRuleIds)
        }
      }

      if (draggedBlock) {
        if (hasBlockLayoutChanged(blocksRef.current, draggedBlock)) {
          confirmSave(blocksRef.current, 'di chuyển một khung giá', pendingDeletedRuleIds)
        }
      }

      if (resizedBlock) {
        if (hasBlockLayoutChanged(blocksRef.current, resizedBlock, false)) {
          confirmSave(
            blocksRef.current,
            'thay đổi độ dài khung giá',
            pendingDeletedRuleIds,
          )
        }
      }

      // Resets active state tracking flags
      setDragState(null)
      setResizeState(null)
      setCreateState(null)

      if (resizedBlock) {
        setSelectedId(resizedBlock.id)
        setEditingId(resizedBlock.id)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [
    dragState,
    resizeState,
    createState,
    getMinutesFromY,
    getColumnFromX,
    blocks,
    stageBlocks,
    confirmSave,
    pendingDeletedRuleIds,
  ])

  // --- Block Data Manipulation Actions ---

  const handleDelete = useCallback(
    (id: string) => {
      const block = blocks.find((item) => item.id === id)
      if (!block) return

      const nextBlocks = stageBlocks((current) => current.filter((b) => b.id !== id))
      const nextDeletedRuleIds = addPendingDeleteId(
        pendingDeletedRuleIds,
        block?.courtPriceRuleID,
      )

      if (block?.courtPriceRuleID) {
        setPendingDeletedRuleIds(nextDeletedRuleIds)
      }
      confirmSave(nextBlocks, 'xóa một khung giá', nextDeletedRuleIds)
      setSelectedId(null)
      setEditingId(null)
    },
    [blocks, confirmSave, pendingDeletedRuleIds, stageBlocks],
  )

  const handleUpdatePrice = useCallback(
    (
      id: string,
      { price, priceRuleTypeID }: { price: number; priceRuleTypeID?: number | null },
    ) => {
      const block = blocks.find((item) => item.id === id)
      if (!block) return

      const label = priceRuleTypeID
        ? (priceRuleTypeById.get(priceRuleTypeID)?.name ?? '')
        : ''
      const nextBlocks = stageBlocks((current) =>
        current.map((b) => (b.id === id ? { ...b, price, priceRuleTypeID, label } : b)),
      )
      confirmSave(nextBlocks, 'cập nhật giá của khung giờ', pendingDeletedRuleIds)
      setEditingId(null)
    },
    [blocks, confirmSave, pendingDeletedRuleIds, priceRuleTypeById, stageBlocks],
  )

  const handleCloseEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleSaveConfig = async () => {
    const nextBlocks = draftBlocks ?? blocks
    await saveChanges(nextBlocks, pendingDeletedRuleIds).catch(() => undefined)
  }

  // Groups current blocks efficiently by day columns
  const blocksByDay = useMemo(() => {
    const map: { [key: number]: PriceBlock[] } = {}
    for (let i = 0; i < 7; i++) map[i] = []
    blocks.forEach((b) => map[b.day]?.push(b))
    return map
  }, [blocks])

  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i,
  )

  // --- Rendering ---
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        padding: '24px',
      }}
      className="font-sans"
    >
      <div className="w-full">
        {/* Visual Header */}
        <div
          className="flex items-start justify-between gap-4"
          style={{ marginBottom: 24 }}
        >
          <Space align="start" size={16}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#e6f4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1677ff',
                fontSize: 20,
              }}
            >
              <WalletOutlined />
            </div>
            <div>
              <Typography.Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                Cấu hình giá
              </Typography.Title>
              <Typography.Text type="secondary">
                Cấu hình chi tiết giá cho từng khung giờ trong tuần bằng cách kéo thả.
              </Typography.Text>
            </div>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving || createMut.isPending || updateMut.isPending}
            onClick={handleSaveConfig}
          >
            Lưu cấu hình
          </Button>
        </div>

        {/* Scheduler Card Wrapper */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Weekday Column Headers */}
          <div className="flex border-b border-slate-100">
            <div className="w-14 shrink-0 border-r border-slate-100" />
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex-1 min-w-0 text-center py-3 text-xs font-semibold text-slate-500 
                           uppercase tracking-widest border-r border-slate-100 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dynamic Scrollable Grid Body */}
          <div className="flex overflow-auto" style={{ maxHeight: '75vh' }}>
            {/* Hour labels sidebar */}
            <div
              className="w-14 shrink-0 border-r border-slate-100 relative"
              style={{ height: `${minutesToPx(TOTAL_MINUTES)}px` }}
            >
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="absolute right-2 text-[10px] text-slate-400 font-medium leading-none -translate-y-1/2"
                  style={{ top: `${minutesToPx(i * 60)}px` }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Main Day Columns Grid */}
            <div
              ref={gridRef}
              className="flex flex-1 relative"
              style={{ height: `${minutesToPx(TOTAL_MINUTES)}px` }}
            >
              {DAYS.map((_, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    columnsRef.current[i] = el
                  }}
                  className="flex-1 min-w-0 border-r border-slate-100 last:border-r-0 relative"
                >
                  <DayColumn
                    dayIndex={i}
                    blocks={blocksByDay[i] || []}
                    selectedId={selectedId}
                    editingId={editingId}
                    dragOver={dragOver}
                    onSelectBlock={(id) => {
                      setSelectedId(id)
                      setEditingId(id)
                    }}
                    onDelete={handleDelete}
                    onDragStart={handleDragStart}
                    onResizeStart={handleResizeStart}
                    onColumnMouseDown={handleColumnMouseDown}
                    onUpdatePrice={handleUpdatePrice}
                    priceRuleTypes={priceRuleTypes}
                    onCloseEdit={handleCloseEdit}
                  />
                </div>
              ))}

              {/* Visual Creation drag preview */}
              {createState && createState.endMin > createState.startMin && (
                <div
                  className="absolute pointer-events-none z-40 rounded-xl border-2 border-dashed border-sky-400 bg-sky-100/60"
                  style={{
                    left: `calc(${(createState.dayIndex / 7) * 100}% + 4px)`,
                    width: `calc(${100 / 7}% - 8px)`,
                    top: `${minutesToPx(createState.startMin)}px`,
                    height: `${minutesToPx(createState.endMin - createState.startMin)}px`,
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-sky-500 text-[10px] font-semibold">
                    <span>
                      {formatMinutesAsTime(START_HOUR * 60 + createState.startMin)}
                    </span>
                    <span className="text-sky-300">–</span>
                    <span>
                      {formatMinutesAsTime(START_HOUR * 60 + createState.endMin)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
