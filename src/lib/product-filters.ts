import { getStockStatus } from './utils'
import type { Product } from '@/types'

export type SortKey = 'name_asc' | 'name_desc' | 'stock_asc' | 'stock_desc' | 'price_asc' | 'price_desc' | 'recent'

export interface ProductFilters {
  q: string
  tab: 'all' | 'ok' | 'low' | 'out'
  cat: string          // '' = todas | 'none' = sem categoria | id
  sup: string          // '' = todos | 'none' = sem fornecedor | id
  st: string           // '' = todos | ativo | inativo | descontinuado
  smin?: number        // estoque mínimo
  smax?: number
  pmin?: number        // preço de venda
  pmax?: number
  sort: SortKey
}

export const DEFAULT_FILTERS: ProductFilters = { q: '', tab: 'all', cat: '', sup: '', st: '', sort: 'name_asc' }

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name_asc', label: 'Nome (A–Z)' },
  { key: 'name_desc', label: 'Nome (Z–A)' },
  { key: 'stock_asc', label: 'Estoque (menor primeiro)' },
  { key: 'stock_desc', label: 'Estoque (maior primeiro)' },
  { key: 'price_asc', label: 'Preço de venda (menor)' },
  { key: 'price_desc', label: 'Preço de venda (maior)' },
  { key: 'recent', label: 'Atualizados recentemente' },
]

const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Quantidade de filtros "avançados" ativos (busca, aba e ordenação ficam de fora). */
export function activeAdvancedCount(f: ProductFilters): number {
  return [f.cat, f.sup, f.st].filter(Boolean).length +
    [f.smin, f.smax, f.pmin, f.pmax].filter(v => v !== undefined).length
}

export function applyFilters(products: Product[], f: ProductFilters): Product[] {
  const q = fold(f.q.trim())
  const out = products.filter(p => {
    if (f.tab !== 'all' && getStockStatus(p.current_stock, p.min_stock) !== f.tab) return false
    if (q) {
      const hay = fold(`${p.name} ${p.sku} ${p.brand ?? ''} ${p.barcode ?? ''}`)
      if (!hay.includes(q)) return false
    }
    if (f.cat) {
      const id = p.category_id ?? p.category?.id
      if (f.cat === 'none' ? !!id : id !== f.cat) return false
    }
    if (f.sup) {
      const id = p.supplier_id ?? p.supplier?.id
      if (f.sup === 'none' ? !!id : id !== f.sup) return false
    }
    if (f.st && p.status !== f.st) return false
    if (f.smin !== undefined && p.current_stock < f.smin) return false
    if (f.smax !== undefined && p.current_stock > f.smax) return false
    if (f.pmin !== undefined && p.sale_price < f.pmin) return false
    if (f.pmax !== undefined && p.sale_price > f.pmax) return false
    return true
  })

  const cmp: Record<SortKey, (a: Product, b: Product) => number> = {
    name_asc: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
    name_desc: (a, b) => b.name.localeCompare(a.name, 'pt-BR'),
    stock_asc: (a, b) => a.current_stock - b.current_stock,
    stock_desc: (a, b) => b.current_stock - a.current_stock,
    price_asc: (a, b) => a.sale_price - b.sale_price,
    price_desc: (a, b) => b.sale_price - a.sale_price,
    recent: (a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''),
  }
  return out.sort(cmp[f.sort])
}

// ── (de)serialização na URL ──
const num = (v: string | null): number | undefined => {
  if (v === null || v.trim() === '') return undefined
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

export function filtersFromParams(p: URLSearchParams): ProductFilters {
  const tab = p.get('tab')
  const sort = p.get('sort') as SortKey | null
  return {
    q: p.get('q') ?? '',
    tab: tab === 'ok' || tab === 'low' || tab === 'out' ? tab : 'all',
    cat: p.get('cat') ?? '',
    sup: p.get('sup') ?? '',
    st: p.get('st') ?? '',
    smin: num(p.get('smin')), smax: num(p.get('smax')),
    pmin: num(p.get('pmin')), pmax: num(p.get('pmax')),
    sort: sort && SORT_OPTIONS.some(o => o.key === sort) ? sort : 'name_asc',
  }
}

export function filtersToParams(f: ProductFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  if (f.tab !== 'all') p.set('tab', f.tab)
  if (f.cat) p.set('cat', f.cat)
  if (f.sup) p.set('sup', f.sup)
  if (f.st) p.set('st', f.st)
  if (f.smin !== undefined) p.set('smin', String(f.smin))
  if (f.smax !== undefined) p.set('smax', String(f.smax))
  if (f.pmin !== undefined) p.set('pmin', String(f.pmin))
  if (f.pmax !== undefined) p.set('pmax', String(f.pmax))
  if (f.sort !== 'name_asc') p.set('sort', f.sort)
  return p
}
