import { supabase } from '@/lib/supabase'
import type {
  Product, ProductFormData, ProductFilters,
  PaginatedResult, PaginationParams, StockMovement, MovementFormData
} from '@/types'

export const productService = {
  async getAll(
    filters: ProductFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 20 }
  ): Promise<PaginatedResult<Product>> {
    const { page, pageSize } = pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('products')
      .select('*, category:categories(*), supplier:suppliers(*)', { count: 'exact' })

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)
    }
    if (filters.category_id) query = query.eq('category_id', filters.category_id)
    if (filters.supplier_id) query = query.eq('supplier_id', filters.supplier_id)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.stock_status === 'zerado') query = query.eq('current_stock', 0)
    if (filters.stock_status === 'baixo') query = query.lt('current_stock', supabase.rpc('get_min_stock'))

    const sortBy = filters.sort_by ?? 'name'
    const sortOrder = filters.sort_order ?? 'asc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return {
      data: (data ?? []) as Product[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), supplier:suppliers(*)')
      .eq('id', id)
      .single()
    if (error) return null
    return data as Product
  },

  async create(formData: ProductFormData): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(formData)
      .select('*, category:categories(*), supplier:suppliers(*)')
      .single()
    if (error) throw error
    return data as Product
  },

  async update(id: string, formData: Partial<ProductFormData>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(*), supplier:suppliers(*)')
      .single()
    if (error) throw error
    return data as Product
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },

  async getLowStock(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .filter('current_stock', 'lt', 'min_stock')
      .order('current_stock', { ascending: true })
      .limit(50)
    if (error) throw error
    return (data ?? []) as Product[]
  },

  async getOutOfStock(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('current_stock', 0)
      .eq('status', 'ativo')
    if (error) throw error
    return (data ?? []) as Product[]
  },
}

export const movementService = {
  async create(formData: MovementFormData, userId: string): Promise<StockMovement> {
    // Fetch current stock
    const { data: product } = await supabase
      .from('products')
      .select('current_stock, cost_price')
      .eq('id', formData.product_id)
      .single()

    if (!product) throw new Error('Produto não encontrado')

    let balanceAfter = product.current_stock
    if (formData.type === 'entrada') balanceAfter += formData.quantity
    else if (formData.type === 'saida' || formData.type === 'perda') balanceAfter -= formData.quantity
    else if (formData.type === 'ajuste') balanceAfter = formData.quantity

    const { data, error } = await supabase
      .from('stock_movements')
      .insert({
        ...formData,
        balance_after: balanceAfter,
        unit_cost: formData.unit_cost ?? product.cost_price,
        total_cost: (formData.unit_cost ?? product.cost_price) * formData.quantity,
        user_id: userId,
      })
      .select('*, product:products(*), user:user_profiles(*)')
      .single()

    if (error) throw error

    // Update product stock
    await supabase
      .from('products')
      .update({ current_stock: balanceAfter, updated_at: new Date().toISOString() })
      .eq('id', formData.product_id)

    return data as StockMovement
  },

  async getHistory(
    filters: { product_id?: string; type?: string; date_from?: string; date_to?: string } = {},
    pagination: PaginationParams = { page: 1, pageSize: 30 }
  ): Promise<PaginatedResult<StockMovement>> {
    const { page, pageSize } = pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('stock_movements')
      .select('*, product:products(id,name,sku), user:user_profiles(id,full_name)', { count: 'exact' })

    if (filters.product_id) query = query.eq('product_id', filters.product_id)
    if (filters.type) query = query.eq('type', filters.type)
    if (filters.date_from) query = query.gte('created_at', filters.date_from)
    if (filters.date_to) query = query.lte('created_at', filters.date_to)

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return {
      data: (data ?? []) as StockMovement[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }
  },
}
