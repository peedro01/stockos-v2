import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast'
import { useToastState } from '@/hooks/use-toast'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral' },
  '/products': { title: 'Produtos', subtitle: 'Gestão de catálogo' },
  '/movements': { title: 'Movimentações', subtitle: 'Histórico de estoque' },
  '/suppliers': { title: 'Fornecedores', subtitle: 'Cadastro' },
  '/customers': { title: 'Clientes', subtitle: 'Base de clientes' },
  '/reports': { title: 'Relatórios', subtitle: 'Análises e exportações' },
  '/alerts': { title: 'Alertas', subtitle: 'Notificações do sistema' },
  '/settings': { title: 'Configurações', subtitle: 'Sistema' },
}

export function AppLayout() {
  const location = useLocation()
  const page = pageTitles[location.pathname] ?? { title: 'StockOS', subtitle: '' }
  const { toasts, dismiss } = useToastState()

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Header title={page.title} subtitle={page.subtitle} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <ToastViewport />
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} open>
          <div className="flex-1">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose onClick={() => dismiss(t.id)} />
        </Toast>
      ))}
    </ToastProvider>
  )
}
