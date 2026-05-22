export type BookingStatus = {
  bookingStatusID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
  colorCode: string
  canCancel: boolean
  isFinal: boolean
}

export type BookingStatusRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  colorCode?: string
  canCancel?: boolean
  isFinal?: boolean
}
