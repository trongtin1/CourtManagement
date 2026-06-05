import { useEffect } from 'react'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Form,
  Row,
  Slider,
  Space,
  Switch,
  TimePicker,
} from 'antd'
import {
  SaveOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  WalletOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
} from '@/features/facilities/api/useSystemSettingsQueries'
import { toApiError } from '@/utils/errors'

type FormValues = {
  openingTime: dayjs.Dayjs
  closingTime: dayjs.Dayjs
  slotDurationMinutes: number
  minBookingDurationMinutes: number
  maxBookingDurationMinutes: number
  maxPreBookingDays: number
  cancellationThresholdHours: number

  // Deposit & Policies
  enableDeposit: boolean
  depositPercent: number

  // Behind the scenes / existing fields
  enableCancellationFee: boolean
  cancellationFeePercent: number
}

const minBookingMarks: Record<number, string> = {
  30: '30p',
  60: '60p',
  120: '120p',
  180: '180p',
}

const maxBookingMarks: Record<number, string> = {
  60: '60p',
  120: '120p',
  180: '180p',
  240: '240p',
  360: '360p',
}

const preBookingMarks: Record<number, string> = {
  1: '1',
  14: '14',
  30: '30',
  60: '60',
}

const cancellationMarks: Record<number, string> = {
  1: '1h',
  4: '4h',
  12: '12h',
  24: '24h',
  48: '48h',
}

const depositMarks: Record<number, string> = {
  10: '10%',
  30: '30%',
  50: '50%',
  100: '100%',
}

// ────────────────── Reusable sub-components ──────────────────

function SwitchRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="font-medium text-sm text-slate-800">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</div>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  )
}

function SlotDurationPicker({
  value,
  onChange,
}: {
  value?: number
  onChange?: (v: number) => void
}) {
  const options = [
    { value: 15, label: '15 phút' },
    { value: 30, label: '30 phút' },
    { value: 60, label: '60 phút' },
    { value: 90, label: '90 phút' },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange?.(opt.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer border ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ────────────────── Main Page ──────────────────

export function SystemSettingsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()

  const { data: settings, isLoading, refetch, isRefetching } = useSystemSettingsQuery()
  const updateMutation = useUpdateSystemSettingsMutation()

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        openingTime: settings.openingTime
          ? dayjs(settings.openingTime, 'HH:mm:ss')
          : dayjs('06:00', 'HH:mm'),
        closingTime: settings.closingTime
          ? dayjs(settings.closingTime, 'HH:mm:ss')
          : dayjs('22:00', 'HH:mm'),
        slotDurationMinutes: settings.slotDurationMinutes || 60,
        minBookingDurationMinutes: settings.minBookingDurationMinutes || 60,
        maxBookingDurationMinutes: settings.maxBookingDurationMinutes || 180,
        cancellationThresholdHours: settings.cancellationThresholdHours ?? 4,
        enableCancellationFee: !!settings.enableCancellationFee,
        cancellationFeePercent: settings.cancellationFeePercent ?? 20,

        maxPreBookingDays: settings.maxPreBookingDays ?? 14,
        enableDeposit: settings.enableDeposit ?? true,
        depositPercent: settings.depositPercent ?? 30,
      })
    }
  }, [settings, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      if (values.closingTime.isBefore(values.openingTime)) {
        message.error('Giờ đóng cửa không thể trước giờ mở cửa!')
        return
      }

      // 1. Update backend settings
      await updateMutation.mutateAsync({
        openingTime: values.openingTime.format('HH:mm:ss'),
        closingTime: values.closingTime.format('HH:mm:ss'),
        slotDurationMinutes: values.slotDurationMinutes,
        minBookingDurationMinutes: values.minBookingDurationMinutes,
        maxBookingDurationMinutes: values.maxBookingDurationMinutes,
        cancellationThresholdHours: values.cancellationThresholdHours,
        enableCancellationFee: values.enableCancellationFee,
        cancellationFeePercent: values.cancellationFeePercent,
        bufferDurationMinutes: settings?.bufferDurationMinutes || 10,
        minAllowableGapMinutes: settings?.minAllowableGapMinutes || 60,
        timezone: settings?.timezone || 'SE Asia Standard Time',
        maxPreBookingDays: values.maxPreBookingDays,
        enableDeposit: values.enableDeposit,
        depositPercent: values.depositPercent,
      })

      message.success('Cập nhật cấu hình hệ thống thành công!')
    } catch (err) {
      message.error(toApiError(err).message)
    }
  }

  if (isLoading) {
    return <LoadingSpin tip="Đang tải cấu hình hệ thống..." />
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Space className="w-full" direction="vertical" size={24}>
        {/* Top toolbar */}
        <div className="flex items-center justify-end">
          <Space>
            <Button
              icon={<ReloadOutlined />}
              loading={isRefetching}
              onClick={() => refetch()}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={updateMutation.isPending}
            >
              Lưu cài đặt
            </Button>
          </Space>
        </div>

        {/* Card 1 — Giờ hoạt động & Bước thời gian */}
        <Card
          className="border-slate-200 shadow-sm"
          title={
            <span>
              <ClockCircleOutlined className="mr-2 text-blue-500" />
              Giờ hoạt động & Bước thời gian
            </span>
          }
        >
          <Row gutter={[24, 16]}>
            <Col xs={12} sm={6}>
              <Form.Item
                label="Giờ mở cửa"
                name="openingTime"
                rules={[{ required: true, message: 'Vui lòng chọn giờ mở cửa' }]}
              >
                <TimePicker
                  format="HH:mm"
                  className="w-full"
                  allowClear={false}
                  showNow={false}
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item
                label="Giờ đóng cửa"
                name="closingTime"
                rules={[{ required: true, message: 'Vui lòng chọn giờ đóng cửa' }]}
              >
                <TimePicker
                  format="HH:mm"
                  className="w-full"
                  allowClear={false}
                  showNow={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Bước thời gian đặt sân"
                name="slotDurationMinutes"
                tooltip="Khoảng thời gian giữa các khung giờ có thể đặt"
              >
                <SlotDurationPicker />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Card 2 — Quy tắc đặt sân */}
        <Card
          className="border-slate-200 shadow-sm"
          title={
            <span>
              <ControlOutlined className="mr-2 text-blue-500" />
              Quy tắc đặt sân
            </span>
          }
        >
          <Row gutter={[32, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Thời lượng đặt tối thiểu (phút)"
                name="minBookingDurationMinutes"
                tooltip="Khách hàng phải đặt ít nhất số phút này"
              >
                <Slider
                  min={30}
                  max={180}
                  step={30}
                  marks={minBookingMarks}
                  tooltip={{ formatter: (val) => `${val} phút` }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Thời lượng đặt tối đa (phút)"
                name="maxBookingDurationMinutes"
                tooltip="Giới hạn tối đa một lần đặt sân"
              >
                <Slider
                  min={60}
                  max={360}
                  step={30}
                  marks={maxBookingMarks}
                  tooltip={{ formatter: (val) => `${val} phút` }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Cho phép đặt trước (ngày)"
                name="maxPreBookingDays"
                tooltip="Số ngày tối đa trước ngày chơi mà khách có thể đặt"
              >
                <Slider
                  min={1}
                  max={60}
                  step={1}
                  marks={preBookingMarks}
                  tooltip={{ formatter: (val) => `${val} ngày` }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Thời hạn hủy sân (giờ)"
                name="cancellationThresholdHours"
                tooltip="Hủy trước thời điểm đặt ít nhất số giờ này để được hoàn tiền"
              >
                <Slider
                  min={1}
                  max={48}
                  step={1}
                  marks={cancellationMarks}
                  tooltip={{ formatter: (val) => `${val} giờ` }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Conflict warning — belongs to this card */}
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) =>
              prev.minBookingDurationMinutes !== curr.minBookingDurationMinutes ||
              prev.slotDurationMinutes !== curr.slotDurationMinutes
            }
          >
            {({ getFieldValue }) => {
              const minBooking = getFieldValue('minBookingDurationMinutes') || 60
              const slotDuration = getFieldValue('slotDurationMinutes') || 30
              if (minBooking > slotDuration) {
                return (
                  <Alert
                    message={`Cảnh báo: thời lượng tối thiểu (${minBooking}p) lớn hơn bước thời gian (${slotDuration}p). Kiểm tra lại để tránh xung đột.`}
                    type="warning"
                    showIcon
                    className="mt-2"
                  />
                )
              }
              return null
            }}
          </Form.Item>
        </Card>

        {/* Card 3 — Chính sách thanh toán & vận hành */}
        <Card
          className="border-slate-200 shadow-sm"
          title={
            <span>
              <WalletOutlined className="mr-2 text-blue-500" />
              Chính sách đặt cọc
            </span>
          }
        >
          <Row gutter={[32, 0]}>
            <Col xs={24} md={24}>
              <div className="divide-y divide-slate-100">
                <SwitchRow
                  title="Yêu cầu đặt cọc"
                  description="Khách thanh toán một phần khi đặt sân."
                >
                  <Form.Item name="enableDeposit" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                </SwitchRow>

                {/* Deposit percent — conditional */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) => prev.enableDeposit !== curr.enableDeposit}
                >
                  {({ getFieldValue }) => {
                    if (!getFieldValue('enableDeposit')) return null
                    return (
                      <div className="py-3">
                        <Form.Item
                          label="Phần trăm đặt cọc"
                          name="depositPercent"
                          className="mb-0"
                        >
                          <Slider
                            min={10}
                            max={100}
                            step={5}
                            marks={depositMarks}
                            tooltip={{ formatter: (val) => `${val}%` }}
                          />
                        </Form.Item>
                      </div>
                    )
                  }}
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Card>
      </Space>
    </Form>
  )
}
