import { Card, Table, Tag, Space, Input, Select, Button, Statistic, Row, Col, Progress, Alert } from 'antd'
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAccountingReceivablesQuery } from '@/features/accounting/api/useAccountingQueries'
import { useState } from 'react'

const ageColorMap: Record<string, string> = {
  '0-30': 'green',
  '31-60': 'gold',
  '61-90': 'red',
  '>90': 'red',
}

const ageLabelMap: Record<string, string> = {
  '0-30': '0-30 ngày',
  '31-60': '31-60 ngày',
  '61-90': '61-90 ngày',
  '>90': '> 90 ngày',
}

const formatVND = (v: number) => v.toLocaleString('vi-VN') + '₫'

export function AccountingReceivables() {
  const query = useAccountingReceivablesQuery()
  const customers = query.data ?? []

  const [keyword, setKeyword] = useState('')
  const [ageFilter, setAgeFilter] = useState('all')

  const filteredCustomers = customers.filter((c) => {
    const matchesKeyword = c.name.toLowerCase().includes(keyword.toLowerCase()) || c.code.toLowerCase().includes(keyword.toLowerCase())
    const matchesAge = ageFilter === 'all' || c.age === ageFilter
    return matchesKeyword && matchesAge
  })

  const totalRemain = customers.reduce((s, c) => s + (c.total - c.paid), 0)

  const buckets = ['0-30', '31-60', '61-90', '>90'].map((k) => ({
    key: k,
    label: ageLabelMap[k],
    value: customers.filter((c) => c.age === k).reduce((s, c) => s + (c.total - c.paid), 0),
    count: customers.filter((c) => c.age === k).length,
    color: ageColorMap[k],
  }))

  const criticalCustomers = customers.filter(c => c.age === '61-90' || c.age === '>90')
  const criticalTotal = criticalCustomers.reduce((s, c) => s + (c.total - c.paid), 0)

  return (
    <Space className="w-full" direction="vertical" size={24}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Công nợ phải thu</h2>
          <p className="text-xs text-slate-500 mb-0">Theo dõi chi tiết công nợ của khách hàng và thời hạn nợ.</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => query.refetch()} loading={query.isFetching}>Tải lại</Button>
        </Space>
      </div>

      {/* Summary */}
      <Row gutter={[16, 16]}>
        <Col lg={4} md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm" style={{ borderLeft: '4px solid #3b82f6' }}>
            <Statistic
              title="Tổng phải thu"
              value={formatVND(totalRemain)}
              valueStyle={{ color: '#3b82f6', fontSize: '20px' }}
            />
            <div className="text-xs text-slate-400 mt-1">{customers.length} khách hàng</div>
          </Card>
        </Col>
        {buckets.map((b) => (
          <Col key={b.key} lg={5} md={8} xs={12}>
            <Card className="border-slate-200 shadow-sm" size="small">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">{b.label}</span>
                <Tag color={b.color}>{b.key}</Tag>
              </div>
              <div className="text-lg font-bold tabular-nums">{formatVND(b.value)}</div>
              <Progress
                percent={totalRemain > 0 ? Math.round((b.value / totalRemain) * 100) : 0}
                showInfo={false}
                strokeColor={
                  b.color === 'green'
                    ? '#22c55e'
                    : b.color === 'gold'
                      ? '#f59e0b'
                      : '#ef4444'
                }
                size="small"
                className="mt-1"
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Detail table */}
      <Card
        className="border-slate-200 shadow-sm"
        title="Chi tiết công nợ"
        extra={
          <Space>
            <span className="text-xs text-slate-500">{filteredCustomers.length} khách hàng khớp bộ lọc</span>
          </Space>
        }
      >
        <Space className="w-full mb-4" wrap>
          <Input.Search
            placeholder="Tìm tên / mã khách hàng…"
            style={{ width: 280 }}
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Select
            value={ageFilter}
            style={{ width: 160 }}
            onChange={setAgeFilter}
            options={[
              { label: 'Tất cả tuổi nợ', value: 'all' },
              { label: '0-30 ngày', value: '0-30' },
              { label: '31-60 ngày', value: '31-60' },
              { label: '61-90 ngày', value: '61-90' },
              { label: 'Trên 90 ngày', value: '>90' },
            ]}
          />
        </Space>

        <Table
          rowKey="key"
          loading={query.isLoading}
          columns={[
            {
              title: 'Khách hàng',
              key: 'customer',
              render: (_: unknown, record) => (
                <div>
                  <div className="font-semibold text-sm">{record.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{record.code}</div>
                </div>
              ),
            },
            {
              title: 'Tổng phát sinh',
              dataIndex: 'total',
              width: 140,
              align: 'right' as const,
              render: (v: number) => <span className="tabular-nums">{formatVND(v)}</span>,
            },
            {
              title: 'Đã thanh toán',
              dataIndex: 'paid',
              width: 140,
              align: 'right' as const,
              render: (v: number) => (
                <span className="tabular-nums text-emerald-600">{formatVND(v)}</span>
              ),
            },
            {
              title: 'Còn lại',
              key: 'remain',
              width: 140,
              align: 'right' as const,
              render: (_: unknown, record) => (
                <span className="tabular-nums text-red-500 font-semibold">
                  {formatVND(record.total - record.paid)}
                </span>
              ),
            },
            {
              title: 'Tiến độ',
              key: 'progress',
              width: 140,
              render: (_: unknown, record) => {
                const pct = record.total > 0 ? Math.round((record.paid / record.total) * 100) : 0
                return <Progress percent={pct} size="small" />
              },
            },
            {
              title: 'Hạn TT',
              dataIndex: 'due',
              width: 100,
            },
            {
              title: 'Tuổi nợ',
              dataIndex: 'age',
              width: 110,
              align: 'center' as const,
              render: (age: string) => (
                <Tag color={ageColorMap[age] || 'default'}>{ageLabelMap[age] || age}</Tag>
              ),
            },

          ]}
          dataSource={filteredCustomers}
          pagination={false}
          size="middle"
          scroll={{ x: 1000 }}
        />

        {/* Warning */}
        {criticalCustomers.length > 0 && (
          <Alert
            message={
              <span>
                <strong>{criticalCustomers.length} khách hàng</strong> có công nợ quá hạn trên 60 ngày · Tổng{' '}
                <strong className="text-red-500">{formatVND(criticalTotal)}</strong> · Đề xuất gửi email nhắc nhở tự động.
              </span>
            }
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            action={
              <Button size="small" type="primary" style={{ background: '#d97706' }}>
                Gửi nhắc nhở
              </Button>
            }
            className="mt-4"
          />
        )}
      </Card>
    </Space>
  )
}
