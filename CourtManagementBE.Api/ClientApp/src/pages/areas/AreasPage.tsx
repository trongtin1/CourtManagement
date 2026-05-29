import { useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tooltip,
} from 'antd'
import {
  AimOutlined,
  BorderOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HolderOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useAreasQuery,
  useCreateAreaMutation,
  useDeleteAreaMutation,
  useUpdateAreaMutation,
} from '@/features/areas/api/useAreaQueries'
import type {
  Area,
  CreateAreaRequest,
  UpdateAreaRequest,
} from '@/features/areas/model/types'
import { useCourtsQuery } from '@/features/courts/api/useCourtQueries'
import {
  useCourtAreaMappingsByAreaQuery,
  useCreateCourtAreaMappingMutation,
  useDeleteCourtAreaMappingMutation,
  useUpdateCourtAreaMappingMutation,
} from '@/features/courts/api/useCourtAreaMappingQueries'
import type { Court, CourtAreaMapping } from '@/features/courts/model/types'
import { useFacilitiesQuery } from '@/features/facilities/api/useFacilityQueries'
import { toApiError } from '@/utils/errors'

const areaColors = ['#16a34a', '#2563eb', '#7c3aed', '#f97316', '#14b8a6', '#db2777']

type MappingDraft = Pick<CourtAreaMapping, 'positionX' | 'positionY' | 'displayOrder'>

const emptyAreas: Area[] = []
const emptyCourts: Court[] = []
const emptyFacilities: { facilityID: number; facilityName: string }[] = []
const emptyMappings: CourtAreaMapping[] = []

const round1 = (value: number) => Math.round(value * 10) / 10

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const getAreaUnit = (area?: Area) => ({
  length: Math.max(area?.totalLength || 40, 1),
  width: Math.max(area?.totalWidth || 25, 1),
})

const getCourtSize = (court?: Court, area?: Area) => {
  const unit = getAreaUnit(area)
  return {
    widthPct: clamp(((court?.length || 10) / unit.length) * 100, 10, 26),
    heightPct: clamp(((court?.width || 6) / unit.width) * 100, 10, 22),
  }
}

const getMappingDraft = (
  mapping: CourtAreaMapping,
  drafts: Record<number, MappingDraft>,
): MappingDraft => drafts[mapping.courtAreaMappingID] ?? mapping

export function AreasPage() {
  const { message } = App.useApp()
  const [areaForm] = Form.useForm()
  const [mappingForm] = Form.useForm()
  const [search, setSearch] = useState('')
  const [areaModalOpen, setAreaModalOpen] = useState(false)
  const [mappingModalOpen, setMappingModalOpen] = useState(false)
  const [mappingDrawerOpen, setMappingDrawerOpen] = useState(false)
  const [designerTab, setDesignerTab] = useState('map')
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null)
  const [selectedMappingId, setSelectedMappingId] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Record<number, MappingDraft>>({})

  const {
    data: areasData,
    isLoading: areasLoading,
    refetch: refetchAreas,
  } = useAreasQuery()
  const shouldLoadCourts = mappingDrawerOpen || mappingModalOpen
  const shouldLoadFacilities = areaModalOpen && !editingAreaId

  const { data: courtsData } = useCourtsQuery(undefined, shouldLoadCourts)
  const { data: facilitiesData } = useFacilitiesQuery(undefined, shouldLoadFacilities)
  const { mutateAsync: createArea, isPending: createAreaLoading } =
    useCreateAreaMutation()
  const { mutateAsync: updateArea, isPending: updateAreaLoading } =
    useUpdateAreaMutation()
  const { mutate: deleteArea } = useDeleteAreaMutation()
  const { mutateAsync: createMapping, isPending: createMappingLoading } =
    useCreateCourtAreaMappingMutation()
  const { mutateAsync: updateMapping, isPending: updateMappingLoading } =
    useUpdateCourtAreaMappingMutation()
  const { mutateAsync: deleteMapping } = useDeleteCourtAreaMappingMutation()

  const areas = areasData?.items ?? emptyAreas
  const courts = courtsData?.items ?? emptyCourts
  const facilities = facilitiesData?.items ?? emptyFacilities
  const selectedArea = areas.find((area) => area.areaID === selectedAreaId) ?? areas[0]
  const activeAreaId = selectedArea?.areaID ?? 0
  const { data: mappingsData } = useCourtAreaMappingsByAreaQuery(
    activeAreaId,
    mappingDrawerOpen,
  )
  const mappings = mappingsData ?? emptyMappings

  const courtById = useMemo(() => {
    return new Map(courts.map((court) => [court.courtID, court]))
  }, [courts])

  const filteredAreas = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return areas

    return areas.filter(
      (area) =>
        area.areaName.toLowerCase().includes(keyword) ||
        area.areaCode.toLowerCase().includes(keyword) ||
        area.description.toLowerCase().includes(keyword),
    )
  }, [areas, search])

  const selectedMapping =
    mappings.find((mapping) => mapping.courtAreaMappingID === selectedMappingId) ??
    mappings[0]
  const activeSelectedMappingId = selectedMapping?.courtAreaMappingID ?? null
  const selectedCourt = selectedMapping
    ? courtById.get(selectedMapping.courtID)
    : undefined
  const dirtyDrafts = useMemo(
    () =>
      Object.entries(drafts).filter(([id, draft]) => {
        const mapping = mappings.find((item) => item.courtAreaMappingID === Number(id))
        return (
          mapping &&
          (mapping.positionX !== draft.positionX ||
            mapping.positionY !== draft.positionY ||
            mapping.displayOrder !== draft.displayOrder)
        )
      }),
    [drafts, mappings],
  )

  const openCreateArea = () => {
    setEditingAreaId(null)
    areaForm.resetFields()
    areaForm.setFieldsValue({
      facilityID: facilities[0]?.facilityID,
      totalLength: 40,
      totalWidth: 25,
      isActive: true,
    })
    setAreaModalOpen(true)
  }

  const openEditArea = (area: Area) => {
    setEditingAreaId(area.areaID)
    areaForm.setFieldsValue({
      areaCode: area.areaCode,
      areaName: area.areaName,
      totalLength: area.totalLength,
      totalWidth: area.totalWidth,
      description: area.description,
      isActive: area.isActive,
    })
    setAreaModalOpen(true)
  }

  const submitArea = async () => {
    try {
      const values = await areaForm.validateFields()
      if (editingAreaId) {
        const data: UpdateAreaRequest = {
          areaCode: values.areaCode,
          areaName: values.areaName,
          totalLength: values.totalLength,
          totalWidth: values.totalWidth,
          description: values.description,
          isActive: values.isActive,
        }
        await updateArea({ id: editingAreaId, data })
        message.success('Cập nhật khu vực thành công')
      } else {
        const data: CreateAreaRequest = {
          facilityID: values.facilityID,
          areaCode: values.areaCode,
          areaName: values.areaName,
          totalLength: values.totalLength,
          totalWidth: values.totalWidth,
          description: values.description,
          isActive: values.isActive,
        }
        const created = await createArea(data)
        setSelectedAreaId(created.areaID)
        setSelectedMappingId(null)
        setDrafts({})
        message.success('Tạo khu vực thành công')
      }
      setAreaModalOpen(false)
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const toggleArea = async (area: Area) => {
    try {
      await updateArea({
        id: area.areaID,
        data: {
          areaCode: area.areaCode,
          areaName: area.areaName,
          totalLength: area.totalLength,
          totalWidth: area.totalWidth,
          description: area.description,
          isActive: !area.isActive,
        },
      })
      message.success(area.isActive ? 'Đã tắt khu vực' : 'Đã bật khu vực')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  const openMappingDrawer = (area: Area) => {
    setSelectedAreaId(area.areaID)
    setSelectedMappingId(null)
    setDrafts({})
    setMappingDrawerOpen(true)
  }

  const openCreateMapping = () => {
    mappingForm.resetFields()
    mappingForm.setFieldsValue({
      areaID: activeAreaId,
      positionX: 2,
      positionY: 2,
      displayOrder: mappings.length + 1,
    })
    setMappingModalOpen(true)
  }

  const submitMapping = async () => {
    try {
      const values = await mappingForm.validateFields()
      await createMapping({
        courtID: values.courtID,
        areaID: activeAreaId,
        positionX: values.positionX ?? 0,
        positionY: values.positionY ?? 0,
        displayOrder: values.displayOrder ?? mappings.length + 1,
      })
      setMappingModalOpen(false)
      message.success('Đã thêm sân vào khu vực')
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const updateDraft = (mappingId: number, patch: Partial<MappingDraft>) => {
    const mapping = mappings.find((item) => item.courtAreaMappingID === mappingId)
    if (!mapping) return

    setDrafts((current) => ({
      ...current,
      [mappingId]: {
        ...getMappingDraft(mapping, current),
        ...patch,
      },
    }))
  }

  const saveMapping = async (mapping: CourtAreaMapping, draft: MappingDraft) => {
    await updateMapping({
      id: mapping.courtAreaMappingID,
      data: {
        positionX: draft.positionX,
        positionY: draft.positionY,
        displayOrder: draft.displayOrder,
      },
    })
  }

  const saveDrafts = async () => {
    try {
      await Promise.all(
        dirtyDrafts.map(([id, draft]) => {
          const mapping = mappings.find((item) => item.courtAreaMappingID === Number(id))
          if (!mapping) return Promise.resolve()
          return saveMapping(mapping, draft)
        }),
      )
      setDrafts({})
      message.success('Đã lưu sơ đồ')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  const handleDragStart = (
    event: ReactPointerEvent<HTMLDivElement>,
    mapping: CourtAreaMapping,
  ) => {
    if (!selectedArea) return

    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedMappingId(mapping.courtAreaMappingID)

    const canvas = event.currentTarget.parentElement
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const unit = getAreaUnit(selectedArea)
    const court = courtById.get(mapping.courtID)
    const size = getCourtSize(court, selectedArea)

    const move = (moveEvent: globalThis.PointerEvent) => {
      const leftPct = clamp(
        ((moveEvent.clientX - rect.left) / rect.width) * 100,
        0,
        100 - size.widthPct,
      )
      const topPct = clamp(
        ((moveEvent.clientY - rect.top) / rect.height) * 100,
        0,
        100 - size.heightPct,
      )
      updateDraft(mapping.courtAreaMappingID, {
        positionX: round1((leftPct / 100) * unit.length),
        positionY: round1((topPct / 100) * unit.width),
      })
    }

    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const removeMapping = async (mappingId: number) => {
    try {
      await deleteMapping(mappingId)
      setSelectedMappingId(null)
      message.success('Đã xóa sân khỏi sơ đồ')
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  const unmappedCourts = useMemo(
    () =>
      courts.filter(
        (court) => !mappings.some((mapping) => mapping.courtID === court.courtID),
      ),
    [courts, mappings],
  )

  if (areasLoading) {
    return <LoadingSpin tip="Đang tải khu vực..." />
  }

  return (
    <Space className="w-full" direction="vertical" size={16}>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button icon={<PlusOutlined />} onClick={openCreateArea} type="primary">
          Thêm khu vực
        </Button>
      </div>

      <Card>
        <Space className="mb-4 w-full justify-between" wrap>
          <Input
            allowClear
            className="max-w-md"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm khu vực..."
            prefix={<SearchOutlined />}
            value={search}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={areasLoading}
            onClick={() => refetchAreas()}
          >
            Làm mới
          </Button>
        </Space>

        <Table
          columns={[
            {
              title: '#',
              width: 56,
              render: (_: unknown, __: Area, index: number) => index + 1,
            },
            {
              title: 'Tên khu vực',
              render: (_: unknown, area: Area) => (
                <Space>
                  <span className="font-semibold">{area.areaName}</span>
                </Space>
              ),
            },
            { title: 'Mã khu vực', dataIndex: 'areaCode', width: 140 },
            {
              title: 'Kích thước',
              width: 190,
              render: (_: unknown, area: Area) =>
                `${area.totalLength}m x ${area.totalWidth}m`,
            },
            {
              title: 'Số sân',
              width: 100,
              render: (_: unknown, area: Area) =>
                mappingDrawerOpen && activeAreaId === area.areaID ? mappings.length : '—',
            },
            { title: 'Mô tả', dataIndex: 'description' },

            {
              title: 'Trạng thái',
              width: 150,
              render: (_: unknown, area: Area) => (
                <Switch
                  checked={area.isActive}
                  checkedChildren="Hoạt động"
                  loading={updateAreaLoading}
                  onChange={() => toggleArea(area)}
                  unCheckedChildren="Tắt"
                />
              ),
            },
            {
              title: 'Thao tác',
              width: 170,
              render: (_: unknown, area: Area) => (
                <Space>
                  <Tooltip title="Mở sơ đồ">
                    <Button
                      icon={<EyeOutlined />}
                      onClick={(event) => {
                        event.stopPropagation()
                        openMappingDrawer(area)
                      }}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Sửa">
                    <Button
                      icon={<EditOutlined />}
                      onClick={(event) => {
                        event.stopPropagation()
                        openEditArea(area)
                      }}
                      size="small"
                    />
                  </Tooltip>
                  <Popconfirm
                    onConfirm={() => deleteArea(area.areaID)}
                    title="Xóa khu vực này?"
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(event) => event.stopPropagation()}
                      size="small"
                    />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={filteredAreas}
          onRow={(area) => ({
            onClick: () => {
              setSelectedAreaId(area.areaID)
              setSelectedMappingId(null)
              setDrafts({})
            },
          })}
          pagination={{ pageSize: 4, showTotal: (total) => `Hiển thị ${total} khu vực` }}
          rowClassName={(area) =>
            area.areaID === selectedArea?.areaID ? 'bg-emerald-50/60' : 'cursor-pointer'
          }
          rowKey="areaID"
          scroll={{ x: 1100 }}
        />
      </Card>

      <Drawer
        width="100vw"
        open={mappingDrawerOpen}
        onClose={() => setMappingDrawerOpen(false)}
        title={
          <Space direction="vertical" size={0}>
            <h4 className="mb-0! text-lg font-semibold">
              Sơ đồ khu vực: {selectedArea?.areaName ?? 'Chưa chọn khu vực'}
              {selectedArea ? ` (${selectedArea.areaCode})` : ''}
            </h4>
            <span className="text-slate-500">
              {selectedArea
                ? `${selectedArea.totalLength}m x ${selectedArea.totalWidth}m`
                : 'Chọn một khu vực để quản lý sơ đồ'}
            </span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<EyeOutlined />}>Xem trước</Button>
            <Button
              disabled={dirtyDrafts.length === 0}
              icon={<SaveOutlined />}
              loading={updateMappingLoading}
              onClick={saveDrafts}
              type="primary"
            >
              Lưu sơ đồ
            </Button>
          </Space>
        }
      >
        {!selectedArea ? (
          <Empty description="Chưa có khu vực" />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[280px_minmax(520px,1fr)_280px]">
            <Card size="small" title="Danh sách sân trong khu vực">
              <Space className="w-full" direction="vertical" size={10}>
                <div className="max-h-95 space-y-2 overflow-auto pr-1">
                  {mappings.map((mapping, index) => {
                    const court = courtById.get(mapping.courtID)
                    const draft = getMappingDraft(mapping, drafts)
                    const color = areaColors[index % areaColors.length]

                    return (
                      <button
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                          activeSelectedMappingId === mapping.courtAreaMappingID
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-blue-200'
                        }`}
                        key={mapping.courtAreaMappingID}
                        onClick={() => setSelectedMappingId(mapping.courtAreaMappingID)}
                        type="button"
                      >
                        <Space>
                          <span
                            className="size-2.5 rounded-full"
                            style={{ background: color }}
                          />
                          <span>
                            <span className="font-semibold">
                              {court?.courtName ?? `Sân #${mapping.courtID}`}
                            </span>
                            <span className="block text-xs text-slate-500">
                              X {draft.positionX} · Y {draft.positionY}
                            </span>
                          </span>
                        </Space>
                        <Popconfirm
                          onConfirm={(event) => {
                            event?.stopPropagation()
                            removeMapping(mapping.courtAreaMappingID)
                          }}
                          title="Xóa sân khỏi khu vực?"
                        >
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(event) => event.stopPropagation()}
                            size="small"
                            type="text"
                          />
                        </Popconfirm>
                      </button>
                    )
                  })}
                  {mappings.length === 0 && (
                    <Empty
                      description="Chưa có sân trong khu vực"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
                <Button block icon={<PlusOutlined />} onClick={openCreateMapping}>
                  Thêm sân vào khu vực
                </Button>
              </Space>
            </Card>

            <Card
              size="small"
              title="Sơ đồ khu vực"
              extra={
                <Tabs
                  activeKey={designerTab}
                  onChange={setDesignerTab}
                  items={[
                    { key: 'map', label: 'Sơ đồ' },
                    { key: 'list', label: 'Danh sách sân' },
                    { key: 'settings', label: 'Cài đặt khu vực' },
                  ]}
                  size="small"
                />
              }
            >
              {designerTab === 'list' ? (
                <Table
                  columns={[
                    { title: 'Mã sân', dataIndex: 'courtCode', width: 110 },
                    { title: 'Tên sân', dataIndex: 'courtName' },
                    {
                      title: 'Kích thước',
                      width: 140,
                      render: (_: unknown, court: Court) =>
                        `${court.length}m x ${court.width}m`,
                    },
                    { title: 'Thứ tự', dataIndex: 'sortOrder', width: 90 },
                  ]}
                  dataSource={mappings
                    .map((mapping) => courtById.get(mapping.courtID))
                    .filter((court): court is Court => Boolean(court))}
                  pagination={false}
                  rowKey="courtID"
                  size="small"
                />
              ) : designerTab === 'settings' ? (
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                  <div>
                    <span className="text-slate-500">Mã khu vực</span>
                    <h5 className="text-base font-semibold">{selectedArea.areaCode}</h5>
                  </div>
                  <div>
                    <span className="text-slate-500">Kích thước</span>
                    <h5 className="text-base font-semibold">
                      {selectedArea.totalLength}m x {selectedArea.totalWidth}m
                    </h5>
                  </div>
                  <div>
                    <span className="text-slate-500">Số sân</span>
                    <h5 className="text-base font-semibold">{mappings.length}</h5>
                  </div>
                </div>
              ) : (
                <div
                  className="relative min-h-107.5 overflow-hidden rounded-lg border border-slate-200 bg-white"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                >
                  <div className="absolute inset-8 rounded border-4 border-slate-300 bg-white/65 shadow-inner" />
                  <div className="absolute left-10 top-6 text-xs font-semibold text-slate-600">
                    {selectedArea.totalWidth}m
                  </div>
                  <div className="absolute right-10 top-6 text-xs font-semibold text-slate-600">
                    {selectedArea.totalLength}m
                  </div>

                  {mappings.map((mapping, index) => {
                    const court = courtById.get(mapping.courtID)
                    const draft = getMappingDraft(mapping, drafts)
                    const unit = getAreaUnit(selectedArea)
                    const size = getCourtSize(court, selectedArea)
                    const leftPct = clamp(
                      (draft.positionX / unit.length) * 100,
                      0,
                      100 - size.widthPct,
                    )
                    const topPct = clamp(
                      (draft.positionY / unit.width) * 100,
                      0,
                      100 - size.heightPct,
                    )
                    const color = areaColors[index % areaColors.length]
                    const selected =
                      activeSelectedMappingId === mapping.courtAreaMappingID

                    return (
                      <div
                        className={`absolute cursor-move touch-none rounded border-2 p-1 shadow-sm transition ${
                          selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                        }`}
                        key={mapping.courtAreaMappingID}
                        onPointerDown={(event) => handleDragStart(event, mapping)}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${size.widthPct}%`,
                          height: `${size.heightPct}%`,
                          borderColor: color,
                          background: `${color}35`,
                        }}
                      >
                        <div className="grid h-full place-items-center rounded border border-white/70 bg-white/20">
                          <span className="font-semibold">
                            {court?.courtCode ?? mapping.courtID}
                          </span>
                        </div>
                        {selected && (
                          <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-red-500 text-xs text-white">
                            ×
                          </span>
                        )}
                      </div>
                    )
                  })}

                  <div className="absolute bottom-6 left-20 rounded bg-slate-200 px-10 py-4 text-xs font-semibold text-slate-700">
                    KHU NGHỈ
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded bg-slate-200 px-10 py-4 text-xs font-semibold text-slate-700">
                    QUẦY LỄ TÂN
                  </div>
                  <div className="absolute bottom-6 right-20 rounded bg-slate-200 px-10 py-4 text-xs font-semibold text-slate-700">
                    WC
                  </div>
                </div>
              )}
              <Space className="mt-4" wrap>
                <Button icon={<AimOutlined />} type="primary">
                  Chọn
                </Button>
                <Button icon={<HolderOutlined />}>Sân</Button>
                <Button icon={<BorderOutlined />}>Vật cản</Button>
              </Space>
            </Card>

            <Card size="small" title="Thông tin sân đang chọn">
              {selectedMapping && selectedCourt ? (
                <Space className="w-full" direction="vertical" size={14}>
                  <Space>
                    <span className="size-3 rounded-full bg-emerald-500" />
                    <span className="font-semibold">{selectedCourt.courtName}</span>
                  </Space>
                  <div>
                    <span className="text-slate-500">Loại sân</span>
                    <Input readOnly value={`Loại #${selectedCourt.courtTypeID}`} />
                  </div>
                  <div>
                    <span className="text-slate-500">Kích thước thực tế</span>
                    <Input
                      readOnly
                      value={`${selectedCourt.length}m x ${selectedCourt.width}m`}
                    />
                  </div>
                  <Space.Compact block>
                    <InputNumber
                      addonBefore="X"
                      className="w-full"
                      min={0}
                      onChange={(value) =>
                        updateDraft(selectedMapping.courtAreaMappingID, {
                          positionX: Number(value ?? 0),
                        })
                      }
                      value={getMappingDraft(selectedMapping, drafts).positionX}
                    />
                    <InputNumber
                      addonBefore="Y"
                      className="w-full"
                      min={0}
                      onChange={(value) =>
                        updateDraft(selectedMapping.courtAreaMappingID, {
                          positionY: Number(value ?? 0),
                        })
                      }
                      value={getMappingDraft(selectedMapping, drafts).positionY}
                    />
                  </Space.Compact>
                  <InputNumber
                    addonBefore="Thứ tự"
                    className="w-full"
                    min={0}
                    onChange={(value) =>
                      updateDraft(selectedMapping.courtAreaMappingID, {
                        displayOrder: Number(value ?? 0),
                      })
                    }
                    value={getMappingDraft(selectedMapping, drafts).displayOrder}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeMapping(selectedMapping.courtAreaMappingID)}
                  >
                    Xóa sân khỏi sơ đồ
                  </Button>
                </Space>
              ) : (
                <Empty
                  description="Chọn một sân trên sơ đồ"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </div>
        )}
      </Drawer>

      <Modal
        confirmLoading={createAreaLoading || updateAreaLoading}
        destroyOnClose
        onCancel={() => setAreaModalOpen(false)}
        onOk={submitArea}
        okText={editingAreaId ? 'Cập nhật' : 'Tạo'}
        open={areaModalOpen}
        title={editingAreaId ? 'Sửa khu vực' : 'Thêm khu vực'}
      >
        <Form form={areaForm} layout="vertical">
          {!editingAreaId && (
            <Form.Item label="Cơ sở" name="facilityID" rules={[{ required: true }]}>
              <Select
                options={facilities.map((facility) => ({
                  label: facility.facilityName,
                  value: facility.facilityID,
                }))}
                placeholder="Chọn cơ sở"
              />
            </Form.Item>
          )}
          <Form.Item label="Mã khu vực" name="areaCode" rules={[{ required: true }]}>
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item label="Tên khu vực" name="areaName" rules={[{ required: true }]}>
            <Input maxLength={200} />
          </Form.Item>
          <Space className="w-full" size={12}>
            <Form.Item className="flex-1" label="Chiều dài" name="totalLength">
              <InputNumber addonAfter="m" className="w-full" min={1} />
            </Form.Item>
            <Form.Item className="flex-1" label="Chiều rộng" name="totalWidth">
              <InputNumber addonAfter="m" className="w-full" min={1} />
            </Form.Item>
          </Space>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea maxLength={500} rows={3} />
          </Form.Item>
          <Form.Item label="Hoạt động" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        confirmLoading={createMappingLoading}
        destroyOnClose
        onCancel={() => setMappingModalOpen(false)}
        onOk={submitMapping}
        okText="Thêm"
        open={mappingModalOpen}
        title={`Thêm sân vào ${selectedArea?.areaName ?? 'khu vực'}`}
      >
        <Form form={mappingForm} layout="vertical">
          <Form.Item label="Sân" name="courtID" rules={[{ required: true }]}>
            <Select
              options={unmappedCourts.map((court) => ({
                label: `${court.courtCode} - ${court.courtName}`,
                value: court.courtID,
              }))}
              placeholder="Chọn sân"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Space className="w-full" size={12}>
            <Form.Item className="flex-1" label="Vị trí X" name="positionX">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item className="flex-1" label="Vị trí Y" name="positionY">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item className="flex-1" label="Thứ tự" name="displayOrder">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Space>
  )
}
