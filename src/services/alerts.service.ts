import { supabase } from '@/lib/supabase'
import type { StockAlert } from '@/types'

const NIL_UUID = '00000000-0000-0000-0000-000000000000'

export const alertsService = {
  async getAll(): Promise<StockAlert[]> {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return (data ?? []) as StockAlert[]
  },

  async markRead(id: string): Promise<void> {
    const { error } = await supabase.from('stock_alerts').update({ is_read: true }).eq('id', id)
    if (error) throw error
  },

  async markAllRead(): Promise<void> {
    const { error } = await supabase.from('stock_alerts').update({ is_read: true }).eq('is_read', false)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('stock_alerts').delete().eq('id', id)
    if (error) throw error
  },

  async deleteAll(): Promise<void> {
    const { error } = await supabase.from('stock_alerts').delete().neq('id', NIL_UUID)
    if (error) throw error
  },
}
