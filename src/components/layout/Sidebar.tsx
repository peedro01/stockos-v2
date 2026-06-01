import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ArrowLeftRight, Truck, Users,
  BarChart3, Bell, Settings, ChevronLeft, ChevronRight, LogOut, X
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { useAlertsStore } from '@/store/alerts.store'
import { useAuth } from '@/contexts/auth.context'
import { useProductsStore } from '@/store/products.store'
import { getStockStatus } from '@/lib/utils'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const { signOut } = useAuth()
  const { unreadCount } = useAlertsStore()
  const { products } = useProductsStore()

  // Badges dinâmicos
  const alertsBadge = unreadCount()
  const criticalProducts = products.filter(p => {
    const ss = getStockStatus(p.current_stock, p.min_stock)
    return ss === 'low' || ss === 'out'
  }).length

  const navSections = [
    {
      label: 'Principal',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/products', icon: Package, label: 'Produtos', badge: criticalProducts > 0 ? criticalProducts : 0 },
        { to: '/movements', icon: ArrowLeftRight, label: 'Movimentações' },
      ],
    },
    {
      label: 'Cadastros',
      items: [
        { to: '/suppliers', icon: Truck, label: 'Fornecedores' },
        { to: '/customers', icon: Users, label: 'Clientes' },
      ],
    },
    {
      label: 'Análises',
      items: [
        { to: '/reports', icon: BarChart3, label: 'Relatórios' },
        { to: '/alerts', icon: Bell, label: 'Alertas', badge: alertsBadge },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { to: '/settings', icon: Settings, label: 'Configurações' },
      ],
    },
  ]

  const navContent = (collapsed: boolean) => (
    <>
      <div className="flex h-[52px] items-center gap-2.5 border-b border-border px-3 flex-shrink-0">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">S</div>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">StockOS</span>
            <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground border border-border">PRO</span>
          </div>
        )}
        {mobileOpen !== undefined && !collapsed && (
          <button onClick={onMobileClose} className="ml-auto p-1 text-muted-foreground hover:text-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            {!collapsed && (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-colors mb-0.5',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge != null && item.badge > 0 && (
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2 flex-shrink-0">
        <div className={cn('flex items-center gap-2 rounded-lg bg-secondary px-2 py-2', collapsed && 'justify-center px-1')}>
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-[11px] font-bold text-white">
            {user ? getInitials(user.full_name) : 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user?.full_name ?? 'Usuário'}</p>
              <p className="text-[10px] capitalize text-muted-foreground">{user?.role ?? 'operador'}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={() => signOut()} className="rounded p-1 text-muted-foreground hover:text-foreground" title="Sair">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop */}
      <aside className={cn(
        'relative hidden lg:flex flex-col h-screen border-r border-border bg-card transition-all duration-300 ease-in-out flex-shrink-0',
        sidebarCollapsed ? 'w-14' : 'w-[220px]'
      )}>
        {navContent(sidebarCollapsed)}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-[70px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-card lg:hidden">
            {navContent(false)}
          </aside>
        </>
      )}
    </>
  )
}
