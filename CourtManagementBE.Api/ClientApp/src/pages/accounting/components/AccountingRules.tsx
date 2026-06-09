import { useMemo, useState } from 'react'
import { App, Button, Card, Input, Select, Space, Table, Tag } from 'antd'
import {
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  HolderOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import {
  useAccountingAccountsQuery,
  useAccountingRulesQuery,
  useCreateAccountingRuleMutation,
} from '@/features/accounting/api/useAccountingQueries'
import type {
  AccountingRule,
  AccountingRuleConditionCreate,
  AccountingRuleCreateRequest,
  AccountingRuleLineCreate,
} from '@/features/accounting/model/types'
import { toApiError } from '@/utils/errors'
import {
  ACCOUNTING_RULE_OPERATOR_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  SOURCE_TABLE_OPTIONS,
  VALUE_SOURCE_OPTIONS,
} from '@/features/accounting/constants/accountingConstants'

const fieldsBySourceTable: Record<string, { label: string; value: string }[]> = {
  Payments: [
    { label: 'Phương thức thanh toán', value: 'PaymentMethod' },
    { label: 'Trạng thái', value: 'Status' },
    { label: 'Số tiền', value: 'Amount' },
    { label: 'Mã booking', value: 'BookingId' },
  ],
  Bookings: [
    { label: 'Trạng thái', value: 'Status' },
    { label: 'Tổng số tiền', value: 'TotalAmount' },
    { label: 'Số tiền đã thanh toán', value: 'PaidAmount' },
  ],
}

const newCondition = (): AccountingRuleConditionCreate => ({
  fieldName: 'PaymentMethod',
  operator: '=',
  expectedValue: '',
  logicalGroup: 'GP1',
})

const newLine = (entryType: 'Debit' | 'Credit'): AccountingRuleLineCreate => ({
  accountCode: '',
  entryType,
  valueSource: 'Amount',
  descriptionTemplate: '',
})

const emptyDraft = (): AccountingRuleCreateRequest => ({
  id: `rule_${Date.now()}`,
  ruleName: '',
  transactionType: 'BOOKING_PAYMENT',
  sourceTable: 'Payments',
  description: '',
  priority: 10,
  isActive: true,
  conditions: [newCondition()],
  lines: [newLine('Debit'), newLine('Credit')],
})

const ruleToDraft = (rule: AccountingRule): AccountingRuleCreateRequest => ({
  id: rule.id,
  ruleName: rule.ruleName || '',
  transactionType: rule.transactionType,
  sourceTable: rule.sourceTable || 'Payments',
  description: rule.description || '',
  priority: rule.priority || 10,
  isActive: rule.isActive,
  conditions: rule.conditions.map((condition) => ({
    fieldName: condition.fieldName,
    operator: condition.operator,
    expectedValue: condition.expectedValue,
    logicalGroup: condition.logicalGroup || 'GP1',
  })),
  lines: rule.lines.map((line) => ({
    accountCode: line.accountCode,
    entryType: line.entryType,
    valueSource: line.valueSource,
    descriptionTemplate: line.descriptionTemplate || '',
  })),
})

export function AccountingRules() {
  const { message } = App.useApp()

  const rulesQuery = useAccountingRulesQuery()
  const accountsQuery = useAccountingAccountsQuery()
  const createRule = useCreateAccountingRuleMutation()

  const rules = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data])
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data])

  const [active, setActive] = useState<AccountingRule | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [transactionFilter, setTransactionFilter] = useState('ALL')
  const [formState, setFormState] = useState<AccountingRuleCreateRequest | null>(null)

  const accountOptions = useMemo(
    () =>
      accounts.map((a) => ({
        label: `${a.accountCode} - ${a.accountName}`,
        value: a.accountCode,
      })),
    [accounts],
  )

  const selected = active ?? rules[0] ?? null
  const currentFormState =
    formState ?? (!isCreating && selected ? ruleToDraft(selected) : null)

  const activeFieldOptions = useMemo(() => {
    return fieldsBySourceTable[currentFormState?.sourceTable || 'Payments'] || []
  }, [currentFormState?.sourceTable])

  const filteredRules = useMemo(() => {
    let result = rules

    if (transactionFilter !== 'ALL') {
      result = result.filter((x) => x.transactionType === transactionFilter)
    }

    if (!searchQuery.trim()) return result

    const q = searchQuery.toLowerCase()

    return result.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        (r.ruleName || '').toLowerCase().includes(q) ||
        (r.transactionType || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q),
    )
  }, [rules, searchQuery, transactionFilter])

  const updateForm = (patch: Partial<AccountingRuleCreateRequest>) => {
    setFormState((current) => {
      const base = current ?? (!isCreating && selected ? ruleToDraft(selected) : null)
      return base ? { ...base, ...patch } : null
    })
  }

  const updateCondition = (
    index: number,
    patch: Partial<AccountingRuleConditionCreate>,
  ) => {
    if (!currentFormState) return
    const conditions = currentFormState.conditions.map((condition, i) =>
      i === index ? { ...condition, ...patch } : condition,
    )
    updateForm({ conditions })
  }

  const updateLine = (index: number, patch: Partial<AccountingRuleLineCreate>) => {
    if (!currentFormState) return
    const lines = currentFormState.lines.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    )
    updateForm({ lines })
  }

  const startCreate = () => {
    setIsCreating(true)
    setFormState(emptyDraft())
  }

  const handleCancel = () => {
    if (isCreating) {
      setIsCreating(false)
      setFormState(null)
    } else if (selected) {
      setFormState(ruleToDraft(selected))
      message.info('Đã hủy bỏ các thay đổi chỉnh sửa.')
    }
  }

  const submitSave = async () => {
    if (!currentFormState) return
    if (!currentFormState.id.trim() || !currentFormState.ruleName.trim()) {
      message.error('Vui lòng nhập mã quy tắc và tên quy tắc.')
      return
    }

    if (currentFormState.lines.some((line) => !line.accountCode)) {
      message.error('Vui lòng chọn tài khoản cho tất cả dòng bút toán.')
      return
    }

    try {
      await createRule.mutateAsync({
        ...currentFormState,
        id: currentFormState.id.trim(),
        ruleName: currentFormState.ruleName.trim(),
        description: currentFormState.description.trim(),
        conditions: currentFormState.conditions.map((condition, index) => ({
          ...condition,
          expectedValue: condition.expectedValue.trim(),
          sortOrder: (index + 1) * 10,
        })),
        lines: currentFormState.lines.map((line, index) => ({
          ...line,
          sortOrder: (index + 1) * 10,
          descriptionTemplate: line.descriptionTemplate.trim(),
        })),
      })

      message.success('Đã lưu quy tắc định khoản thành công.')
      setIsCreating(false)
      setFormState(null)
      rulesQuery.refetch()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      message.error(toApiError(error).message)
    }
  }

  const conditions = currentFormState?.conditions ?? []
  const lines = currentFormState?.lines ?? []

  // Renders the correct expected value component depending on the fieldName selected
  const renderExpectedValueField = (
    condition: AccountingRuleConditionCreate,
    index: number,
  ) => {
    if (condition.fieldName === 'PaymentMethod') {
      return (
        <Select
          value={condition.expectedValue || undefined}
          placeholder="Chọn phương thức"
          options={[
            { label: 'Tiền mặt (cash)', value: 'cash' },
            { label: 'Chuyển khoản (bank_transfer)', value: 'bank_transfer' },
            { label: 'Banking (banking)', value: 'banking' },
            { label: 'Quét mã QR (qr)', value: 'qr' },
          ]}
          onChange={(value) => updateCondition(index, { expectedValue: value })}
          className="w-full"
        />
      )
    }

    if (condition.fieldName === 'HasVat') {
      return (
        <Select
          value={condition.expectedValue || undefined}
          placeholder="Chọn giá trị"
          options={[
            { label: 'Có', value: 'true' },
            { label: 'Không', value: 'false' },
          ]}
          onChange={(value) => updateCondition(index, { expectedValue: value })}
          className="w-full"
        />
      )
    }

    if (condition.fieldName === 'Status') {
      const isBooking = currentFormState?.sourceTable === 'Bookings'
      const statusOptions = isBooking
        ? [{ label: 'Đã xác nhận (Đã thanh toán cọc)', value: '002' }]
        : [
            { label: 'Thành công (success)', value: 'success' },
            { label: 'Đã thanh toán (paid)', value: 'paid' },
            { label: 'Chờ xử lý (pending)', value: 'pending' },
            { label: 'Thất bại (failed)', value: 'failed' },
            { label: 'Đã hoàn tiền (refunded)', value: 'refunded' },
          ]
      return (
        <Select
          value={condition.expectedValue || undefined}
          placeholder="Chọn giá trị"
          options={statusOptions}
          onChange={(value) => updateCondition(index, { expectedValue: value })}
          className="w-full"
        />
      )
    }

    // Default to plain Input
    return (
      <Input
        placeholder="Nhập giá trị"
        value={condition.expectedValue}
        onChange={(e) => updateCondition(index, { expectedValue: e.target.value })}
        className="w-full"
      />
    )
  }

  const columns = [
    {
      title: 'Loại',
      dataIndex: 'entryType',
      key: 'entryType',
      width: 105,
      render: (value: 'Debit' | 'Credit', _: AccountingRuleLineCreate, index: number) => (
        <Select
          disabled={!isCreating}
          value={value}
          options={[
            { label: 'Nợ', value: 'Debit' },
            { label: 'Có', value: 'Credit' },
          ]}
          onChange={(val) => updateLine(index, { entryType: val })}
          popupMatchSelectWidth={false}
          className={`w-full font-bold select-entry-type ${
            value === 'Debit' ? 'debit-style' : 'credit-style'
          }`}
          dropdownStyle={{ minWidth: 140 }}
          style={{
            minWidth: 96,
            color: value === 'Debit' ? '#10b981' : '#f43f5e',
            fontWeight: 'bold',
          }}
        />
      ),
    },
    {
      title: 'Tài khoản',
      dataIndex: 'accountCode',
      key: 'accountCode',
      width: 280,
      render: (value: string, _: AccountingRuleLineCreate, index: number) => (
        <Select
          showSearch
          value={value || undefined}
          placeholder="Chọn tài khoản"
          options={accountOptions}
          optionFilterProp="label"
          onChange={(val) => updateLine(index, { accountCode: val })}
          className="w-full rounded-lg"
          popupMatchSelectWidth={360}
          style={{ minWidth: 240 }}
        />
      ),
    },
    {
      title: 'Diễn giải',
      dataIndex: 'descriptionTemplate',
      key: 'descriptionTemplate',
      width: 340,
      render: (value: string, _: AccountingRuleLineCreate, index: number) => (
        <Input
          value={value}
          onChange={(e) => updateLine(index, { descriptionTemplate: e.target.value })}
          placeholder="VD: Doanh thu đặt sân"
          className="rounded-lg border-slate-200"
          style={{ minWidth: 260 }}
        />
      ),
    },
    {
      title: 'Công thức tiền',
      dataIndex: 'valueSource',
      key: 'valueSource',
      width: 220,
      render: (value: string, _: AccountingRuleLineCreate, index: number) => (
        <Select
          value={value}
          options={VALUE_SOURCE_OPTIONS}
          onChange={(val) => updateLine(index, { valueSource: val })}
          className="w-full rounded-lg"
          popupMatchSelectWidth={280}
          style={{ minWidth: 180 }}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 85,
      align: 'center' as const,
      render: (_: unknown, __: AccountingRuleLineCreate, index: number) => (
        <div className="flex items-center justify-center gap-1">
          <HolderOutlined className="text-slate-400 cursor-grab hover:text-slate-600 text-sm shrink-0" />
          <Button
            danger
            type="text"
            shape="circle"
            icon={<DeleteOutlined />}
            disabled={currentFormState ? currentFormState.lines.length <= 2 : true}
            onClick={() =>
              updateForm({
                lines: currentFormState
                  ? currentFormState.lines.filter((_, i) => i !== index)
                  : [],
              })
            }
            className="hover:bg-red-50 flex items-center justify-center h-7 w-7 text-red-500 shrink-0"
          />
        </div>
      ),
    },
  ]

  const conditionColumns = [
    {
      title: 'Nhóm logic (GP)',
      dataIndex: 'logicalGroup',
      key: 'logicalGroup',
      width: 140,
      render: (value: string, _: AccountingRuleConditionCreate, index: number) => (
        <div className="w-full">
          <Input
            value={value}
            onChange={(e) => updateCondition(index, { logicalGroup: e.target.value })}
            placeholder="Mã nhóm (VD: A, B)"
            className="rounded-lg"
            style={{ height: '34px', minWidth: 120 }}
          />
        </div>
      ),
    },
    {
      title: 'Thuộc tính',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 180,
      render: (value: string, _: AccountingRuleConditionCreate, index: number) => (
        <Select
          value={value}
          options={activeFieldOptions}
          onChange={(val) =>
            updateCondition(index, { fieldName: val, expectedValue: '' })
          }
          className="w-full"
          popupMatchSelectWidth={240}
          style={{ height: '34px', minWidth: 180 }}
        />
      ),
    },
    {
      title: 'Phép so sánh',
      dataIndex: 'operator',
      key: 'operator',
      width: 150,
      render: (value: string, _: AccountingRuleConditionCreate, index: number) => (
        <Select
          value={value}
          options={ACCOUNTING_RULE_OPERATOR_OPTIONS}
          onChange={(val) => updateCondition(index, { operator: val })}
          className="w-full"
          popupMatchSelectWidth={220}
          style={{ height: '34px', minWidth: 150 }}
        />
      ),
    },
    {
      title: 'Giá trị so sánh',
      dataIndex: 'expectedValue',
      key: 'expectedValue',
      width: 280,
      render: (_: string, record: AccountingRuleConditionCreate, index: number) => (
        <div className="w-full">{renderExpectedValueField(record, index)}</div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 70,
      align: 'center' as const,
      render: (_: unknown, __: AccountingRuleConditionCreate, index: number) => (
        <div className="flex justify-center">
          <Button
            danger
            type="text"
            shape="circle"
            icon={<DeleteOutlined />}
            disabled={currentFormState ? currentFormState.conditions.length <= 1 : true}
            onClick={() =>
              updateForm({
                conditions: currentFormState
                  ? currentFormState.conditions.filter((_, i) => i !== index)
                  : [],
              })
            }
            className="hover:bg-red-50 flex items-center justify-center h-8 w-8 text-red-500"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="accounting-rules w-full space-y-5 font-sans">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-slate-900">
            Quy tắc định khoản tự động
          </h1>

          <p className="text-sm text-slate-500">
            Thiết lập các logic để tự động định khoản tài khoản Nợ/Có khi có phát sinh
            giao dịch trên hệ thống.
          </p>
        </div>

        <Space align="center" size={16}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={startCreate}
            className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-xs"
          >
            Thêm quy tắc
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* Left Card: Rules Table-List */}
        <Card
          className="overflow-hidden border-slate-200 shadow-sm"
          bodyStyle={{ padding: 0 }}
        >
          {/* Search bar & filter row */}
          <div className="border-b border-slate-100 p-4 bg-white">
            <div className="grid grid-cols-1 gap-3">
              <Input
                placeholder="Tìm kiếm quy tắc..."
                prefix={<SearchOutlined className="text-slate-400" />}
                allowClear
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                value={transactionFilter}
                onChange={setTransactionFilter}
                options={[
                  { label: 'Tất cả loại giao dịch', value: 'ALL' },
                  ...TRANSACTION_TYPE_OPTIONS.map((t) => ({
                    label: t.label,
                    value: t.value,
                  })),
                ]}
              />
            </div>
          </div>

          <div className="max-h-170 overflow-y-auto">
            {filteredRules.map((rule) => {
              const isSelected = !isCreating && selected?.id === rule.id

              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => {
                    setActive(rule)
                    setIsCreating(false)
                    setFormState(ruleToDraft(rule))
                  }}
                  className={`block w-full border-b border-slate-100 px-4 py-4 text-left transition border-l-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-blue-600'
                      : 'bg-white hover:bg-slate-50/50 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 leading-snug">
                        {rule.ruleName || 'Chưa đặt tên'}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-slate-500 font-normal">
                        {rule.description || rule.id}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Tag
                        color={rule.isActive ? 'success' : 'warning'}
                        className="m-0 text-[11px] font-semibold px-2 py-0.5 rounded border"
                      >
                        {rule.isActive ? 'Bật' : 'Tắt'}
                      </Tag>
                      <MoreOutlined className="text-slate-400 text-base" />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                    <Tag className="border-0 bg-slate-100/80 px-2 py-0.5 m-0 text-slate-600 text-[10px] font-mono">
                      {rule.transactionType}
                    </Tag>
                    <Tag className="border-0 bg-blue-50 px-2 py-0.5 m-0 text-blue-700 text-[10px] font-semibold">
                      Ưu tiên {rule.priority}
                    </Tag>
                  </div>
                </button>
              )
            })}

            {filteredRules.length === 0 && (
              <div className="py-20 text-center text-sm text-slate-400 italic">
                Không tìm thấy quy tắc nào thỏa mãn điều kiện lọc.
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3.5 text-xs text-slate-500 font-medium bg-slate-50/50">
            Hiển thị {filteredRules.length} trong {rules.length} quy tắc
          </div>
        </Card>

        {/* Right Card: Unified Rule Config Form */}
        <Card className="border-slate-200 shadow-sm" bodyStyle={{ padding: 0 }}>
          {currentFormState ? (
            <>
              {/* Section 1: Rule General Info */}
              <section className="border-b border-slate-100 p-5">
                <h3 className="mb-5 text-base font-bold text-slate-900 flex items-center gap-2">
                  <SettingOutlined className="text-blue-500 text-sm" />
                  Thông tin quy tắc
                </h3>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                  <div className="lg:col-span-2">
                    <FormItem label="Tên quy tắc" required>
                      <Input
                        value={currentFormState.ruleName}
                        onChange={(e) => updateForm({ ruleName: e.target.value })}
                        placeholder="VD: Thu tiền đặt sân (Có VAT)"
                        className="rounded-lg border-slate-250 py-1.5"
                      />
                    </FormItem>
                  </div>

                  <FormItem label="Loại giao dịch" required>
                    <Select
                      value={currentFormState.transactionType}
                      options={TRANSACTION_TYPE_OPTIONS}
                      onChange={(value) => updateForm({ transactionType: value })}
                      className="w-full rounded-lg"
                      style={{ height: '37px' }}
                    />
                  </FormItem>

                  <FormItem label="Bảng nguồn" required>
                    <Select
                      value={currentFormState.sourceTable}
                      options={SOURCE_TABLE_OPTIONS}
                      onChange={(value) => {
                        const newFields = fieldsBySourceTable[value] || []
                        const defaultFieldName = newFields[0]?.value || ''
                        updateForm({
                          sourceTable: value,
                          conditions: currentFormState.conditions.map((c) => ({
                            ...c,
                            fieldName: defaultFieldName,
                            expectedValue: '',
                          })),
                        })
                      }}
                      className="w-full rounded-lg"
                      style={{ height: '37px' }}
                    />
                  </FormItem>

                  <FormItem label="Trạng thái">
                    <Select
                      value={currentFormState.isActive ? 'ACTIVE' : 'INACTIVE'}
                      options={[
                        { label: 'Đang hoạt động', value: 'ACTIVE' },
                        { label: 'Tạm dừng', value: 'INACTIVE' },
                      ]}
                      onChange={(value) => updateForm({ isActive: value === 'ACTIVE' })}
                      className="w-full rounded-lg"
                      style={{ height: '37px' }}
                    />
                  </FormItem>

                  <div className="lg:col-span-4">
                    <FormItem label="Mô tả">
                      <Input.TextArea
                        rows={3}
                        value={currentFormState.description}
                        onChange={(e) => updateForm({ description: e.target.value })}
                        placeholder="Mô tả chi tiết mục đích, cách hoạt động của quy tắc định khoản này..."
                        className="rounded-lg border-slate-250"
                      />
                    </FormItem>
                  </div>
                </div>
              </section>

              {/* Section 2: Activation Conditions */}
              <section className="border-b border-slate-100 p-5">
                <h3 className="mb-5 text-base font-bold text-slate-900 flex items-center gap-2">
                  <InfoCircleOutlined className="text-blue-500 text-sm" />
                  Điều kiện áp dụng
                </h3>

                <Table
                  dataSource={conditions.map((c, idx) => ({ ...c, key: idx }))}
                  columns={conditionColumns}
                  pagination={false}
                  bordered
                  size="middle"
                  scroll={{ x: 820 }}
                  className="accounting-table rounded-xl border border-slate-200 bg-white"
                  rowClassName="hover:bg-slate-50/20"
                />

                <div className="flex justify-center pt-4">
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      updateForm({
                        conditions: [...currentFormState.conditions, newCondition()],
                      })
                    }
                    className="border-blue-200 text-blue-600 hover:text-blue-700 hover:border-blue-300 font-semibold rounded-lg w-full max-w-50"
                  >
                    Thêm điều kiện
                  </Button>
                </div>
              </section>

              {/* Section 3: Accounting Lines */}
              <section className="p-5">
                <h3 className="mb-5 text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileTextOutlined className="text-blue-500 text-sm" />
                  Bút toán định khoản
                </h3>

                <Table
                  dataSource={lines.map((line, idx) => ({ ...line, key: idx }))}
                  columns={columns}
                  pagination={false}
                  bordered
                  size="middle"
                  scroll={{ x: 1030 }}
                  className="accounting-table rounded-xl border border-slate-200 bg-white"
                  rowClassName="hover:bg-slate-50/20"
                />

                <Space className="mt-4" size={12}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      updateForm({
                        lines: [...currentFormState.lines, newLine('Debit')],
                      })
                    }
                    className="border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 font-medium rounded-lg"
                  >
                    Thêm dòng Nợ
                  </Button>

                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      updateForm({
                        lines: [...currentFormState.lines, newLine('Credit')],
                      })
                    }
                    className="border-rose-200 text-rose-600 hover:text-rose-700 hover:border-rose-300 font-medium rounded-lg"
                  >
                    Thêm dòng Có
                  </Button>
                </Space>
              </section>

              {/* Bottom footer button action bar */}
              <div className="flex justify-end gap-3 border-t border-slate-100 p-5 bg-slate-50/30 rounded-b-xl">
                <Button onClick={handleCancel} className="rounded-lg px-5">
                  Hủy
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={createRule.isPending}
                  onClick={submitSave}
                  className="bg-blue-600 hover:bg-blue-700 border-none shadow-xs rounded-lg px-6 font-semibold"
                >
                  Lưu quy tắc
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-140 flex-col items-center justify-center text-center p-6">
              <InfoCircleOutlined className="mb-3 text-4xl text-slate-300 animate-pulse" />
              <div className="font-semibold text-slate-700 text-sm">
                Chưa lựa chọn quy tắc
              </div>
              <p className="mt-1 text-xs text-slate-400 max-w-70 leading-relaxed">
                Chọn một quy tắc bên cột danh sách hoặc nhấn nút "Thêm quy tắc" ở phía
                trên để bắt đầu cấu hình.
              </p>
            </div>
          )}
        </Card>
      </div>
      <style>{customStyle}</style>
    </div>
  )
}

function FormItem({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </label>
  )
}

const customStyle = `
.accounting-rules .ant-select-selector,
.accounting-rules .ant-input {
  min-height: 36px;
}
.accounting-rules .ant-select-selection-item,
.accounting-rules .ant-select-selection-placeholder {
  line-height: 34px;
}
.select-entry-type.debit-style .ant-select-selector {
  background-color: #ecfdf5 !important;
  border-color: #a7f3d0 !important;
  color: #10b981 !important;
  border-radius: 9999px !important;
}
.select-entry-type.credit-style .ant-select-selector {
  background-color: #fff1f2 !important;
  border-color: #fecdd3 !important;
  color: #f43f5e !important;
  border-radius: 9999px !important;
}
.accounting-table .ant-table-thead > tr > th {
  background-color: #f8fafc !important;
  font-weight: 700 !important;
  color: #475569 !important;
  font-size: 11px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  padding: 10px 16px !important;
}
.accounting-table .ant-table-tbody > tr > td {
  padding: 12px 16px !important;
  vertical-align: top;
}
.accounting-table .ant-table-container {
  overflow: hidden;
  border-radius: 12px;
}
`
