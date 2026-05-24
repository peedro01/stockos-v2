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

const registerSchema = loginSchema.extend({
  full_name: z.string().min(3, 'Nome muito curto'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Senhas não conferem', path: ['confirmPassword'] })
type RegisterForm = z.infer<typeof registerSchema>

const forgotSchema = z.object({ email: z.string().email('E-mail inválido') })
type ForgotForm = z.infer<typeof forgotSchema>

type Mode = 'login' | 'register' | 'forgot'

export default function Login() {
  const { signIn, signUp, resetPassword } = useAuth()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Se já está autenticado, redireciona
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@stockos.demo', password: 'demo123' },
  })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })
  const forgotForm = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })

  async function handleLogin(data: LoginForm) {
    setError('')
    const { error } = await signIn(data.email, data.password)
    if (error) {
      setError(error)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  async function handleRegister(data: RegisterForm) {
    setError('')
    const { error } = await signUp(data.email, data.password, data.full_name)
    if (error) setError(error)
    else setSuccess('Conta criada! Verifique seu e-mail.')
  }

  async function handleForgot(data: ForgotForm) {
    setError('')
    const { error } = await resetPassword(data.email)
    if (error) setError(error)
    else setSuccess('Link de recuperação enviado para seu e-mail.')
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
            <h2 className="text-2xl font-bold tracking-tight">
              {mode === 'login' ? 'Entrar na conta' : mode === 'register' ? 'Criar conta' : 'Recuperar senha'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'login' ? 'Acesse o painel de gestão de estoque' : mode === 'register' ? 'Preencha seus dados para começar' : 'Informe seu e-mail para receber o link'}
            </p>
          </div>

          {mode === 'login' && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary mb-0.5">🔑 Acesso demo</p>
              <p className="text-[11px] text-muted-foreground">admin@stockos.demo · demo123</p>
            </div>
          )}

          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">{error}</div>}
          {success && <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-400">{success}</div>}

          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail</label>
                <Input type="email" placeholder="seu@email.com" {...loginForm.register('email')} />
                {loginForm.formState.errors.email && <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Senha</label>
                <div className="relative">
                  <Input type={showPass ? 'text' : 'password'} placeholder="••••••••" className="pr-10" {...loginForm.register('password')} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="accent-primary" /> Manter conectado
                </label>
                <button type="button" onClick={() => { setMode('forgot'); setError('') }} className="text-xs text-primary hover:underline">
                  Esqueci a senha
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                {loginForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
              </Button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome completo</label>
                <Input placeholder="João da Silva" {...registerForm.register('full_name')} />
                {registerForm.formState.errors.full_name && <p className="text-xs text-red-400">{registerForm.formState.errors.full_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail</label>
                <Input type="email" placeholder="seu@email.com" {...registerForm.register('email')} />
                {registerForm.formState.errors.email && <p className="text-xs text-red-400">{registerForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Senha</label>
                <Input type="password" placeholder="Mínimo 6 caracteres" {...registerForm.register('password')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirmar senha</label>
                <Input type="password" placeholder="Repita a senha" {...registerForm.register('confirmPassword')} />
                {registerForm.formState.errors.confirmPassword && <p className="text-xs text-red-400">{registerForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                {registerForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
              </Button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={forgotForm.handleSubmit(handleForgot)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail cadastrado</label>
                <Input type="email" placeholder="seu@email.com" {...forgotForm.register('email')} />
                {forgotForm.formState.errors.email && <p className="text-xs text-red-400">{forgotForm.formState.errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={forgotForm.formState.isSubmitting}>
                {forgotForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link'}
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-muted-foreground">
            {mode === 'login' ? (
              <>Não tem conta?{' '}<button onClick={() => { setMode('register'); setError('') }} className="text-primary hover:underline font-semibold">Criar conta</button></>
            ) : (
              <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-primary hover:underline font-semibold">← Voltar ao login</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
