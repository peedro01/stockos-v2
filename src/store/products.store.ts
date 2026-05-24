import { create } from 'zustand'
import type { Product, ProductFilters } from '../types'
import { mockProducts } from '../lib/mock-data'

interface ProductsState {
  products: Product[]
  filters: ProductFilters
  isLoading: boolean
  setProducts: (products: Product[]) => void
  setFilters: (filters: Partial<ProductFilters>) => void
  setLoading: (loading: boolean) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
}

const defaultFilters: ProductFilters = {
  search: '',
  status: 'all',
  stockStatus: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  perPage: 20,
}

export const useProductsStore = create<ProductsState>()((set) => ({
  products: mockProducts,
  filters: defaultFilters,
  isLoading: false,
  setProducts: (products) => set({ products }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters, page: 1 } })),
  setLoading: (isLoading) => set({ isLoading }),
  addProduct: (product) => set((s) => ({ products: [product, ...s.products] })),
  updateProduct: (id, updates) =>
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
}))
