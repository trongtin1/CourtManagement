import { useState } from 'react'
import {
  Drawer,
  Button,
  Tag,
  Descriptions,
  Timeline,
  Spin,
  Modal,
  Form,
  InputNumber,
  Input,
  App,
  Select,
  Pagination,
  Tabs,
} from 'antd'
import {
  CloseOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReloadOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import type {
  BookingGroup,
  BookingGroupStatus,
  Booking,
} from '@/features/bookings/model/types'
import { formatCompactCurrency } from '@/utils/format'
import {
  useBookingGroupQuery,
  usePayBookingGroupDepositMutation,
} from '@/features/bookings/api/useBookingGroupQueries'
import {
  useGroupBookingsQuery,
  useRefundBookingMutation,
  useBookingStatusesQuery,
} from '@/features/bookings/api/useBookingQueries'

interface BookingGroupDetailDrawerProps {
  group: BookingGroup | null
  open: boolean
  onClose: () => void
}

const STATUS_MAP: Record<BookingGroupStatus, { label: string; color: string }> = {
  Active: { label: 'Đang hoạt động', color: 'green' },
  Paused: { label: 'Tạm dừng', color: 'orange' },
  Cancelled: { label: 'Đã hủy', color: 'red' },
  Completed: { label: 'Hoàn thành', color: 'default' },
}

const DAY_MAP: Record<string, string> = {
  '0': 'CN',
  '1': 'T2',
  '2': 'T3',
  '3': 'T4',
  '4': 'T5',
  '5': 'T6',
  '6': 'T7',
}

export function BookingGroupDetailDrawer({
  group,
  open,
  onClose,
}: BookingGroupDetailDrawerProps) {
  const { message } = App.useApp()
  const { data: fullGroup, isLoading } = useBookingGroupQuery(group?.bookingGroupID ?? 0)
  const payDepositMutation = usePayBookingGroupDepositMutation()
  const refundMutation = useRefundBookingMutation()
  const { data: statusesData } = useBookingStatusesQuery()
  const bookingStatuses = statusesData ?? []

  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [payForm] = Form.useForm()

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [refundForm] = Form.useForm()
  const [refundingBookingId, setRefundingBookingId] = useState<string | null>(null)
  const [refundingMaxAmount, setRefundingMaxAmount] = useState<number>(0)

  // Booking Group Bookings Query & Pagination
  const [groupStatusFilter, setGroupStatusFilter] = useState<string | undefined>()
  const [groupPage, setGroupPage] = useState<number>(1)
  const groupPageSize = 5

  const { data: groupBookingsData, isLoading: isGroupBookingsLoading } =
    useGroupBookingsQuery(
      group?.bookingGroupID
        ? {
            bookingGroupID: group.bookingGroupID,
            status: groupStatusFilter,
            page: groupPage,
            pageSize: groupPageSize,
          }
        : undefined,
    )

  const handleGroupStatusFilterChange = (val: string | undefined) => {
    setGroupStatusFilter(val)
    setGroupPage(1)
  }

  const getBookingStatusTag = (statusVal: string) => {
    const statusObj = bookingStatuses.find(
      (opt) =>
        opt.code === statusVal ||
        (opt.statusName ?? '').toLowerCase() === statusVal.toLowerCase(),
    )
    if (!statusObj) return <Tag>{statusVal}</Tag>
    return (
      <Tag color={statusObj.colorCode || 'default'} style={{ marginRight: 0 }}>
        {statusObj.labelName}
      </Tag>
    )
  }

  const detail = fullGroup ?? group
  if (!detail) return null

  const statusMeta = STATUS_MAP[detail.status]
  const rc = detail.recurringConfig

  const parsedDays = rc?.daysOfWeek
    ? rc.daysOfWeek
        .split(',')
        .map((d) => DAY_MAP[d.trim()] ?? d)
        .join(', ')
    : null

  const debtAmount = detail.totalAmount - detail.paidAmount

  const handlePaymentSubmit = (values: { amount: number; note?: string }) => {
    payDepositMutation.mutate(
      {
        id: detail.bookingGroupID,
        data: {
          amount: values.amount,
          note: values.note || '',
        },
      },
      {
        onSuccess: () => {
          message.success('Nạp tiền cọc nhóm thành công!')
          setIsPayModalOpen(false)
          payForm.resetFields()
        },
        onError: (error) => {
          const fallbackMessage = 'Nạp tiền cọc nhóm thất bại!'
          const serverMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? fallbackMessage
          message.error(serverMessage)
        },
      },
    )
  }

  const handleRefundSubmit = (values: { amount: number; note?: string }) => {
    if (!refundingBookingId) return

    refundMutation.mutate(
      {
        id: refundingBookingId,
        data: {
          amount: values.amount,
          note: values.note || '',
        },
      },
      {
        onSuccess: () => {
          message.success('Ghi nhận hoàn tiền booking thành công!')
          setIsRefundModalOpen(false)
          refundForm.resetFields()
        },
        onError: (error) => {
          const fallbackMessage = 'Hoàn tiền booking thất bại!'
          const serverMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? fallbackMessage
          message.error(serverMessage)
        },
      },
    )
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={700}
      title={null}
      closeIcon={null}
      styles={{
        body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' },
        header: { display: 'none' },
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Spin />
        </div>
      ) : (
        <>
          {/* Header band */}
          <div className="bg-slate-50 border-b border-slate-200 p-5 relative shrink-0">
            <div className="absolute top-4 right-4">
              <Button
                type="text"
                size="middle"
                icon={<CloseOutlined className="text-base" />}
                onClick={onClose}
              />
            </div>
            <div className="flex flex-col gap-1 pr-9">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ReloadOutlined /> Lịch định kỳ
              </div>
              <h2 className="m-0 text-lg font-bold text-slate-900 leading-tight">
                Nhóm #{detail.bookingGroupID}
              </h2>
              <Tag
                color={statusMeta?.color}
                className="self-start rounded-full font-semibold text-xs px-3 py-0.5 mt-1.5"
              >
                {statusMeta?.label ?? detail.status}
              </Tag>
            </div>
          </div>

          {/* Tabs Body Container */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Tabs
              defaultActiveKey="overview"
              className="w-full flex-1 flex flex-col h-full [&_.ant-tabs-nav]:px-5 [&_.ant-tabs-nav]:m-0 [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content-holder]:overflow-y-auto [&_.ant-tabs-tabpane]:p-5 [&_.ant-tabs-content]:h-full"
              items={[
                {
                  key: 'overview',
                  label: (
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <ClockCircleOutlined /> Tổng quan
                    </span>
                  ),
                  children: (
                    <div className="flex flex-col gap-5">
                      {/* Finance summary card */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-400">
                              Tổng tiền lịch lặp
                            </span>
                            <span className="text-base font-bold text-slate-850">
                              {formatCompactCurrency(detail.totalAmount)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 pl-1">
                            <span className="text-xs font-medium text-slate-400">
                              Số dư cọc khả dụng
                            </span>
                            <span className="text-base font-bold text-emerald-600">
                              {formatCompactCurrency(detail.paidAmount)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 pl-1">
                            <span className="text-xs font-medium text-slate-400">
                              Còn lại cần thu
                            </span>
                            <span
                              className={`text-base font-bold ${debtAmount > 0 ? 'text-rose-550' : 'text-emerald-600'}`}
                            >
                              {formatCompactCurrency(Math.max(0, debtAmount))}
                            </span>
                          </div>
                        </div>

                        {detail.status === 'Active' && (
                          <Button
                            type="primary"
                            icon={<WalletOutlined />}
                            size="large"
                            className="bg-emerald-600 hover:bg-emerald-705 w-full rounded-lg text-sm font-bold h-10"
                            loading={payDepositMutation.isPending}
                            onClick={() => {
                              payForm.setFieldsValue({ amount: 500000 })
                              setIsPayModalOpen(true)
                            }}
                          >
                            Nạp thêm tiền cọc nhóm
                          </Button>
                        )}
                      </div>

                      {/* Config details */}
                      {rc && (
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-205 flex flex-col gap-3.5">
                          <p className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">
                            Cấu hình định kỳ
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-405 text-xs">Sân đặt</span>
                              <span className="font-bold text-slate-800 text-sm">
                                Sân #{rc.courtID}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-405 text-xs">Khung giờ</span>
                              <span className="font-bold text-slate-800 text-sm">
                                {rc.startTime?.substring(0, 5)} –{' '}
                                {rc.endTime?.substring(0, 5)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 col-span-2">
                              <span className="text-slate-405 text-xs">
                                Ngày hoạt động
                              </span>
                              <span className="font-semibold text-slate-800 text-sm">
                                {dayjs(rc.startDate).format('DD/MM/YYYY')} –{' '}
                                {dayjs(rc.endDate).format('DD/MM/YYYY')}
                              </span>
                            </div>
                            {parsedDays && (
                              <div className="flex flex-col gap-1 col-span-2">
                                <span className="text-slate-405 text-xs">
                                  Các ngày trong tuần
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-0.5">
                                  {rc.daysOfWeek.split(',').map((d) => (
                                    <span
                                      key={d.trim()}
                                      className="inline-flex items-center justify-center w-9 h-7 rounded bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100"
                                    >
                                      {DAY_MAP[d.trim()] ?? d}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-200/60 pt-2.5">
                              <span className="text-slate-405 text-xs">
                                Thời gian hoạt động
                              </span>
                              <span className="font-bold text-slate-800 text-sm">
                                Còn {Math.max(0, dayjs(rc.endDate).diff(dayjs(), 'day'))}{' '}
                                ngày nữa
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Basic details */}
                      <div className="bg-white border border-slate-150 rounded-xl p-5 flex flex-col gap-3">
                        <p className="text-sm font-bold text-slate-705 uppercase tracking-wider m-0">
                          Thông tin cơ bản
                        </p>
                        <Descriptions
                          column={1}
                          size="small"
                          labelStyle={{
                            color: '#94a3b8',
                            fontWeight: 500,
                            fontSize: 12,
                            width: 110,
                          }}
                          contentStyle={{
                            color: '#1e293b',
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                          colon={false}
                          className="[&_.ant-descriptions-item]:pb-2"
                        >
                          <Descriptions.Item label="Ngày tạo">
                            {dayjs(detail.createdDate).format('DD/MM/YYYY HH:mm')}
                          </Descriptions.Item>
                          {detail.customerID && (
                            <Descriptions.Item label="Khách hàng">
                              #{detail.customerID}
                            </Descriptions.Item>
                          )}
                          {detail.note && (
                            <Descriptions.Item label="Ghi chú">
                              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>
                                {detail.note}
                              </span>
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'bookings',
                  label: (
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <CalendarOutlined /> Danh sách đặt sân
                    </span>
                  ),
                  children: (
                    <div className="flex flex-col gap-4 h-full">
                      <div className="shrink-0">
                        <Select
                          placeholder="Lọc theo trạng thái"
                          allowClear
                          size="middle"
                          className="w-full text-sm"
                          value={groupStatusFilter}
                          onChange={handleGroupStatusFilterChange}
                          options={[
                            { label: 'Tất cả trạng thái', value: '' },
                            ...bookingStatuses.map((s) => ({
                              label: s.labelName,
                              value: s.code,
                            })),
                          ]}
                          dropdownStyle={{ borderRadius: '12px' }}
                        />
                      </div>

                      {isGroupBookingsLoading ? (
                        <div className="flex justify-center p-8 flex-1 items-center">
                          <Spin size="small" tip="Đang tải..." />
                        </div>
                      ) : (
                        <div className="flex-1 min-h-0 flex flex-col justify-between">
                          <div className="overflow-y-auto pr-1 flex flex-col gap-3">
                            {(groupBookingsData?.items ?? []).length === 0 ? (
                              <p className="text-sm text-slate-400 italic text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                Không tìm thấy booking nào trong nhóm.
                              </p>
                            ) : (
                              (groupBookingsData?.items ?? []).map((b: Booking) => {
                                const bPaid = b.paidAmount ?? 0
                                return (
                                  <div
                                    key={b.bookingID}
                                    className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm text-sm flex flex-col gap-2.5 hover:border-slate-350 hover:shadow transition"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-slate-800 text-sm">
                                        {dayjs(b.bookingDate).format('DD/MM/YYYY')}
                                      </span>
                                      {getBookingStatusTag(b.status)}
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500">
                                      <span>
                                        Tổng:{' '}
                                        <strong className="text-slate-700 text-sm">
                                          {formatCompactCurrency(b.totalAmount)}
                                        </strong>
                                      </span>
                                      <span>
                                        Đã trả:{' '}
                                        <strong className="text-emerald-600 text-sm">
                                          {formatCompactCurrency(bPaid)}
                                        </strong>
                                      </span>
                                    </div>
                                    {bPaid > 0 && (
                                      <div className="flex justify-end border-t border-slate-100 pt-2.5 mt-1">
                                        <Button
                                          type="primary"
                                          danger
                                          size="middle"
                                          icon={<WalletOutlined />}
                                          className="text-xs h-7.5 px-3.5 rounded-md font-semibold"
                                          onClick={() => {
                                            setRefundingBookingId(b.bookingID)
                                            setRefundingMaxAmount(bPaid)
                                            refundForm.setFieldsValue({ amount: bPaid })
                                            setIsRefundModalOpen(true)
                                          }}
                                        >
                                          Hoàn tiền
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            )}
                          </div>

                          {groupBookingsData && groupBookingsData.totalPages > 1 && (
                            <div className="mt-4 flex justify-center shrink-0 pt-2.5 border-t border-slate-100 bg-white">
                              <Pagination
                                size="small"
                                current={groupPage}
                                pageSize={groupPageSize}
                                total={groupBookingsData.totalCount}
                                onChange={setGroupPage}
                                showSizeChanger={false}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'finance',
                  label: (
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <DollarOutlined /> Tài chính
                    </span>
                  ),
                  children: (
                    <div className="flex flex-col gap-4">
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">
                        Lịch sử & tiến trình tài chính
                      </p>
                      <div className="bg-white border border-slate-150 rounded-xl p-4.5">
                        <Timeline
                          items={[
                            {
                              color: 'green',
                              children: (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-medium text-slate-500">
                                    Đặt cọc / thanh toán trước
                                  </span>
                                  <span className="text-base font-bold text-slate-850">
                                    {formatCompactCurrency(detail.paidAmount)}
                                  </span>
                                </div>
                              ),
                            },
                          ]}
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Modal Nạp Tiền Cọc */}
          <Modal
            title={
              <span className="flex items-center gap-2 font-extrabold text-slate-800 text-base">
                <WalletOutlined className="text-emerald-600" /> Nạp thêm tiền cọc cho nhóm
                định kỳ
              </span>
            }
            open={isPayModalOpen}
            onCancel={() => setIsPayModalOpen(false)}
            footer={null}
            destroyOnClose
            className="rounded-2xl overflow-hidden"
          >
            <Form form={payForm} layout="vertical" onFinish={handlePaymentSubmit}>
              <Form.Item
                name="amount"
                label={
                  <span className="text-xs font-bold text-slate-600">
                    Số tiền đóng cọc thêm (VNĐ)
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền cọc!' },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null) return Promise.resolve()
                      if (value <= 0)
                        return Promise.reject(new Error('Số tiền cọc phải lớn hơn 0.'))
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <InputNumber<number>
                  className="w-full"
                  min={1000}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="note"
                label={
                  <span className="text-xs font-bold text-slate-600">
                    Ghi chú nạp cọc
                  </span>
                }
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Ví dụ: Khách chuyển khoản cọc bổ sung..."
                />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => setIsPayModalOpen(false)}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={payDepositMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Xác nhận nạp cọc
                </Button>
              </div>
            </Form>
          </Modal>

          {/* Modal Hoàn Tiền Booking */}
          <Modal
            title={
              <span className="flex items-center gap-2 font-extrabold text-slate-800 text-base">
                <WalletOutlined className="text-rose-650" /> Hoàn trả tiền booking
              </span>
            }
            open={isRefundModalOpen}
            onCancel={() => setIsRefundModalOpen(false)}
            footer={null}
            destroyOnClose
            className="rounded-2xl overflow-hidden"
          >
            <Form form={refundForm} layout="vertical" onFinish={handleRefundSubmit}>
              <Form.Item
                name="amount"
                label={
                  <span className="text-xs font-bold text-slate-600">
                    Số tiền hoàn trả (VNĐ) (Tối đa:{' '}
                    {formatCompactCurrency(refundingMaxAmount)})
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền hoàn trả!' },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null) return Promise.resolve()
                      if (value <= 0)
                        return Promise.reject(
                          new Error('Số tiền hoàn trả phải lớn hơn 0.'),
                        )
                      if (value > refundingMaxAmount) {
                        return Promise.reject(
                          new Error(
                            'Số tiền hoàn trả không được vượt quá số tiền đã thanh toán.',
                          ),
                        )
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <InputNumber<number>
                  className="w-full"
                  min={1}
                  max={refundingMaxAmount}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="note"
                label={
                  <span className="text-xs font-bold text-slate-600">
                    Ghi chú hoàn tiền
                  </span>
                }
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Ví dụ: Hoàn trả tiền cọc do thay đổi lịch nhóm định kỳ..."
                />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => setIsRefundModalOpen(false)}>Hủy</Button>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={refundMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Xác nhận hoàn tiền
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      )}
    </Drawer>
  )
}
