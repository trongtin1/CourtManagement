import { useState, useMemo, useCallback } from 'react'
import { App, Button, Form, Input, Tag, Badge, Tabs, Pagination, Empty } from 'antd'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { useCombosQuery } from '@/features/combos/api/useComboQueries'
import type { Combo } from '@/features/combos/model/types'
import {
  useCourtsQuery,
  useCourtSlotsAvailabilityQuery,
} from '@/features/courts/api/useCourtQueries'
import type { CourtSlotAvailability } from '@/features/courts/model/types'
import { useServicesQuery } from '@/features/services/api/useServiceQueries'
import { useCustomersQuery } from '@/features/customers/api/useCustomerQueries'
import { bookingApi } from '@/features/bookings/api/bookingApi'
import { formatCompactCurrency } from '@/utils/format'

type SelectedSvc = { quantity: number; unitPrice: number }

const formatTimeSpan = (timeStr: string) => {
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0')
    const mm = parts[1].padStart(2, '0')
    const ss = parts[2] ? parts[2].substring(0, 2).padStart(2, '0') : '00'
    return `${hh}:${mm}:${ss}`
  }
  return timeStr
}

const steps = ['Chọn sân', 'Chọn giờ', 'Dịch vụ', 'Xác nhận']

interface CreateBookingPageProps {
  onClose?: () => void
}

export function CreateBookingPage({ onClose }: CreateBookingPageProps) {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [courtID, setCourtID] = useState<number | null>(null)
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])
  const [services, setServices] = useState<Record<number, SelectedSvc>>({})
  const [customerID, setCustomerID] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [selectedComboID, setSelectedComboID] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    } else {
      navigate('/bookings')
    }
  }, [onClose, navigate])

  // Pagination states for combos and services
  const [comboPage, setComboPage] = useState(1)
  const [servicePage, setServicePage] = useState(1)

  // Fetch real data from React Query hooks
  const combosQuery = useCombosQuery()
  const courtsQuery = useCourtsQuery({ page: 1, pageSize: 100 })
  const servicesQuery = useServicesQuery({ page: servicePage })
  const customersQuery = useCustomersQuery({ page: 1, pageSize: 100 })
  const slotsAvailabilityQuery = useCourtSlotsAvailabilityQuery(courtID, date)

  const courts = courtsQuery.data?.items ?? []
  const timeSlots = useMemo(
    () => slotsAvailabilityQuery.data ?? [],
    [slotsAvailabilityQuery.data],
  )
  const serviceItems = servicesQuery.data?.items ?? []
  const customers = customersQuery.data?.items ?? []

  // Store full combo object to persist across page changes
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null)

  const toggleCombo = (combo: Combo) => {
    if (selectedComboID === combo.comboID) {
      setSelectedComboID(null)
      setSelectedCombo(null)
    } else {
      setSelectedComboID(combo.comboID)
      setSelectedCombo(combo)
    }
  }

  const isSlotLocked = (slot: CourtSlotAvailability) => {
    if (!courtID) return true
    return slot.isLocked || slot.isBooked
  }

  const toggleSlot = (id: number) =>
    setSelectedSlots((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    )

  const getSlotPriceReal = useCallback(
    (slotId: number) => {
      const slot = timeSlots.find((s) => s.slotIndex === slotId)
      return slot?.price ?? 0
    },
    [timeSlots],
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
          .map((id) => getSlotPriceReal(id))
          .sort((a, b) => b - a)

        for (let i = 0; i < extraCount; i++) {
          cost += sortedPrices[i] ?? 0
        }
      }
      return cost
    }

    return selectedSlots.reduce((s, id) => s + getSlotPriceReal(id), 0)
  }, [selectedSlots, selectedCombo, getSlotPriceReal])

  const svcTotal = Object.values(services).reduce(
    (s, v) => s + v.quantity * v.unitPrice,
    0,
  )
  const total = slotTotal + svcTotal

  const court = courts.find((c) => c.courtID === courtID)
  const customer = customers.find((c) => c.customerID === customerID)

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

  const handleSubmit = async () => {
    if (!courtID) {
      message.warning('Vui lòng chọn sân trước')
      return
    }
    if (selectedSlots.length === 0) {
      message.warning('Vui lòng chọn khung giờ')
      return
    }
    if (!customerID) {
      message.warning('Vui lòng chọn khách hàng')
      return
    }

    try {
      setSubmitting(true)

      await bookingApi.createFull({
        courtID: courtID,
        customerID: customerID,
        bookingDate: date,
        note: note,
        slots: selectedSlots
          .map((id) => timeSlots.find((s) => s.slotIndex === id))
          .filter((slot): slot is CourtSlotAvailability => !!slot)
          .map((slot) => ({
            startTime: formatTimeSpan(slot.startTime),
            endTime: formatTimeSpan(slot.endTime),
          })),
        services: Object.entries(services).map(([svcId, svc]) => ({
          serviceID: Number(svcId),
          quantity: svc.quantity,
        })),
        combos: selectedComboID
          ? [{ comboID: selectedComboID, quantity: 1 }]
          : [],
      })

      await queryClient.invalidateQueries()
      message.success('Tạo booking thành công!')
      handleClose()
    } catch (err) {
      console.error(err)
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo booking'
      message.error(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleClose}
            className="flex items-center justify-center font-medium"
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 m-0">Đặt sân mới</h1>
          </div>
        </div>
      </div>

      {/* Main Grid Layout - Natural Full Window Scroll */}
      <div className="max-w-375 w-full mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Step Content (spans 3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Wizard steps bar */}
          <div className="flex gap-2">
            {steps.map((label, i) => {
              const isClickable = isStepClickable(i)
              const isActive = i === step
              const isDone = i < step

              let stepClass =
                'flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white opacity-50 cursor-not-allowed'
              let numClass =
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-400 shrink-0'
              let labelClass = 'text-xs font-semibold text-slate-400'

              if (isActive) {
                stepClass =
                  'flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-slate-800 bg-slate-50 transition duration-200 cursor-pointer shadow-sm ring-1 ring-slate-800'
                numClass =
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-900 text-white shrink-0'
                labelClass = 'text-xs font-semibold text-slate-900'
              } else if (isDone) {
                stepClass =
                  'flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 transition duration-200 cursor-pointer hover:border-emerald-300 hover:shadow-sm'
                numClass =
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-500 text-white shrink-0'
                labelClass = 'text-xs font-semibold text-emerald-600'
              } else if (isClickable) {
                stepClass =
                  'flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-white transition duration-200 cursor-pointer hover:border-slate-300 hover:shadow-sm'
                numClass =
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-500 shrink-0'
                labelClass = 'text-xs font-semibold text-slate-600'
              }

              return (
                <div
                  key={i}
                  className={stepClass}
                  onClick={() => isClickable && setStep(i)}
                >
                  <span className={numClass}>{isDone ? '✓' : i + 1}</span>
                  <span className={labelClass}>{label}</span>
                </div>
              )
            })}
          </div>

          {/* Form Step Content Box */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
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
                  {courts.map((c) => (
                    <div
                      key={c.courtID}
                      className={`flex flex-col gap-1.5 border rounded-xl p-4 cursor-pointer bg-white transition duration-150 ${
                        courtID === c.courtID
                          ? 'border-slate-850 bg-slate-50 shadow-sm ring-1 ring-slate-800'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                      onClick={() => setCourtID(c.courtID)}
                    >
                      <span className="text-sm font-bold text-slate-800">
                        {c.courtName}
                      </span>
                      <div className="flex gap-1 items-center">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {c.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{c.courtCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Slot picker */}
            {step === 1 && (
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Chọn khung giờ
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Sân: <strong className="text-teal-600">{court?.courtName}</strong> ·
                  Ngày: <strong>{date}</strong>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => {
                    const locked = isSlotLocked(slot)
                    const sel = selectedSlots.includes(slot.slotIndex)
                    const price = getSlotPriceReal(slot.slotIndex)

                    let cardClass =
                      'relative border border-slate-200 rounded-xl p-3 text-center cursor-pointer bg-white transition duration-150 hover:border-slate-300 hover:shadow-sm'
                    let priceClass = 'text-[10px] mt-0.5 font-semibold text-slate-400'

                    if (sel) {
                      cardClass =
                        'relative border border-slate-900 bg-slate-900 text-white rounded-xl p-3 text-center cursor-pointer transition duration-150 shadow-sm'
                      priceClass = 'text-[10px] mt-0.5 font-semibold text-slate-300'
                    } else if (locked) {
                      cardClass =
                        'relative border border-slate-200 bg-slate-50 opacity-40 rounded-xl p-3 text-center cursor-not-allowed select-none'
                    }

                    return (
                      <div
                        key={slot.slotIndex}
                        className={cardClass}
                        onClick={() => !locked && toggleSlot(slot.slotIndex)}
                        title={slot.lockReason ?? undefined}
                      >
                        {locked && (
                          <span className="text-[10px] text-red-500 font-bold block absolute top-1 right-2">
                            [Bận]
                          </span>
                        )}
                        <div className="text-sm font-bold">
                          {slot.startTime.substring(0, 5)}–{slot.endTime.substring(0, 5)}
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
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Dịch vụ đi kèm
                </h3>
                <p className="text-sm text-slate-400 mb-4">Tùy chọn – có thể bỏ qua</p>

                <Tabs
                  defaultActiveKey="services"
                  className="custom-booking-tabs"
                  items={[
                    {
                      key: 'combos',
                      label: (
                        <span className="font-semibold text-sm">Gói Combo ưu đãi</span>
                      ),
                      children: (
                        <div>
                          {combosQuery.isPending ? (
                            <div className="py-8 text-center text-slate-400">
                              Đang tải danh sách combo...
                            </div>
                          ) : (combosQuery.data?.items ?? []).length === 0 ? (
                            <Empty
                              description="Không có gói combo nào hoạt động"
                              className="py-8"
                            />
                          ) : (
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(combosQuery.data?.items ?? []).map((combo: Combo) => {
                                  const isSel = selectedComboID === combo.comboID
                                  return (
                                    <div
                                      key={combo.comboID}
                                      className={`relative flex flex-col justify-between p-4 bg-white border-2 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer ${
                                        isSel
                                          ? 'border-rose-500 bg-rose-50/10 shadow-sm'
                                          : 'border-slate-100 hover:border-rose-200'
                                      }`}
                                      onClick={() => toggleCombo(combo)}
                                    >
                                      {isSel && (
                                        <div className="absolute top-2 right-2">
                                          <span className="text-xs font-semibold text-rose-600">
                                            [Đang chọn]
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-bold text-slate-800 text-sm block mb-1">
                                          {combo.comboName}
                                        </span>
                                        <span className="text-xs text-slate-400 block min-h-8 mb-3">
                                          {combo.description || 'Không có mô tả'}
                                        </span>

                                        <div className="flex flex-wrap gap-1 mb-3">
                                          {combo.services && combo.services.length > 0 ? (
                                            combo.services.map((s) => (
                                              <Tag
                                                color="purple"
                                                key={s.serviceID}
                                                className="text-[10px]"
                                              >
                                                {s.serviceName} x{s.quantity} {s.unit}
                                              </Tag>
                                            ))
                                          ) : (
                                            <span className="text-gray-400 text-xs">
                                              Không tặng kèm dịch vụ
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                        <span className="text-xs font-bold text-orange-500">
                                          {combo.durationHours} Giờ chơi
                                        </span>
                                        <span className="text-sm font-bold text-rose-600">
                                          {formatCompactCurrency(combo.comboPrice)}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              <Pagination
                                current={comboPage}
                                pageSize={combosQuery.data?.pageSize ?? 10}
                                total={combosQuery.data?.totalCount ?? 0}
                                onChange={(p) => setComboPage(p)}
                                size="small"
                                showSizeChanger={false}
                                className="mt-6 flex justify-end"
                              />
                            </div>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'services',
                      label: (
                        <span className="font-semibold text-sm">Dịch vụ riêng lẻ</span>
                      ),
                      children: (
                        <div>
                          {servicesQuery.isPending ? (
                            <div className="py-8 text-center text-slate-400">
                              Đang tải danh sách dịch vụ...
                            </div>
                          ) : serviceItems.length === 0 ? (
                            <Empty
                              description="Không có dịch vụ nào khả dụng"
                              className="py-8"
                            />
                          ) : (
                            <div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {serviceItems.map((svc) => {
                                  const sel = services[svc.serviceID]
                                  const quantity = sel?.quantity || 0
                                  const svcPrice = svc.price ?? 0

                                  return (
                                    <div
                                      key={svc.serviceID}
                                      className={`relative flex flex-col justify-between p-4 bg-white border-2 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer ${
                                        quantity > 0
                                          ? 'border-indigo-500 bg-indigo-50/10 shadow-sm'
                                          : 'border-slate-100 hover:border-indigo-200'
                                      }`}
                                      onClick={() => {
                                        if (quantity > 0) {
                                          setServices((c) => {
                                            const next = { ...c }
                                            delete next[svc.serviceID]
                                            return next
                                          })
                                        } else {
                                          setServices((c) => ({
                                            ...c,
                                            [svc.serviceID]: {
                                              quantity: 1,
                                              unitPrice: svcPrice,
                                            },
                                          }))
                                        }
                                      }}
                                    >
                                      {quantity > 0 && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                          <span className="text-[10px] font-semibold text-indigo-650 text-indigo-600">
                                            [Đã chọn]
                                          </span>
                                          <Badge
                                            count={quantity}
                                            style={{ backgroundColor: '#6366f1' }}
                                          />
                                        </div>
                                      )}

                                      <div className="flex flex-col mb-3">
                                        <div
                                          className="font-semibold text-slate-800 text-sm w-full truncate"
                                          title={svc.serviceName}
                                        >
                                          {svc.serviceName}
                                        </div>
                                        <div className="text-xs font-semibold text-emerald-600 mt-1">
                                          {svc.price == null
                                            ? 'Chưa có giá'
                                            : `${formatCompactCurrency(svcPrice)} / ${svc.unit}`}
                                        </div>
                                      </div>

                                      <div
                                        className="w-full"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {quantity === 0 ? (
                                          <Button
                                            type="dashed"
                                            block
                                            className="text-slate-500 hover:text-indigo-600 hover:border-indigo-500"
                                            onClick={() => {
                                              setServices((c) => ({
                                                ...c,
                                                [svc.serviceID]: {
                                                  quantity: 1,
                                                  unitPrice: svcPrice,
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
                                              className="text-slate-400 hover:text-red-500 font-bold"
                                              onClick={(e) => {
                                                e.stopPropagation()
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
                                            >
                                              -
                                            </Button>
                                            <span className="font-bold text-slate-800 text-sm select-none">
                                              {quantity}
                                            </span>
                                            <Button
                                              type="text"
                                              size="small"
                                              className="text-indigo-600 font-bold"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setServices((c) => ({
                                                  ...c,
                                                  [svc.serviceID]: {
                                                    ...c[svc.serviceID],
                                                    quantity: quantity + 1,
                                                  },
                                                }))
                                              }}
                                            >
                                              +
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              <Pagination
                                current={servicePage}
                                pageSize={servicesQuery.data?.pageSize ?? 10}
                                total={servicesQuery.data?.totalCount ?? 0}
                                onChange={(p) => setServicePage(p)}
                                size="small"
                                showSizeChanger={false}
                                className="mt-6 flex justify-end"
                              />
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
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
                      {customers.map((c) => {
                        const getInitials = (name: string) => {
                          return name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        }
                        return (
                          <div
                            key={c.customerID}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition ${
                              customerID === c.customerID
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-slate-200 hover:border-teal-300'
                            }`}
                            onClick={() => setCustomerID(c.customerID)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-bold text-teal-600">
                              {getInitials(c.customerName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {c.customerName}
                              </div>
                              <div className="text-xs text-slate-400">{c.phone}</div>
                            </div>
                          </div>
                        )
                      })}
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
        </div>

        {/* Summary sidebar (sticky top) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Tóm tắt booking
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                    Sân
                  </div>
                  <div className="font-bold text-slate-800">
                    {court?.courtName ?? 'Chưa chọn'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                    Ngày
                  </div>
                  <div className="font-bold text-slate-800">{date}</div>
                </div>
                <div>
                  <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                    Khung giờ
                  </div>
                  <div className="font-bold text-slate-800 leading-relaxed">
                    {selectedSlots.length > 0
                      ? selectedSlots
                          .map((id) => {
                            const found = timeSlots.find((s) => s.slotIndex === id)
                            return found
                              ? `${found.startTime.substring(0, 5)}–${found.endTime.substring(0, 5)}`
                              : ''
                          })
                          .filter(Boolean)
                          .join(', ')
                      : 'Chưa chọn'}
                  </div>
                </div>
                {selectedCombo && (
                  <div>
                    <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                      Gói Combo
                    </div>
                    <div className="font-bold text-rose-600">
                      {selectedCombo.comboName}
                    </div>
                  </div>
                )}
                {customer && (
                  <div>
                    <div className="text-slate-450 text-slate-400 text-xs font-medium mb-0.5">
                      Khách hàng
                    </div>
                    <div className="font-bold text-slate-800">
                      {customer.customerName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>
                  {selectedCombo
                    ? 'Tiền Combo & Sân'
                    : `Tiền sân (${selectedSlots.length} slot)`}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatCompactCurrency(slotTotal)}
                </span>
              </div>

              {Object.entries(services).length > 0 && (
                <div className="pt-3 border-t border-dashed border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Chi tiết dịch vụ
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {Object.entries(services).map(([idStr, selectedSvc]) => {
                      const svcId = Number(idStr)
                      const item = serviceItems.find((s) => s.serviceID === svcId)
                      if (!item) return null
                      return (
                        <div
                          key={svcId}
                          className="flex justify-between text-xs text-slate-600"
                        >
                          <span>
                            {item.serviceName}{' '}
                            <span className="font-semibold text-indigo-550 text-indigo-500">
                              x{selectedSvc.quantity}
                            </span>
                          </span>
                          <span className="font-medium text-slate-700">
                            {formatCompactCurrency(
                              selectedSvc.quantity * selectedSvc.unitPrice,
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {svcTotal > 0 && (
                <div className="flex justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                  <span>Tổng tiền dịch vụ</span>
                  <span className="font-semibold text-slate-800">
                    {formatCompactCurrency(svcTotal)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 bg-white mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  Tổng cộng
                </span>
                <span className="text-xl font-extrabold text-teal-600">
                  {formatCompactCurrency(total)}
                </span>
              </div>

              <div className="flex gap-2">
                {step > 0 && (
                  <Button onClick={() => setStep((s) => s - 1)} className="flex-1">
                    Quay lại
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="primary"
                    disabled={!canNext()}
                    onClick={() => setStep((s) => s + 1)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border-0 font-semibold"
                  >
                    Tiếp theo
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={submitting}
                    className="flex-1 bg-teal-600 hover:bg-teal-500 border-0 font-semibold"
                  >
                    Tạo booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
