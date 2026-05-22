export type RefundReason = {
  refundReasonID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
}
export type RefundReasonRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}
