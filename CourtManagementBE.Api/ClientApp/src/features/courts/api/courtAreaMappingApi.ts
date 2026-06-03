import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/apiClient'
import type {
  CourtAreaMapping,
  CreateCourtAreaMappingRequest,
  UpdateCourtAreaMappingRequest,
} from '../model/types'


export const courtAreaMappingApi = {
  getByArea: (areaId: number) =>
    apiGet<CourtAreaMapping[]>(`/courtareamapping/area/${areaId}`),
  create: (data: CreateCourtAreaMappingRequest) =>
    apiPost<CourtAreaMapping>(`/courtareamapping`, data),
  update: (id: number, data: UpdateCourtAreaMappingRequest) =>
    apiPut<CourtAreaMapping>(`/courtareamapping/${id}`, data),
  delete: (id: number) => apiDelete(`/courtareamapping/${id}`),
}
