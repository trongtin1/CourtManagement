import { useMemo, useState, useEffect } from 'react'
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Checkbox,
} from 'antd'
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'

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
  dayOfWeek: number
  startTime: string
  endTime: string
  price: number
  isActive: boolean
}

const buildPayload = (values: FormValues): CreateCourtDefaultPriceRuleRequest => ({
  priceRuleTypeID: values.priceRuleTypeID ?? null,
  dayOfWeek: values.dayOfWeek,
  startTime: toTimeSpan(values.startTime),
  endTime: toTimeSpan(values.endTime),
  price: Number(values.price),
  isActive: values.isActive,
})

export default function CourtPriceSettingPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [selectedDay, setSelectedDay] = useState(1)
  const [editingId, setEditingId] = useState<number | null>(null)

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
        .filter((rule) => rule.dayOfWeek === selectedDay)
        .sort((a, b) => formatTime(a.startTime).localeCompare(formatTime(b.startTime))),
    [rules, selectedDay],
  )

  const groupedRules = useMemo(
    () =>
      days.map((day) => ({
        ...day,
        rules: rules
          .filter((rule) => rule.dayOfWeek === day.value)
          .sort((a, b) => formatTime(a.startTime).localeCompare(formatTime(b.startTime))),
      })),
    [rules],
  )

  useEffect(() => {
    if (!editingId) {
      form.setFieldsValue({
        dayOfWeek: selectedDay,
      })
    }
  }, [selectedDay, editingId, form])

  const openCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      priceRuleTypeID: null,
      dayOfWeek: selectedDay,
      startTime: '06:00',
      endTime: '07:00',
      price: 100000,
      isActive: true,
    })
  }

  const openEdit = (record: CourtDefaultPriceRule) => {
    setEditingId(record.courtDefaultPriceRuleID)
    setSelectedDay(record.dayOfWeek)
    form.setFieldsValue({
      priceRuleTypeID: record.priceRuleTypeID ?? null,
      dayOfWeek: record.dayOfWeek,
      startTime: formatTime(record.startTime),
      endTime: formatTime(record.endTime),
      price: record.price,
      isActive: record.isActive,
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = buildPayload(values)
      if (editingId) {
        await updateMut.mutateAsync({
          id: editingId,
          data: payload as UpdateCourtDefaultPriceRuleRequest,
        })
        message.success('Cập nhật khung giá thành công')
        setEditingId(null)
        form.resetFields()
      } else {
        await createMut.mutateAsync(payload)
        message.success('Tạo khung giá thành công')
        form.resetFields()
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
        setEditingId(null)
        form.resetFields()
      }
    } catch (error) {
      message.error(toApiError(error).message)
    }
  }

  if (rulesQuery.isPending) {
    return <LoadingSpin tip="Đang tải cấu hình giá sân..." />
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 flex flex-col gap-6">
        <Card
          styles={{ body: { padding: '20px' } }}
          className="rounded-2xl shadow-sm border-slate-200"
        >
          <div className="flex overflow-x-auto gap-3 pb-2 md:pb-0">
            {groupedRules.map((day) => (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className={`min-w-27.5 rounded-xl border px-4 py-4 text-left transition shrink-0 ${
                  selectedDay === day.value
                    ? 'bg-[#111827] border-[#111827]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`font-semibold text-[15px] ${
                    selectedDay === day.value ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {day.label}
                </div>
                <div
                  className={`mt-1 text-sm ${
                    selectedDay === day.value ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {day.rules.length} khung giá
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card
          className="rounded-2xl shadow-sm border-slate-200"
          styles={{ body: { padding: 0 } }}
        >
          <div className="p-6 border-b border-slate-100">
            <Typography.Title level={4} style={{ margin: 0, fontWeight: 500 }}>
              Khung giá của {days.find((day) => day.value === selectedDay)?.label}
            </Typography.Title>
          </div>

          <Table
            columns={[
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
                render: (value: number | null | undefined) => renderPriceRuleType(value),
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
          />
        </Card>
      </div>

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
              startTime: '06:00',
              endTime: '07:00',
              price: 100000,
              isActive: true,
            }}
          >
            <Form.Item
              label={<span className="font-medium text-slate-800">Ngày trong tuần</span>}
              name="dayOfWeek"
              rules={[{ required: true, message: 'Chọn ngày trong tuần' }]}
            >
              <Select
                size="large"
                options={days.map((day) => ({ value: day.value, label: day.label }))}
                onChange={(value) => {
                  if (!editingId) {
                    setSelectedDay(value)
                  }
                }}
              />
            </Form.Item>

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
                placeholder="Mac dinh"
                size="large"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="font-medium text-slate-800">Giờ bắt đầu</span>}
                name="startTime"
                rules={[{ required: true, message: 'Nhập giờ bắt đầu' }]}
              >
                <Input type="time" size="large" />
              </Form.Item>
              <Form.Item
                label={<span className="font-medium text-slate-800">Giờ kết thúc</span>}
                name="endTime"
                rules={[{ required: true, message: 'Nhập giờ kết thúc' }]}
              >
                <Input type="time" size="large" />
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
                onClick={openCreate}
                className="px-6 rounded-lg font-medium text-slate-700"
              >
                Hủy
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}
