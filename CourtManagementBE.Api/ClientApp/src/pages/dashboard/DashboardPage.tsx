import {
  CalendarOutlined,
  CreditCardOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Col, Row, Space, Statistic, Typography } from 'antd'
import { Link } from 'react-router-dom'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import { ROUTES } from '@/constants/routes'
import { useDashboardSummaryQuery } from '@/features/dashboard/api/useDashboardQueries'
import { useCurrentUserQuery } from '@/features/auth/api/useAuthQueries'
import { selectCurrentUser } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/hooks/redux'

const quickActions = [
  {
    title: 'Tạo booking',
    description: 'Ghi nhận lịch đặt sân mới',
    icon: <PlusOutlined />,
    to: ROUTES.bookings,
  },
  {
    title: 'Xem lịch đặt sân',
    description: 'Kiểm tra các lượt đặt gần nhất',
    icon: <CalendarOutlined />,
    to: ROUTES.bookings,
  },
  {
    title: 'Quản lý sân',
    description: 'Cập nhật trạng thái và thông tin sân',
    icon: <ShopOutlined />,
    to: ROUTES.courts,
  },
  {
    title: 'Thanh toán',
    description: 'Theo dõi các giao dịch phát sinh',
    icon: <CreditCardOutlined />,
    to: ROUTES.payments,
  },
]

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser)
  const currentUserQuery = useCurrentUserQuery()
  const dashboardSummaryQuery = useDashboardSummaryQuery()

  if (dashboardSummaryQuery.isPending) {
    return <LoadingSpin tip="Loading dashboard..." />
  }

  if (dashboardSummaryQuery.isError) {
    return (
      <Space className="w-full" direction="vertical" size={24}>
        <Alert
          action={
            <Button
              icon={<ReloadOutlined />}
              loading={dashboardSummaryQuery.isRefetching}
              onClick={() => dashboardSummaryQuery.refetch()}
              size="small"
            >
              Retry
            </Button>
          }
          message="Không tải được dữ liệu tổng quan"
          showIcon
          type="error"
        />
      </Space>
    )
  }

  const summary = dashboardSummaryQuery.data

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 md:flex-row md:items-center">
        <Space direction="vertical" size={2}>
          <Typography.Text className="text-slate-500!">Xin chào</Typography.Text>
          <Typography.Title className="mb-0!" level={3}>
            {currentUserQuery.data?.fullName || user?.fullName || 'Admin'}
          </Typography.Title>
        </Space>
        <Button
          icon={<ReloadOutlined />}
          loading={dashboardSummaryQuery.isRefetching}
          onClick={() => dashboardSummaryQuery.refetch()}
        >
          Làm mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {summary.metrics.map((metric) => (
          <Col key={metric.key} lg={8} md={12} xs={24}>
            <Card className="h-full border-slate-200 shadow-sm">
              <Statistic
                prefix={<span className="text-blue-600">{metric.icon}</span>}
                title={metric.title}
                value={metric.value}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col lg={16} xs={24}>
          <Card className="h-full border-slate-200 shadow-sm" title="Tổng quan vận hành">
            <Typography.Paragraph className="mb-0! text-slate-600!">
              {summary.overview}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col lg={8} xs={24}>
          <Card className="h-full border-slate-200 shadow-sm" title="Tác vụ nhanh">
            <Space className="w-full" direction="vertical" size={10}>
              {quickActions.map((action) => (
                <Link
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-slate-900 transition hover:border-blue-300 hover:bg-blue-50"
                  key={action.title}
                  to={action.to}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-blue-700">
                    {action.icon}
                  </span>
                  <span className="min-w-0">
                    <Typography.Text strong>{action.title}</Typography.Text>
                    <Typography.Text className="block text-sm text-slate-500!">
                      {action.description}
                    </Typography.Text>
                  </span>
                </Link>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}
