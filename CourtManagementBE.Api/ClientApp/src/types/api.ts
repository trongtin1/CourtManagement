export type ApiResponse<T> = {
  statusCode: number
  isSuccess: boolean
  message: string
  data: T
}

export type PaginationQuery = {
  page?: number
  pageSize?: number
}

export type PageList<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export type ApiError = {
  status?: number
  message: string
  errors?: Record<string, string[]>
}
