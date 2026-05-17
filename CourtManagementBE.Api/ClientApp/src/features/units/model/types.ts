export type Unit = { unitID: number; code: string; name: string; description: string; sortOrder: number; isActive: boolean; createdDate: string; symbol: string }
export type CreateUnitRequest = { code: string; name: string; description?: string; sortOrder?: number; isActive?: boolean; symbol?: string }
export type UpdateUnitRequest = CreateUnitRequest
