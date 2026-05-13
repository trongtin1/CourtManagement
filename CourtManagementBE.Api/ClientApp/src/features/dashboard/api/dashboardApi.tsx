import { CalendarOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons'

import type { DashboardSummary } from '@/features/dashboard/model/types'
import { apiGet } from '@/services/api/apiClient'

type DashboardSummaryDto = {
  metrics: Array<{
    key: string
    title: string
    value: number
    iconKey: string
  }>
  overview: string
}

const iconByKey = {
  calendar: <CalendarOutlined />,
  'file-text': <FileTextOutlined />,
  team: <TeamOutlined />,
} as const

const dashboardEndpoints = {
  summary: '/dashboard/summary',
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const summary = await apiGet<DashboardSummaryDto>(dashboardEndpoints.summary)

  return {
    ...summary,
    metrics: summary.metrics.map((metric) => ({
      ...metric,
      icon: iconByKey[metric.iconKey as keyof typeof iconByKey] ?? <FileTextOutlined />,
    })),
  }
}
