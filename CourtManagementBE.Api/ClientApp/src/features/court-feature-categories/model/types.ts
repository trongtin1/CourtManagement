export type CourtFeatureCategory = { courtFeatureCategoryID: number; code: string; name: string; description: string; sortOrder: number; isActive: boolean; createdDate: string }
export type CreateCourtFeatureCategoryRequest = { code: string; name: string; description?: string; sortOrder?: number; isActive?: boolean }
export type UpdateCourtFeatureCategoryRequest = CreateCourtFeatureCategoryRequest
