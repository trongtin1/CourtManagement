import { apiGet } from '@/services/api/apiClient'
import type { CourtPriceHistory } from '../model/types'


export const courtPriceHistoryApi = {
  getByCourt: (courtId: number) =>
    apiGet<CourtPriceHistory[]>(`/courtpricehistory/court/${courtId}`),
  getByPriceSlot: (priceSlotId: number) =>
    apiGet<CourtPriceHistory[]>(`/courtpricehistory/price-slot/${priceSlotId}`),
}
