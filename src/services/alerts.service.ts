import { supabase } from '@/lib/supabase'
import type { StockAlert } from '@/types'

export const alertsService = {
  async getAll(): Promise<StockAlert[]> {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as StockAlert[]
  },

  async markRead(id: string): Promise<void> {
    await supabase.from('stock_alerts').update({ is_read: true }).eq('id', id)
  },

  async delete(id: string): Promise<void> {
    await supabase.from('stock_alerts').delete().eq('id', id)
  },
}
