import { Search, Bell, HelpCircle, Menu } from 'lucide-react'
import { mockAlerts } from '@/lib/mock-data'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const unreadCount = mockAlerts.filter(a => !a.is_read).length

  return (
    <header className="flex h-[52px] items-center gap-2 border-b border-border bg-card px-3 sm:px-5 flex-shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground lg:hidden flex-shrink-0"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-[14px] sm:text-[15px] font-semibold tracking-tight truncate">{title}</h1>
        {subtitle && (
          <span className="hidden sm:inline rounded px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border whitespace-nowrap">
            {subtitle}
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 w-48 lg:w-64">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input
            placeholder="Buscar..."
            className="bg-transparent text-xs outline-none placeholder:text-muted-foreground w-full"
          />
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground md:hidden">
          <Search className="h-4 w-4" />
        </button>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <button className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
