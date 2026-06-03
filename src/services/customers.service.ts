import { supabase } from '@/lib/supabase'
import type { Customer, CustomerFormData } from '@/types'

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name')
    if (error) throw error
    return (data ?? []) as Customer[]
  },

  async create(data: CustomerFormData & { company_id: string }): Promise<Customer> {
    const { data: customer, error } = await supabase
      .from('customers').insert(data).select().single()
    if (error) throw error
    return customer as Customer
  },

  async update(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
    const { data: customer, error } = await supabase
      .from('customers').update(data).eq('id', id).select().single()
    if (error) throw error
    return customer as Customer
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw error
  },
}
