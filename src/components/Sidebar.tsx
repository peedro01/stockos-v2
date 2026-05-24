import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ArrowLeftRight, Truck, Users,
  BarChart3, Bell, Settings, ChevronLeft, ChevronRight, LogOut,
  Boxes
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { to: '/produtos', icon: Package, label: 'Produtos' },
      { to: '/movimentacoes', icon: ArrowLeftRight, label: 'Movimentações' },
    ],
  },
  {
    label: 'Cadastros',
    items: [
      { to: '/fornecedores', icon: Truck, label: 'Fornecedores' },
      { to: '/clientes', icon: Users, label: 'Clientes' },
    ],
  },
  {
    label: 'Análises',
    items: [
      { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
      { to: '/alertas', icon: Bell, label: 'Alertas', badge: true },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/configuracoes', icon: Settings, label: 'Configurações' },
    ],
  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, unreadAlertsCount } = useAppStore()
  const { signOut, profile } = useAuth()
  const location = useLocation()

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col z-40 transition-all duration-200',
      sidebarCollapsed ? 'w-[60px]' : 'w-[240px]'
    )}>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border gap-3 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Boxes className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm tracking-tight">StockOS</span>
            <span className="text-[10px] text-muted-foreground bg-secondary border border-border rounded px-1.5 py-0.5">PRO</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {!sidebarCollapsed && (
              <p className="px-4 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive: a }) => cn(
                  'flex items-center gap-3 mx-2 px-2.5 py-2 rounded-lg transition-all text-sm font-medium',
                  (a || isActive(item.to, item.exact))
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && unreadAlertsCount > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {unreadAlertsCount}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && item.badge && unreadAlertsCount > 0 && (
                  <span className="absolute right-1 top-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border space-y-1">
        {!sidebarCollapsed && profile && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-secondary/60 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile.full_name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{profile.full_name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
          title={sidebarCollapsed ? 'Sair' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>Sair</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Recolher</span></>}
        </button>
      </div>
    </aside>
  )
}
