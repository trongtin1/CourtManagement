import { apiGet, apiPut } from '@/services/api/apiClient'

export type SystemSettings = {
  slotDurationMinutes: number
  openingTime: string
  closingTime: string
  timezone: string
  enableCancellationFee: boolean
  cancellationFeePercent: number
  cancellationThresholdHours: number
}

export const systemSettingsApi = {
  get: () => apiGet<SystemSettings>('/system-settings'),
  update: (data: SystemSettings) => apiPut<SystemSettings>('/system-settings', data),
}
