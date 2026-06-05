import { apiGet, apiPut } from '@/services/api/apiClient'

export type SystemSettings = {
  slotDurationMinutes: number
  openingTime: string
  closingTime: string
  timezone: string
  enableCancellationFee: boolean
  cancellationFeePercent: number
  cancellationThresholdHours: number
  bufferDurationMinutes: number
  minBookingDurationMinutes: number
  maxBookingDurationMinutes: number
  minAllowableGapMinutes: number
  maxPreBookingDays: number
  enableDeposit: boolean
  depositPercent: number
}

export const systemSettingsApi = {
  get: () => apiGet<SystemSettings>('/system-settings'),
  update: (data: SystemSettings) => apiPut<SystemSettings>('/system-settings', data),
}
