import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Package, Layers, AlertTriangle, CircleX, TrendingUp, TrendingDown, DollarSign, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MovementBadge } from '@/components/shared/StockBadge'
import { formatNumber, formatDateTime, cn } from '@/lib/utils'
import { mockDashboardStats, mockChartData, mockCategoryDistribution, mockMovements, mockStockEvolution } from '@/lib/mock-data'

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
  const s = mockDashboardStats
  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-5 animate-fade-in">
      {/* KPI Grid — 2 cols mobile, 4 cols tablet, 7 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
        <KPICard icon={Package} label="Total produtos" value={formatNumber(s.totalProducts)} sub="+24 este mês" trend="up" color="text-primary" />
        <KPICard icon={Layers} label="Itens em estoque" value={formatNumber(s.totalStock)} sub="+1.2k semana" trend="up" color="text-blue-400" />
        <KPICard icon={AlertTriangle} label="Abaixo do mínimo" value={String(s.lowStockCount)} sub="+8 vs ontem" trend="down" color="text-amber-400" />
        <KPICard icon={CircleX} label="Zerados" value={String(s.outOfStockCount)} sub="Ação necessária" trend="down" color="text-red-400" />
        <KPICard icon={ArrowDown} label="Entradas mai." value={formatNumber(s.monthlyInbound)} sub="+18% vs abr." trend="up" color="text-green-400" />
        <KPICard icon={ArrowUp} label="Saídas mai." value={formatNumber(s.monthlyOutbound)} sub="-5% vs abr." trend="down" color="text-red-400" />
        <KPICard icon={DollarSign} label="Valor estoque" value="R$842k" sub="+3.4% mês" trend="up" color="text-green-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Entradas × Saídas — 2025</CardTitle>
            <p className="text-xs text-muted-foreground">Movimentações mensais acumuladas</p>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={mockChartData} barCategoryGap="30%">
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
            <p className="text-xs text-muted-foreground">% do valor total</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={mockCategoryDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {mockCategoryDistribution.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {mockCategoryDistribution.map(cat => (
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
          <CardTitle>Evolução do valor em estoque — 2025</CardTitle>
          <p className="text-xs text-muted-foreground">Valor total em R$ mil</p>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={mockStockEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}k`} width={45} />
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`R$${v}k`, 'Valor']} />
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
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-3 w-3" />
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
                {mockMovements.slice(0, 6).map(m => (
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
                      {m.user_id === 'u1' ? 'João S.' : m.user_id === 'u2' ? 'Maria L.' : 'Pedro M.'}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
