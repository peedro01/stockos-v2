import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { mockProducts, mockMovements } from '@/lib/mock-data'
import type { Product, StockMovement } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export function useProductDetail(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      if (IS_DEMO) {
        setProduct(mockProducts.find(p => p.id === id) ?? null)
        setMovements(mockMovements.filter(m => m.product_id === id))
        return
      }
      const [pRes, mRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(id, name, color), supplier:suppliers(id, company_name)')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('stock_movements')
          .select('id, product_id, type, quantity, unit_cost, balance_after, reference, notes, user_id, created_at, user:user_profiles(full_name)')
          .eq('product_id', id)
          .order('created_at', { ascending: false })
          .limit(500),
      ])
      if (pRes.error) throw pRes.error
      if (mRes.error) throw mRes.error
      setProduct((pRes.data as unknown as Product) ?? null)
      setMovements((mRes.data ?? []) as unknown as StockMovement[])
    } catch (e: any) {
      console.error('Erro ao carregar produto', e)
      setError(e?.message ?? 'Erro ao carregar produto')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { fetch() }, [fetch])

  return { product, setProduct, movements, isLoading, error, refetch: fetch }
}
