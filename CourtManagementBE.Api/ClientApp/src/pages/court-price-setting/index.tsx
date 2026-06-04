import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Form,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Checkbox,
  DatePicker,
  Tooltip,
  Radio,
  TimePicker,
} from 'antd'
import dayjs from 'dayjs'
import {
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import {
  useCourtDefaultPriceRulesQuery,
  useCreateCourtDefaultPriceRuleMutation,
  useDeleteCourtDefaultPriceRuleMutation,
  useUpdateCourtDefaultPriceRuleMutation,
} from '@/features/courts/api/useCourtDefaultPriceRuleQueries'
import { usePriceRuleTypesQuery } from '@/features/courts/api/usePriceRuleTypeQueries'
import type {
  CourtDefaultPriceRule,
  CreateCourtDefaultPriceRuleRequest,
  PriceRuleType,
  UpdateCourtDefaultPriceRuleRequest,
} from '@/features/courts/model/types'
import { toApiError } from '@/utils/errors'
import { useSystemSettingsQuery } from '@/features/facilities/api/useSystemSettingsQueries'
import { getDisabledTime } from '@/utils/format'
import { formatCurrency, formatTime, toTimeSpan } from '@/utils/format'

const days = [
  { value: 1, label: 'Thứ 2', shortLabel: 'T2' },
  { value: 2, label: 'Thứ 3', shortLabel: 'T3' },
  { value: 3, label: 'Thứ 4', shortLabel: 'T4' },
  { value: 4, label: 'Thứ 5', shortLabel: 'T5' },
  { value: 5, label: 'Thứ 6', shortLabel: 'T6' },
  { value: 6, label: 'Thứ 7', shortLabel: 'T7' },
  { value: 0, label: 'Chủ nhật', shortLabel: 'CN' },
]

type FormValues = {
  priceRuleTypeID?: number | null
  dayOfWeek?: number | null
  specificDate?: dayjs.Dayjs | null
  startTime: dayjs.Dayjs
  endTime: dayjs.Dayjs
  price: number
  isLoadDefault: boolean
  isMapping: boolean
  isActive: boolean
}

const buildPayload = (
  values: FormValues,
  configType: 'weekly' | 'specific',
): CreateCourtDefaultPriceRuleRequest => ({
  priceRuleTypeID: values.priceRuleTypeID ?? null,
  dayOfWeek: configType === 'weekly' ? values.dayOfWeek : null,
  specificDate:
    configType === 'specific' && values.specificDate
      ? values.specificDate.format('YYYY-MM-DD')
      : null,
  startTime: values.startTime ? toTimeSpan(values.startTime.format('HH:mm')) : '',
  endTime: values.endTime ? toTimeSpan(values.endTime.format('HH:mm')) : '',
  price: Number(values.price),
  isLoadDefault: !!values.isLoadDefault,
  isMapping: !!values.isMapping,
  isActive: values.isActive,
})

export default function CourtPriceSettingPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [selectedDay, setSelectedDay] = useState(1)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { data: facility } = useSystemSettingsQuery()

  const [configType, setConfigType] = useState<'weekly' | 'specific'>('weekly')

  const rulesQuery = useCourtDefaultPriceRulesQuery()
  const createMut = useCreateCourtDefaultPriceRuleMutation()
  const updateMut = useUpdateCourtDefaultPriceRuleMutation()
  const deleteMut = useDeleteCourtDefaultPriceRuleMutation()
  const priceRuleTypesQuery = usePriceRuleTypesQuery({ page: 1, pageSize: 1000 })

  const rules = useMemo(() => rulesQuery.data?.items ?? [], [rulesQuery.data?.items])
  const priceRuleTypes = useMemo(
    () =>
      [...(priceRuleTypesQuery.data?.items ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
      ),
    [priceRuleTypesQuery.data?.items],
  )
  const priceRuleTypeById = useMemo(
    () => new Map(priceRuleTypes.map((type) => [type.priceRuleTypeID, type] as const)),
    [priceRuleTypes],
  )

  const renderPriceRuleType = (priceRuleTypeID?: number | null) => {
    if (!priceRuleTypeID) {
      return <Tag>Mac dinh</Tag>
    }

    const type = priceRuleTypeById.get(priceRuleTypeID)
    if (!type) {
      return <Tag>{priceRuleTypeID}</Tag>
    }

    return <Tag color={type.colorCode || undefined}>{type.name}</Tag>
  }

  const selectedDayRules = useMemo(
    () =>
      rules
        .filter((rule) =>
          selectedDay === -1 ? rule.dayOfWeek == null : rule.dayOfWeek === selectedDay,
        )
        .sort((a, b) => formatTime(a.startTime).localeCompare(formatTime(b.startTime))),
    [rules, selectedDay],
  )

  const groupedRules = useMemo(
    () =>
      days.map((day) => ({
        ...day,
        rules: rules
          .filter((rule) =>
            day.value === -1 ? rule.dayOfWeek == null : rule.dayOfWeek === day.value,
          )
          .sort((a, b) => formatTime(a.startTime).localeCompare(formatTime(b.startTime))),
      })),
    [rules],
  )

  const openCreate = () => {
    setEditingId(null)
    setIsFormVisible(true)
    form.resetFields()
    setConfigType(selectedDay === -1 ? 'specific' : 'weekly')

    const defaultStart = facility?.openingTime
      ? facility.openingTime.substring(0, 5)
      : '06:00'
    const defaultEnd = dayjs(defaultStart, 'HH:mm').add(1, 'hour').format('HH:mm')

    form.setFieldsValue({
      priceRuleTypeID: null,
      dayOfWeek: selectedDay === -1 ? null : selectedDay,
      specificDate: null,
      startTime: dayjs(defaultStart, 'HH:mm'),
      endTime: dayjs(defaultEnd, 'HH:mm'),
      price: 100000,
      isLoadDefault: true,
      isMapping: false,
      isActive: true,
    })
  }

  const openEdit = (record: CourtDefaultPriceRule) => {
    setEditingId(record.courtDefaultPriceRuleID)
    setIsFormVisible(true)
    setSelectedDay(record.dayOfWeek ?? -1)
    setConfigType(record.dayOfWeek == null ? 'specific' : 'weekly')
    form.setFieldsValue({
      priceRuleTypeID: record.priceRuleTypeID ?? null,
      dayOfWeek: record.dayOfWeek ?? null,
      specificDate: record.specificDate ? dayjs(record.specificDate) : null,
      startTime: dayjs(record.startTime, 'HH:mm:ss'),
      endTime: dayjs(record.endTime, 'HH:mm:ss'),
      price: record.price,
      isLoadDefault: record.isLoadDefault,
      isMapping: record.isMapping,
      isActive: record.isActive,
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = buildPayload(values, configType)
      if (editingId) {
        await updateMut.mutateAsync({
          id: editingId,
          data: payload as UpdateCourtDefaultPriceRuleRequest,
        })
        message.success('Cập nhật khung giá thành công')
        setIsFormVisible(false)
        setEditingId(null)
      } else {
        await createMut.mutateAsync(payload)
        message.success('Tạo khung giá thành công')
        setIsFormVisible(false)
        setEditingId(null)
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMut.mutateAsync(id)
      message.success('Xóa khung giá thành công')
      if (editingId === id) {
        setIsFormVisible(false)
        setEditingId(null)
      }
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (rulesQuery.isPending) {
    return <LoadingSpin tip="Đang tải cấu hình giá sân..." />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <Typography.Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            Cấu hình giá sân mặc định
          </Typography.Title>
          <Typography.Text type="secondary" className="text-slate-500">
            Thiết lập giá cho các ngày trong tuần hoặc cấu hình ngày đặc biệt hằng tuần
          </Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={openCreate}
          className="rounded-xl px-5 h-11 text-[15px] font-medium"
        >
          Thêm khung giá
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div
          className={`${isFormVisible ? 'xl:col-span-2' : 'xl:col-span-3'} flex flex-col gap-6 transition-all duration-300`}
        >
          <Card
            styles={{ body: { padding: '24px' } }}
            className="rounded-2xl shadow-sm border-slate-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Weekly Days Section */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Cấu hình hằng tuần
                </div>
                <div className="flex overflow-x-auto gap-3 pb-2 lg:pb-0 scrollbar-thin">
                  {groupedRules.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => {
                        setSelectedDay(day.value)
                        if (!editingId) {
                          setConfigType('weekly')
                          form.setFieldsValue({
                            dayOfWeek: day.value,
                            specificDate: null,
                          })
                        }
                      }}
                      className={`min-w-24 rounded-xl border px-3.5 py-3 text-left transition shrink-0 ${
                        selectedDay === day.value
                          ? 'bg-[#111827] border-[#111827]'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`font-semibold text-[14px] ${
                          selectedDay === day.value ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {day.label}
                      </div>
                      <div
                        className={`mt-1 text-xs ${
                          selectedDay === day.value ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {day.rules.length} khung giá
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden lg:block h-14 w-px bg-slate-200 self-end mb-1" />

              {/* Specific Date Section */}
              <div className="shrink-0 flex flex-col">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Ngày đặc biệt / Ngày lễ
                </div>
                <button
                  onClick={() => {
                    setSelectedDay(-1)
                    if (!editingId) {
                      setConfigType('specific')
                      form.setFieldsValue({
                        dayOfWeek: null,
                        specificDate: null,
                      })
                    }
                  }}
                  className={`min-w-44 rounded-xl border px-4 py-3 text-left transition shrink-0 flex items-center justify-between gap-4 ${
                    selectedDay === -1
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-blue-50/50 border-blue-100 hover:border-blue-200 text-blue-800'
                  }`}
                >
                  <div>
                    <div
                      className={`font-semibold text-[14px] ${selectedDay === -1 ? 'text-white' : 'text-blue-900'}`}
                    >
                      Ngày cụ thể
                    </div>
                    <div
                      className={`mt-1 text-xs ${selectedDay === -1 ? 'text-blue-200' : 'text-blue-500'}`}
                    >
                      {rules.filter((r) => r.dayOfWeek == null).length} khung cấu hình
                    </div>
                  </div>
                  <CalendarOutlined
                    className={`text-lg ${selectedDay === -1 ? 'text-white' : 'text-blue-600'}`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card
            className="rounded-2xl shadow-sm border-slate-200"
            styles={{ body: { padding: 0 } }}
          >
            <div className="p-6 border-b border-slate-100">
              <Typography.Title level={4} style={{ margin: 0, fontWeight: 500 }}>
                Khung giá của{' '}
                {selectedDay === -1
                  ? 'Ngày cụ thể'
                  : days.find((day) => day.value === selectedDay)?.label}
              </Typography.Title>
            </div>

            <Table
              columns={[
                ...(selectedDay === -1
                  ? [
                      {
                        title: 'Ngày áp dụng',
                        dataIndex: 'specificDate',
                        render: (value: string) => (
                          <Typography.Text strong className="text-blue-600">
                            {dayjs(value).format('DD/MM/YYYY')}
                          </Typography.Text>
                        ),
                      },
                    ]
                  : []),
                {
                  title: 'Khung giờ',
                  key: 'time',
                  render: (_: unknown, record: CourtDefaultPriceRule) => (
                    <Typography.Text strong className="text-slate-700">
                      {formatTime(record.startTime)} - {formatTime(record.endTime)}
                    </Typography.Text>
                  ),
                },
                {
                  title: 'Giá',
                  dataIndex: 'price',
                  render: (value: number) => (
                    <Typography.Text strong className="text-slate-700">
                      {formatCurrency(value)}
                    </Typography.Text>
                  ),
                },
                {
                  title: 'Loại giá',
                  dataIndex: 'priceRuleTypeID',
                  render: (value: number | null | undefined) =>
                    renderPriceRuleType(value),
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'isActive',
                  render: (value: boolean) =>
                    value ? (
                      <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">
                        Đang áp dụng
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Đã tắt
                      </span>
                    ),
                },
                {
                  title: 'Thao tác',
                  align: 'right',
                  render: (_: unknown, record: CourtDefaultPriceRule) => (
                    <Space size={8}>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => openEdit(record)}
                        className="text-slate-600"
                      />
                      <Popconfirm
                        title="Xóa khung giá này?"
                        onConfirm={() => handleDelete(record.courtDefaultPriceRuleID)}
                      >
                        <Button icon={<DeleteOutlined />} className="text-slate-600" />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
              dataSource={selectedDayRules}
              loading={rulesQuery.isFetching}
              pagination={false}
              rowKey="courtDefaultPriceRuleID"
              rowClassName={(record) =>
                editingId === record.courtDefaultPriceRuleID ? 'bg-blue-50' : ''
              }
            />
          </Card>
        </div>

        {isFormVisible && (
          <div className="xl:col-span-1">
            <Card
              className="rounded-2xl shadow-sm border-slate-200 sticky top-6"
              styles={{ body: { padding: '24px' } }}
            >
              <Typography.Title
                level={4}
                style={{ marginTop: 0, marginBottom: 8, fontWeight: 500 }}
              >
                {editingId ? 'Sửa khung giá' : 'Thêm khung giá'}
              </Typography.Title>
              <Typography.Paragraph type="secondary" className="mb-6 text-[14px]">
                Dùng cho giá mặc định hằng tuần, chưa bao gồm ngày lễ.
              </Typography.Paragraph>

              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  priceRuleTypeID: null,
                  dayOfWeek: selectedDay,
                  startTime: dayjs('06:00', 'HH:mm'),
                  endTime: dayjs('07:00', 'HH:mm'),
                  price: 100000,
                  applyMode: 'default',
                  isActive: true,
                }}
              >
                <Form.Item
                  label={
                    <span className="font-medium text-slate-800">Loại cấu hình</span>
                  }
                >
                  <Radio.Group
                    optionType="button"
                    buttonStyle="solid"
                    value={configType}
                    onChange={(e) => setConfigType(e.target.value)}
                    className="w-full flex"
                  >
                    <Radio.Button value="weekly" className="flex-1 text-center">
                      Ngày trong tuần
                    </Radio.Button>
                    <Radio.Button value="specific" className="flex-1 text-center">
                      Ngày cụ thể
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                {configType === 'weekly' && (
                  <Form.Item
                    label={
                      <span className="font-medium text-slate-800">Ngày trong tuần</span>
                    }
                    name="dayOfWeek"
                    rules={[{ required: true, message: 'Chọn ngày trong tuần' }]}
                  >
                    <Select
                      size="large"
                      options={days.map((day) => ({
                        value: day.value,
                        label: day.label,
                      }))}
                      onChange={(value) => setSelectedDay(value)}
                    />
                  </Form.Item>
                )}

                {configType === 'specific' && (
                  <Form.Item
                    label={
                      <span className="font-medium text-slate-800">Chọn ngày cụ thể</span>
                    }
                    name="specificDate"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày cụ thể' }]}
                  >
                    <DatePicker
                      size="large"
                      className="w-full"
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label={<span className="font-medium text-slate-800">Loại giá</span>}
                  name="priceRuleTypeID"
                >
                  <Select
                    allowClear
                    loading={priceRuleTypesQuery.isFetching}
                    options={priceRuleTypes.map((type: PriceRuleType) => ({
                      value: type.priceRuleTypeID,
                      label: type.name,
                    }))}
                    placeholder="Mặc định"
                    size="large"
                  />
                </Form.Item>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700 tracking-wider">
                    CÁCH ÁP DỤNG KHUNG GIÁ
                  </div>
                  <div className="flex gap-6 items-center">
                    <Form.Item name="isLoadDefault" valuePropName="checked" noStyle>
                      <Checkbox className="font-semibold text-slate-800 text-xs">
                        <Tooltip title="Áp dụng làm giá chuẩn cho các khung giờ">
                          <span>
                            Giá mặc định (Chuẩn){' '}
                            <QuestionCircleOutlined className="text-slate-400 text-[10px] ml-0.5" />
                          </span>
                        </Tooltip>
                      </Checkbox>
                    </Form.Item>
                    <Form.Item name="isMapping" valuePropName="checked" noStyle>
                      <Checkbox className="font-semibold text-slate-800 text-xs">
                        <Tooltip title="Ghi đè lên các mức giá chuẩn (thường áp dụng cho khung giờ cao điểm, sự kiện)">
                          <span>
                            Giá ghi đè (Đặc biệt){' '}
                            <QuestionCircleOutlined className="text-slate-400 text-[10px] ml-0.5" />
                          </span>
                        </Tooltip>
                      </Checkbox>
                    </Form.Item>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label={
                      <span className="font-medium text-slate-800">Giờ bắt đầu</span>
                    }
                    name="startTime"
                    rules={[
                      { required: true, message: 'Nhập giờ bắt đầu' },
                      () => ({
                        validator(_, value) {
                          if (!value || !facility) return Promise.resolve()
                          const timeStr = value.format('HH:mm')
                          const openStr = facility.openingTime.substring(0, 5)
                          const closeStr = facility.closingTime.substring(0, 5)
                          if (timeStr < openStr || timeStr > closeStr) {
                            return Promise.reject(
                              new Error(`Phải từ ${openStr} đến ${closeStr}`),
                            )
                          }
                          return Promise.resolve()
                        },
                      }),
                    ]}
                  >
                    <TimePicker
                      format="HH:mm"
                      size="large"
                      className="w-full"
                      placeholder="Giờ bắt đầu"
                      disabledTime={getDisabledTime(
                        facility?.openingTime,
                        facility?.closingTime,
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span className="font-medium text-slate-800">Giờ kết thúc</span>
                    }
                    name="endTime"
                    rules={[
                      { required: true, message: 'Nhập giờ kết thúc' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || !facility) return Promise.resolve()
                          const timeStr = value.format('HH:mm')
                          const openStr = facility.openingTime.substring(0, 5)
                          const closeStr = facility.closingTime.substring(0, 5)
                          if (timeStr < openStr || timeStr > closeStr) {
                            return Promise.reject(
                              new Error(`Phải từ ${openStr} đến ${closeStr}`),
                            )
                          }
                          const startTime = getFieldValue('startTime')
                          if (startTime && value.isBefore(startTime)) {
                            return Promise.reject(new Error('Phải sau giờ bắt đầu'))
                          }
                          return Promise.resolve()
                        },
                      }),
                    ]}
                  >
                    <TimePicker
                      format="HH:mm"
                      size="large"
                      className="w-full"
                      placeholder="Giờ kết thúc"
                      disabledTime={getDisabledTime(
                        facility?.openingTime,
                        facility?.closingTime,
                      )}
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="font-medium text-slate-800">Giá tiền</span>}
                  name="price"
                  rules={[{ required: true, message: 'Nhập giá tiền' }]}
                >
                  <InputNumber className="w-full" size="large" controls={false} min={0} />
                </Form.Item>

                <Form.Item
                  name="isActive"
                  valuePropName="checked"
                  className="mb-8 p-3 border border-slate-100 rounded-xl bg-slate-50/50"
                >
                  <Checkbox className="font-medium text-slate-800">Đang áp dụng</Checkbox>
                </Form.Item>

                <div className="flex items-center gap-3">
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={createMut.isPending || updateMut.isPending}
                    onClick={handleSubmit}
                    className="flex-1"
                  >
                    Lưu
                  </Button>
                  <Button
                    size="large"
                    onClick={() => {
                      setIsFormVisible(false)
                      setEditingId(null)
                    }}
                    className="px-6 rounded-lg font-medium text-slate-700"
                  >
                    Hủy
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
