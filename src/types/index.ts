// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'gerente' | 'operador'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  company_id: string
  created_at: string
  last_sign_in?: string
  is_active: boolean
}

// ─── Company ─────────────────────────────────────────────────────────────────
export interface Company {
  id: string
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  logo_url?: string
  created_at: string
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  company_id: string
  created_at: string
}

// ─── Supplier ────────────────────────────────────────────────────────────────
export interface Supplier {
  id: string
  company_name: string
  cnpj?: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  notes?: string
  is_active: boolean
  company_id: string
  created_at: string
  updated_at: string
}

// ─── Customer ────────────────────────────────────────────────────────────────
export type CustomerType = 'pf' | 'pj'

export interface Customer {
  id: string
  name: string
  type: CustomerType
  document?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  notes?: string
  is_active: boolean
  company_id: string
  created_at: string
  updated_at: string
}

// ─── Product ─────────────────────────────────────────────────────────────────
export type ProductStatus = 'ativo' | 'inativo' | 'descontinuado'
export type ProductUnit = 'un' | 'kg' | 'g' | 'l' | 'ml' | 'cx' | 'pc' | 'par' | 'rolo' | 'm'

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  description?: string
  category_id?: string
  category?: Category
  brand?: string
  supplier_id?: string
  supplier?: Supplier
  unit: ProductUnit
  cost_price: number
  sale_price: number
  current_stock: number
  min_stock: number
  max_stock?: number
  location?: string
  image_url?: string
  status: ProductStatus
  company_id: string
  created_at: string
  updated_at: string
}

// ─── Movement ────────────────────────────────────────────────────────────────
export type MovementType = 'entrada' | 'saida' | 'ajuste' | 'transferencia' | 'perda' | 'inventario'

export interface StockMovement {
  id: string
  product_id: string
  product?: Product
  type: MovementType
  quantity: number
  balance_after: number
  unit_cost?: number
  total_cost?: number
  reference?: string
  notes?: string
  user_id: string
  user?: UserProfile
  company_id: string
  created_at: string
}

// ─── Alert ───────────────────────────────────────────────────────────────────
export type AlertSeverity = 'info' | 'warning' | 'danger'

export interface StockAlert {
  id: string
  type: string
  title: string
  message: string
  severity: AlertSeverity
  is_read: boolean
  product_id?: string
  product?: Product
  company_id: string
  created_at: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalProducts: number
  totalStock: number
  lowStockCount: number
  outOfStockCount: number
  monthlyInbound: number
  monthlyOutbound: number
  totalStockValue: number
  monthlyInboundChange: number
  monthlyOutboundChange: number
}

export interface ChartDataPoint {
  month: string
  entradas: number
  saidas: number
}

export interface CategoryDistribution {
  name: string
  value: number
  color: string
}

// ─── Forms ───────────────────────────────────────────────────────────────────
export interface ProductFormData {
  name: string
  sku: string
  barcode?: string
  description?: string
  category_id?: string
  brand?: string
  supplier_id?: string
  unit: ProductUnit
  cost_price: number
  sale_price: number
  current_stock: number
  min_stock: number
  max_stock?: number
  location?: string
  status: ProductStatus
}

export interface MovementFormData {
  product_id: string
  type: MovementType
  quantity: number
  unit_cost?: number
  reference?: string
  notes?: string
}

export interface SupplierFormData {
  company_name: string
  cnpj?: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  notes?: string
  is_active: boolean
}

export interface CustomerFormData {
  name: string
  type: CustomerType
  document?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  notes?: string
  is_active: boolean
}

// ─── Filters ─────────────────────────────────────────────────────────────────
export interface ProductFilters {
  search: string
  category_id?: string
  supplier_id?: string
  status?: ProductStatus | 'all'
  stockStatus?: 'all' | 'ok' | 'low' | 'out'
  sortBy: 'name' | 'sku' | 'current_stock' | 'sale_price' | 'created_at'
  sortOrder: 'asc' | 'desc'
  page: number
  perPage: number
}

export interface MovementFilters {
  search: string
  type?: MovementType | 'all'
  dateFrom?: string
  dateTo?: string
  product_id?: string
  page: number
  perPage: number
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
