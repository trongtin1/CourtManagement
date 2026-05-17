import { useState } from 'react'
import { Button, Card, Col, Input, Row, Select, Space, Statistic, Table, Tag } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import { usePaymentsQuery } from '@/features/payments/api/usePaymentQueries'
import type { Payment } from '@/features/payments/model/types'

const statusColors: Record<string, string> = {
  failed: 'volcano',
  paid: 'green',
  pending: 'orange',
  refunded: 'red',
}

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function PaymentsPage() {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = usePaymentsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )

  if (query.isPending) return <LoadingSpin tip="Đang tải thanh toán..." />

  const payments = query.data?.items ?? []
  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      !normalizedSearch ||
      payment.bookingID?.toLowerCase().includes(normalizedSearch) ||
      payment.paymentMethod?.toLowerCase().includes(normalizedSearch) ||
      payment.transactionID?.toLowerCase().includes(normalizedSearch) ||
      payment.note?.toLowerCase().includes(normalizedSearch)
    const matchesStatus = !statusFilter || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })
  const paidAmount = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + (payment.amount ?? 0), 0)
  const refundedAmount = payments.reduce(
    (sum, payment) => sum + (payment.refundedAmount ?? 0),
    0,
  )

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Space wrap>
          <Input.Search
            allowClear
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm booking, giao dịch, ghi chú..."
            style={{ width: 300 }}
            value={searchText}
          />
          <Select
            allowClear
            onChange={setStatusFilter}
            options={[
              { label: 'Chờ thanh toán', value: 'pending' },
              { label: 'Đã thanh toán', value: 'paid' },
              { label: 'Đã hoàn tiền', value: 'refunded' },
              { label: 'Thất bại', value: 'failed' },
            ]}
            placeholder="Trạng thái"
            style={{ width: 170 }}
            value={statusFilter}
          />
        </Space>
        <Button
          icon={<ReloadOutlined />}
          loading={query.isRefetching}
          onClick={() => query.refetch()}
        >
          Làm mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic title="Giao dịch đang hiển thị" value={filteredPayments.length} />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Đã thanh toán"
              value={paidAmount}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card className="border-slate-200 shadow-sm">
            <Statistic
              title="Đã hoàn"
              value={refundedAmount}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      <Card className="border-slate-200 shadow-sm" title="Lịch sử thanh toán">
        <Table<Payment>
          columns={[
            { title: 'ID', dataIndex: 'paymentID', width: 70 },
            { title: 'Booking ID', dataIndex: 'bookingID', ellipsis: true, width: 260 },
            {
              title: 'Số tiền',
              dataIndex: 'amount',
              width: 120,
              render: (value: number) => formatCurrency(value ?? 0),
            },
            { title: 'Phương thức', dataIndex: 'paymentMethod', width: 130 },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              width: 120,
              render: (value: string) => (
                <Tag color={statusColors[value] || 'default'}>{value}</Tag>
              ),
            },
            {
              title: 'Ngày TT',
              dataIndex: 'paymentDate',
              width: 120,
              render: (value: string) =>
                value ? new Date(value).toLocaleDateString('vi-VN') : '-',
            },
            { title: 'Ghi chú', dataIndex: 'note', ellipsis: true },
          ]}
          dataSource={filteredPayments}
          loading={query.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          rowKey="paymentID"
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: query.data?.totalCount ?? 0,
            showTotal: (total) => `Tổng ${total}`,
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>
    </Space>
  )
}
