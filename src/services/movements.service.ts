import { supabase } from '@/lib/supabase'
import type { StockMovement, MovementFormData } from '@/types'

export const movementsService = {
  async getAll(): Promise<StockMovement[]> {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(id, name, sku, unit)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return (data ?? []) as StockMovement[]
  },

  async create(data: MovementFormData & { user_id: string; company_id: string }): Promise<StockMovement> {
    const { data: movement, error } = await supabase
      .from('stock_movements')
      .insert(data)
      .select(`*, product:products(id, name, sku, unit)`)
      .single()

    if (error) throw error
    return movement as StockMovement
  },
}
