import { useState } from 'react'
import { Button, Card, Space, Table, Tag, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { TablePaginationConfig } from 'antd/es/table'
import { LoadingSpin } from '@/components/common/LoadingSpin'
import { usePaymentsQuery } from '@/features/payments/api/usePaymentQueries'
import type { Payment } from '@/features/payments/model/types'

const statusColors: Record<string, string> = { pending: 'orange', paid: 'green', refunded: 'red', failed: 'volcano' }

export function PaymentsPage() {
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const query = usePaymentsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )

  if (query.isPending) return <LoadingSpin tip="Đang tải thanh toán..." />

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={2}>Quản lý Thanh toán</Typography.Title>
          <Typography.Paragraph type="secondary">Lịch sử thanh toán</Typography.Paragraph>
        </div>
        <Button icon={<ReloadOutlined />} loading={query.isRefetching} onClick={() => query.refetch()}>Làm mới</Button>
      </div>
      <Card>
        <Table<Payment>
          columns={[
            { title: 'ID', dataIndex: 'paymentID', width: 70 },
            { title: 'Booking ID', dataIndex: 'bookingID', ellipsis: true, width: 260 },
            { title: 'Số tiền', dataIndex: 'amount', width: 120, render: (v: number) => v?.toLocaleString('vi-VN') + 'đ' },
            { title: 'Phương thức', dataIndex: 'paymentMethod', width: 120 },
            { title: 'Trạng thái', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag> },
            { title: 'Ngày TT', dataIndex: 'paymentDate', width: 120, render: (v: string) => v ? new Date(v).toLocaleDateString('vi-VN') : '—' },
            { title: 'Ghi chú', dataIndex: 'note', ellipsis: true },
          ]}
          dataSource={query.data?.items ?? []} loading={query.isFetching} onChange={(pagination) => setTablePagination(pagination)} rowKey="paymentID" pagination={{ current: tablePagination.current ?? 1, pageSize: tablePagination.pageSize ?? 10, total: query.data?.totalCount ?? 0, showTotal: (t) => `Tổng ${t}` }} scroll={{ x: 900 }} size="middle"
        />
      </Card>
    </Space>
  )
}
