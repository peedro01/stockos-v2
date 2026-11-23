import { supabase } from '@/lib/supabase'
import type { StockMovement, MovementFormData } from '@/types'

export const movementsService = {
  async getAll(): Promise<StockMovement[]> {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(id, name, sku, unit),
        user:user_profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return (data ?? []) as StockMovement[]
  },

  async create(data: MovementFormData & { user_id: string; company_id: string }): Promise<StockMovement> {
    const payload: Record<string, any> = {
      ...data,
      reference: data.reference || null,
      notes: data.notes || null,
      unit_cost: data.type === 'entrada' && data.unit_cost ? data.unit_cost : null,
    }
    payload.total_cost = payload.unit_cost ? Number((payload.unit_cost * data.quantity).toFixed(2)) : null

    const { data: movement, error } = await supabase
      .from('stock_movements')
      .insert(payload)
      .select(`*, product:products(id, name, sku, unit)`)
      .single()

    if (error) throw error
    return movement as StockMovement
  },
}
