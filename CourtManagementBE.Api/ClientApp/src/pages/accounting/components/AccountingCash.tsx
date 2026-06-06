import { useState, useMemo } from 'react'
import { Card, Table, Space, DatePicker, Segmented, Row, Col, Button } from 'antd'
import {
  WalletOutlined,
  BankOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAccountingCashflowQuery } from '@/features/accounting/api/useAccountingQueries'

const formatVND = (v: number) => v.toLocaleString('vi-VN')

export function AccountingCash() {
  const [mode, setMode] = useState<'cash' | 'bank'>('cash')
  const [selectedKey, setSelectedKey] = useState('cash-main')

  const query = useAccountingCashflowQuery(mode)
  const data = query.data

  const startBal = data?.startBal ?? 12000000
  const ledger = useMemo(() => data?.ledger ?? [], [data?.ledger])
  const cashFunds = useMemo(() => data?.cashFunds ?? [], [data?.cashFunds])
  const banks = useMemo(() => data?.banks ?? [], [data?.banks])

  const rows = useMemo(() => {
    const result = []
    let current = startBal
    for (const r of ledger) {
      current += r.debit - r.credit
      result.push({ ...r, bal: current })
    }
    return result
  }, [startBal, ledger])

  const totalDebit = useMemo(() => ledger.reduce((s, r) => s + r.debit, 0), [ledger])
  const totalCredit = useMemo(() => ledger.reduce((s, r) => s + r.credit, 0), [ledger])
  const endBal = startBal + totalDebit - totalCredit

  return (
    <Space className="w-full" direction="vertical" size={24}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Sổ quỹ & Ngân hàng</h2>
          <p className="text-xs text-slate-500 mb-0">Chi tiết dòng tiền mặt tại quỹ và số dư tiền gửi ngân hàng.</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => query.refetch()} loading={query.isFetching}>Tải lại</Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Lập phiếu chi
          </Button>
        </Space>
      </div>

      {/* Mode toggle */}
      <Segmented
        value={mode}
        onChange={(v) => {
          const newMode = v as 'cash' | 'bank'
          setMode(newMode)
          setSelectedKey(newMode === 'cash' ? 'cash-main' : 'vcb')
        }}
        options={[
          {
            label: (
              <span className="inline-flex items-center gap-1.5">
                <WalletOutlined /> Sổ quỹ tiền mặt
              </span>
            ),
            value: 'cash',
          },
          {
            label: (
              <span className="inline-flex items-center gap-1.5">
                <BankOutlined /> Sổ ngân hàng
              </span>
            ),
            value: 'bank',
          },
        ]}
        size="large"
      />

      {/* Fund / Bank selection */}
      {query.isLoading ? (
        <Card loading={true} className="w-full" />
      ) : mode === 'cash' ? (
        <Row gutter={[16, 16]}>
          {cashFunds.map((f) => (
            <Col key={f.key} md={8} xs={24}>
              <Card
                className="cursor-pointer shadow-sm transition-all hover:shadow-md"
                style={{
                  borderColor: selectedKey === f.key ? '#3b82f6' : '#e2e8f0',
                  background: selectedKey === f.key ? '#eff6ff' : undefined,
                }}
                onClick={() => setSelectedKey(f.key)}
              >
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <WalletOutlined className="text-emerald-500" />
                  {f.name}
                </div>
                <div className="text-2xl font-bold mt-2 tabular-nums">
                  {formatVND(f.bal)}₫
                </div>
                <div className="text-xs text-slate-400 mt-1">Cập nhật vừa xong</div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          {banks.map((b) => (
            <Col key={b.key} lg={6} md={12} xs={24}>
              <Card
                className="cursor-pointer shadow-sm transition-all hover:shadow-md"
                style={{
                  borderTop: `3px solid ${b.color}`,
                  borderColor: selectedKey === b.key ? '#3b82f6' : undefined,
                  background: selectedKey === b.key ? '#eff6ff' : undefined,
                }}
                onClick={() => setSelectedKey(b.key)}
              >
                <div className="text-xs text-slate-500">{b.name}</div>
                <div className="text-xl font-bold mt-1 tabular-nums">
                  {formatVND(b.bal)}₫
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">{b.acc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Ledger table */}
      <Card
        className="border-slate-200 shadow-sm"
        title={mode === 'cash' ? 'Sổ quỹ chi tiết' : 'Sổ phụ ngân hàng'}
        extra={
          <Space className="text-xs">
            <span>
              Tồn đầu: <strong className="tabular-nums">{formatVND(startBal)}₫</strong>
            </span>
            <span>
              Tồn cuối:{' '}
              <strong className="tabular-nums text-blue-600">{formatVND(endBal)}₫</strong>
            </span>
          </Space>
        }
      >
        <Space className="w-full mb-4" wrap>
          <DatePicker.RangePicker placeholder={['Từ ngày', 'Đến ngày']} style={{ width: 280 }} />
        </Space>

        <Table
          rowKey="key"
          loading={query.isLoading}
          columns={[
            { title: 'Ngày', dataIndex: 'date', width: 80 },
            {
              title: 'Số CT',
              dataIndex: 'no',
              width: 120,
              render: (text: string) => <span className="font-mono text-xs">{text}</span>,
            },
            { title: 'Diễn giải', dataIndex: 'desc' },
            {
              title: 'Thu',
              dataIndex: 'debit',
              width: 150,
              align: 'right' as const,
              render: (v: number) =>
                v ? (
                  <span className="text-emerald-600 font-semibold tabular-nums inline-flex items-center gap-1">
                    <ArrowUpOutlined className="text-xs" />
                    {formatVND(v)}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                ),
            },
            {
              title: 'Chi',
              dataIndex: 'credit',
              width: 150,
              align: 'right' as const,
              render: (v: number) =>
                v ? (
                  <span className="text-red-500 font-semibold tabular-nums inline-flex items-center gap-1">
                    <ArrowDownOutlined className="text-xs" />
                    {formatVND(v)}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                ),
            },
            {
              title: 'Tồn / Số dư',
              dataIndex: 'bal',
              width: 150,
              align: 'right' as const,
              render: (v: number) => (
                <span className="font-semibold tabular-nums">{formatVND(v)}</span>
              ),
            },
          ]}
          dataSource={rows}
          pagination={false}
          size="middle"
          summary={() => (
            <Table.Summary.Row className="font-bold bg-blue-50">
              <Table.Summary.Cell index={0} colSpan={3}>
                TỒN CUỐI KỲ
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <span className="text-emerald-600 tabular-nums">{formatVND(totalDebit)}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <span className="text-red-500 tabular-nums">{formatVND(totalCredit)}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <span className="text-blue-600 tabular-nums">{formatVND(endBal)}</span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
          scroll={{ x: 700 }}
        />
      </Card>
    </Space>
  )
}
