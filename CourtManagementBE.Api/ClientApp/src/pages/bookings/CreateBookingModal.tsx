import { useState, useMemo } from 'react'
import { App, Button, Drawer, Form, Input, Select, Card, Tag, Badge, Divider } from 'antd'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  LockOutlined,
  GiftOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { useCombosQuery } from '@/features/combos/api/useComboQueries'
import {
  MOCK_COURTS,
  MOCK_TIME_SLOTS,
  MOCK_CUSTOMERS,
  MOCK_SERVICES,
  MOCK_LOCKED_SLOTS,
  getSlotPrice,
} from './mockData'
import { formatCompactCurrency } from '@/utils/format'

interface Props {
  open: boolean
  onClose: () => void
  initialCourtID?: number
  initialSlotTime?: string
  initialDate?: string
}

type SelectedSvc = { quantity: number; unitPrice: number }

const steps = ['Chọn sân', 'Chọn giờ', 'Dịch vụ', 'Xác nhận']

export function CreateBookingModal({
  open,
  onClose,
  initialCourtID,
  initialSlotTime,
  initialDate,
}: Props) {
  const { message } = App.useApp()
  const [step, setStep] = useState(0)
  const [courtID, setCourtID] = useState<number | null>(initialCourtID ?? null)
  const [date, setDate] = useState(initialDate ?? dayjs().format('YYYY-MM-DD'))
  const [selectedSlots, setSelectedSlots] = useState<number[]>(
    initialSlotTime
      ? [MOCK_TIME_SLOTS.findIndex((s) => s.startTime === initialSlotTime) + 1].filter(
          Boolean,
        )
      : [],
  )
  const [services, setServices] = useState<Record<number, SelectedSvc>>({})
  const [customerID, setCustomerID] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [selectedComboID, setSelectedComboID] = useState<number | null>(null)

  // Fetch combos
  const combosQuery = useCombosQuery({ page: 1, pageSize: 100 })

  const resetAll = () => {
    setStep(0)
    setCourtID(initialCourtID ?? null)
    setDate(initialDate ?? dayjs().format('YYYY-MM-DD'))
    setSelectedSlots(
      initialSlotTime
        ? [MOCK_TIME_SLOTS.findIndex((s) => s.startTime === initialSlotTime) + 1].filter(
            Boolean,
          )
        : [],
    )
    setServices({})
    setCustomerID(null)
    setNote('')
    setSelectedComboID(null)
  }

  const selectedCombo = useMemo(
    () => combosQuery.data?.items?.find((c) => c.comboID === selectedComboID),
    [combosQuery.data, selectedComboID],
  )

  const dow = dayjs(date).day()
  const locks = useMemo(
    () => MOCK_LOCKED_SLOTS.filter((l) => l.date === date && l.courtID === courtID),
    [date, courtID],
  )

  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const isSlotLocked = (slot: (typeof MOCK_TIME_SLOTS)[0]) =>
    locks.some(
      (l) => toMin(l.startTime) < slot.endMinute && toMin(l.endTime) > slot.startMinute,
    )

  const toggleSlot = (id: number) =>
    setSelectedSlots((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    )

  const slotTotal = useMemo(() => {
    if (selectedCombo) {
      const comboPrice = selectedCombo.comboPrice
      const comboHours = selectedCombo.durationHours
      const selectedHoursCount = selectedSlots.length

      let cost = comboPrice
      if (selectedHoursCount > comboHours) {
        const extraCount = selectedHoursCount - comboHours
        const sortedPrices = [...selectedSlots]
          .map((id) => {
            const slot = MOCK_TIME_SLOTS.find((t) => t.timeSlotID === id)
            return slot && courtID ? getSlotPrice(courtID, dow, slot.startTime) : 0
          })
          .sort((a, b) => b - a)

        for (let i = 0; i < extraCount; i++) {
          cost += sortedPrices[i] ?? 0
        }
      }
      return cost
    }

    return selectedSlots.reduce((s, id) => {
      const slot = MOCK_TIME_SLOTS.find((t) => t.timeSlotID === id)
      return s + (slot && courtID ? getSlotPrice(courtID, dow, slot.startTime) : 0)
    }, 0)
  }, [selectedSlots, courtID, dow, selectedCombo])

  const svcTotal = Object.values(services).reduce(
    (s, v) => s + v.quantity * v.unitPrice,
    0,
  )
  const total = slotTotal + svcTotal

  const court = MOCK_COURTS.find((c) => c.courtID === courtID)
  const customer = MOCK_CUSTOMERS.find((c) => c.customerID === customerID)

  const canNext = () => {
    if (step === 0) return !!courtID
    if (step === 1) return selectedSlots.length > 0
    return true
  }

  const isStepClickable = (targetStep: number) => {
    if (targetStep === 0) return true
    if (targetStep === 1) return !!courtID
    if (targetStep === 2) return !!courtID && selectedSlots.length > 0
    if (targetStep === 3) return !!courtID && selectedSlots.length > 0
    return false
  }

  const handleSubmit = () => {
    if (!customerID) {
      message.warning('Vui lòng chọn khách hàng')
      return
    }
    message.success('Tạo booking thành công!')
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="100%"
      placement="right"
      destroyOnClose
      afterOpenChange={(isOpen) => {
        if (isOpen) resetAll()
      }}
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-teal-500" />
          <span>Đặt sân mới</span>
        </div>
      }
      styles={{ body: { padding: 0 }, header: { padding: '14px 24px' } }}
    >
      <div className="flex h-[calc(100vh-57px)] bg-slate-50">
        {/* Main area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Wizard steps bar */}
          {/* Wizard steps bar */}
          <div className="flex gap-2 mb-6">
            {steps.map((label, i) => {
              const isClickable = isStepClickable(i)
              const isActive = i === step
              const isDone = i < step
              
              let stepClass = "flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white opacity-50 cursor-not-allowed"
              let numClass = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-400 shrink-0"
              let labelClass = "text-xs font-semibold text-slate-400"
              
              if (isActive) {
                stepClass = "flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-slate-800 bg-slate-50 transition duration-200 cursor-pointer shadow-sm ring-1 ring-slate-800"
                numClass = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-900 text-white shrink-0"
                labelClass = "text-xs font-semibold text-slate-900"
              } else if (isDone) {
                stepClass = "flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 transition duration-200 cursor-pointer hover:border-emerald-300 hover:shadow-sm"
                numClass = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-500 text-white shrink-0"
                labelClass = "text-xs font-semibold text-emerald-600"
              } else if (isClickable) {
                stepClass = "flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white transition duration-200 cursor-pointer hover:border-slate-300 hover:shadow-sm"
                numClass = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-500 shrink-0"
                labelClass = "text-xs font-semibold text-slate-600"
              }

              return (
                <div
                  key={i}
                  className={stepClass}
                  onClick={() => isClickable && setStep(i)}
                >
                  <span className={numClass}>
                    {isDone ? <CheckCircleFilled style={{ fontSize: 12 }} /> : i + 1}
                  </span>
                  <span className={labelClass}>{label}</span>
                </div>
              )
            })}
          </div>

          {/* Step 0: Court picker */}
          {step === 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Chọn sân</h3>
              <p className="text-sm text-slate-400 mb-4">
                Chọn sân muốn đặt cho khách hàng
              </p>

              <Form.Item label="Ngày đặt" className="mb-4" style={{ maxWidth: 220 }}>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {MOCK_COURTS.map((c) => (
                  <div
                    key={c.courtID}
                    className={`flex flex-col gap-1.5 border rounded-xl p-4 cursor-pointer bg-white transition duration-150 ${
                      courtID === c.courtID
                        ? 'border-slate-800 bg-slate-50 shadow-sm ring-1 ring-slate-800'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                    onClick={() => setCourtID(c.courtID)}
                  >
                    <span className="text-sm font-bold text-slate-800">{c.courtName}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded w-fit inline-flex items-center"
                      style={{ background: `${c.statusColor}18`, color: c.statusColor }}
                    >
                      {c.courtType}
                    </span>
                    <span className="text-xs text-slate-400">{c.courtCode}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Slot picker */}
          {step === 1 && (
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Chọn khung giờ</h3>
              <p className="text-sm text-slate-400 mb-4">
                Sân: <strong className="text-teal-600">{court?.courtName}</strong> · Ngày:{' '}
                <strong>{date}</strong>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {MOCK_TIME_SLOTS.map((slot) => {
                  const locked = isSlotLocked(slot)
                  const sel = selectedSlots.includes(slot.timeSlotID)
                  const price = courtID ? getSlotPrice(courtID, dow, slot.startTime) : 0
                  
                  let cardClass = "relative border border-slate-200 rounded-xl p-3 text-center cursor-pointer bg-white transition duration-150 hover:border-slate-300 hover:shadow-sm"
                  let priceClass = "text-[10px] mt-0.5 font-semibold text-slate-450 text-slate-400"
                  
                  if (sel) {
                    cardClass = "relative border border-slate-900 bg-slate-900 text-white rounded-xl p-3 text-center cursor-pointer transition duration-150 shadow-sm"
                    priceClass = "text-[10px] mt-0.5 font-semibold text-slate-300"
                  } else if (locked) {
                    cardClass = "relative border border-slate-200 bg-slate-50 opacity-40 rounded-xl p-3 text-center cursor-not-allowed select-none"
                  }

                  return (
                    <div
                      key={slot.timeSlotID}
                      className={cardClass}
                      onClick={() => !locked && toggleSlot(slot.timeSlotID)}
                    >
                      {locked && (
                        <LockOutlined className="text-red-400 text-xs absolute top-1 right-1" />
                      )}
                      <div className="text-sm font-bold">
                        {slot.startTime}–{slot.endTime}
                      </div>
                      <div className={priceClass}>{formatCompactCurrency(price)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Dịch vụ đi kèm</h3>
              <p className="text-sm text-slate-400 mb-4">Tùy chọn – có thể bỏ qua</p>

              {/* Combo Package Selection */}
              <div className="mb-6 p-4 bg-rose-50/40 border border-rose-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <GiftOutlined className="text-rose-500 text-lg" />
                  <span className="font-bold text-slate-800 text-sm">
                    Áp dụng Gói Combo ưu đãi
                  </span>
                  <Badge
                    count="Hot"
                    style={{ backgroundColor: '#f43f5e', fontSize: '10px' }}
                  />
                </div>
                <Select
                  className="w-full mb-3"
                  placeholder="Chọn gói Combo khuyến mãi..."
                  allowClear
                  value={selectedComboID}
                  onChange={(v) => setSelectedComboID(v || null)}
                  options={combosQuery.data?.items
                    ?.filter((c) => c.isActive)
                    .map((c) => ({
                      value: c.comboID,
                      label: `${c.comboName} (${formatCompactCurrency(c.comboPrice)})`,
                    }))}
                />

                {selectedCombo && (
                  <Card size="small" className="border-rose-200 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-rose-600 block">
                          {selectedCombo.comboName}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {selectedCombo.description}
                        </span>
                      </div>
                      <Tag color="rose" className="m-0 font-bold">
                        {formatCompactCurrency(selectedCombo.comboPrice)}
                      </Tag>
                    </div>
                    <Divider className="my-2" />
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Giờ thuê sân đi kèm:</span>
                        <strong className="text-rose-600">
                          {selectedCombo.durationHours} giờ chơi
                        </strong>
                      </div>
                      <div className="text-slate-600">
                        <span className="block mb-1 font-semibold text-slate-700">
                          Dịch vụ tặng kèm miễn phí:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {selectedCombo.services && selectedCombo.services.length > 0 ? (
                            selectedCombo.services.map((s) => (
                              <Tag
                                color="purple"
                                key={s.serviceID}
                                className="text-[10px]"
                              >
                                {s.serviceName} x{s.quantity} {s.unit}
                              </Tag>
                            ))
                          ) : (
                            <span className="text-gray-400">Không có dịch vụ đi kèm</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MOCK_SERVICES.map((svc) => {
                  const sel = services[svc.serviceID]
                  const quantity = sel?.quantity || 0

                  return (
                    <div
                      key={svc.serviceID}
                      className={`relative flex flex-col justify-between p-4 bg-white border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                        quantity > 0
                          ? 'border-indigo-500 bg-indigo-50/10 shadow-sm'
                          : 'border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      {quantity > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge
                            count={quantity}
                            style={{ backgroundColor: '#6366f1' }}
                          />
                        </div>
                      )}

                      <div className="flex flex-col items-center text-center mb-3">
                        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-slate-50 rounded-xl mb-2 transition-transform duration-200 hover:scale-110">
                          {svc.icon}
                        </div>
                        <div
                          className="font-semibold text-slate-800 text-sm w-full truncate"
                          title={svc.serviceName}
                        >
                          {svc.serviceName}
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 mt-1">
                          {formatCompactCurrency(svc.unitPrice)} / {svc.unit}
                        </div>
                      </div>

                      <div className="w-full">
                        {quantity === 0 ? (
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            block
                            className="text-slate-500 hover:text-indigo-600 hover:border-indigo-500"
                            onClick={() => {
                              setServices((c) => ({
                                ...c,
                                [svc.serviceID]: {
                                  quantity: 1,
                                  unitPrice: svc.unitPrice,
                                },
                              }))
                            }}
                          >
                            Thêm
                          </Button>
                        ) : (
                          <div className="flex items-center justify-between border border-slate-200 rounded-lg p-1 bg-white">
                            <Button
                              type="text"
                              size="small"
                              icon={<MinusOutlined />}
                              className="text-slate-400 hover:text-red-500"
                              onClick={() => {
                                setServices((c) => {
                                  const next = { ...c }
                                  if (quantity <= 1) {
                                    delete next[svc.serviceID]
                                  } else {
                                    next[svc.serviceID] = {
                                      ...next[svc.serviceID],
                                      quantity: quantity - 1,
                                    }
                                  }
                                  return next
                                })
                              }}
                            />
                            <span className="font-bold text-slate-800 text-sm select-none">
                              {quantity}
                            </span>
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              className="text-indigo-600"
                              onClick={() => {
                                setServices((c) => ({
                                  ...c,
                                  [svc.serviceID]: {
                                    ...c[svc.serviceID],
                                    quantity: quantity + 1,
                                  },
                                }))
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Xác nhận & Khách hàng
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Kiểm tra lại thông tin trước khi tạo
              </p>
              <Form layout="vertical" style={{ maxWidth: 400 }}>
                <Form.Item label="Chọn khách hàng" required>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {MOCK_CUSTOMERS.map((c) => (
                      <div
                        key={c.customerID}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition ${customerID === c.customerID ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
                        onClick={() => setCustomerID(c.customerID)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {c.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">
                            {c.fullName}
                          </div>
                          <div className="text-xs text-slate-400">{c.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Form.Item>
                <Form.Item label="Ghi chú">
                  <Input.TextArea
                    rows={3}
                    placeholder="Ghi chú thêm..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Form.Item>
              </Form>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="w-80 shrink-0 border-l border-slate-200 bg-white px-5 py-5 flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-4">Tóm tắt booking</h3>

          <div className="flex-1 space-y-3 text-sm">
            <div>
              <div className="text-slate-400">Sân</div>
              <div className="font-bold text-slate-800">
                {court?.courtName ?? 'Chưa chọn'}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Ngày</div>
              <div className="font-bold text-slate-800">{date}</div>
            </div>
            <div>
              <div className="text-slate-400">Khung giờ</div>
              <div className="font-bold text-slate-800">
                {selectedSlots.length > 0
                  ? selectedSlots
                      .map(
                        (id) =>
                          MOCK_TIME_SLOTS.find((s) => s.timeSlotID === id)?.startTime,
                      )
                      .join(', ')
                  : 'Chưa chọn'}
              </div>
            </div>
            {selectedCombo && (
              <div>
                <div className="text-slate-400">Gói Combo</div>
                <div className="font-bold text-rose-600 flex items-center gap-1">
                  <GiftOutlined /> {selectedCombo.comboName}
                </div>
              </div>
            )}
            {customer && (
              <div>
                <div className="text-slate-400">Khách hàng</div>
                <div className="font-bold text-slate-800">{customer.fullName}</div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>
                  {selectedCombo
                    ? 'Tiền Combo & Sân'
                    : `Tiền sân (${selectedSlots.length} slot)`}
                </span>
                <span>{formatCompactCurrency(slotTotal)}</span>
              </div>
              {svcTotal > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Dịch vụ</span>
                  <span>{formatCompactCurrency(svcTotal)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-slate-800">Tổng cộng</span>
              <span className="text-xl font-extrabold text-teal-600">
                {formatCompactCurrency(total)}
              </span>
            </div>

            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setStep((s) => s - 1)}
                >
                  Quay lại
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="primary"
                  block
                  disabled={!canNext()}
                  icon={<ArrowRightOutlined />}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button type="primary" block onClick={handleSubmit}>
                  Tạo booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
