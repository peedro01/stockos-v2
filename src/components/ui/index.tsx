import React from 'react'
import { cn } from '@/utils'
import { Loader2 } from 'lucide-react'

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  children: React.ReactNode
  className?: string
}

const badgeVariants = {
  default: 'bg-secondary text-secondary-foreground border-border',
  success: 'bg-green-500/15 text-green-400 border-green-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-400 border-red-500/20',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  secondary: 'bg-secondary text-muted-foreground border-border',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border',
  ghost: 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent',
  danger: 'bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20',
  outline: 'bg-transparent text-foreground hover:bg-secondary border-border',
}

const buttonSizes = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3 text-xs gap-2',
  lg: 'h-9 px-4 text-sm gap-2',
}

export function Button({ variant = 'secondary', size = 'md', loading, icon, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full h-9 bg-secondary/60 border border-border rounded-lg px-3 text-sm outline-none transition-colors',
            'placeholder:text-muted-foreground',
            'focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
            icon && 'pl-9',
            error && 'border-destructive focus:border-destructive',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full h-9 bg-secondary/60 border border-border rounded-lg px-3 text-sm outline-none transition-colors',
          'focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
          error && 'border-destructive',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm outline-none transition-colors resize-none',
          'placeholder:text-muted-foreground',
          'focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
          error && 'border-destructive',
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-card border border-border rounded-xl', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-4 border-b border-border', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  sub?: string
  subTrend?: 'up' | 'down' | 'neutral'
  iconBg?: string
}

export function StatCard({ label, value, icon, sub, subTrend = 'neutral', iconBg = 'bg-primary/10' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && (
        <p className={cn(
          'text-xs mt-1.5 flex items-center gap-1',
          subTrend === 'up' && 'text-green-400',
          subTrend === 'down' && 'text-red-400',
          subTrend === 'neutral' && 'text-muted-foreground',
        )}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold mb-1">{title}</p>
      {description && <p className="text-xs text-muted-foreground mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Mostrando {from}–{to} de {total} registros
      </p>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          ← Anterior
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = i + 1
          return (
            <Button key={p} size="sm" variant={p === page ? 'primary' : 'secondary'} onClick={() => onPageChange(p)}>
              {p}
            </Button>
          )
        })}
        <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Próximo →
        </Button>
      </div>
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full', className)}>
        {children}
      </table>
    </div>
  )
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn('px-5 py-3.5 text-sm border-b border-border/50 last-of-type:border-0 align-middle', className)}>
      {children}
    </td>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const modalSizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-card border border-border rounded-xl shadow-2xl w-full', modalSizes[size])}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
