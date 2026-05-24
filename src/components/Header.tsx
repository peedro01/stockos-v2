import { useLocation, Link } from 'react-router-dom'
import { Search, Bell, HelpCircle, Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/utils'

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
  '/produtos': { title: 'Produtos', subtitle: 'Gestão de catálogo' },
  '/movimentacoes': { title: 'Movimentações', subtitle: 'Histórico de estoque' },
  '/fornecedores': { title: 'Fornecedores', subtitle: 'Cadastro de fornecedores' },
  '/clientes': { title: 'Clientes', subtitle: 'Base de clientes' },
  '/relatorios': { title: 'Relatórios', subtitle: 'Análises e exportações' },
  '/alertas': { title: 'Alertas', subtitle: 'Notificações do sistema' },
  '/configuracoes': { title: 'Configurações', subtitle: 'Preferências e sistema' },
}

const quickActionByPath: Record<string, { label: string; to: string }> = {
  '/produtos': { label: 'Novo produto', to: '/produtos?new=1' },
  '/movimentacoes': { label: 'Nova movimentação', to: '/movimentacoes?new=1' },
  '/fornecedores': { label: 'Novo fornecedor', to: '/fornecedores?new=1' },
  '/clientes': { label: 'Novo cliente', to: '/clientes?new=1' },
}

export function Header() {
  const location = useLocation()
  const unreadAlertsCount = useAppStore((s) => s.unreadAlertsCount)
  const meta = pageMeta[location.pathname] ?? { title: 'StockOS', subtitle: '' }
  const quickAction = quickActionByPath[location.pathname]

  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex-shrink-0">
      <div>
        <h1 className="text-sm font-semibold leading-tight">{meta.title}</h1>
        <p className="text-xs text-muted-foreground leading-tight">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-lg px-3 h-8 flex-1 max-w-xs ml-auto">
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <input
          className="bg-transparent text-xs outline-none flex-1 placeholder:text-muted-foreground min-w-0"
          placeholder="Buscar produtos, SKUs..."
        />
        <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1 hidden sm:inline">⌘K</kbd>
      </div>

      <div className="flex items-center gap-2">
        {quickAction && (
          <Link
            to={quickAction.to}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{quickAction.label}</span>
          </Link>
        )}
        <Link
          to="/alertas"
          className={cn(
            'relative w-8 h-8 rounded-lg border border-border bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors'
          )}
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
          )}
        </Link>
        <button className="w-8 h-8 rounded-lg border border-border bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
