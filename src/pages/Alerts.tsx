import { AlertTriangle, CircleX, Info, Bell, Check, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAlertsStore } from '@/store/alerts.store'
import { formatDateTime, cn } from '@/lib/utils'

const severityConfig = {
  danger: { icon: CircleX, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
}

export default function Alerts() {
  const { alerts, markRead, dismiss, markAllRead, clearAll, unreadCount } = useAlertsStore()
  const unread = unreadCount()

  return (
    <div className="p-3 sm:p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            {unread > 0 ? `${unread} não lidos` : 'Todos lidos'}
          </span>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <Button variant="outline" size="sm" className="text-xs" onClick={markAllRead}>
              <Check className="h-3.5 w-3.5" />Ler todos
            </Button>
          )}
          {alerts.length > 0 && (
            <Button variant="outline" size="sm" className="text-xs text-red-400 border-red-500/30" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5" />Limpar tudo
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map(alert => {
          const cfg = severityConfig[alert.severity]
          const Icon = cfg.icon
          return (
            <Card
              key={alert.id}
              className={cn('flex items-start gap-3 p-3 sm:p-4 border transition-all', cfg.border, cfg.bg, alert.is_read && 'opacity-60')}
            >
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
                  <button
                    onClick={() => markRead(alert.id)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-green-400 hover:border-green-500/30 transition-colors"
                    title="Marcar como lido"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => dismiss(alert.id)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          )
        })}

        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <Bell className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Tudo em dia!</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Nenhum alerta pendente no momento</p>
          </div>
        )}
      </div>
    </div>
  )
}
