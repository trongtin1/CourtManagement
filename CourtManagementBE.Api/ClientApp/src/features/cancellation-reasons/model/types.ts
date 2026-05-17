export type CancellationReason = { cancellationReasonID: number; code: string; name: string; description: string; sortOrder: number; isActive: boolean; createdDate: string }
export type CreateCancellationReasonRequest = { code: string; name: string; description?: string; sortOrder?: number; isActive?: boolean }
export type UpdateCancellationReasonRequest = CreateCancellationReasonRequest
