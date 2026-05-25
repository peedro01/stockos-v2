import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, TrendingUp, Star, AlertTriangle, Download, FileSpreadsheet } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockStockEvolution } from '@/lib/mock-data'

const reportCards = [
  { icon: FileText, label: 'Estoque atual', desc: 'Posição em tempo real', color: 'text-blue-400' },
  { icon: TrendingUp, label: 'Entradas/Saídas', desc: 'Por período', color: 'text-green-400' },
  { icon: Star, label: 'Mais vendidos', desc: 'Top 50 produtos', color: 'text-amber-400' },
  { icon: AlertTriangle, label: 'Críticos', desc: 'Abaixo do mínimo', color: 'text-red-400' },
]

export default function Reports() {
  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportCards.map(r => (
          <Card key={r.label} className="p-4 hover:border-border/80 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <r.icon className={`h-4 w-4 ${r.color}`} />
              <span className="text-xs font-semibold">{r.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
            <div className="flex gap-1.5 flex-wrap">
              <Button size="sm" className="h-7 text-[11px] px-2.5"><FileText className="h-3 w-3" />PDF</Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5"><FileSpreadsheet className="h-3 w-3" />Excel</Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Evolução do valor em estoque</CardTitle>
          <p className="text-xs text-muted-foreground">Valor total em R$ mil</p>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockStockEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}k`} width={45} />
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`R$${v}k`, 'Valor']} />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Produtos mais movimentados</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Acumulado no mês</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5" />Exportar</Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[
              { name: 'Cabo HDMI', value: 520 },
              { name: 'Mouse Ergo.', value: 390 },
              { name: 'Teclado RGB', value: 280 },
              { name: 'Webcam HD', value: 240 },
              { name: 'Hub USB-C', value: 180 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#6366f155" stroke="#818cf8" strokeWidth={1} radius={[0,4,4,0]} name="Movimentações" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
