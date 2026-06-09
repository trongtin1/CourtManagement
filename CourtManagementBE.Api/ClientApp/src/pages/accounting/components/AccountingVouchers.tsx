import { Card, Table, Tag, Space, Input, DatePicker, Select, Button, Statistic, Row, Col } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useAccountingVouchersQuery } from '@/features/accounting/api/useAccountingQueries'
import { useState } from 'react'

const stateMap: Record<string, { color: string; label: string }> = {
  posted: { color: 'green', label: 'Đã ghi sổ' },
  draft: { color: 'gold', label: 'Nháp' },
  pending: { color: 'default', label: 'Chờ duyệt' },
  cancel: { color: 'red', label: 'Đã huỷ' },
}

const typeColorMap: Record<string, string> = {
  'Phiếu thu': 'green',
  'Phiếu chi': 'red',
  'Báo có NH': 'blue',
  'Báo nợ NH': 'gold',
  'Hoá đơn': 'default',
}

const formatVND = (v: number) => v.toLocaleString('vi-VN') + '₫'

export function AccountingVouchers() {
  const query = useAccountingVouchersQuery()
  const vouchers = query.data ?? []

  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')

  const filteredVouchers = vouchers.filter((v) => {
    const matchesKeyword = v.no.toLowerCase().includes(keyword.toLowerCase()) || v.desc.toLowerCase().includes(keyword.toLowerCase())
    
    let matchesType = true
    if (typeFilter !== 'all') {
      if (typeFilter === 'thu') matchesType = v.type === 'Phiếu thu'
      else if (typeFilter === 'chi') matchesType = v.type === 'Phiếu chi'
      else if (typeFilter === 'bank') matchesType = v.type === 'Báo có NH' || v.type === 'Báo nợ NH'
      else if (typeFilter === 'invoice') matchesType = v.type === 'Hoá đơn'
    }

    const matchesState = stateFilter === 'all' || v.state === stateFilter

    return matchesKeyword && matchesType && matchesState
  })

  const totalCount = vouchers.length
  const receiptsCount = vouchers.filter((v) => v.type === 'Phiếu thu').length
  const paymentsCount = vouchers.filter((v) => v.type === 'Phiếu chi').length
  const bankCount = vouchers.filter((v) => v.type === 'Báo có NH' || v.type === 'Báo nợ NH').length
  const draftCount = vouchers.filter((v) => v.state === 'draft').length

  return (
    <Space className="w-full" direction="vertical" size={24}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-0.5">Quản lý chứng từ</h2>
          <p className="text-xs text-slate-500 mb-0">Danh sách và trạng thái các chứng từ thu chi, hóa đơn gốc.</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => query.refetch()} loading={query.isFetching}>Tải lại</Button>
        </Space>
      </div>

      {/* Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={4}>
          <Card className="border-slate-200 shadow-sm" size="small">
            <Statistic title="Tổng chứng từ" value={totalCount} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="border-slate-200 shadow-sm" size="small">
            <Statistic title="Phiếu thu" value={receiptsCount} valueStyle={{ color: '#22c55e' }} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="border-slate-200 shadow-sm" size="small">
            <Statistic title="Phiếu chi" value={paymentsCount} valueStyle={{ color: '#ef4444' }} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="border-slate-200 shadow-sm" size="small">
            <Statistic title="Báo có/nợ" value={bankCount} valueStyle={{ color: '#3b82f6' }} />
          </Card>
        </Col>
        <Col xs={12} md={5}>
          <Card className="border-slate-200 shadow-sm" size="small">
            <Statistic title="Nháp / Chờ duyệt" value={draftCount} valueStyle={{ color: '#f59e0b' }} />
          </Card>
        </Col>
      </Row>

      {/* Vouchers Table */}
      <Card className="border-slate-200 shadow-sm" title="Danh sách chứng từ">
        <Space className="w-full mb-4" wrap>
          <Input.Search 
            placeholder="Tìm số chứng từ, diễn giải…" 
            style={{ width: 280 }} 
            allowClear 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <DatePicker placeholder="Ngày" />
          <Select
            value={typeFilter}
            style={{ width: 140 }}
            onChange={setTypeFilter}
            options={[
              { label: 'Tất cả loại', value: 'all' },
              { label: 'Phiếu thu', value: 'thu' },
              { label: 'Phiếu chi', value: 'chi' },
              { label: 'Báo có/nợ', value: 'bank' },
              { label: 'Hoá đơn', value: 'invoice' },
            ]}
          />
          <Select
            value={stateFilter}
            style={{ width: 150 }}
            onChange={setStateFilter}
            options={[
              { label: 'Mọi trạng thái', value: 'all' },
              { label: 'Đã ghi sổ', value: 'posted' },
              { label: 'Nháp', value: 'draft' },
              { label: 'Chờ duyệt', value: 'pending' },
              { label: 'Đã huỷ', value: 'cancel' },
            ]}
          />
        </Space>

        <Table
          rowKey="id"
          loading={query.isLoading}
          columns={[
            {
              title: 'Số CT',
              dataIndex: 'no',
              width: 150,
              render: (text: string) => <span className="font-mono text-xs font-bold">{text}</span>,
            },
            { title: 'Ngày', dataIndex: 'date', width: 110 },
            {
              title: 'Loại',
              dataIndex: 'type',
              width: 120,
              render: (text: string) => <Tag color={typeColorMap[text] || 'default'}>{text}</Tag>,
            },
            {
              title: 'Diễn giải',
              dataIndex: 'desc',
              ellipsis: true,
            },
            {
              title: 'Số tiền',
              dataIndex: 'amt',
              width: 140,
              align: 'right' as const,
              render: (v: number) => (
                <span className="font-semibold tabular-nums">{formatVND(v)}</span>
              ),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'state',
              width: 120,
              align: 'center' as const,
              render: (state: string) => {
                const s = stateMap[state] || { color: 'default', label: state }
                return <Tag color={s.color}>{s.label}</Tag>
              },
            }
          ]}
          dataSource={filteredVouchers}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Hiển thị 1–${Math.min(10, total)} / ${total} chứng từ`,
            showSizeChanger: true,
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
    </Space>
  )
}
