export type Payment = {
  paymentID: number
  bookingID: string
  amount: number
  refundedAmount: number
  paymentMethod: string
  status: string
  note: string
  paymentDate: string
  createdDate: string
}

export type CreatePaymentRequest = {
  bookingID: string
  amount: number
  paymentMethod: string
  status?: string
  note?: string
  paymentDate: string
}

export type UpdatePaymentRequest = {
  status: string
  refundedAmount?: number
  note?: string
}
