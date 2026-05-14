export type Court = {
  courtID: number
  facilityID: number
  areaID: number | null
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
  areaID?: number | null
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
  areaID?: number | null
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
  description: string
  createDate: string
  createdBy: string
  isActive: boolean
}

export type CreateCourtFeatureRequest = {
  featureCode: string
  featureName: string
  description?: string
  isActive?: boolean
}

export type UpdateCourtFeatureRequest = CreateCourtFeatureRequest

export type TimeSlot = {
  timeSlotID: number
  tenantID: number
  slotName: string
  startTime: string
  endTime: string
  isActive: boolean
}

export type CreateTimeSlotRequest = {
  tenantID: number
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
