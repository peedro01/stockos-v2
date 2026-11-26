import { useMemo } from 'react'
import { X } from 'lucide-react'
import { SORT_OPTIONS, activeAdvancedCount, type ProductFilters, type SortKey } from '@/lib/product-filters'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  filters: ProductFilters
  onChange: (patch: Partial<ProductFilters>) => void
  onClear: () => void
}

const fieldCls = 'h-8 w-full rounded-md border border-border bg-secondary px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring'

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
    {children}
  </div>
)

const toNum = (v: string): number | undefined => {
  if (v.trim() === '') return undefined
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export function ProductFilterPanel({ products, filters, onChange, onClear }: Props) {
  // só categorias/fornecedores que realmente aparecem nos produtos
  const { categories, suppliers, hasNoCategory, hasNoSupplier } = useMemo(() => {
    const cats = new Map<string, string>()
    const sups = new Map<string, string>()
    let noCat = false, noSup = false
    for (const p of products) {
      const cid = p.category_id ?? p.category?.id
      const sid = p.supplier_id ?? p.supplier?.id
      if (cid && p.category?.name) cats.set(cid, p.category.name); else if (!cid) noCat = true
      if (sid && p.supplier?.company_name) sups.set(sid, p.supplier.company_name); else if (!sid) noSup = true
    }
    const sorted = (m: Map<string, string>) => [...m.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
    return { categories: sorted(cats), suppliers: sorted(sups), hasNoCategory: noCat, hasNoSupplier: noSup }
  }, [products])

  const active = activeAdvancedCount(filters)

  return (
    <div className="border-b border-border bg-secondary/20 px-4 py-3 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Categoria">
          <select className={fieldCls} value={filters.cat} onChange={e => onChange({ cat: e.target.value })}>
            <option value="">Todas</option>
            {categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            {hasNoCategory && <option value="none">Sem categoria</option>}
          </select>
        </Field>
        <Field label="Fornecedor">
          <select className={fieldCls} value={filters.sup} onChange={e => onChange({ sup: e.target.value })}>
            <option value="">Todos</option>
            {suppliers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            {hasNoSupplier && <option value="none">Sem fornecedor</option>}
          </select>
        </Field>
        <Field label="Status">
          <select className={fieldCls} value={filters.st} onChange={e => onChange({ st: e.target.value })}>
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="descontinuado">Descontinuado</option>
          </select>
        </Field>

        <Field label="Estoque (unidades)">
          <div className="flex items-center gap-1.5">
            <input type="number" min={0} placeholder="de" className={fieldCls} value={filters.smin ?? ''}
              onChange={e => onChange({ smin: toNum(e.target.value) })} />
            <span className="text-xs text-muted-foreground">–</span>
            <input type="number" min={0} placeholder="até" className={fieldCls} value={filters.smax ?? ''}
              onChange={e => onChange({ smax: toNum(e.target.value) })} />
          </div>
        </Field>
        <Field label="Preço de venda (R$)">
          <div className="flex items-center gap-1.5">
            <input type="number" min={0} step="0.01" placeholder="de" className={fieldCls} value={filters.pmin ?? ''}
              onChange={e => onChange({ pmin: toNum(e.target.value) })} />
            <span className="text-xs text-muted-foreground">–</span>
            <input type="number" min={0} step="0.01" placeholder="até" className={fieldCls} value={filters.pmax ?? ''}
              onChange={e => onChange({ pmax: toNum(e.target.value) })} />
          </div>
        </Field>
        <Field label="Ordenar por">
          <select className={fieldCls} value={filters.sort} onChange={e => onChange({ sort: e.target.value as SortKey })}>
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </Field>
      </div>

      {active > 0 && (
        <button onClick={onClear} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" /> Limpar filtros avançados ({active})
        </button>
      )}
    </div>
  )
}
