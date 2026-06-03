import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { UnitConversion, UnitConversionRequest } from '../model/types'

export const unitConversionApi = {
  getByService: (serviceId: number) => 
    apiGet<UnitConversion[]>(`/UnitConversion/service/${serviceId}`),
  
  create: (data: UnitConversionRequest) => 
    apiPost<UnitConversion>('/UnitConversion', data),
  
  update: (id: number, data: UnitConversionRequest) => 
    apiPut<UnitConversion>(`/UnitConversion/${id}`, data),
  
  delete: (id: number) => 
    apiDelete(`/UnitConversion/${id}`),
}
