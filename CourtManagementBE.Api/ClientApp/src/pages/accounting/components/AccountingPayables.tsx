import { useState, useMemo } from 'react'
import { Card, Table, Tag, Space, Input, Select, Button, Statistic, Row, Col, Progress } from 'antd'
import {
  ShopOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAccountingPayablesQuery } from '@/features/accounting/api/useAccountingQueries'
import type { PayableResponse } from '@/features/accounting/model/types'

const urgColorMap: Record<string, string> = {
  due: 'red',
  soon: 'gold',
  ok: 'green',
}

const urgLabelMap: Record<string, string> = {
  due: 'Quá hạn',
  soon: 'Sắp đến hạn',
  ok: 'Còn hạn',
}

const formatVND = (v: number) => v.toLocaleString('vi-VN') + '₫'

export function AccountingPayables() {
  const query = useAccountingPayablesQuery()
  const suppliers = useMemo(() => query.data ?? [], [query.data])

  const [keyword, setKeyword] = useState('')
  const [urgFilter, setUrgFilter] = useState('all')

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesKeyword = s.name.toLowerCase().includes(keyword.toLowerCase()) || s.code.toLowerCase().includes(keyword.toLowerCase())
      const matchesUrg = urgFilter === 'all' || s.urg === urgFilter
      return matchesKeyword && matchesUrg
    })
  }, [suppliers, keyword, urgFilter])

  // Summary statistics
  const total = useMemo(() => suppliers.reduce((s, c) => s + (c.total - c.paid), 0), [suppliers])
  
  const dueTotal = useMemo(() => suppliers.filter(s => s.urg === 'due').reduce((s, c) => s + (c.total - c.paid), 0), [suppliers])
  const dueCount = useMemo(() => suppliers.filter(s => s.urg === 'due').length, [suppliers])

  const soonTotal = useMemo(() => suppliers.filter(s => s.urg === 'soon').reduce((s, c) => s + (c.total - c.paid), 0), [suppliers])
  const soonCount = useMemo(() => suppliers.filter(s => s.urg === 'soon').length, [suppliers])

  const paidMonth = useMemo(() => suppliers.reduce((s, c) => s + c.paid, 0), [suppliers])

  return (
    <Space className="w-full" direction="vertical" size={24}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Công nợ phải trả</h2>
          <p className="text-xs text-slate-500 mb-0">Theo dõi chi tiết các khoản phải thanh toán cho nhà cung cấp.</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => query.refetch()} loading={query.isFetching}>Tải lại</Button>
        </Space>
      </div>

      {/* Summary */}
      <Row gutter={[16, 16]}>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm" style={{ borderLeft: '4px solid #f59e0b' }}>
            <Statistic
              title="Tổng phải trả"
              value={formatVND(total)}
              valueStyle={{ color: '#d97706', fontSize: '20px' }}
            />
            <div className="text-xs text-slate-400 mt-1">{suppliers.length} nhà cung cấp</div>
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Quá hạn"
              value={formatVND(dueTotal)}
              valueStyle={{ color: '#ef4444' }}
            />
            <div className="text-xs text-slate-400 mt-1">{dueCount} NCC</div>
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Sắp đến hạn (7 ngày)"
              value={formatVND(soonTotal)}
              valueStyle={{ color: '#f59e0b' }}
            />
            <div className="text-xs text-slate-400 mt-1">{soonCount} NCC</div>
          </Card>
        </Col>
        <Col lg={6} md={12} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Đã thanh toán"
              value={formatVND(paidMonth)}
              valueStyle={{ color: '#22c55e' }}
            />
            <div className="text-xs text-slate-400 mt-1">Ghi nhận từ sổ cái</div>
          </Card>
        </Col>
      </Row>

      {/* Suppliers table */}
      <Card
        className="border-slate-200 shadow-sm"
        title="Danh sách nhà cung cấp"
        extra={<Tag>Dữ liệu đồng bộ sổ cái</Tag>}
      >
        <Space className="w-full mb-4" wrap>
          <Input.Search
            placeholder="Tìm nhà cung cấp…"
            style={{ width: 280 }}
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Select
            value={urgFilter}
            style={{ width: 160 }}
            onChange={setUrgFilter}
            options={[
              { label: 'Mọi trạng thái', value: 'all' },
              { label: 'Quá hạn', value: 'due' },
              { label: 'Sắp đến hạn', value: 'soon' },
              { label: 'Còn hạn', value: 'ok' },
            ]}
          />
        </Space>

        <Table
          rowKey="key"
          loading={query.isLoading}
          columns={[
            {
              title: 'Nhà cung cấp',
              key: 'supplier',
              render: (_: unknown, record: PayableResponse) => (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 text-amber-600">
                    <ShopOutlined />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{record.name}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {record.code} · Hạn {record.due}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'urg',
              width: 120,
              render: (urg: string) => (
                <Tag color={urgColorMap[urg] || 'default'}>{urgLabelMap[urg] || urg}</Tag>
              ),
            },
            {
              title: 'Tổng',
              dataIndex: 'total',
              width: 130,
              align: 'right' as const,
              render: (v: number) => <span className="tabular-nums">{formatVND(v)}</span>,
            },
            {
              title: 'Đã trả',
              dataIndex: 'paid',
              width: 130,
              align: 'right' as const,
              render: (v: number) => (
                <span className="tabular-nums text-emerald-600">{formatVND(v)}</span>
              ),
            },
            {
              title: 'Còn lại',
              key: 'remain',
              width: 130,
              align: 'right' as const,
              render: (_: unknown, record: PayableResponse) => (
                <span className="tabular-nums text-red-500 font-bold">
                  {formatVND(record.total - record.paid)}
                </span>
              ),
            },
            {
              title: 'Tiến độ',
              key: 'progress',
              width: 120,
              render: (_: unknown, record: PayableResponse) => {
                const pct = record.total > 0 ? Math.round((record.paid / record.total) * 100) : 0
                return <Progress percent={pct} size="small" strokeColor="#f59e0b" />
              },
            },

          ]}
          dataSource={filteredSuppliers}
          pagination={false}
          size="middle"
          scroll={{ x: 900 }}
        />
      </Card>
    </Space>
  )
}
