import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Package, Layers, AlertTriangle, CircleX, TrendingUp, TrendingDown, DollarSign, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MovementBadge } from '@/components/shared/StockBadge'
import { formatNumber, formatDateTime, cn } from '@/lib/utils'
import { useDashboard } from '@/hooks/use-dashboard'

function compactCurrency(v: number): string {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(1).replace('.', ',')}k`
  return `R$${Math.round(v)}`
}

const signed = (n: number) => `${n > 0 ? '+' : ''}${n}%`

const KPICard = ({ icon: Icon, label, value, sub, trend, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; trend?: 'up' | 'down'; color: string
}) => (
  <Card>
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', color)} />
        <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground leading-tight">{label}</span>
      </div>
      <p className={cn('text-xl sm:text-2xl font-bold tracking-tight', color)}>{value}</p>
      <div className={cn('mt-1 flex items-center gap-1 text-[10px] sm:text-[11px]',
        trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground')}>
        {trend === 'up' && <TrendingUp className="h-3 w-3" />}
        {trend === 'down' && <TrendingDown className="h-3 w-3" />}
        <span className="truncate">{sub}</span>
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboard()

  if (!data) {
    return (
      <div className="p-5 text-center text-xs text-muted-foreground">
        {error ? (
          <>
            <p className="text-red-400">Erro ao carregar o dashboard: {error}</p>
            <button onClick={refetch} className="mt-3 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:text-foreground">Tentar de novo</button>
          </>
        ) : 'Carregando dashboard...'}
      </div>
    )
  }

  const { stats: s, chartData, categoryDistribution, stockEvolution, recentMovements, currentMonthLabel, previousMonthLabel } = data

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-5 animate-fade-in">
      {/* KPI Grid — 2 cols mobile, 4 cols tablet, 7 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
        <KPICard icon={Package} label="Total produtos" value={formatNumber(s.totalProducts)} sub="cadastrados" color="text-primary" />
        <KPICard icon={Layers} label="Itens em estoque" value={formatNumber(s.totalStock)} sub="unidades no total" color="text-blue-400" />
        <KPICard icon={AlertTriangle} label="Abaixo do mínimo" value={String(s.lowStockCount)} sub={s.lowStockCount > 0 ? 'Repor em breve' : 'Tudo certo'} trend={s.lowStockCount > 0 ? 'down' : undefined} color="text-amber-400" />
        <KPICard icon={CircleX} label="Zerados" value={String(s.outOfStockCount)} sub={s.outOfStockCount > 0 ? 'Ação necessária' : 'Nenhum zerado'} trend={s.outOfStockCount > 0 ? 'down' : undefined} color="text-red-400" />
        <KPICard icon={ArrowDown} label={`Entradas ${currentMonthLabel}`} value={formatNumber(s.monthlyInbound)} sub={`${signed(s.monthlyInboundChange)} vs ${previousMonthLabel}`} trend={s.monthlyInboundChange >= 0 ? 'up' : 'down'} color="text-green-400" />
        <KPICard icon={ArrowUp} label={`Saídas ${currentMonthLabel}`} value={formatNumber(s.monthlyOutbound)} sub={`${signed(s.monthlyOutboundChange)} vs ${previousMonthLabel}`} trend={s.monthlyOutboundChange <= 0 ? 'up' : 'down'} color="text-red-400" />
        <KPICard icon={DollarSign} label="Valor estoque" value={compactCurrency(s.totalStockValue)} sub="a custo" color="text-green-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Entradas × Saídas</CardTitle>
            <p className="text-xs text-muted-foreground">Últimos 6 meses, em unidades</p>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="month" tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="entradas" fill="#6366f155" stroke="#818cf8" strokeWidth={1} radius={[4,4,0,0]} name="Entradas" />
                <Bar dataKey="saidas" fill="#ef444433" stroke="#ef4444" strokeWidth={1} radius={[4,4,0,0]} name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1 px-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-primary/60" />Entradas</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-red-500/60" />Saídas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Por categoria</CardTitle>
            <p className="text-xs text-muted-foreground">% das unidades em estoque</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {categoryDistribution.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {categoryDistribution.map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 flex-shrink-0 rounded-sm" style={{ background: cat.color }} />
                  <span className="flex-1 text-xs text-muted-foreground truncate">{cat.name}</span>
                  <span className="text-xs font-semibold">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Evolução do estoque</CardTitle>
          <p className="text-xs text-muted-foreground">Itens em estoque ao fim de cada mês</p>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={stockEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatNumber(v)} width={45} />
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [formatNumber(v), 'Itens']} />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Movements table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle>Últimas movimentações</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Atividade recente</p>
          </div>
          <button onClick={refetch} disabled={isLoading} className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-60">
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  {['Produto', 'Tipo', 'Qtd', 'Usuário', 'Data'].map(h => (
                    <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentMovements.map(m => (
                  <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="text-xs font-semibold truncate max-w-[120px] sm:max-w-none">{m.product?.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{m.product?.sku}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5"><MovementBadge type={m.type} /></td>
                    <td className={cn('px-3 sm:px-4 py-2.5 text-xs font-bold',
                      m.type === 'entrada' ? 'text-green-400' : m.type === 'saida' ? 'text-red-400' : 'text-amber-400')}>
                      {m.type === 'entrada' ? '+' : m.type === 'saida' ? '-' : '±'}{formatNumber(m.quantity)}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                      {(m as any).user?.full_name ?? (m.user_id === 'u1' ? 'João S.' : m.user_id === 'u2' ? 'Maria L.' : m.user_id === 'u3' ? 'Pedro M.' : '—')}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                  </tr>
                ))}
                {recentMovements.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">Nenhuma movimentação ainda</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
