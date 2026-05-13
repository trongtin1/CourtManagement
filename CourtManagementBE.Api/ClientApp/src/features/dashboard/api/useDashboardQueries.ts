import { useQuery } from '@tanstack/react-query'

import { getDashboardSummary } from '@/features/dashboard/api/dashboardApi'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardQueryKeys.all, 'summary'] as const,
}

export const useDashboardSummaryQuery = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.summary(),
    queryFn: getDashboardSummary,
  })
}
