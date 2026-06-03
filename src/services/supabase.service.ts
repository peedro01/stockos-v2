import { supabase } from '@/lib/supabase'
import type { Product, ProductFormData, Supplier, SupplierFormData, Customer, CustomerFormData, StockMovement, MovementFormData, StockAlert } from '@/types'

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const productService = {
  async getAll(company_id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, category:categories(*), supplier:suppliers(*)`)
      .eq('company_id', company_id)
      .order('name')
    if (error) throw error
    return data as Product[]
  },

  async create(data: ProductFormData, company_id: string) {
    const { data: result, error } = await supabase
      .from('products')
      .insert({ ...data, company_id })
      .select(`*, category:categories(*), supplier:suppliers(*)`)
      .single()
    if (error) throw error
    return result as Product
  },

  async update(id: string, data: Partial<ProductFormData>) {
    const { data: result, error } = await supabase
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`*, category:categories(*), supplier:suppliers(*)`)
      .single()
    if (error) throw error
    return result as Product
  },

  async delete(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── SUPPLIERS ───────────────────────────────────────────────────────────────
export const supplierService = {
  async getAll(company_id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('company_id', company_id)
      .order('company_name')
    if (error) throw error
    return data as Supplier[]
  },

  async create(data: SupplierFormData, company_id: string) {
    const { data: result, error } = await supabase
      .from('suppliers')
      .insert({ ...data, company_id })
      .select()
      .single()
    if (error) throw error
    return result as Supplier
  },

  async update(id: string, data: Partial<SupplierFormData>) {
    const { data: result, error } = await supabase
      .from('suppliers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result as Supplier
  },

  async delete(id: string) {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
export const customerService = {
  async getAll(company_id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', company_id)
      .order('name')
    if (error) throw error
    return data as Customer[]
  },

  async create(data: CustomerFormData, company_id: string) {
    const { data: result, error } = await supabase
      .from('customers')
      .insert({ ...data, company_id })
      .select()
      .single()
    if (error) throw error
    return result as Customer
  },

  async update(id: string, data: Partial<CustomerFormData>) {
    const { data: result, error } = await supabase
      .from('customers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result as Customer
  },

  async delete(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── MOVEMENTS ───────────────────────────────────────────────────────────────
export const movementService = {
  async getAll(company_id: string) {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`*, product:products(name, sku)`)
      .eq('company_id', company_id)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return data as StockMovement[]
  },

  async create(data: MovementFormData, user_id: string, company_id: string) {
    const { data: result, error } = await supabase
      .from('stock_movements')
      .insert({ ...data, user_id, company_id })
      .select(`*, product:products(name, sku)`)
      .single()
    if (error) throw error
    return result as StockMovement
  },
}

// ─── ALERTS ──────────────────────────────────────────────────────────────────
export const alertService = {
  async getAll(company_id: string) {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as StockAlert[]
  },

  async markRead(id: string) {
    const { error } = await supabase
      .from('stock_alerts')
      .update({ is_read: true })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase.from('stock_alerts').delete().eq('id', id)
    if (error) throw error
  },

  async markAllRead(company_id: string) {
    const { error } = await supabase
      .from('stock_alerts')
      .update({ is_read: true })
      .eq('company_id', company_id)
      .eq('is_read', false)
    if (error) throw error
  },
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const categoryService = {
  async getAll(company_id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('company_id', company_id)
      .order('name')
    if (error) throw error
    return data
  },
}
