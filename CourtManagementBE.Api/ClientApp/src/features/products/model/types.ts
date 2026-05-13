export type ProductStatus = 'Active' | 'Draft' | 'Archived'

export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: ProductStatus
}
