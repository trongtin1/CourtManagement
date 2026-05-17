export type AssetCategory = { assetCategoryID: number; code: string; name: string; description: string; sortOrder: number; isActive: boolean; createdDate: string }
export type CreateAssetCategoryRequest = { code: string; name: string; description?: string; sortOrder?: number; isActive?: boolean }
export type UpdateAssetCategoryRequest = CreateAssetCategoryRequest
