import type { PaginationQuery } from '@/types/api'

export interface BookingResource extends PaginationQuery {
  bookingGroupID?: number
  status?: string
}
