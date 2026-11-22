import { useState, useEffect, useCallback } from 'react'
import { productsService } from '@/services/products.service'
import { mockProducts } from '@/lib/mock-data'
import { useAuthStore } from '@/store/auth.store'
import type { Product, ProductFormData, ProductFilters } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export function useProducts(filters?: Partial<ProductFilters>) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (IS_DEMO) {
        await new Promise(r => setTimeout(r, 300))
        setProducts(mockProducts)
      } else {
        const result = await productsService.getAll(filters)
        setProducts(result.data)
      }
    } catch (e: any) {
      setError(e.message)
      if (IS_DEMO) setProducts(mockProducts)
    } finally {
      setIsLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  async function createProduct(data: ProductFormData) {
    if (IS_DEMO) {
      const novo: Product = {
        ...data, id: Math.random().toString(36).slice(2),
        company_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
      setProducts(prev => [novo, ...prev])
      return novo
    }
    const product = await productsService.create({ ...data, company_id: useAuthStore.getState().user?.company_id ?? '00000000-0000-0000-0000-000000000001' })
    setProducts(prev => [product, ...prev])
    return product
  }

  async function updateProduct(id: string, data: Partial<ProductFormData>) {
    if (IS_DEMO) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p))
      return
    }
    const updated = await productsService.update(id, data)
    setProducts(prev => prev.map(p => p.id === id ? updated : p))
  }

  async function deleteProduct(id: string) {
    if (IS_DEMO) {
      setProducts(prev => prev.filter(p => p.id !== id))
      return
    }
    await productsService.delete(id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  return { products, isLoading, error, refetch: fetch, createProduct, updateProduct, deleteProduct }
}
