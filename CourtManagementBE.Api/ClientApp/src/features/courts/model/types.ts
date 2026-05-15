export type Court = {
  courtID: number
  facilityID: number
  courtTypeID: number
  courtCode: string
  courtName: string
  statusID: number
  length: number
  width: number
  capacity: number
  sortOrder: number
  description: string
  imageURL: string
  isActive: boolean
  createDate: string
}

export type CreateCourtRequest = {
  facilityID: number
  courtTypeID: number
  courtCode: string
  courtName: string
  statusID: number
  length?: number
  width?: number
  capacity?: number
  sortOrder?: number
  description?: string
  imageURL?: string
  isActive?: boolean
}

export type UpdateCourtRequest = {
  courtTypeID: number
  courtCode: string
  courtName: string
  statusID: number
  length?: number
  width?: number
  capacity?: number
  sortOrder?: number
  description?: string
  imageURL?: string
  isActive?: boolean
}

export type CourtType = {
  courtTypeID: number
  code: string
  name: string
  description: string
  isActive: boolean
}

export type CreateCourtTypeRequest = {
  code: string
  name: string
  description?: string
  isActive?: boolean
}

export type UpdateCourtTypeRequest = CreateCourtTypeRequest

export type CourtStatus = {
  statusID: number
  statusCode: string
  statusName: string
  colorCode: string
  description: string
  createDate: string
  isActive: boolean
}

export type CreateCourtStatusRequest = {
  statusCode: string
  statusName: string
  colorCode?: string
  description?: string
  isActive?: boolean
}

export type UpdateCourtStatusRequest = CreateCourtStatusRequest

export type CourtFeature = {
  courtFeatureID: number
  featureCode: string
  featureName: string
  category: string
  description: string
  createDate: string
  createdBy: string
  isActive: boolean
}

export type CreateCourtFeatureRequest = {
  featureCode: string
  featureName: string
  category: string
  description?: string
  isActive?: boolean
}

export type UpdateCourtFeatureRequest = CreateCourtFeatureRequest

export type CourtFeatureMapping = {
  courtFeatureMappingID: number
  courtID: number
  courtFeatureID: number
  createDate: string
}

export type CreateCourtFeatureMappingRequest = {
  courtID: number
  courtFeatureID: number
}

export type CourtAsset = {
  courtAssetID: number
  courtID: number
  assetCode: string
  assetName: string
  category: string
  quantity: number
  unit: string
  condition: string
  purchaseDate?: string | null
  purchasePrice?: number | null
  lastMaintenanceDate?: string | null
  nextMaintenanceDate?: string | null
  note: string
  isActive: boolean
  createDate: string
  createdBy: string
  modifiedDate: string
  modifiedBy: string
}

export type CreateCourtAssetRequest = {
  courtID: number
  assetCode: string
  assetName: string
  category?: string
  quantity?: number
  unit?: string
  condition?: string
  purchaseDate?: string | null
  purchasePrice?: number | null
  lastMaintenanceDate?: string | null
  nextMaintenanceDate?: string | null
  note?: string
  isActive?: boolean
}

export type UpdateCourtAssetRequest = Omit<CreateCourtAssetRequest, 'courtID'>

export type TimeSlot = {
  timeSlotID: number
  slotName: string
  startTime: string
  endTime: string
  isActive: boolean
}

export type CreateTimeSlotRequest = {
  slotName: string
  startTime: string
  endTime: string
  isActive?: boolean
}

export type UpdateTimeSlotRequest = {
  slotName: string
  startTime: string
  endTime: string
  isActive?: boolean
}

export type CourtPrice = {
  id: number
  courtID: number
  timeSlotID: number
  dayOfWeek: number
  price: number
  isActive: boolean
  createdDate: string
}

export type CreateCourtPriceRequest = {
  courtID: number
  timeSlotID: number
  dayOfWeek: number
  price: number
  isActive?: boolean
}

export type UpdateCourtPriceRequest = Omit<CreateCourtPriceRequest, 'courtID'>

export type CourtAreaMapping = {
  courtAreaMappingID: number
  courtID: number
  areaID: number
  positionX: number
  positionY: number
  displayOrder: number
  createDate: string
}

export type CreateCourtAreaMappingRequest = {
  courtID: number
  areaID: number
  positionX?: number
  positionY?: number
  displayOrder?: number
}

export type UpdateCourtAreaMappingRequest = {
  positionX: number
  positionY: number
  displayOrder: number
}

export type CourtUtility = {
  courtUtilitiesID: number
  courtID: number
  utilityID: number
  createDate: string
}

export type CreateCourtUtilityRequest = {
  courtID: number
  utilityID: number
}

export type CourtPriceHistory = {
  courtPriceHistoryID: number
  courtPriceByTimeSlotID: number
  courtID: number
  timeSlotID: number
  dayOfWeek: number
  oldPrice: number
  newPrice: number
  changeDate: string
  changedBy: string
  reason: string
}
