export type CancellationReason = {
  cancellationReasonID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
}
export type CancellationReasonRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}
