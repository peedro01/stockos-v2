import { useState } from 'react'
import { Users, Building2, Bell, Shield, Database, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockUsers } from '@/lib/mock-data'
import { getInitials, cn } from '@/lib/utils'

const roleLabels = { admin: 'Admin', gerente: 'Gerente', operador: 'Operador' }
const roleColors = {
  admin: 'bg-primary/15 text-primary',
  gerente: 'bg-green-500/15 text-green-400',
  operador: 'bg-amber-500/15 text-amber-400',
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={cn('relative h-5 w-9 flex-shrink-0 rounded-full border transition-colors',
        on ? 'bg-primary border-primary' : 'bg-secondary border-border')}>
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', on ? 'left-4' : 'left-0.5')} />
    </button>
  )
}

export default function Settings() {
  const [notifications, setNotifications] = useState({
    lowStock: true, outOfStock: true, suspicious: false, weeklyReport: true, expiryWarning: true,
  })
  const [companyName, setCompanyName] = useState('Empresa Exemplo Ltda.')
  const [cnpj, setCnpj] = useState('00.000.000/0001-00')
  const [email, setEmail] = useState('contato@empresa.com')
  const [phone, setPhone] = useState('(11) 3000-0000')
  const [saved, setSaved] = useState(false)

  function saveCompany() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="p-3 sm:p-5 space-y-4 sm:space-y-5 max-w-3xl animate-fade-in">

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Notificações</h2>
        </div>
        <div className="divide-y divide-border/60">
          {[
            { key: 'lowStock', label: 'Estoque baixo', desc: 'Produto atingiu o mínimo' },
            { key: 'outOfStock', label: 'Produto zerado', desc: 'Estoque chegou a zero' },
            { key: 'suspicious', label: 'Movimentação suspeita', desc: 'Saída fora do horário' },
            { key: 'weeklyReport', label: 'Relatório semanal', desc: 'Resumo toda segunda' },
            { key: 'expiryWarning', label: 'Alerta de vencimento', desc: 'Próximos 30 dias' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{item.desc}</p>
              </div>
              <Toggle on={notifications[item.key as keyof typeof notifications]}
                onToggle={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))} />
            </div>
          ))}
        </div>
      </Card>

      {/* Users */}
      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3 gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Usuários</h2>
          </div>
          <Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Convidar</span> usuário</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                {['Usuário', 'Função', 'Último acesso', 'Status', ''].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(u => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-3 sm:px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-[10px] font-bold text-white">
                        {getInitials(u.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{u.full_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', roleColors[u.role])}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {u.last_sign_in ? new Date(u.last_sign_in).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—'}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
                      u.is_active ? 'bg-green-500/15 text-green-400' : 'bg-secondary text-muted-foreground')}>
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <div className="flex gap-1">
                      <button className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                      {u.role !== 'admin' && <button className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Company */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Dados da empresa</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Razão social</label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">CNPJ</label>
              <Input value={cnpj} onChange={e => setCnpj(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">E-mail</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Telefone</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <Button size="sm" className="text-xs" onClick={saveCompany}>
            {saved ? '✓ Salvo!' : 'Salvar alterações'}
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Segurança</h2>
        </div>
        <div className="divide-y divide-border/60">
          {[
            { label: '2FA obrigatório para admins', on: true },
            { label: 'Log de auditoria completo', on: true },
            { label: 'Encerrar sessão após inatividade', on: false },
          ].map(item => {
            const [on, setOn] = useState(item.on)
            return (
              <div key={item.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <p className="text-sm font-medium">{item.label}</p>
                <Toggle on={on} onToggle={() => setOn(!on)} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Stock config */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Configurações de estoque</h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Percentual de alerta (%)', value: '20' },
            { label: 'Dias p/ alerta de vencimento', value: '30' },
            { label: 'Unidade padrão', value: 'un' },
            { label: 'Método de custeio', value: 'FIFO' },
          ].map(f => (
            <div key={f.label} className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</label>
              <Input defaultValue={f.value} />
            </div>
          ))}
          <div className="col-span-full">
            <Button size="sm" className="text-xs">Salvar configurações</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
