import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, ArrowLeftRight, Truck, Users, BarChart3, Settings, Bell, LayoutDashboard, X, ArrowRight } from 'lucide-react'
import { cn, formatCurrency, getStockStatus } from '@/lib/utils'
import { mockProducts, mockSuppliers, mockCustomers, mockMovements } from '@/lib/mock-data'

interface SearchResult {
  id: string
  type: 'produto' | 'fornecedor' | 'cliente' | 'movimentacao' | 'pagina'
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: string
  href: string
  icon: React.ElementType
}

const pages: SearchResult[] = [
  { id: 'p1', type: 'pagina', title: 'Dashboard', subtitle: 'Visão geral do sistema', href: '/dashboard', icon: LayoutDashboard },
  { id: 'p2', type: 'pagina', title: 'Produtos', subtitle: 'Gestão de catálogo', href: '/products', icon: Package },
  { id: 'p3', type: 'pagina', title: 'Movimentações', subtitle: 'Histórico de estoque', href: '/movements', icon: ArrowLeftRight },
  { id: 'p4', type: 'pagina', title: 'Fornecedores', subtitle: 'Cadastro de fornecedores', href: '/suppliers', icon: Truck },
  { id: 'p5', type: 'pagina', title: 'Clientes', subtitle: 'Base de clientes', href: '/customers', icon: Users },
  { id: 'p6', type: 'pagina', title: 'Relatórios', subtitle: 'Análises e exportações', href: '/reports', icon: BarChart3 },
  { id: 'p7', type: 'pagina', title: 'Alertas', subtitle: 'Notificações do sistema', href: '/alerts', icon: Bell },
  { id: 'p8', type: 'pagina', title: 'Configurações', subtitle: 'Sistema e usuários', href: '/settings', icon: Settings },
]

const typeLabels = {
  produto: 'Produto',
  fornecedor: 'Fornecedor',
  cliente: 'Cliente',
  movimentacao: 'Movimentação',
  pagina: 'Página',
}

const typeColors = {
  produto: 'bg-primary/15 text-primary',
  fornecedor: 'bg-blue-500/15 text-blue-400',
  cliente: 'bg-green-500/15 text-green-400',
  movimentacao: 'bg-amber-500/15 text-amber-400',
  pagina: 'bg-secondary text-muted-foreground',
}

interface SearchPaletteProps {
  open: boolean
  onClose: () => void
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return pages

    const q = query.toLowerCase()

    const productResults: SearchResult[] = mockProducts
      .filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode ?? '').includes(q))
      .slice(0, 4)
      .map(p => {
        const ss = getStockStatus(p.current_stock, p.min_stock)
        return {
          id: p.id,
          type: 'produto' as const,
          title: p.name,
          subtitle: `${p.sku} · Estoque: ${p.current_stock} · ${formatCurrency(p.sale_price)}`,
          badge: ss === 'out' ? 'Zerado' : ss === 'low' ? 'Baixo' : 'OK',
          badgeColor: ss === 'out' ? 'bg-red-500/15 text-red-400' : ss === 'low' ? 'bg-amber-500/15 text-amber-400' : 'bg-green-500/15 text-green-400',
          href: '/products',
          icon: Package,
        }
      })

    const supplierResults: SearchResult[] = mockSuppliers
      .filter(s => s.company_name.toLowerCase().includes(q) || (s.cnpj ?? '').includes(q))
      .slice(0, 2)
      .map(s => ({
        id: s.id,
        type: 'fornecedor' as const,
        title: s.company_name,
        subtitle: s.cnpj ?? s.email ?? '',
        href: '/suppliers',
        icon: Truck,
      }))

    const customerResults: SearchResult[] = mockCustomers
      .filter(c => c.name.toLowerCase().includes(q) || (c.document ?? '').includes(q))
      .slice(0, 2)
      .map(c => ({
        id: c.id,
        type: 'cliente' as const,
        title: c.name,
        subtitle: c.document ?? c.email ?? '',
        href: '/customers',
        icon: Users,
      }))

    const pageResults = pages.filter(p => p.title.toLowerCase().includes(q))

    return [...productResults, ...supplierResults, ...customerResults, ...pageResults]
  }, [query])

  useEffect(() => { setSelected(0) }, [results])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && results[selected]) { navigate(results[selected].href); onClose() }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, selected, navigate, onClose])

  if (!open) return null

  const grouped = query.trim()
    ? null
    : { paginas: pages }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar produtos, fornecedores, páginas..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum resultado para "{query}"</p>
            </div>
          )}

          {!query.trim() && (
            <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Navegação rápida
            </p>
          )}

          {query.trim() && results.some(r => r.type === 'produto') && (
            <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Produtos</p>
          )}

          {results.map((result, i) => {
            const Icon = result.icon
            const isSelected = i === selected
            return (
              <button
                key={result.id}
                onClick={() => { navigate(result.href); onClose() }}
                onMouseEnter={() => setSelected(i)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  isSelected ? 'bg-primary/10' : 'hover:bg-secondary/60'
                )}
              >
                <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border',
                  isSelected ? 'bg-primary/20 border-primary/30' : 'bg-secondary')}>
                  <Icon className={cn('h-3.5 w-3.5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', isSelected ? 'text-foreground' : 'text-foreground/90')}>
                    {result.title}
                  </p>
                  {result.subtitle && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{result.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {result.badge && (
                    <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-semibold', result.badgeColor)}>
                      {result.badge}
                    </span>
                  )}
                  <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', typeColors[result.type])}>
                    {typeLabels[result.type]}
                  </span>
                  {isSelected && <ArrowRight className="h-3.5 w-3.5 text-primary" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border px-1 py-0.5 text-[9px]">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border px-1 py-0.5 text-[9px]">↵</kbd> abrir
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border px-1 py-0.5 text-[9px]">ESC</kbd> fechar
          </span>
        </div>
      </div>
    </div>
  )
}
