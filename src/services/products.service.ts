import { supabase } from '@/lib/supabase'
import type { Product, ProductFormData, ProductFilters, PaginatedResult } from '@/types'

export const productsService = {
  async getAll(filters?: Partial<ProductFilters>): Promise<PaginatedResult<Product>> {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, color),
        supplier:suppliers(id, company_name)
      `, { count: 'exact' })

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.stockStatus === 'out') {
      query = query.eq('current_stock', 0)
    } else if (filters?.stockStatus === 'low') {
      query = query.gt('current_stock', 0).filter('current_stock', 'lte', 'min_stock')
    }

    const sortBy = filters?.sortBy ?? 'name'
    const sortOrder = filters?.sortOrder ?? 'asc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const page = filters?.page ?? 1
    const perPage = filters?.perPage ?? 50
    query = query.range((page - 1) * perPage, page * perPage - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: (data ?? []) as Product[],
      total: count ?? 0,
      page,
      perPage,
      totalPages: Math.ceil((count ?? 0) / perPage),
    }
  },

  async create(data: ProductFormData & { company_id: string }): Promise<Product> {
    const { data: product, error } = await supabase
      .from('products')
      .insert(data)
      .select(`*, category:categories(id, name, color), supplier:suppliers(id, company_name)`)
      .single()

    if (error) throw error
    return product as Product
  },

  async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const { data: product, error } = await supabase
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`*, category:categories(id, name, color), supplier:suppliers(id, company_name)`)
      .single()

    if (error) throw error
    return product as Product
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
}
