import { supabase } from '@/lib/supabase'
import type { UserProfile, UserRole } from '@/types'

export interface CompanySettings {
  notifications: { lowStock: boolean; outOfStock: boolean }
  defaultUnit: string
}

export interface Company {
  id: string
  name: string
  cnpj: string | null
  email: string | null
  phone: string | null
  settings: Partial<CompanySettings>
}

export const settingsService = {
  async getCompany(): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, cnpj, email, phone, settings')
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data as Company | null
  },

  async updateCompany(id: string, fields: Pick<Company, 'name' | 'cnpj' | 'email' | 'phone'>): Promise<void> {
    const { data, error } = await supabase.from('companies').update(fields).eq('id', id).select('id')
    if (error) throw error
    if (!data?.length) throw new Error('Sem permissão para alterar os dados da empresa (apenas admin).')
  },

  async updateSettings(id: string, settings: Partial<CompanySettings>): Promise<void> {
    const { data, error } = await supabase.from('companies').update({ settings }).eq('id', id).select('id')
    if (error) throw error
    if (!data?.length) throw new Error('Sem permissão para alterar as configurações (apenas admin).')
  },

  async getUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, company_id, created_at, is_active')
      .order('created_at')
    if (error) throw error
    return (data ?? []) as UserProfile[]
  },

  async updateUser(id: string, fields: { role?: UserRole; is_active?: boolean }): Promise<void> {
    const { data, error } = await supabase.from('user_profiles').update(fields).eq('id', id).select('id')
    if (error) throw error
    if (!data?.length) throw new Error('Sem permissão para alterar usuários (apenas admin).')
  },
}
