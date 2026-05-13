import type { ReactNode } from 'react'

export type DashboardMetric = {
  key: string
  title: string
  value: number
  icon: ReactNode
  iconKey?: string
}

export type DashboardSummary = {
  metrics: DashboardMetric[]
  overview: string
}
