import { Bell, X, AlertTriangle, CircleX, Info, Check } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { useAlertsStore } from '@/store/alerts.store'

const severityConfig = {
  danger: { icon: CircleX, text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  warning: { icon: AlertTriangle, text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  info: { icon: Info, text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
}

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { alerts, markRead, dismiss, markAllRead, clearAll, unreadCount } = useAlertsStore()
  const unread = unreadCount()

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-3 top-[60px] z-50 w-[340px] sm:w-[380px] rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Notificações</span>
            {unread > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button onClick={markAllRead} className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                Ler tudo
              </button>
            )}
            {alerts.length > 0 && (
              <button onClick={clearAll} className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-red-400 hover:bg-secondary transition-colors">
                Limpar
              </button>
            )}
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-3">
                <Bell className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Tudo em dia!</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Nenhuma notificação pendente</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {alerts.map(alert => {
                const cfg = severityConfig[alert.severity]
                const Icon = cfg.icon
                return (
                  <div key={alert.id}
                    className={cn('flex items-start gap-3 px-4 py-3 transition-colors',
                      !alert.is_read ? 'bg-secondary/30' : 'hover:bg-secondary/20')}>
                    <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border mt-0.5', cfg.bg, cfg.border)}>
                      <Icon className={cn('h-3.5 w-3.5', cfg.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-xs font-semibold leading-tight', !alert.is_read && 'text-foreground')}>
                          {alert.title}
                        </p>
                        {!alert.is_read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{formatDateTime(alert.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {!alert.is_read && (
                        <button onClick={() => markRead(alert.id)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-green-400 hover:border-green-500/30 transition-colors"
                          title="Marcar como lido">
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                      <button onClick={() => dismiss(alert.id)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
                        title="Dispensar">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {alerts.length > 0 && (
          <div className="border-t border-border px-4 py-2.5">
            <button onClick={onClose} className="text-xs text-primary hover:underline font-medium">
              Ver todos os alertas →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
