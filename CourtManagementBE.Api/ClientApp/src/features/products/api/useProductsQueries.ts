import { useQuery } from '@tanstack/react-query'

import { getProducts } from '@/features/products/api/productsApi'
import type { PaginationQuery } from '@/types/api'

export const productQueryKeys = {
  all: ['products'] as const,
  list: (params?: PaginationQuery) => [...productQueryKeys.all, 'list', params] as const,
}

export const useProductsQuery = (params?: PaginationQuery) => {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getProducts(params),
  })
}
