import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Package, Layers, AlertTriangle, CircleX, TrendingUp, TrendingDown,
  DollarSign, ArrowDown, ArrowUp, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MovementBadge } from '@/components/shared/StockBadge'
import { formatCurrency, formatNumber, formatDateTime, cn } from '@/lib/utils'
import {
  mockDashboardStats, mockChartData, mockCategoryDistribution,
  mockMovements, mockStockEvolution
} from '@/lib/mock-data'

const KPICard = ({
  icon: Icon, label, value, sub, trend, color
}: {
  icon: React.ElementType; label: string; value: string; sub: string; trend?: 'up' | 'down'; color: string
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold tracking-tight', color)}>{value}</p>
      <div className={cn('mt-1.5 flex items-center gap-1 text-[11px]', trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground')}>
        {trend === 'up' && <TrendingUp className="h-3 w-3" />}
        {trend === 'down' && <TrendingDown className="h-3 w-3" />}
        {sub}
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const s = mockDashboardStats

  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <KPICard icon={Package} label="Total produtos" value={formatNumber(s.totalProducts)} sub="+24 este mês" trend="up" color="text-primary" />
        <KPICard icon={Layers} label="Itens em estoque" value={formatNumber(s.totalStock)} sub="+1.2k semana" trend="up" color="text-blue-400" />
        <KPICard icon={AlertTriangle} label="Abaixo do mínimo" value={String(s.lowStockCount)} sub="+8 vs ontem" trend="down" color="text-amber-400" />
        <KPICard icon={CircleX} label="Zerados" value={String(s.outOfStockCount)} sub="Ação necessária" trend="down" color="text-red-400" />
        <KPICard icon={ArrowDown} label="Entradas mai." value={formatNumber(s.monthlyInbound)} sub={`+${s.monthlyInboundChange}% vs abr.`} trend="up" color="text-green-400" />
        <KPICard icon={ArrowUp} label="Saídas mai." value={formatNumber(s.monthlyOutbound)} sub={`${s.monthlyOutboundChange}% vs abr.`} trend="down" color="text-red-400" />
        <KPICard icon={DollarSign} label="Valor em estoque" value="R$842k" sub="+3.4% este mês" trend="up" color="text-green-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Entradas × Saídas — 2025</CardTitle>
            <p className="text-xs text-muted-foreground">Movimentações mensais acumuladas</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockChartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="month" tick={{ fill: '#9090a8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9090a8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8 }}
                  labelStyle={{ color: '#e8e8f0', fontWeight: 600 }}
                />
                <Bar dataKey="entradas" fill="#6366f155" stroke="#818cf8" strokeWidth={1} radius={[4,4,0,0]} name="Entradas" />
                <Bar dataKey="saidas" fill="#ef444433" stroke="#ef4444" strokeWidth={1} radius={[4,4,0,0]} name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-sm bg-primary/60" />Entradas
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-sm bg-red-500/60" />Saídas
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por categoria</CardTitle>
            <p className="text-xs text-muted-foreground">% do valor total</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={mockCategoryDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {mockCategoryDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8 }}
                  formatter={(v: number) => [`${v}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {mockCategoryDistribution.map((cat) => (
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

      {/* Evolution chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do valor em estoque — 2025</CardTitle>
          <p className="text-xs text-muted-foreground">Valor total em mil reais</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={mockStockEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#9090a8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9090a8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}k`} />
              <Tooltip
                contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8 }}
                formatter={(v: number) => [`R$${v}k`, 'Valor']}
              />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} fill="#22c55e15" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent movements table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle>Últimas movimentações</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Atividade recente do estoque</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3 w-3" />Atualizar
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Produto', 'Tipo', 'Qtd', 'Usuário', 'Data/Hora', 'Referência'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockMovements.slice(0, 7).map((m) => (
                  <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-semibold">{m.product?.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{m.product?.sku}</div>
                    </td>
                    <td className="px-4 py-2.5"><MovementBadge type={m.type} /></td>
                    <td className={cn('px-4 py-2.5 text-xs font-bold',
                      m.type === 'entrada' ? 'text-green-400' : m.type === 'saida' ? 'text-red-400' : 'text-amber-400')}>
                      {m.type === 'entrada' ? '+' : m.type === 'saida' ? '-' : '±'}{formatNumber(m.quantity)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{m.user_id === 'u1' ? 'João S.' : m.user_id === 'u2' ? 'Maria L.' : 'Pedro M.'}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(m.created_at)}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{m.reference ?? '—'}</td>
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
