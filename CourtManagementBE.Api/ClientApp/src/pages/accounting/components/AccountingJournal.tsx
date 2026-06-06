import { useMemo, useState } from 'react'
import { Alert, Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Space, Statistic, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import { CheckCircleOutlined, DownloadOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  useAccountingJournalQuery,
  usePostJournalBatchMutation,
  useUpdateDraftJournalMutation,
} from '@/features/accounting/api/useAccountingQueries'
import type { JournalEntry, JournalEntryLineUpdate } from '@/features/accounting/model/types'

const formatVND = (v: number) => v.toLocaleString('vi-VN')
const formatDate = (value: string) => new Date(value).toLocaleDateString('vi-VN')

export function AccountingJournal() {
  const [keyword, setKeyword] = useState('')
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [form] = Form.useForm()

  const queryParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      fromDate: range?.[0]?.format('YYYY-MM-DD'),
      toDate: range?.[1]?.format('YYYY-MM-DD'),
    }),
    [keyword, range],
  )

  const journalQuery = useAccountingJournalQuery(queryParams)
  const postBatchMut = usePostJournalBatchMutation()
  const updateDraftMut = useUpdateDraftJournalMutation()
  const entries = journalQuery.data ?? []

  const totals = entries.reduce(
    (acc, entry) => {
      acc.debit += entry.totalDebit
      acc.credit += entry.totalCredit
      return acc
    },
    { debit: 0, credit: 0 },
  )
  const balanced = totals.debit === totals.credit

  const handleBatchPost = async () => {
    const entryIds = selectedRowKeys.map(String)
    if (entryIds.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bút toán nháp để ghi sổ.')
      return
    }

    await postBatchMut.mutateAsync({ entryIds })
    setSelectedRowKeys([])
    message.success(`Đã ghi sổ ${entryIds.length} bút toán nháp.`)
  }

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry)
    form.setFieldsValue({
      description: entry.description,
      lines: entry.lines.map((line) => ({
        id: line.id,
        accountCode: line.accountCode,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        partnerId: line.partnerId,
        description: line.description,
      })),
    })
  }

  const handleUpdateDraft = async () => {
    if (!editingEntry) return
    const values = await form.validateFields()
    await updateDraftMut.mutateAsync({
      id: editingEntry.id,
      body: {
        description: values.description,
        lines: values.lines as JournalEntryLineUpdate[],
      },
    })
    setEditingEntry(null)
    message.success('Đã cập nhật bút toán nháp.')
  }

  const handleViewSourceDocument = (sourceTable: string, sourceId: string) => {
    Modal.info({
      title: 'Chi tiết chứng từ gốc',
      content: (
        <div className="font-sans text-xs">
          <p><strong>Bảng nguồn:</strong> {sourceTable}</p>
          <p><strong>Mã giao dịch gốc:</strong> #{sourceId}</p>
          <p className="text-slate-500 mt-2">Dữ liệu này được liên kết từ bút toán sinh tự động ở background.</p>
        </div>
      ),
    })
  }

  const columns: ColumnsType<JournalEntry> = [
    {
      title: 'Số CT',
      dataIndex: 'voucherNo',
      width: 120,
      render: (text: string) => <span className="font-mono text-xs font-bold">{text}</span>,
    },
    {
      title: 'Ngày',
      dataIndex: 'entryDate',
      width: 110,
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Chứng từ gốc',
      key: 'source',
      width: 170,
      render: (_, record) => (
        <Button type="dashed" size="small" icon={<EyeOutlined />} onClick={() => handleViewSourceDocument(record.sourceTable, record.sourceId)}>
          {record.sourceTable} #{record.sourceId}
        </Button>
      ),
    },
    {
      title: 'Diễn giải',
      dataIndex: 'description',
      render: (text: string, record) => (
        <Space>
          <span>{text}</span>
          <Tag color={record.isBalanced ? 'green' : 'red'}>{record.isBalanced ? 'cân' : 'lệch'}</Tag>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'Posted' ? 'success' : 'warning'}>{status === 'Posted' ? 'Đã ghi sổ' : 'Nháp'}</Tag>
      ),
    },
    {
      title: 'Tổng Nợ',
      dataIndex: 'totalDebit',
      width: 130,
      align: 'right',
      render: (v: number) => <span className="tabular-nums font-semibold">{formatVND(v)}</span>,
    },
    {
      title: 'Tổng Có',
      dataIndex: 'totalCredit',
      width: 130,
      align: 'right',
      render: (v: number) => <span className="tabular-nums font-semibold">{formatVND(v)}</span>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => record.status === 'Draft' ? (
        <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
          Chỉnh sửa
        </Button>
      ) : null,
    },
  ]

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Sổ nhật ký chung</h2>
          <p className="text-xs text-slate-500 mb-0">Bút toán được sinh nháp tự động từ thanh toán/công nợ và ghi sổ khi chốt ca hoặc chốt ngày.</p>
        </div>
        <Space className="shrink-0">
          <Button icon={<ReloadOutlined />} onClick={() => journalQuery.refetch()} loading={journalQuery.isFetching}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={selectedRowKeys.length === 0}
            loading={postBatchMut.isPending}
            onClick={handleBatchPost}
          >
            Duyệt & Ghi sổ hàng loạt ({selectedRowKeys.length})
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Tổng phát sinh Nợ" value={formatVND(totals.debit) + '₫'} valueStyle={{ color: '#3b82f6' }} />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Tổng phát sinh Có" value={formatVND(totals.credit) + '₫'} valueStyle={{ color: '#3b82f6' }} />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            {balanced ? (
              <Alert message="✓ Tổng Nợ = Tổng Có" type="success" showIcon icon={<CheckCircleOutlined />} className="border-0 bg-transparent p-0!" />
            ) : (
              <Alert message={`Lệch ${formatVND(Math.abs(totals.debit - totals.credit))}₫`} type="error" showIcon icon={<ExclamationCircleOutlined />} className="border-0 bg-transparent p-0!" />
            )}
          </Card>
        </Col>
      </Row>

      <Card
        className="border-slate-200 shadow-sm"
        title="Nhật ký bút toán"
        extra={
          <Space>
            <span className="text-xs text-slate-500">{entries.length} bút toán</span>
            <Button icon={<DownloadOutlined />} size="small">Xuất sổ</Button>
          </Space>
        }
      >
        <Space className="w-full mb-4" wrap>
          <Input.Search placeholder="Tìm bút toán, mô tả…" style={{ width: 280 }} allowClear onSearch={setKeyword} onChange={(e) => !e.target.value && setKeyword('')} />
          <DatePicker.RangePicker placeholder={['Từ ngày', 'Đến ngày']} onChange={(value) => setRange(value)} />
        </Space>

        <Table
          rowKey="id"
          loading={journalQuery.isLoading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({ disabled: record.status !== 'Draft' }),
          }}
          columns={columns}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={[
                  {
                    title: 'Tài khoản',
                    key: 'account',
                    render: (_, line) => <span className="font-mono font-semibold">{line.accountCode}{line.accountName ? ` — ${line.accountName}` : ''}</span>,
                  },
                  { title: 'Diễn giải', dataIndex: 'description' },
                  {
                    title: 'Nợ',
                    dataIndex: 'debitAmount',
                    align: 'right' as const,
                    render: (v: number) => v ? <span className="text-blue-600 font-semibold tabular-nums">{formatVND(v)}</span> : <span className="text-slate-300">—</span>,
                  },
                  {
                    title: 'Có',
                    dataIndex: 'creditAmount',
                    align: 'right' as const,
                    render: (v: number) => v ? <span className="text-blue-600 font-semibold tabular-nums">{formatVND(v)}</span> : <span className="text-slate-300">—</span>,
                  },
                ]}
                dataSource={record.lines}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ),
          }}
          dataSource={entries}
          pagination={false}
          size="middle"
          scroll={{ x: 1050 }}
        />
      </Card>

      <Modal
        title={`Chỉnh sửa bút toán nháp ${editingEntry?.voucherNo ?? ''}`}
        open={!!editingEntry}
        onCancel={() => setEditingEntry(null)}
        onOk={handleUpdateDraft}
        okText="Lưu bút toán"
        confirmLoading={updateDraftMut.isPending}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="description" label="Diễn giải">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.List name="lines">
            {(fields) => (
              <Space direction="vertical" className="w-full">
                {fields.map((field) => (
                  <Row gutter={8} key={field.key} align="middle">
                    <Col span={5}>
                      <Form.Item name={[field.name, 'accountCode']} rules={[{ required: true, message: 'Nhập tài khoản' }]} className="mb-2">
                        <Input placeholder="TK" />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item name={[field.name, 'debitAmount']} className="mb-2">
                        <InputNumber min={0} className="w-full" placeholder="Nợ" />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item name={[field.name, 'creditAmount']} className="mb-2">
                        <InputNumber min={0} className="w-full" placeholder="Có" />
                      </Form.Item>
                    </Col>
                    <Col span={9}>
                      <Form.Item name={[field.name, 'description']} className="mb-2">
                        <Input placeholder="Diễn giải dòng" />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </Space>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Space>
  )
}
