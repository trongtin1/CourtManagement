export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
export type BookingGroupStatus = 'Active' | 'Paused' | 'Cancelled' | 'Completed'
export type BookingGroupType = 'recurring' | 'tournament' | 'corporate'

export type Booking = {
  bookingID: string
  courtID: number
  customerID: number
  bookingGroupID?: number | null
  bookingDate: string
  totalAmount: number
  comboID?: number | null
  status: BookingStatus
  note: string
  cancellationReason: string
  cancelledAt: string | null
  createdDate: string
  startTime?: string
  endTime?: string
}

export type BookingGroup = {
  bookingGroupID: number
  groupType: BookingGroupType
  customerID?: number | null
  facilityID?: number | null
  comboID?: number | null
  groupName: string
  totalAmount: number
  paidAmount: number
  status: BookingGroupStatus
  note: string
  createdDate: string
  recurringConfig?: RecurringConfig | null
}

export type RecurringConfig = {
  recurringConfigID: number
  bookingGroupID: number
  courtID: number
  startDate: string
  endDate: string
  daysOfWeek: string
  startTime: string
  endTime: string
}

export type CreateBookingRequest = {
  courtID: number
  customerID: number
  bookingDate: string
  totalAmount?: number
  comboID?: number | null
  status?: string
  note?: string
}

export type CreateFullBookingRequest = {
  courtID: number
  customerID: number
  bookingDate: string
  comboID?: number | null
  note?: string
  slots: Array<{
    startTime: string
    endTime: string
  }>
  services: Array<{
    serviceID: number
    quantity: number
  }>
}

export type UpdateBookingRequest = {
  status: string
  note?: string
  cancellationReason?: string
  totalAmount?: number
}

export type CancelBookingRequest = {
  cancellationReason: string
}

export type CreateBookingGroupRequest = {
  groupType: BookingGroupType
  customerID?: number | null
  facilityID?: number | null
  comboID?: number | null
  groupName: string
  totalAmount?: number
  paidAmount?: number
  status?: string
  note?: string
  recurringConfig?: {
    courtID: number
    startDate: string
    endDate: string
    daysOfWeek: string
    startTime: string
    endTime: string
  } | null
}

export type CancelBookingGroupRequest = {
  reason: string
}

export type BookingService = {
  bookingServiceID: number
  bookingID: string
  serviceID: number
  quantity: number
  unitPrice: number
  discountAmount: number
  totalAmount: number
  status: string
  createdDate: string
}

export type BookingSlot = {
  id: number
  bookingID: string
  courtID: number
  bookingDate: string
  startTime: string
  endTime: string
}
