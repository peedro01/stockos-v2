import { supabase } from '@/lib/supabase'
import type { Supplier, SupplierFormData, Client, ClientFormData } from '@/types'

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('company_name')
    if (error) throw error
    return (data ?? []) as Supplier[]
  },

  async getById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single()
    if (error) return null
    return data as Supplier
  },

  async create(formData: SupplierFormData): Promise<Supplier> {
    const { data, error } = await supabase.from('suppliers').insert(formData).select().single()
    if (error) throw error
    return data as Supplier
  },

  async update(id: string, formData: Partial<SupplierFormData>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Supplier
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) throw error
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: isActive })
      .eq('id', id)
    if (error) throw error
  },
}

export const clientService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*').order('name')
    if (error) throw error
    return (data ?? []) as Client[]
  },

  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
    if (error) return null
    return data as Client
  },

  async create(formData: ClientFormData): Promise<Client> {
    const { data, error } = await supabase.from('clients').insert(formData).select().single()
    if (error) throw error
    return data as Client
  },

  async update(id: string, formData: Partial<ClientFormData>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Client
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error
  },
}

export const categoryService = {
  async getAll() {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) throw error
    return data ?? []
  },

  async create(name: string, description?: string) {
    const { data, error } = await supabase.from('categories').insert({ name, description }).select().single()
    if (error) throw error
    return data
  },
}

export const dashboardService = {
  async getStats() {
    const [products, lowStock, outStock, movements] = await Promise.all([
      supabase.from('products').select('id, current_stock, cost_price, sale_price, min_stock, status').eq('status', 'ativo'),
      supabase.from('products').select('id').eq('status', 'ativo').filter('current_stock', 'lt', 'min_stock'),
      supabase.from('products').select('id').eq('status', 'ativo').eq('current_stock', 0),
      supabase.from('stock_movements')
        .select('type, quantity, created_at')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    const productData = products.data ?? []
    const totalStock = productData.reduce((sum, p) => sum + (p.current_stock ?? 0), 0)
    const stockValue = productData.reduce((sum, p) => sum + (p.current_stock ?? 0) * (p.cost_price ?? 0), 0)

    const movData = movements.data ?? []
    const entries = movData.filter(m => m.type === 'entrada').reduce((s, m) => s + m.quantity, 0)
    const exits = movData.filter(m => m.type === 'saida').reduce((s, m) => s + m.quantity, 0)

    return {
      total_products: productData.length,
      total_stock_items: totalStock,
      products_low_stock: lowStock.data?.length ?? 0,
      products_out_of_stock: outStock.data?.length ?? 0,
      entries_this_month: entries,
      exits_this_month: exits,
      stock_value: stockValue,
      alerts_count: (lowStock.data?.length ?? 0) + (outStock.data?.length ?? 0),
    }
  },

  async getMonthlyMovements() {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleDateString('pt-BR', { month: 'short' }),
      })
    }

    const result = await Promise.all(months.map(async (m) => {
      const start = new Date(m.year, m.month - 1, 1).toISOString()
      const end = new Date(m.year, m.month, 0, 23, 59, 59).toISOString()
      const { data } = await supabase
        .from('stock_movements')
        .select('type, quantity')
        .gte('created_at', start)
        .lte('created_at', end)
      const entries = (data ?? []).filter(d => d.type === 'entrada').reduce((s, d) => s + d.quantity, 0)
      const exits = (data ?? []).filter(d => d.type === 'saida').reduce((s, d) => s + d.quantity, 0)
      return { month: m.label, entries, exits }
    }))

    return result
  },
}
