import { useState, useMemo } from 'react'
import { App, Button, Checkbox, Drawer, Form, Input, InputNumber } from 'antd'
import {
  ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined,
  CheckCircleFilled, LockOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import {
  MOCK_COURTS, MOCK_TIME_SLOTS, MOCK_CUSTOMERS, MOCK_SERVICES,
  MOCK_LOCKED_SLOTS, getSlotPrice,
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

export function CreateBookingModal({ open, onClose, initialCourtID, initialSlotTime, initialDate }: Props) {
  const { message } = App.useApp()
  const [step, setStep] = useState(0)
  const [courtID, setCourtID] = useState<number | null>(initialCourtID ?? null)
  const [date, setDate] = useState(initialDate ?? dayjs().format('YYYY-MM-DD'))
  const [selectedSlots, setSelectedSlots] = useState<number[]>(
    initialSlotTime ? [MOCK_TIME_SLOTS.findIndex(s => s.startTime === initialSlotTime) + 1].filter(Boolean) : [],
  )
  const [services, setServices] = useState<Record<number, SelectedSvc>>({})
  const [customerID, setCustomerID] = useState<number | null>(null)
  const [note, setNote] = useState('')

  const resetAll = () => {
    setStep(0); setCourtID(initialCourtID ?? null)
    setDate(initialDate ?? dayjs().format('YYYY-MM-DD'))
    setSelectedSlots(initialSlotTime
      ? [MOCK_TIME_SLOTS.findIndex(s => s.startTime === initialSlotTime) + 1].filter(Boolean)
      : []
    )
    setServices({}); setCustomerID(null); setNote('')
  }

  const dow = dayjs(date).day()
  const locks = useMemo(
    () => MOCK_LOCKED_SLOTS.filter(l => l.date === date && l.courtID === courtID),
    [date, courtID],
  )

  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

  const isSlotLocked = (slot: typeof MOCK_TIME_SLOTS[0]) =>
    locks.some(l => toMin(l.startTime) < slot.endMinute && toMin(l.endTime) > slot.startMinute)

  const toggleSlot = (id: number) =>
    setSelectedSlots(cur => cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id])

  const toggleSvc = (svc: typeof MOCK_SERVICES[0], checked: boolean) => {
    setServices(cur => {
      const next = { ...cur }
      if (!checked) { delete next[svc.serviceID]; return next }
      next[svc.serviceID] = { quantity: 1, unitPrice: svc.unitPrice }
      return next
    })
  }

  const slotTotal = useMemo(() =>
    selectedSlots.reduce((s, id) => {
      const slot = MOCK_TIME_SLOTS.find(t => t.timeSlotID === id)
      return s + (slot && courtID ? getSlotPrice(courtID, dow, slot.startTime) : 0)
    }, 0),
    [selectedSlots, courtID, dow],
  )
  const svcTotal = Object.values(services).reduce((s, v) => s + v.quantity * v.unitPrice, 0)
  const total = slotTotal + svcTotal

  const court = MOCK_COURTS.find(c => c.courtID === courtID)
  const customer = MOCK_CUSTOMERS.find(c => c.customerID === customerID)

  const canNext = () => {
    if (step === 0) return !!courtID
    if (step === 1) return selectedSlots.length > 0
    return true
  }

  const handleSubmit = () => {
    if (!customerID) { message.warning('Vui lòng chọn khách hàng'); return }
    message.success('Tạo booking thành công!')
    onClose()
  }

  return (
    <Drawer
      open={open} onClose={onClose} width="100%" placement="right" destroyOnClose
      afterOpenChange={isOpen => { if (isOpen) resetAll() }}
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
          <div className="wizard-steps">
            {steps.map((label, i) => (
              <div key={i} className={`wizard-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <span className="step-number">
                  {i < step ? <CheckCircleFilled style={{ fontSize: 14 }} /> : i + 1}
                </span>
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>

          {/* Step 0: Court picker */}
          {step === 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Chọn sân</h3>
              <p className="text-sm text-slate-400 mb-4">Chọn sân muốn đặt cho khách hàng</p>

              <Form.Item label="Ngày đặt" className="mb-4" style={{ maxWidth: 220 }}>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </Form.Item>

              <div className="court-picker-grid">
                {MOCK_COURTS.map(c => (
                  <div
                    key={c.courtID}
                    className={`court-pick-card ${courtID === c.courtID ? 'selected' : ''}`}
                    onClick={() => setCourtID(c.courtID)}
                  >
                    <span className="pick-court-name">{c.courtName}</span>
                    <span className="pick-court-type"
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
                Sân: <strong className="text-teal-600">{court?.courtName}</strong> · Ngày: <strong>{date}</strong>
              </p>
              <div className="slot-picker-grid">
                {MOCK_TIME_SLOTS.map(slot => {
                  const locked = isSlotLocked(slot)
                  const sel = selectedSlots.includes(slot.timeSlotID)
                  const price = courtID ? getSlotPrice(courtID, dow, slot.startTime) : 0
                  return (
                    <div
                      key={slot.timeSlotID}
                      className={`slot-pick-card ${sel ? 'selected' : ''} ${locked ? 'locked' : ''}`}
                      onClick={() => !locked && toggleSlot(slot.timeSlotID)}
                    >
                      {locked && <LockOutlined className="text-red-400 text-xs absolute top-1 right-1" />}
                      <div className="slot-time">{slot.startTime}–{slot.endTime}</div>
                      <div className="slot-price">{formatCompactCurrency(price)}</div>
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
              <div className="service-pick-list">
                {MOCK_SERVICES.map(svc => {
                  const sel = services[svc.serviceID]
                  return (
                    <div key={svc.serviceID} className={`service-pick-row ${sel ? 'selected' : ''}`}>
                      <Checkbox checked={!!sel} onChange={e => toggleSvc(svc, e.target.checked)} />
                      <span className="service-icon">{svc.icon}</span>
                      <div className="service-info">
                        <div className="name">{svc.serviceName}</div>
                        <div className="price">{formatCompactCurrency(svc.unitPrice)} / {svc.unit}</div>
                      </div>
                      {sel && (
                        <InputNumber
                          min={1} size="small" value={sel.quantity} style={{ width: 64 }}
                          onChange={v => setServices(c => ({
                            ...c, [svc.serviceID]: { ...c[svc.serviceID], quantity: v ?? 1 },
                          }))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Xác nhận & Khách hàng</h3>
              <p className="text-sm text-slate-400 mb-4">Kiểm tra lại thông tin trước khi tạo</p>
              <Form layout="vertical" style={{ maxWidth: 400 }}>
                <Form.Item label="Chọn khách hàng" required>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {MOCK_CUSTOMERS.map(c => (
                      <div
                        key={c.customerID}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition ${customerID === c.customerID ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
                        onClick={() => setCustomerID(c.customerID)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{c.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">{c.fullName}</div>
                          <div className="text-xs text-slate-400">{c.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Form.Item>
                <Form.Item label="Ghi chú">
                  <Input.TextArea rows={3} placeholder="Ghi chú thêm..." value={note} onChange={e => setNote(e.target.value)} />
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
              <div className="font-bold text-slate-800">{court?.courtName ?? 'Chưa chọn'}</div>
            </div>
            <div>
              <div className="text-slate-400">Ngày</div>
              <div className="font-bold text-slate-800">{date}</div>
            </div>
            <div>
              <div className="text-slate-400">Khung giờ</div>
              <div className="font-bold text-slate-800">
                {selectedSlots.length > 0
                  ? selectedSlots.map(id => MOCK_TIME_SLOTS.find(s => s.timeSlotID === id)?.startTime).join(', ')
                  : 'Chưa chọn'}
              </div>
            </div>
            {customer && (
              <div>
                <div className="text-slate-400">Khách hàng</div>
                <div className="font-bold text-slate-800">{customer.fullName}</div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Tiền sân ({selectedSlots.length} slot)</span>
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
              <span className="text-xl font-extrabold text-teal-600">{formatCompactCurrency(total)}</span>
            </div>

            <div className="flex gap-2">
              {step > 0 && (
                <Button icon={<ArrowLeftOutlined />} onClick={() => setStep(s => s - 1)}>Quay lại</Button>
              )}
              {step < 3 ? (
                <Button type="primary" block disabled={!canNext()} icon={<ArrowRightOutlined />}
                  onClick={() => setStep(s => s + 1)}>
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
