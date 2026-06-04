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

// Checa se é modo demo — só se a URL for realmente placeholder
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string ?? ''
const IS_DEMO =
  !SUPABASE_URL ||
  SUPABASE_URL === '' ||
  SUPABASE_URL.includes('SEU_PROJETO') ||
  SUPABASE_URL.includes('placeholder.supabase.co') ||
  SUPABASE_URL === 'https://placeholder.supabase.co'

interface AuthContextValue {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  isDemoMode: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    if (IS_DEMO) {
      setLoading(false)
      return
    }

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setUser(data as UserProfile)
      } else {
        // Perfil não encontrado — cria um básico
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user) {
          const profile: UserProfile = {
            id: authUser.user.id,
            email: authUser.user.email ?? '',
            full_name: authUser.user.user_metadata?.full_name ?? authUser.user.email ?? 'Usuário',
            role: 'admin',
            company_id: '00000000-0000-0000-0000-000000000001',
            created_at: new Date().toISOString(),
            is_active: true,
          }
          setUser(profile)
        }
      }
    } catch {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    // Modo demo
    if (IS_DEMO) {
      if (email === 'admin@stockos.demo' && password === 'demo123') {
        setUser(DEMO_USER)
        return { error: null }
      }
      return { error: 'No modo demo use: admin@stockos.demo / demo123' }
    }

    // Login real no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user) await fetchProfile(data.user.id)
    return { error: null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (IS_DEMO) return { error: 'Configure o Supabase para criar contas.' }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    if (IS_DEMO) {
      useAuthStore.getState().logout()
      return
    }
    await supabase.auth.signOut()
    useAuthStore.getState().logout()
  }

  async function resetPassword(email: string) {
    if (IS_DEMO) return { error: 'Configure o Supabase para recuperação de senha.' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider value={{ signIn, signUp, signOut, resetPassword, isDemoMode: IS_DEMO }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
