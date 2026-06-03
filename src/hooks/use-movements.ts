import { useState, useEffect, useCallback } from 'react'
import { movementsService } from '@/services/movements.service'
import { mockMovements, mockProducts } from '@/lib/mock-data'
import { useAuthStore } from '@/store/auth.store'
import type { StockMovement, MovementFormData } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export function useMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()

  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (IS_DEMO) {
        await new Promise(r => setTimeout(r, 300))
        setMovements(mockMovements)
      } else {
        const data = await movementsService.getAll()
        setMovements(data)
      }
    } catch {
      setMovements(mockMovements)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function createMovement(data: MovementFormData) {
    if (IS_DEMO) {
      const product = mockProducts.find(p => p.id === data.product_id)
      const novo: StockMovement = {
        ...data, id: Math.random().toString(36).slice(2),
        product, balance_after: 0, user_id: 'u1',
        company_id: '1', created_at: new Date().toISOString(),
      }
      setMovements(prev => [novo, ...prev])
      return
    }
    const movement = await movementsService.create({
      ...data,
      user_id: user?.id ?? '',
      company_id: '1',
    })
    setMovements(prev => [movement, ...prev])
  }

  return { movements, isLoading, refetch: fetch, createMovement }
}
