import { useEffect } from 'react'
import {
  App,
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  TimePicker,
  Typography,
  Tooltip,
} from 'antd'
import {
  SettingOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
} from '@/features/facilities/api/useSystemSettingsQueries'
import { toApiError } from '@/utils/errors'

const { Title, Paragraph } = Typography

type FormValues = {
  openingTime: dayjs.Dayjs
  closingTime: dayjs.Dayjs
  slotDurationMinutes: number
  enableCancellationFee: boolean
  cancellationFeePercent: number
  cancellationThresholdHours: number
}

export function SystemSettingsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()

  const { data: settings, isLoading } = useSystemSettingsQuery()
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
        enableCancellationFee: !!settings.enableCancellationFee,
        cancellationFeePercent: settings.cancellationFeePercent ?? 20,
        cancellationThresholdHours: settings.cancellationThresholdHours ?? 24,
      })
    }
  }, [settings, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      if (values.closingTime.isBefore(values.openingTime)) {
        message.error('Giờ đóng cửa không thể trước giờ mở cửa!')
        return
      }

      await updateMutation.mutateAsync({
        openingTime: values.openingTime.format('HH:mm:ss'),
        closingTime: values.closingTime.format('HH:mm:ss'),
        slotDurationMinutes: values.slotDurationMinutes,
        enableCancellationFee: values.enableCancellationFee,
        cancellationFeePercent: values.cancellationFeePercent,
        cancellationThresholdHours: values.cancellationThresholdHours,
        timezone: settings?.timezone || 'SE Asia Standard Time',
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
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-left">
        <Space align="start" size={16}>
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-100">
            <SettingOutlined />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 4, fontWeight: 700 }}>
              Cài đặt Hệ thống
            </Title>
            <Paragraph type="secondary" className="text-sm m-0">
              Quản lý các thông số cốt lõi của hệ thống bao gồm giờ hoạt động, thời lượng
              slot mặc định, và chính sách phạt hủy đặt sân.
            </Paragraph>
          </div>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-6 text-left"
      >
        {/* Section 1: Thời gian & Slot */}
        <Card
          className="rounded-2xl border-slate-200 shadow-xs overflow-hidden"
          title={
            <div className="flex items-center gap-2.5 py-1">
              <ClockCircleOutlined className="text-blue-500 text-lg" />
              <span className="font-bold text-slate-800 text-[16px]">
                Giờ hoạt động & Khung giờ chơi
              </span>
            </div>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700">
                    Giờ mở cửa <span className="text-red-500">*</span>
                  </span>
                }
                name="openingTime"
                rules={[{ required: true, message: 'Vui lòng chọn giờ mở cửa' }]}
              >
                <TimePicker
                  format="HH:mm"
                  className="w-full rounded-xl py-2 px-3.5"
                  allowClear={false}
                  showNow={false}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700">
                    Giờ đóng cửa <span className="text-red-500">*</span>
                  </span>
                }
                name="closingTime"
                rules={[{ required: true, message: 'Vui lòng chọn giờ đóng cửa' }]}
              >
                <TimePicker
                  format="HH:mm"
                  className="w-full rounded-xl py-2 px-3.5"
                  allowClear={false}
                  showNow={false}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label={
                  <Space>
                    <span className="font-semibold text-slate-700">
                      Thời lượng một slot
                    </span>
                    <Tooltip title="Độ dài chuẩn của mỗi slot khi khách hàng đặt sân. Thay đổi này sẽ ảnh hưởng trực tiếp tới cách phân khung giờ trên dòng thời gian.">
                      <QuestionCircleOutlined className="text-slate-400 text-xs" />
                    </Tooltip>
                  </Space>
                }
                name="slotDurationMinutes"
                rules={[{ required: true, message: 'Vui lòng chọn thời lượng slot' }]}
              >
                <Select
                  size="large"
                  className="w-full"
                  options={[
                    { value: 30, label: '30 phút' },
                    { value: 60, label: '60 phút (1 tiếng)' },
                    { value: 90, label: '90 phút (1.5 tiếng)' },
                    { value: 120, label: '120 phút (2 tiếng)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Section 2: Chính sách Hủy đặt sân */}
        <Card
          className="rounded-2xl border-slate-200 shadow-xs overflow-hidden"
          title={
            <div className="flex items-center gap-2.5 py-1">
              <PercentageOutlined className="text-rose-500 text-lg" />
              <span className="font-bold text-slate-800 text-[16px]">
                Chính sách hủy sân & Phí phạt
              </span>
            </div>
          }
        >
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
            <div className="pr-4">
              <div className="font-bold text-slate-800 text-[14px]">
                Áp dụng phí hủy sân
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Kích hoạt để tự động tính phí phạt hủy sân nếu khách hàng hủy lịch sát giờ
                chơi.
              </div>
            </div>
            <Form.Item name="enableCancellationFee" valuePropName="checked" noStyle>
              <Switch size="default" />
            </Form.Item>
          </div>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) =>
              prev.enableCancellationFee !== curr.enableCancellationFee
            }
          >
            {({ getFieldValue }) => {
              const enabled = getFieldValue('enableCancellationFee')
              if (!enabled) return null

              return (
                <Row
                  gutter={[24, 24]}
                  className="animate-in slide-in-from-top-3 duration-200"
                >
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          <span className="font-semibold text-slate-700">
                            Tỷ lệ phí phạt hủy sân
                          </span>
                          <Tooltip title="Số phần trăm tiền cọc/tiền thuê sân bị giữ lại làm phí phạt khi khách hàng thực hiện hủy sân vi phạm chính sách thời gian.">
                            <QuestionCircleOutlined className="text-slate-400 text-xs" />
                          </Tooltip>
                        </Space>
                      }
                      name="cancellationFeePercent"
                      rules={[
                        { required: true, message: 'Nhập tỷ lệ phí phạt' },
                        {
                          type: 'number',
                          min: 0,
                          max: 100,
                          message: 'Tỷ lệ phải từ 0% đến 100%',
                        },
                      ]}
                    >
                      <InputNumber
                        className="w-full font-bold"
                        addonAfter="%"
                        min={0}
                        max={100}
                        size="large"
                        controls={true}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          <span className="font-semibold text-slate-700">
                            Thời gian giới hạn hủy miễn phí
                          </span>
                          <Tooltip title="Thời hạn trước giờ chơi tối thiểu (tính bằng tiếng) để khách hàng được phép hủy sân mà KHÔNG bị tính phí phạt.">
                            <QuestionCircleOutlined className="text-slate-400 text-xs" />
                          </Tooltip>
                        </Space>
                      }
                      name="cancellationThresholdHours"
                      rules={[
                        { required: true, message: 'Nhập thời gian giới hạn' },
                        { type: 'number', min: 0, message: 'Thời gian không được âm' },
                      ]}
                    >
                      <InputNumber
                        className="w-full font-bold"
                        addonAfter="tiếng trước giờ chơi"
                        min={0}
                        size="large"
                        controls={true}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )
            }}
          </Form.Item>
        </Card>

        {/* Info Tip Block */}
        <div className="flex gap-3 bg-blue-50/40 border border-blue-100 p-4 rounded-2xl">
          <InfoCircleOutlined className="text-blue-500 text-lg mt-0.5" />
          <p className="text-xs text-blue-800 m-0 leading-relaxed">
            Các thay đổi về <strong>Giờ mở/đóng cửa</strong> và{' '}
            <strong>Thời lượng slot</strong> sẽ có hiệu lực ngay lập tức đối với tất cả
            các chế độ xem lịch trình và chức năng chọn giờ chơi trên ứng dụng. Hãy chắc
            chắn rằng bạn đã tham khảo ý kiến kỹ thuật trước khi điều chỉnh các tham số
            này để tránh gián đoạn các đặt sân hiện có.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            loading={updateMutation.isPending}
            className="px-8 rounded-xl font-bold h-12 bg-linear-to-r from-blue-600 to-blue-700 border-0 shadow-md shadow-blue-100 hover:brightness-95"
          >
            Lưu Cài đặt
          </Button>
        </div>
      </Form>
    </div>
  )
}
