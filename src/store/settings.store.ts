import { create } from 'zustand'
import { settingsService, type Company, type CompanySettings } from '@/services/settings.service'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export const DEFAULT_SETTINGS: CompanySettings = {
  notifications: { lowStock: true, outOfStock: true },
  defaultUnit: 'un',
}

const DEMO_COMPANY: Company = {
  id: 'demo', name: 'Empresa Demo Ltda.', cnpj: '00.000.000/0001-00',
  email: 'contato@empresa.com', phone: '(11) 3000-0000', settings: {},
}

interface SettingsState {
  company: Company | null
  load: () => Promise<void>
  saveCompany: (fields: Pick<Company, 'name' | 'cnpj' | 'email' | 'phone'>) => Promise<void>
  saveSettings: (patch: Partial<CompanySettings>) => Promise<void>
}

export function resolveSettings(company: Company | null): CompanySettings {
  const s = company?.settings ?? {}
  return {
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(s.notifications ?? {}) },
    defaultUnit: s.defaultUnit ?? DEFAULT_SETTINGS.defaultUnit,
  }
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  company: IS_DEMO ? DEMO_COMPANY : null,

  load: async () => {
    if (IS_DEMO) return
    try {
      const company = await settingsService.getCompany()
      if (company) set({ company })
    } catch (e) {
      console.error('Erro ao carregar configurações', e)
    }
  },

  saveCompany: async (fields) => {
    const company = get().company
    if (!company) return
    if (!IS_DEMO) await settingsService.updateCompany(company.id, fields)
    set({ company: { ...company, ...fields } })
  },

  saveSettings: async (patch) => {
    const company = get().company
    if (!company) return
    const merged = { ...resolveSettings(company), ...patch }
    if (!IS_DEMO) await settingsService.updateSettings(company.id, merged)
    set({ company: { ...company, settings: merged } })
  },
}))
