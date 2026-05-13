import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Row, Space, Statistic, Typography } from 'antd'

import { LoadingSpin } from '@/components/common/LoadingSpin'
import { useDashboardSummaryQuery } from '@/features/dashboard/api/useDashboardQueries'
import { useCurrentUserQuery } from '@/features/auth/api/useAuthQueries'
import { selectCurrentUser } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/hooks/redux'

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
        <div>
          <Typography.Title level={2}>Dashboard</Typography.Title>
          <Typography.Paragraph type="secondary">
            Welcome back, {user?.fullName || 'User'}.
          </Typography.Paragraph>
        </div>

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
          message="Unable to load dashboard data"
          showIcon
          type="error"
        />
      </Space>
    )
  }

  const summary = dashboardSummaryQuery.data

  return (
    <Space className="w-full" direction="vertical" size={24}>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div>
          <Typography.Title level={2}>Dashboard</Typography.Title>
          <Typography.Paragraph type="secondary">
            Welcome back, {currentUserQuery.data?.fullName || user?.fullName || 'User'}.
          </Typography.Paragraph>
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={dashboardSummaryQuery.isRefetching}
          onClick={() => dashboardSummaryQuery.refetch()}
        >
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {summary.metrics.map((metric) => (
          <Col key={metric.key} lg={8} md={12} xs={24}>
            <Card>
              <Statistic prefix={metric.icon} title={metric.title} value={metric.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Operational overview">
        <Typography.Paragraph>{summary.overview}</Typography.Paragraph>
      </Card>
    </Space>
  )
}
