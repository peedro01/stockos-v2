import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import type { UserProfile } from '../types'

const DEMO_USER: UserProfile = {
  id: 'demo-admin',
  email: 'admin@stockos.demo',
  full_name: 'Admin Demo',
  role: 'admin',
  company_id: '1',
  created_at: '2025-01-01',
  is_active: true,
}

// Demo mode: URL não configurada ou contém placeholder
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const IS_DEMO =
  !supabaseUrl ||
  supabaseUrl.includes('SEU_PROJETO') ||
  supabaseUrl.includes('placeholder') ||
  supabaseUrl === 'https://placeholder.supabase.co'

interface AuthContextValue {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    if (IS_DEMO) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user.id)
      else setUser(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single()
    setUser(data as UserProfile)
  }

  async function signIn(email: string, password: string) {
    if (IS_DEMO) {
      if (email === 'admin@stockos.demo' && password === 'demo123') {
        setUser(DEMO_USER)
        return { error: null }
      }
      return { error: 'Credenciais inválidas. Use: admin@stockos.demo / demo123' }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (IS_DEMO) return { error: 'Configure o Supabase no .env.local para criar contas reais.' }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    if (IS_DEMO) { useAuthStore.getState().logout(); return }
    await supabase.auth.signOut()
    useAuthStore.getState().logout()
  }

  async function resetPassword(email: string) {
    if (IS_DEMO) return { error: 'Configure o Supabase para recuperação de senha.' }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider value={{ signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
