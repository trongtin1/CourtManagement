export type BookingStatus = {
  bookingStatusID: number
  code: string
  statusName: string
  labelName: string
  isTerminal: boolean
  canReschedule: boolean
  canCombo: boolean
  canService: boolean
  colorCode: string
}

export type BookingStatusRequest = {
  code: string
  statusName: string
  labelName: string
  isTerminal: boolean
  canReschedule: boolean
  canCombo: boolean
  canService: boolean
  colorCode: string
}
