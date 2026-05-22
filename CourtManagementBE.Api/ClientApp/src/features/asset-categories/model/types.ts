export type AssetCategory = {
  assetCategoryID: number
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
  createdDate: string
}
export type AssetCategoryRequest = {
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}
