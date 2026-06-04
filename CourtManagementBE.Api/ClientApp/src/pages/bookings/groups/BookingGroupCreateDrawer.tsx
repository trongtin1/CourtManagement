import { useState } from 'react'
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  InputNumber,
  Space,
  App,
  Checkbox,
} from 'antd'
import { UserOutlined, EnvironmentOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import { useCreateBookingGroupMutation } from '@/features/bookings/api/useBookingGroupQueries'
import { useCourtsQuery } from '@/features/courts/api/useCourtQueries'
import { useCustomersQuery } from '@/features/customers/api/useCustomerQueries'
import { useSystemSettingsQuery } from '@/features/facilities/api/useSystemSettingsQueries'
import { getDisabledTime } from '@/utils/format'
import { toApiError } from '@/utils/errors'
import type {
  BookingGroupType,
  CreateBookingGroupRequest,
} from '@/features/bookings/model/types'

interface BookingGroupCreateDrawerProps {
  open: boolean
  onClose: () => void
  facilityId: number
}

interface FormValues {
  customerID?: number | null
  courtID?: number
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs]
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs]
  totalAmount?: number
  paidAmount?: number
  note?: string
}

const DAYS_OF_WEEK = [
  { label: 'T2', value: '1' },
  { label: 'T3', value: '2' },
  { label: 'T4', value: '3' },
  { label: 'T5', value: '4' },
  { label: 'T6', value: '5' },
  { label: 'T7', value: '6' },
  { label: 'CN', value: '0' },
]

export function BookingGroupCreateDrawer({
  open,
  onClose,
  facilityId,
}: BookingGroupCreateDrawerProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const createMutation = useCreateBookingGroupMutation()

  // Queries
  const { data: courtsData } = useCourtsQuery({ page: 1, pageSize: 100 })
  const { data: customersData } = useCustomersQuery({ page: 1, pageSize: 100 })
  const { data: facility } = useSystemSettingsQuery()

  const courts = courtsData?.items ?? []
  const customers = customersData?.items ?? []

  // Component States
  const groupType: BookingGroupType = 'returning'
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [isFlatRate, setIsFlatRate] = useState(false)

  const toggleDay = (dayValue: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue],
    )
  }

  const handleFinish = async (values: FormValues) => {
    if (groupType === 'returning') {
      if (selectedDays.length === 0) {
        message.warning('Vui lòng chọn ít nhất một ngày lặp trong tuần.')
        return
      }
      if (!values.dateRange) {
        message.warning('Vui lòng chọn thời gian bắt đầu và kết thúc.')
        return
      }
      if (!values.timeRange) {
        message.warning('Vui lòng chọn giờ chơi.')
        return
      }
    }

    try {
      const payload: CreateBookingGroupRequest = {
        groupType,
        customerID: values.customerID || null,
        facilityID: facilityId,
        totalAmount: isFlatRate ? values.totalAmount || 0 : 0,
        paidAmount: values.paidAmount || 0,
        status: 'Active',
        note: values.note || '',
      }

      if (groupType === 'returning') {
        const [startDate, endDate] = values.dateRange!
        const [startTime, endTime] = values.timeRange!

        payload.recurringConfig = {
          courtID: values.courtID!,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          daysOfWeek: selectedDays.join(','),
          startTime: startTime.format('HH:mm:ss'),
          endTime: endTime.format('HH:mm:ss'),
        }
      }

      const successMessage = await createMutation.mutateAsync(payload)
      message.success(successMessage)
      form.resetFields()
      setSelectedDays([])
      onClose()
    } catch (err) {
      console.error(err)
      message.error(toApiError(err).message)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={460}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <span className="font-bold text-base">Tạo Nhóm Đặt Sân Định Kỳ</span>
        </div>
      }
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={createMutation.isPending}
            size="medium"
          >
            Lưu & Sinh Lịch
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          groupType: 'returning',
          totalAmount: 0,
          paidAmount: 0,
        }}
      >
        {/* Khách hàng */}
        <Form.Item label="Khách hàng đại diện" name="customerID">
          <Select
            showSearch
            placeholder="Tìm chọn khách hàng..."
            optionFilterProp="label"
            suffixIcon={<UserOutlined />}
            options={customers.map((c) => ({
              label: `${c.customerName} - ${c.phone}`,
              value: c.customerID,
            }))}
          />
        </Form.Item>

        {/* Khung giờ định kỳ */}
        {groupType === 'returning' && (
          <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 mb-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Cấu hình đặt lịch định kỳ
            </h4>

            {/* Chọn Sân */}
            <Form.Item
              label="Chọn sân áp dụng"
              name="courtID"
              rules={[{ required: true, message: 'Vui lòng chọn sân' }]}
            >
              <Select
                placeholder="Chọn sân..."
                suffixIcon={<EnvironmentOutlined />}
                options={courts.map((c) => ({
                  label: c.courtName,
                  value: c.courtID,
                }))}
              />
            </Form.Item>

            {/* Thứ trong tuần */}
            <Form.Item label="Lặp vào các ngày" required>
              <div className="flex justify-between gap-1 mt-1">
                {DAYS_OF_WEEK.map((d) => {
                  const active = selectedDays.includes(d.value)
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 8,
                        border: '1px solid',
                        borderColor: active ? '#0d9488' : '#e2e8f0',
                        background: active ? '#f0fdf4' : '#fff',
                        color: active ? '#0f766e' : '#64748b',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </Form.Item>

            {/* Thời gian */}
            <Form.Item
              label="Thời hạn (Từ ngày – Đến ngày)"
              name="dateRange"
              rules={[{ required: true, message: 'Vui lòng chọn khoảng ngày' }]}
            >
              <DatePicker.RangePicker
                format="DD/MM/YYYY"
                className="w-full"
                placeholder={['Bắt đầu', 'Kết thúc']}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            {/* Khung giờ */}
            <Form.Item
              label="Giờ chơi (Giờ bắt đầu – Giờ kết thúc)"
              name="timeRange"
              rules={[{ required: true, message: 'Vui lòng chọn giờ chơi' }]}
            >
              <TimePicker.RangePicker
                format="HH:mm"
                minuteStep={facility?.slotDurationMinutes as undefined}
                className="w-full"
                placeholder={['Từ giờ', 'Đến giờ']}
                disabledTime={getDisabledTime(
                  facility?.openingTime,
                  facility?.closingTime,
                )}
              />
            </Form.Item>
          </div>
        )}

        {/* Đặt trọn gói */}
        <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 mb-4">
          <Form.Item name="isFlatRate" valuePropName="checked" className="mb-2">
            <Checkbox
              checked={isFlatRate}
              onChange={(e) => setIsFlatRate(e.target.checked)}
            >
              <span className="font-semibold text-slate-700">
                Áp dụng giá trọn gói (Flat-rate)
              </span>
            </Checkbox>
          </Form.Item>

          {isFlatRate && (
            <Form.Item
              label="Giá trọn gói toàn lịch"
              name="totalAmount"
              rules={[{ required: true, message: 'Vui lòng nhập giá trọn gói' }]}
            >
              <InputNumber<number>
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                className="w-full"
                addonAfter="đ"
                min={0}
                placeholder="Nhập giá trọn gói cố định cho toàn bộ lịch..."
              />
            </Form.Item>
          )}

          {/* Đã thanh toán trước / Cọc */}
          <Form.Item
            label="Đã thanh toán trước (Quỹ cọc)"
            name="paidAmount"
            className="mb-0"
          >
            <InputNumber<number>
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value?.replace(/,/g, '') || 0)}
              className="w-full"
              addonAfter="đ"
              min={0}
              placeholder="Nhập số tiền nạp quỹ cọc trước nếu có..."
            />
          </Form.Item>
        </div>

        {/* Ghi chú */}
        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea
            rows={3}
            placeholder="Ghi chú về nhóm đặt sân, giải đấu hoặc yêu cầu dịch vụ khác..."
          />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
