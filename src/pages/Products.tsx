import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Download, Upload, Pencil, Eye, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StockBadge, StockBar } from '@/components/shared/StockBadge'
import { useProductsStore } from '@/store/products.store'
import { formatCurrency, formatNumber, getStockStatus, cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Product } from '@/types'

const tabs = [
  { key: 'all', label: 'Todos' },
  { key: 'ok', label: 'OK' },
  { key: 'low', label: 'Críticos' },
  { key: 'out', label: 'Zerados' },
]

export default function Products() {
  const { products, filters, setFilters, deleteProduct } = useProductsStore()
  const [activeTab, setActiveTab] = useState('all')

  const filtered = useMemo(() => {
    return products.filter(p => {
      const ss = getStockStatus(p.current_stock, p.min_stock)
      if (activeTab !== 'all' && ss !== activeTab) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      }
      return true
    })
  }, [products, filters.search, activeTab])

  const counts = useMemo(() => ({
    all: products.length,
    ok: products.filter(p => getStockStatus(p.current_stock, p.min_stock) === 'ok').length,
    low: products.filter(p => getStockStatus(p.current_stock, p.min_stock) === 'low').length,
    out: products.filter(p => getStockStatus(p.current_stock, p.min_stock) === 'out').length,
  }), [products])

  function handleDelete(p: Product) {
    deleteProduct(p.id)
    toast({ title: 'Produto removido', description: p.name, variant: 'success' })
  }

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      {/* Top actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                activeTab === t.key ? 'bg-card text-foreground border border-border' : 'text-muted-foreground hover:text-foreground')}>
              {t.label} ({counts[t.key as keyof typeof counts]})
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="text-xs"><Upload className="h-3.5 w-3.5" /><span className="hidden sm:inline">Importar</span> CSV</Button>
          <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Exportar</span></Button>
          <Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Novo</span> produto</Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-border px-3 sm:px-4 py-3">
          <div className="flex flex-1 w-full items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <input value={filters.search} onChange={e => setFilters({ search: e.target.value })}
              placeholder="Buscar por nome, SKU..."
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs"><Filter className="h-3.5 w-3.5" />Filtros</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {['Produto', 'SKU', 'Estoque', 'Custo', 'Venda', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const ss = getStockStatus(p.current_stock, p.min_stock)
                return (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="text-xs font-semibold max-w-[140px] sm:max-w-[200px] truncate">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{p.supplier?.company_name ?? '—'}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{p.sku}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className={cn('text-xs font-bold', ss === 'ok' ? 'text-green-400' : ss === 'low' ? 'text-amber-400' : 'text-red-400')}>
                        {formatNumber(p.current_stock)}
                      </div>
                      <StockBar current={p.current_stock} max={p.max_stock ?? p.min_stock * 10} />
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs">{formatCurrency(p.cost_price)}</td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs font-semibold">{formatCurrency(p.sale_price)}</td>
                    <td className="px-3 sm:px-4 py-2.5"><StockBadge status={ss} /></td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="flex gap-1">
                        <button className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                        <button className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"><Eye className="h-3 w-3" /></button>
                        <button onClick={() => handleDelete(p)} className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border px-3 sm:px-4 py-3">
          <span className="text-xs text-muted-foreground">Mostrando {filtered.length} de {products.length} produtos</span>
          <div className="flex gap-1">
            {['← Ant.', '1', '2', '3', 'Prox. →'].map(l => (
              <button key={l} className={cn('rounded-md border border-border px-2 py-1 text-xs transition-colors',
                l === '1' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
