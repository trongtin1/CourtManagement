import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  App,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  AppstoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import { bookingApi } from '@/features/bookings/api/bookingApi'
import { bookingServiceApi } from '@/features/bookings/api/bookingServiceApi'
import { bookingSlotApi } from '@/features/bookings/api/bookingSlotApi'
import {
  useBookingsQuery,
  useCancelBookingMutation,
  useCreateBookingMutation,
  useDeleteBookingMutation,
} from '@/features/bookings/api/useBookingQueries'
import type { Booking, CreateBookingRequest } from '@/features/bookings/model/types'
import { courtPriceApi } from '@/features/courts/api/courtPriceApi'
import { timeSlotApi } from '@/features/courts/api/timeSlotApi'
import { useCourtsQuery } from '@/features/courts/api/useCourtQueries'
import type { Court, TimeSlot } from '@/features/courts/model/types'
import { useServicesQuery } from '@/features/services/api/useServiceQueries'
import type { Service } from '@/features/services/model/types'
import { toApiError } from '@/utils/errors'

const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
}

const today = new Date().toISOString().slice(0, 10)

type BookingFormValues = CreateBookingRequest & {
  email?: string
}

type SelectedService = {
  quantity: number
  unitPrice: number
}

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}đ`

const formatTime = (value: string) => value?.slice(0, 5)

const getDayOfWeek = (date?: string) => {
  if (!date) return new Date().getDay()
  return new Date(date).getDay()
}

export function BookingsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<BookingFormValues>()
  const [open, setOpen] = useState(false)
  const [sidebarOffset, setSidebarOffset] = useState(0)
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null)
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([])
  const [selectedServices, setSelectedServices] = useState<
    Record<number, SelectedService>
  >({})
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const bookingDate = Form.useWatch('bookingDate', form)

  useEffect(() => {
    const sider = document.querySelector('.ant-layout-sider')
    if (!sider) return

    const updateOffset = () => setSidebarOffset(sider.getBoundingClientRect().width)
    updateOffset()

    const observer = new ResizeObserver(updateOffset)
    observer.observe(sider)

    return () => observer.disconnect()
  }, [])

  const query = useBookingsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const courtsQuery = useCourtsQuery()
  const servicesQuery = useServicesQuery()
  const timeSlotsQuery = useQuery({
    queryKey: ['timeSlots', 'booking-picker'],
    queryFn: () => timeSlotApi.getAll(),
  })
  const courtPricesQuery = useQuery({
    queryKey: ['courtPrices', 'booking-picker'],
    queryFn: () => courtPriceApi.getAll(),
  })
  const bookingsByDateQuery = useQuery({
    queryKey: ['bookings', 'date', bookingDate],
    queryFn: () => bookingApi.getByDate(bookingDate),
    enabled: !!bookingDate,
  })

  const createMut = useCreateBookingMutation()
  const cancelMut = useCancelBookingMutation()
  const deleteMut = useDeleteBookingMutation()

  const courts = useMemo(() => courtsQuery.data?.items ?? [], [courtsQuery.data?.items])
  const services = useMemo(
    () => servicesQuery.data?.items ?? [],
    [servicesQuery.data?.items],
  )
  const timeSlots = useMemo(
    () => timeSlotsQuery.data?.items ?? [],
    [timeSlotsQuery.data?.items],
  )
  const courtPrices = useMemo(
    () => courtPricesQuery.data?.items ?? [],
    [courtPricesQuery.data?.items],
  )

  const bookedCourtIds = useMemo(
    () =>
      new Set(
        (bookingsByDateQuery.data ?? [])
          .filter((booking) => booking.status !== 'cancelled')
          .map((booking) => booking.courtID),
      ),
    [bookingsByDateQuery.data],
  )

  const getCourtBasePrice = useCallback(
    (courtId: number) => {
      const prices = courtPrices.filter(
        (price) => price.courtID === courtId && price.isActive,
      )
      if (prices.length === 0) return 200000
      return Math.min(...prices.map((price) => price.price))
    },
    [courtPrices],
  )

  const getSlotPrice = useCallback(
    (timeSlotId: number) => {
      if (!selectedCourtId) return 0
      const dayOfWeek = getDayOfWeek(bookingDate)
      const price = courtPrices.find(
        (item) =>
          item.courtID === selectedCourtId &&
          item.timeSlotID === timeSlotId &&
          item.dayOfWeek === dayOfWeek &&
          item.isActive,
      )
      return price?.price ?? getCourtBasePrice(selectedCourtId)
    },
    [bookingDate, courtPrices, getCourtBasePrice, selectedCourtId],
  )

  const getServicePrice = (service: Service) => {
    const type = service.serviceType?.toLowerCase() ?? ''
    if (type.includes('premium') || type.includes('cao')) return 50000
    return 30000
  }

  const totalAmount = useMemo(() => {
    const courtTotal = selectedSlotIds.reduce(
      (total, slotId) => total + getSlotPrice(slotId),
      0,
    )
    const serviceTotal = Object.values(selectedServices).reduce(
      (total, service) => total + service.quantity * service.unitPrice,
      0,
    )
    return courtTotal + serviceTotal
  }, [getSlotPrice, selectedServices, selectedSlotIds])

  const openCreate = () => {
    form.resetFields()
    form.setFieldsValue({
      bookingDate: today,
      status: 'pending',
      tenantID: 1,
    })
    setSelectedCourtId(null)
    setSelectedSlotIds([])
    setSelectedServices({})
    setOpen(true)
  }

  const handleSlotToggle = (slotId: number) => {
    setSelectedSlotIds((current) =>
      current.includes(slotId)
        ? current.filter((id) => id !== slotId)
        : [...current, slotId],
    )
  }

  const handleServiceToggle = (service: Service, checked: boolean) => {
    setSelectedServices((current) => {
      const next = { ...current }
      if (!checked) {
        delete next[service.serviceID]
        return next
      }
      next[service.serviceID] = {
        quantity: Math.max(service.minQuantity || 1, 1),
        unitPrice: getServicePrice(service),
      }
      return next
    })
  }

  const handleServiceQuantityChange = (serviceId: number, quantity: number | null) => {
    setSelectedServices((current) => ({
      ...current,
      [serviceId]: {
        ...current[serviceId],
        quantity: quantity ?? 1,
      },
    }))
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (!selectedCourtId) {
        message.warning('Vui lòng chọn sân')
        return
      }
      if (selectedSlotIds.length === 0) {
        message.warning('Vui lòng chọn ít nhất một khung giờ')
        return
      }

      const booking = await createMut.mutateAsync({
        tenantID: values.tenantID,
        courtID: selectedCourtId,
        customerID: values.customerID,
        bookingDate: values.bookingDate,
        totalAmount,
        status: 'pending',
        note: values.note,
      })

      await Promise.all(
        selectedSlotIds.map((timeSlotID) =>
          bookingSlotApi.create({
            bookingID: booking.bookingID,
            courtID: selectedCourtId,
            bookingDate: values.bookingDate,
            timeSlotID,
          }),
        ),
      )

      await Promise.all(
        Object.entries(selectedServices).map(([serviceId, service]) =>
          bookingServiceApi.create({
            bookingID: booking.bookingID,
            serviceID: Number(serviceId),
            quantity: service.quantity,
            unitPrice: service.unitPrice,
            status: 'pending',
          }),
        ),
      )

      message.success('Tạo booking thành công')
      setOpen(false)
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      message.error(toApiError(e).message)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelMut.mutateAsync({ id, data: { cancellationReason: 'Admin cancelled' } })
      message.success('Đã huỷ booking')
    } catch (e) {
      message.error(toApiError(e).message)
    }
  }

  const renderCourtCard = (court: Court) => {
    const booked = bookedCourtIds.has(court.courtID)
    const selected = selectedCourtId === court.courtID

    return (
      <button
        className={[
          'min-h-34 rounded-lg border p-3 text-center transition',
          selected ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-teal-200 bg-white',
          booked ? 'border-rose-200 bg-rose-50 text-slate-400' : 'hover:border-teal-500',
        ].join(' ')}
        disabled={booked}
        key={court.courtID}
        onClick={() => {
          setSelectedCourtId(court.courtID)
          setSelectedSlotIds([])
        }}
        type="button"
      >
        <div className="mb-1 flex items-center justify-end">
          <Tag color={booked ? 'red' : 'green'}>{booked ? 'Đã đặt' : 'Trống'}</Tag>
        </div>
        <AppstoreOutlined
          className={booked ? 'text-xl text-slate-300' : 'text-xl text-blue-600'}
        />
        <div className="mt-2 font-semibold text-slate-800">{court.courtName}</div>
        <div className="text-xs text-slate-500">{court.description || 'Trong nhà'}</div>
        <div className="mt-2 text-base font-bold text-emerald-600">
          {formatCurrency(getCourtBasePrice(court.courtID))}
        </div>
        <div className="text-xs text-slate-500">{booked ? 'Đã đặt' : 'Trống'}</div>
      </button>
    )
  }

  const renderTimeSlot = (slot: TimeSlot) => {
    const selected = selectedSlotIds.includes(slot.timeSlotID)

    return (
      <button
        className={[
          'rounded-md border px-3 py-2 text-center transition',
          selected
            ? 'border-teal-500 bg-teal-50 shadow-sm'
            : 'border-teal-200 bg-white hover:border-teal-500',
          !selectedCourtId ? 'cursor-not-allowed opacity-50' : '',
        ].join(' ')}
        disabled={!selectedCourtId}
        key={slot.timeSlotID}
        onClick={() => handleSlotToggle(slot.timeSlotID)}
        type="button"
      >
        <div className="text-sm font-semibold text-slate-800">
          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
        </div>
        <div className="text-xs font-semibold text-emerald-600">
          {formatCurrency(getSlotPrice(slot.timeSlotID))}
        </div>
      </button>
    )
  }

  if (query.isPending) return <LoadingSpin tip="Đang tải bookings..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Quản lý Đặt sân</Typography.Title>
          <Typography.Paragraph type="secondary">
            Danh sách lượt đặt sân
          </Typography.Paragraph>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={query.isRefetching}
            onClick={() => query.refetch()}
          >
            Làm mới
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreate} type="primary">
            Tạo booking
          </Button>
        </Space>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <Table
          columns={[
            { title: 'Booking ID', dataIndex: 'bookingID', width: 280, ellipsis: true },
            { title: 'Sân', dataIndex: 'courtID', width: 70 },
            { title: 'KH', dataIndex: 'customerID', width: 70 },
            {
              title: 'Ngày đặt',
              dataIndex: 'bookingDate',
              width: 120,
              render: (v: string) => new Date(v).toLocaleDateString('vi-VN'),
            },
            {
              title: 'Tổng tiền',
              dataIndex: 'totalAmount',
              width: 120,
              render: (v: number) => formatCurrency(v ?? 0),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              width: 110,
              render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag>,
            },
            { title: 'Ghi chú', dataIndex: 'note', ellipsis: true },
            {
              title: '',
              width: 140,
              render: (_: unknown, r: Booking) => (
                <Space>
                  {r.status !== 'cancelled' && (
                    <Popconfirm
                      title="Huỷ booking?"
                      onConfirm={() => handleCancel(r.bookingID)}
                    >
                      <Button danger size="small">
                        Huỷ
                      </Button>
                    </Popconfirm>
                  )}
                  <Popconfirm
                    title="Xoá?"
                    onConfirm={() => deleteMut.mutate(r.bookingID)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small" type="link" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={query.data?.items ?? []}
          loading={query.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: query.data?.totalCount ?? 0,
            showTotal: (t) => `Tổng ${t}`,
          }}
          rowKey="bookingID"
          scroll={{ x: 1100 }}
          size="middle"
        />
      </div>

      <Modal
        confirmLoading={createMut.isPending}
        okText="Tạo booking"
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        open={open}
        style={{ left: sidebarOffset / 2 }}
        title="Đặt sân mới"
        width={`min(980px, calc(100vw - ${sidebarOffset}px - 48px))`}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item label="Email" name="email">
              <Input placeholder="you@example.com" />
            </Form.Item>
            <Form.Item
              label="Khách hàng ID"
              name="customerID"
              rules={[{ required: true }]}
            >
              <InputNumber className="w-full" min={1} placeholder="Nhập ID khách hàng" />
            </Form.Item>
            <Form.Item label="Tenant ID" name="tenantID" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Form.Item label="Ngày đặt" name="bookingDate" rules={[{ required: true }]}>
              <Input prefix={<CalendarOutlined />} type="date" />
            </Form.Item>
          </div>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={2} placeholder="Ghi chú cho booking" />
          </Form.Item>
        </Form>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Space>
            <AppstoreOutlined className="text-blue-600" />
            <Typography.Text strong>Chọn sân</Typography.Text>
          </Space>
          <Button
            icon={<SearchOutlined />}
            loading={bookingsByDateQuery.isFetching}
            onClick={() => bookingsByDateQuery.refetch()}
            type="primary"
          >
            Xem sân trống
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {courts.map(renderCourtCard)}
        </div>

        <Divider />

        <Space className="mb-3">
          <ClockCircleOutlined className="text-orange-500" />
          <Typography.Text strong>Chọn khung giờ</Typography.Text>
        </Space>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {timeSlots.map(renderTimeSlot)}
        </div>

        <Divider />

        <Space className="mb-3">
          <ShoppingOutlined className="text-indigo-600" />
          <Typography.Text strong>Dịch vụ đi kèm</Typography.Text>
        </Space>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {services.map((service) => {
            const selected = selectedServices[service.serviceID]
            const price = selected?.unitPrice ?? getServicePrice(service)

            return (
              <div
                className="rounded-lg border border-slate-200 bg-white p-3"
                key={service.serviceID}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {service.serviceName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {service.serviceType || 'Dịch vụ'}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-emerald-600">
                      {formatCurrency(price)}
                    </div>
                  </div>
                  <Checkbox
                    checked={!!selected}
                    onChange={(event) =>
                      handleServiceToggle(service, event.target.checked)
                    }
                  >
                    Chọn
                  </Checkbox>
                </div>
                {selected && (
                  <InputNumber
                    className="mt-3 w-full"
                    min={1}
                    onChange={(value) =>
                      handleServiceQuantityChange(service.serviceID, value)
                    }
                    value={selected.quantity}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <Typography.Text type="secondary">
            {selectedCourtId ? `Sân #${selectedCourtId}` : 'Chưa chọn sân'} -{' '}
            {selectedSlotIds.length} khung giờ
          </Typography.Text>
          <Typography.Title className="mb-0!" level={4}>
            {formatCurrency(totalAmount)}
          </Typography.Title>
        </div>
      </Modal>
    </Space>
  )
}
