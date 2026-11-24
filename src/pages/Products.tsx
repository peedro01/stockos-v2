import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, Upload, Pencil, Eye, Trash2, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StockBadge, StockBar } from '@/components/shared/StockBadge'
import { ProductModal } from '@/components/products/ProductModal'
import { DeleteConfirmModal } from '@/components/products/DeleteConfirmModal'
import { useProducts } from '@/hooks/use-products'
import { formatCurrency, formatNumber, getStockStatus, cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Product, ProductFormData } from '@/types'

const tabs = [
  { key: 'all', label: 'Todos' },
  { key: 'ok', label: 'OK' },
  { key: 'low', label: 'Críticos' },
  { key: 'out', label: 'Zerados' },
]

export default function Products() {
  const navigate = useNavigate()
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const filtered = useMemo(() => products.filter(p => {
    const ss = getStockStatus(p.current_stock, p.min_stock)
    if (activeTab !== 'all' && ss !== activeTab) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    }
    return true
  }), [products, search, activeTab])

  const counts = useMemo(() => ({
    all: products.length,
    ok: products.filter(p => getStockStatus(p.current_stock, p.min_stock) === 'ok').length,
    low: products.filter(p => getStockStatus(p.current_stock, p.min_stock) === 'low').length,
    out: products.filter(p => getStockStatus(p.current_stock, p.min_stock) === 'out').length,
  }), [products])

  async function handleSave(data: ProductFormData) {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data)
        toast({ title: '✓ Produto atualizado', description: data.name, variant: 'success' })
      } else {
        await createProduct(data)
        toast({ title: '✓ Produto criado', description: data.name, variant: 'success' })
      }
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'error' })
    }
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return
    try {
      await deleteProduct(productToDelete.id)
      toast({ title: '✓ Produto excluído', description: productToDelete.name, variant: 'success' })
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'error' })
    }
  }

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
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
          <Button size="sm" className="text-xs" onClick={() => { setSelectedProduct(null); setModalOpen(true) }}>
            <Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Novo</span> produto
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-border px-3 sm:px-4 py-3">
          <div className="flex flex-1 w-full items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, SKU..."
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm" className="text-xs"><Filter className="h-3.5 w-3.5" />Filtros</Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
                        <button onClick={() => navigate(`/products/${p.id}`)} className="block text-left text-xs font-semibold max-w-[140px] sm:max-w-[200px] truncate hover:text-primary">{p.name}</button>
                        <div className="text-[10px] text-muted-foreground truncate">{p.supplier?.company_name ?? p.brand ?? '—'}</div>
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
                          <button onClick={() => { setSelectedProduct(p); setModalOpen(true) }}
                            className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
                          <button onClick={() => navigate(`/products/${p.id}`)} title="Ver detalhes"
                            className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"><Eye className="h-3 w-3" /></button>
                          <button onClick={() => { setProductToDelete(p); setDeleteModalOpen(true) }}
                            className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">Nenhum produto encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border px-3 sm:px-4 py-3">
          <span className="text-xs text-muted-foreground">Mostrando {filtered.length} de {products.length} produtos</span>
        </div>
      </Card>

      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} product={selectedProduct} />
      <DeleteConfirmModal open={deleteModalOpen} product={productToDelete} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} />
    </div>
  )
}
