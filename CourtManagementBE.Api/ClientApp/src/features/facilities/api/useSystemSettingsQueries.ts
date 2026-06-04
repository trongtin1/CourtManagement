import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { systemSettingsApi } from './systemSettingsApi'
import type { SystemSettings } from './systemSettingsApi'

export const systemSettingsKeys = {
  all: ['systemSettings'] as const,
}

export const useSystemSettingsQuery = () =>
  useQuery({
    queryKey: systemSettingsKeys.all,
    queryFn: () => systemSettingsApi.get(),
  })

export const useUpdateSystemSettingsMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SystemSettings) => systemSettingsApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: systemSettingsKeys.all }),
  })
}
