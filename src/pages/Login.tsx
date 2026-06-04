import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Package } from 'lucide-react'
import { useAuth } from '@/contexts/auth.context'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const { signIn, isDemoMode } = useAuth()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: isDemoMode
      ? { email: 'admin@stockos.demo', password: 'demo123' }
      : { email: '', password: '' },
  })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleLogin(data: LoginForm) {
    setError('')
    const { error } = await signIn(data.email, data.password)
    if (error) {
      setError(error)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-card border-r border-border p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">S</div>
          <span className="text-lg font-bold tracking-tight">StockOS</span>
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground border border-border">ENTERPRISE</span>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              Gestão de estoque<br />
              <span className="text-primary">para empresas modernas</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
              Controle completo de produtos, movimentações e fornecedores com tecnologia de ponta.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { n: '1.284+', l: 'Produtos gerenciados' },
              { n: '48.6k', l: 'Itens em estoque' },
              { n: '99.9%', l: 'Uptime garantido' },
              { n: '< 200ms', l: 'Tempo de resposta' },
            ].map(s => (
              <div key={s.l} className="rounded-xl border border-border bg-secondary/50 p-3.5">
                <p className="text-xl font-bold text-primary">{s.n}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          <span>StockOS v1.0 · Todos os direitos reservados</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">S</div>
            <span className="text-base font-bold">StockOS</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Entrar na conta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isDemoMode ? 'Modo demo — sem banco de dados' : 'Acesse com suas credenciais'}
            </p>
          </div>

          {isDemoMode && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary mb-0.5">🔑 Acesso demo</p>
              <p className="text-[11px] text-muted-foreground">admin@stockos.demo · demo123</p>
            </div>
          )}

          {!isDemoMode && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
              <p className="text-xs font-semibold text-green-400 mb-0.5">✅ Supabase conectado</p>
              <p className="text-[11px] text-muted-foreground">Use o e-mail e senha cadastrados no painel</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail</label>
              <Input type="email" placeholder="seu@email.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Senha</label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} placeholder="••••••••" className="pr-10" {...register('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
          </form>

          {!isDemoMode && (
            <p className="text-center text-xs text-muted-foreground">
              Problemas para entrar? Verifique suas credenciais no Supabase.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
