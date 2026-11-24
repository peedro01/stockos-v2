import { useState, useEffect } from 'react'
import { Users, Building2, Bell, Shield, Database, Plus, Sun, Moon, Palette } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockUsers } from '@/lib/mock-data'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { useSettingsStore, resolveSettings } from '@/store/settings.store'
import { settingsService } from '@/services/settings.service'
import { toast } from '@/hooks/use-toast'
import { getInitials, cn } from '@/lib/utils'
import type { UserProfile, UserRole } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const roleLabels: Record<UserRole, string> = { admin: 'Admin', gerente: 'Gerente', operador: 'Operador' }
const roleColors: Record<UserRole, string> = {
  admin: 'bg-primary/15 text-primary',
  gerente: 'bg-green-500/15 text-green-400',
  operador: 'bg-amber-500/15 text-amber-400',
}
const UNITS = ['un', 'kg', 'g', 'l', 'ml', 'cx', 'pc', 'par', 'rolo', 'm']

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button onClick={onToggle} disabled={disabled}
      className={cn('relative h-5 w-9 flex-shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        on ? 'bg-primary border-primary' : 'bg-secondary border-border')}>
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', on ? 'left-4' : 'left-0.5')} />
    </button>
  )
}

const SoonTag = () => (
  <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground align-middle">Em breve</span>
)

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{children}</label>
)

export default function Settings() {
  const { theme, setTheme } = useUIStore()
  const me = useAuthStore(s => s.user)
  const company = useSettingsStore(s => s.company)
  const saveCompany = useSettingsStore(s => s.saveCompany)
  const saveSettings = useSettingsStore(s => s.saveSettings)
  const settings = resolveSettings(company)
  const canEdit = IS_DEMO || me?.role === 'admin'

  // ── Empresa ──
  const [form, setForm] = useState({ name: '', cnpj: '', email: '', phone: '' })
  const [savingCompany, setSavingCompany] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (company) setForm({
      name: company.name ?? '', cnpj: company.cnpj ?? '', email: company.email ?? '', phone: company.phone ?? '',
    })
  }, [company?.id, company?.name, company?.cnpj, company?.email, company?.phone])

  async function handleSaveCompany() {
    if (!form.name.trim()) {
      toast({ title: 'Informe a razão social', variant: 'error' })
      return
    }
    setSavingCompany(true)
    try {
      await saveCompany({
        name: form.name.trim(), cnpj: form.cnpj.trim() || null,
        email: form.email.trim() || null, phone: form.phone.trim() || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      const msg = e?.code === '23505' ? 'Este CNPJ já está cadastrado' : (e?.message ?? 'Tente novamente')
      toast({ title: 'Erro ao salvar empresa', description: msg, variant: 'error' })
    } finally {
      setSavingCompany(false)
    }
  }

  async function handleSettings(patch: Parameters<typeof saveSettings>[0]) {
    try {
      await saveSettings(patch)
      toast({ title: '✓ Configuração salva', variant: 'success' })
    } catch (e: any) {
      toast({ title: 'Erro ao salvar configuração', description: e?.message ?? 'Tente novamente', variant: 'error' })
    }
  }

  // ── Usuários ──
  const [users, setUsers] = useState<UserProfile[]>(IS_DEMO ? mockUsers : [])
  const [usersLoading, setUsersLoading] = useState(!IS_DEMO)

  useEffect(() => {
    if (IS_DEMO) return
    settingsService.getUsers().then(setUsers).catch(() => {}).finally(() => setUsersLoading(false))
  }, [])

  async function handleUserChange(u: UserProfile, fields: { role?: UserRole; is_active?: boolean }) {
    const previous = users
    setUsers(list => list.map(x => x.id === u.id ? { ...x, ...fields } : x))
    try {
      if (!IS_DEMO) await settingsService.updateUser(u.id, fields)
      toast({ title: '✓ Usuário atualizado', description: u.full_name, variant: 'success' })
    } catch (e: any) {
      setUsers(previous)
      toast({ title: 'Erro ao atualizar usuário', description: e?.message ?? 'Tente novamente', variant: 'error' })
    }
  }

  return (
    <div className="p-3 sm:p-5 space-y-4 sm:space-y-5 max-w-3xl animate-fade-in">

      {/* Aparência */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Aparência</h2>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Escolha o tema da interface</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:border-border/80'
              )}>
              <div className="flex h-10 w-full rounded-lg bg-zinc-900 border border-zinc-700 items-center justify-center">
                <Moon className="h-4 w-4 text-zinc-300" />
              </div>
              <span className="text-xs font-semibold">Escuro</span>
              {theme === 'dark' && <span className="text-[10px] text-primary font-semibold">● Ativo</span>}
            </button>
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                theme === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:border-border/80'
              )}>
              <div className="flex h-10 w-full rounded-lg bg-gray-100 border border-gray-200 items-center justify-center">
                <Sun className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-xs font-semibold">Claro</span>
              {theme === 'light' && <span className="text-[10px] text-primary font-semibold">● Ativo</span>}
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Notificações</h2>
        </div>
        {!canEdit && <p className="px-4 pt-3 text-xs text-muted-foreground">Apenas administradores podem alterar estas opções.</p>}
        <div className="divide-y divide-border/60">
          {([
            { key: 'lowStock', label: 'Estoque baixo', desc: 'Produto atingiu o mínimo' },
            { key: 'outOfStock', label: 'Produto zerado', desc: 'Estoque chegou a zero' },
          ] as const).map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{item.desc}</p>
              </div>
              <Toggle on={settings.notifications[item.key]} disabled={!canEdit}
                onToggle={() => handleSettings({ notifications: { ...settings.notifications, [item.key]: !settings.notifications[item.key] } })} />
            </div>
          ))}
          {[
            { label: 'Movimentação suspeita', desc: 'Saída fora do horário' },
            { label: 'Relatório semanal', desc: 'Resumo toda segunda' },
            { label: 'Alerta de vencimento', desc: 'Próximos 30 dias' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}<SoonTag /></p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{item.desc}</p>
              </div>
              <Toggle on={false} onToggle={() => {}} disabled />
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
          <Button size="sm" className="text-xs" disabled title="Convite por e-mail em breve">
            <Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Convidar</span> usuário<SoonTag />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                {['Usuário', 'Função', 'Cadastro', 'Status'].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersLoading && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">Carregando...</td></tr>
              )}
              {users.map(u => {
                const isMe = u.id === me?.id
                const editable = canEdit && !isMe
                return (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-[10px] font-bold text-white">
                          {getInitials(u.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{u.full_name}{isMe && <span className="ml-1 text-[10px] font-normal text-muted-foreground">(você)</span>}</p>
                          <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      {editable ? (
                        <select value={u.role} onChange={e => handleUserChange(u, { role: e.target.value as UserRole })}
                          className="h-7 rounded-md border border-border bg-secondary px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring">
                          {(Object.keys(roleLabels) as UserRole[]).map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                        </select>
                      ) : (
                        <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', roleColors[u.role])}>
                          {roleLabels[u.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      {editable ? (
                        <button onClick={() => handleUserChange(u, { is_active: !u.is_active })}
                          className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold transition-colors',
                            u.is_active ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </button>
                      ) : (
                        <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
                          u.is_active ? 'bg-green-500/15 text-green-400' : 'bg-secondary text-muted-foreground')}>
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
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
          {!canEdit && <p className="text-xs text-muted-foreground">Apenas administradores podem alterar os dados da empresa.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FieldLabel>Razão social</FieldLabel>
              <Input value={form.name} disabled={!canEdit} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>CNPJ</FieldLabel>
              <Input value={form.cnpj} disabled={!canEdit} placeholder="00.000.000/0001-00" onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>E-mail</FieldLabel>
              <Input type="email" value={form.email} disabled={!canEdit} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Telefone</FieldLabel>
              <Input value={form.phone} disabled={!canEdit} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <Button size="sm" className="text-xs" onClick={handleSaveCompany} disabled={!canEdit || savingCompany}>
            {savingCompany ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar alterações'}
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
          {['2FA obrigatório para admins', 'Log de auditoria completo', 'Encerrar sessão após inatividade'].map(label => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="text-sm font-medium">{label}<SoonTag /></p>
              <Toggle on={false} onToggle={() => {}} disabled />
            </div>
          ))}
        </div>
      </Card>

      {/* Stock config */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Configurações de estoque</h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel>Unidade padrão (novos produtos)</FieldLabel>
            <select value={settings.defaultUnit} disabled={!canEdit}
              onChange={e => handleSettings({ defaultUnit: e.target.value })}
              className="flex h-9 w-full rounded-md border border-border bg-secondary px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring text-foreground disabled:opacity-50">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          {[
            { label: 'Percentual de alerta (%)', value: '20' },
            { label: 'Dias p/ alerta de vencimento', value: '30' },
            { label: 'Método de custeio', value: 'FIFO' },
          ].map(f => (
            <div key={f.label} className="space-y-1.5">
              <FieldLabel>{f.label}<SoonTag /></FieldLabel>
              <Input value={f.value} disabled readOnly />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
