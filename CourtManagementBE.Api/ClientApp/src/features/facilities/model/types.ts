export type Facility = {
  facilityID: number
  facilityName: string
  address: string
  phone: string
  email: string
  openingTime: string
  closingTime: string
  slotDurationMinutes: number
  imageURL: string
  description: string
  createDate: string
  isActive: boolean
}

export type FacilityRequest = {
  facilityName: string
  address?: string
  phone?: string
  email?: string
  openingTime?: string
  closingTime?: string
  slotDurationMinutes?: number
  imageURL?: string
  description?: string
  isActive?: boolean
}
