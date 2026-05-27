export type Booking = {
  bookingID: string
  courtID: number
  customerID: number
  bookingDate: string
  totalAmount: number
  status: string
  note: string
  cancellationReason: string
  cancelledAt: string | null
  createdDate: string
}

export type CreateBookingRequest = {
  courtID: number
  customerID: number
  bookingDate: string
  totalAmount?: number
  status?: string
  note?: string
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

export type CreateBookingServiceRequest = {
  bookingID: string
  serviceID: number
  quantity: number
  unitPrice: number
  discountAmount?: number
  status?: string
}

export type UpdateBookingServiceRequest = {
  quantity: number
  discountAmount?: number
  status: string
}

export type BookingSlot = {
  id: number
  bookingID: string
  courtID: number
  bookingDate: string
  startTime: string
  endTime: string
}

export type CreateBookingSlotRequest = {
  bookingID: string
  courtID: number
  bookingDate: string
  startTime: string
  endTime: string
}
