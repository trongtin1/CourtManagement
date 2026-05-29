import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type { UnitConversion, UnitConversionRequest } from '../model/types'

export const unitConversionApi = {
  getByService: (serviceId: number) => 
    apiGet<UnitConversion[]>(`/UnitConversion/service/${serviceId}`),
  
  getById: (id: number) => 
    apiGet<UnitConversion>(`/UnitConversion/${id}`),
  
  create: (data: UnitConversionRequest) => 
    apiPost<UnitConversion>('/UnitConversion', data),
  
  update: (id: number, data: UnitConversionRequest) => 
    apiPut<UnitConversion>(`/UnitConversion/${id}`, data),
  
  delete: (id: number) => 
    apiDelete(`/UnitConversion/${id}`),
  
  convert: (params: { serviceId: number; fromUnitId: number; toUnitId: number; quantity: number }) => 
    apiGet<number>('/UnitConversion/convert', params),
}
