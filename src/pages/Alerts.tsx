import { useState } from 'react'
import { AlertTriangle, CircleX, Info, Bell, Check, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockAlerts } from '@/lib/mock-data'
import { formatDateTime, cn } from '@/lib/utils'
import type { StockAlert } from '@/types'

const severityConfig = {
  danger: { icon: CircleX, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>(mockAlerts)

  function markRead(id: string) { setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a)) }
  function dismiss(id: string) { setAlerts(prev => prev.filter(a => a.id !== id)) }

  const unread = alerts.filter(a => !a.is_read).length

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{unread} não lidos</span>
        </div>
        <Button variant="outline" size="sm" className="text-xs"
          onClick={() => setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))}>
          <Check className="h-3.5 w-3.5" /><span className="hidden sm:inline">Marcar todos como lidos</span><span className="sm:hidden">Ler todos</span>
        </Button>
      </div>

      <div className="space-y-2">
        {alerts.map(alert => {
          const cfg = severityConfig[alert.severity]
          const Icon = cfg.icon
          return (
            <Card key={alert.id}
              className={cn('flex items-start gap-3 p-3 sm:p-4 border transition-opacity', cfg.border, cfg.bg, alert.is_read && 'opacity-60')}>
              <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5', cfg.text)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-semibold">{alert.title}</span>
                  {!alert.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/60">{formatDateTime(alert.created_at)}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {!alert.is_read && (
                  <button onClick={() => markRead(alert.id)}
                    className={cn('rounded-md px-2 py-1 text-xs font-medium border', cfg.border, cfg.text, 'hover:opacity-80 hidden sm:block')}>
                    Ver
                  </button>
                )}
                <button onClick={() => dismiss(alert.id)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          )
        })}
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">Nenhum alerta pendente</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tudo em ordem!</p>
          </div>
        )}
      </div>
    </div>
  )
}
