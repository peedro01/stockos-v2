import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, ArrowLeftRight, Truck, Users, LayoutDashboard, BarChart3, Bell, Settings, ArrowRight, X } from 'lucide-react'
import { cn, getStockStatus } from '@/lib/utils'
import { mockProducts, mockSuppliers, mockCustomers, mockMovements } from '@/lib/mock-data'

interface SearchResult {
  id: string
  type: 'produto' | 'fornecedor' | 'cliente' | 'pagina'
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: string
  action: () => void
  icon: React.ElementType
}

const pages = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Produtos', icon: Package },
  { to: '/movements', label: 'Movimentações', icon: ArrowLeftRight },
  { to: '/suppliers', label: 'Fornecedores', icon: Truck },
  { to: '/customers', label: 'Clientes', icon: Users },
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
  { to: '/alerts', label: 'Alertas', icon: Bell },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!open) return
      }
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, results.length - 1))
      if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0))
      if (e.key === 'Enter' && results[selected]) {
        results[selected].action()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, selected])

  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) {
      return pages.map(p => ({
        id: p.to,
        type: 'pagina' as const,
        title: p.label,
        subtitle: 'Navegar para a página',
        icon: p.icon,
        action: () => { navigate(p.to); onClose() },
      }))
    }

    const q = query.toLowerCase()
    const list: SearchResult[] = []

    // Produtos
    mockProducts
      .filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach(p => {
        const ss = getStockStatus(p.current_stock, p.min_stock)
        list.push({
          id: `prod-${p.id}`,
          type: 'produto',
          title: p.name,
          subtitle: `SKU: ${p.sku} · Estoque: ${p.current_stock}`,
          badge: ss === 'ok' ? 'OK' : ss === 'low' ? 'Baixo' : 'Zerado',
          badgeColor: ss === 'ok' ? 'text-green-400 bg-green-500/15' : ss === 'low' ? 'text-amber-400 bg-amber-500/15' : 'text-red-400 bg-red-500/15',
          icon: Package,
          action: () => { navigate('/products'); onClose() },
        })
      })

    // Fornecedores
    mockSuppliers
      .filter(s => s.company_name.toLowerCase().includes(q) || (s.contact_name ?? '').toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(s => {
        list.push({
          id: `sup-${s.id}`,
          type: 'fornecedor',
          title: s.company_name,
          subtitle: s.contact_name ?? s.email ?? '',
          badge: s.is_active ? 'Ativo' : 'Inativo',
          badgeColor: s.is_active ? 'text-green-400 bg-green-500/15' : 'text-muted-foreground bg-secondary',
          icon: Truck,
          action: () => { navigate('/suppliers'); onClose() },
        })
      })

    // Clientes
    mockCustomers
      .filter(c => c.name.toLowerCase().includes(q) || (c.document ?? '').includes(q))
      .slice(0, 2)
      .forEach(c => {
        list.push({
          id: `cli-${c.id}`,
          type: 'cliente',
          title: c.name,
          subtitle: c.document ?? c.email ?? '',
          badge: c.type.toUpperCase(),
          badgeColor: 'text-blue-400 bg-blue-500/15',
          icon: Users,
          action: () => { navigate('/customers'); onClose() },
        })
      })

    // Páginas
    pages
      .filter(p => p.label.toLowerCase().includes(q))
      .forEach(p => {
        list.push({
          id: `page-${p.to}`,
          type: 'pagina',
          title: p.label,
          subtitle: 'Navegar para a página',
          icon: p.icon,
          action: () => { navigate(p.to); onClose() },
        })
      })

    return list
  }, [query])

  useEffect(() => setSelected(0), [query])

  if (!open) return null

  const grouped = {
    produto: results.filter(r => r.type === 'produto'),
    fornecedor: results.filter(r => r.type === 'fornecedor'),
    cliente: results.filter(r => r.type === 'cliente'),
    pagina: results.filter(r => r.type === 'pagina'),
  }

  const typeLabels = { produto: 'Produtos', fornecedor: 'Fornecedores', cliente: 'Clientes', pagina: 'Páginas' }

  let globalIndex = 0

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
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

          {(Object.keys(grouped) as (keyof typeof grouped)[]).map(type => {
            const items = grouped[type]
            if (items.length === 0) return null
            return (
              <div key={type} className="mb-1">
                <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  {typeLabels[type]}
                </p>
                {items.map(result => {
                  const idx = globalIndex++
                  const Icon = result.icon
                  return (
                    <button
                      key={result.id}
                      onClick={() => { result.action(); onClose() }}
                      onMouseEnter={() => setSelected(idx)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        selected === idx ? 'bg-primary/10' : 'hover:bg-secondary/50'
                      )}
                    >
                      <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-secondary')}>
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{result.title}</p>
                        {result.subtitle && <p className="text-[10px] text-muted-foreground truncate">{result.subtitle}</p>}
                      </div>
                      {result.badge && (
                        <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0', result.badgeColor)}>
                          {result.badge}
                        </span>
                      )}
                      {selected === idx && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-border px-4 py-2">
          <span className="text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border px-1 py-0.5 mr-1">↑↓</kbd> navegar
          </span>
          <span className="text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border px-1 py-0.5 mr-1">↵</kbd> selecionar
          </span>
          <span className="text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border px-1 py-0.5 mr-1">ESC</kbd> fechar
          </span>
        </div>
      </div>
    </div>
  )
}
