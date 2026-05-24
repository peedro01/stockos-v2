import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getStockStatus(current: number, minimum: number) {
  if (current === 0) return 'zerado'
  if (current <= minimum) return 'baixo'
  return 'ok'
}

export function getStockStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ok: 'Em estoque',
    baixo: 'Estoque baixo',
    zerado: 'Zerado',
    excesso: 'Excesso',
  }
  return labels[status] ?? status
}

export function getMovementTypeLabel(type: string) {
  const labels: Record<string, string> = {
    entrada: 'Entrada',
    saida: 'Saída',
    ajuste: 'Ajuste',
    transferencia: 'Transferência',
    inventario: 'Inventário',
    perda: 'Perda/Avaria',
  }
  return labels[type] ?? type
}

export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    gerente: 'Gerente',
    operador: 'Operador',
  }
  return labels[role] ?? role
}

export function truncate(str: string, length = 30): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function generateSKU(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '')
  const random = Math.floor(Math.random() * 90000) + 10000
  return `${prefix}-${random}`
}
