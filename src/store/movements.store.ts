import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockMovements } from '../lib/mock-data'
import type { StockMovement, MovementFormData } from '../types'
import { mockProducts } from '../lib/mock-data'

interface MovementsState {
  movements: StockMovement[]
  addMovement: (data: MovementFormData) => void
}

export const useMovementsStore = create<MovementsState>()(
  persist(
    (set) => ({
      movements: mockMovements,
      addMovement: (data) => {
        const product = mockProducts.find(p => p.id === data.product_id)
        const movement: StockMovement = {
          id: Math.random().toString(36).slice(2),
          product_id: data.product_id,
          product,
          type: data.type,
          quantity: data.quantity,
          balance_after: 0,
          unit_cost: data.unit_cost,
          total_cost: data.unit_cost ? data.unit_cost * data.quantity : undefined,
          reference: data.reference,
          notes: data.notes,
          user_id: 'u1',
          company_id: '1',
          created_at: new Date().toISOString(),
        }
        set((s) => ({ movements: [movement, ...s.movements] }))
      },
    }),
    { name: 'stockos-movements' }
  )
)
