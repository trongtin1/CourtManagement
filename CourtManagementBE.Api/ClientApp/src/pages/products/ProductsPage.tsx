import { useState } from 'react'
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import { useProductsQuery } from '@/features/products/api/useProductsQueries'
import type { Product } from '@/features/products/model/types'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const statusColor: Record<Product['status'], string> = {
  Active: 'green',
  Draft: 'gold',
  Archived: 'default',
}

const columns: ColumnsType<Product> = [
  {
    title: 'Product',
    dataIndex: 'name',
    key: 'name',
    width: 220,
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: 160,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    width: 140,
    render: (price: Product['price']) => currencyFormatter.format(price),
  },
  {
    title: 'Stock',
    dataIndex: 'stock',
    key: 'stock',
    width: 120,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 140,
    render: (status: Product['status']) => (
      <Tag color={statusColor[status]}>{status}</Tag>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    fixed: 'right',
    width: 140,
    render: () => (
      <Space size={8}>
        <Button icon={<EditOutlined />} size="small" type="text" />
        <Button danger icon={<DeleteOutlined />} size="small" type="text" />
      </Space>
    ),
  },
]

export function ProductsPage() {
  const [tablePagination, setTablePagination] = useState<TablePaginationConfig>({})
  const productsQuery = useProductsQuery(
    tablePagination.current && tablePagination.pageSize
      ? { page: tablePagination.current, pageSize: tablePagination.pageSize }
      : undefined,
  )
  const products = productsQuery.data?.items ?? []

  const totalStock = products.reduce((total, product) => total + product.stock, 0)
  const activeProducts = products.filter((product) => product.status === 'Active').length

  if (productsQuery.isPending) {
    return <LoadingSpin tip="Loading products..." />
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Typography.Title className="mb-1!" level={2}>
            Products
          </Typography.Title>

          <Typography.Paragraph className="mb-0!" type="secondary">
            Simple mock product catalog for testing the app structure.
          </Typography.Paragraph>
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={productsQuery.isRefetching}
          onClick={() => productsQuery.refetch()}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <Statistic title="Total products" value={productsQuery.data?.totalCount ?? 0} />
        </Card>

        <Card>
          <Statistic title="Active products" value={activeProducts} />
        </Card>

        <Card>
          <Statistic title="Total stock" value={totalStock} />
        </Card>
      </div>

      <Card>
        <Table<Product>
          columns={columns}
          dataSource={products}
          loading={productsQuery.isFetching}
          onChange={(pagination) => setTablePagination(pagination)}
          pagination={{
            current: tablePagination.current ?? 1,
            pageSize: tablePagination.pageSize ?? 10,
            total: productsQuery.data?.totalCount ?? 0,
            showTotal: (total) => `Total ${total}`,
          }}
          rowKey="id"
          scroll={{ x: 920 }}
        />
      </Card>
    </div>
  )
}
