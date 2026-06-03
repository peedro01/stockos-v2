import { supabase } from '@/lib/supabase'
import type { Supplier, SupplierFormData } from '@/types'

export const suppliersService = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name')
    if (error) throw error
    return (data ?? []) as Supplier[]
  },

  async create(data: SupplierFormData & { company_id: string }): Promise<Supplier> {
    const { data: supplier, error } = await supabase
      .from('suppliers').insert(data).select().single()
    if (error) throw error
    return supplier as Supplier
  },

  async update(id: string, data: Partial<SupplierFormData>): Promise<Supplier> {
    const { data: supplier, error } = await supabase
      .from('suppliers').update(data).eq('id', id).select().single()
    if (error) throw error
    return supplier as Supplier
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) throw error
  },
}
