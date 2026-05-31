import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, TrendingUp, Star, AlertTriangle, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockStockEvolution, mockProducts, mockMovements, mockSuppliers, mockCustomers } from '@/lib/mock-data'
import { exportProducts, exportMovements, exportSuppliers, exportCustomers, exportCriticalProducts } from '@/lib/export'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type LoadingKey = string
const useExport = () => {
  const [loading, setLoading] = useState<LoadingKey>('')

  async function run(key: string, fn: () => Promise<void>) {
    setLoading(key)
    try {
      await fn()
      toast({ title: '✓ Arquivo gerado com sucesso!', variant: 'success' })
    } catch (e) {
      toast({ title: 'Erro ao gerar arquivo', description: 'Tente novamente', variant: 'error' })
    } finally {
      setLoading('')
    }
  }

  return { loading, run }
}

function ExportButtons({ keyPrefix, onPdf, onExcel, loading }: {
  keyPrefix: string
  onPdf: () => Promise<void>
  onExcel: () => Promise<void>
  loading: string
}) {
  const { run } = useExport()
  const [localLoading, setLocalLoading] = useState('')

  async function handlePdf() {
    setLocalLoading('pdf')
    try { await onPdf(); toast({ title: '✓ PDF gerado!', variant: 'success' }) }
    catch { toast({ title: 'Erro ao gerar PDF', variant: 'error' }) }
    finally { setLocalLoading('') }
  }

  async function handleExcel() {
    setLocalLoading('excel')
    try { await onExcel(); toast({ title: '✓ Excel gerado!', variant: 'success' }) }
    catch { toast({ title: 'Erro ao gerar Excel', variant: 'error' }) }
    finally { setLocalLoading('') }
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      <Button size="sm" className="h-7 text-[11px] px-2.5" onClick={handlePdf} disabled={!!localLoading}>
        {localLoading === 'pdf' ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}PDF
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5" onClick={handleExcel} disabled={!!localLoading}>
        {localLoading === 'excel' ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSpreadsheet className="h-3 w-3" />}Excel
      </Button>
    </div>
  )
}

const reportCards = [
  {
    icon: FileText, label: 'Estoque atual', desc: `${mockProducts.length} produtos`,
    color: 'text-blue-400',
    onPdf: () => exportProducts(mockProducts, 'pdf'),
    onExcel: () => exportProducts(mockProducts, 'excel'),
  },
  {
    icon: TrendingUp, label: 'Movimentações', desc: `${mockMovements.length} registros`,
    color: 'text-green-400',
    onPdf: () => exportMovements(mockMovements, 'pdf'),
    onExcel: () => exportMovements(mockMovements, 'excel'),
  },
  {
    icon: Star, label: 'Fornecedores', desc: `${mockSuppliers.length} cadastros`,
    color: 'text-amber-400',
    onPdf: () => exportSuppliers(mockSuppliers, 'pdf'),
    onExcel: () => exportSuppliers(mockSuppliers, 'excel'),
  },
  {
    icon: AlertTriangle, label: 'Produtos críticos', desc: 'Abaixo do mínimo',
    color: 'text-red-400',
    onPdf: () => exportCriticalProducts(mockProducts, 'pdf'),
    onExcel: () => exportCriticalProducts(mockProducts, 'excel'),
  },
]

export default function Reports() {
  const [exportLoading, setExportLoading] = useState('')

  async function handleExport(format: 'excel' | 'pdf', type: string) {
    const key = `${type}-${format}`
    setExportLoading(key)
    try {
      if (type === 'movements') await exportMovements(mockMovements, format)
      else if (type === 'products') await exportProducts(mockProducts, format)
      toast({ title: `✓ ${format === 'pdf' ? 'PDF' : 'Excel'} gerado com sucesso!`, variant: 'success' })
    } catch {
      toast({ title: 'Erro ao exportar', variant: 'error' })
    } finally {
      setExportLoading('')
    }
  }

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportCards.map(r => (
          <Card key={r.label} className="p-4 hover:border-border/80 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <r.icon className={cn('h-4 w-4', r.color)} />
              <span className="text-xs font-semibold">{r.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
            <ExportButtons
              keyPrefix={r.label}
              onPdf={r.onPdf}
              onExcel={r.onExcel}
              loading={exportLoading}
            />
          </Card>
        ))}
      </div>

      {/* Evolution chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Evolução do valor em estoque</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Valor total em R$ mil</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs"
                onClick={() => handleExport('pdf', 'products')}
                disabled={exportLoading === 'products-pdf'}>
                {exportLoading === 'products-pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}PDF
              </Button>
              <Button variant="outline" size="sm" className="text-xs"
                onClick={() => handleExport('excel', 'products')}
                disabled={exportLoading === 'products-excel'}>
                {exportLoading === 'products-excel' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockStockEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}k`} width={45} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`R$${v}k`, 'Valor']} />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most moved products */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Produtos mais movimentados</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Acumulado no mês</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs"
                onClick={() => handleExport('pdf', 'movements')}
                disabled={exportLoading === 'movements-pdf'}>
                {exportLoading === 'movements-pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}PDF
              </Button>
              <Button variant="outline" size="sm" className="text-xs"
                onClick={() => handleExport('excel', 'movements')}
                disabled={exportLoading === 'movements-excel'}>
                {exportLoading === 'movements-excel' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}Excel
              </Button>
            </div>
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
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#6366f155" stroke="#818cf8" strokeWidth={1} radius={[0,4,4,0]} name="Movimentações" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customers export */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Relatório de clientes</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{mockCustomers.length} clientes cadastrados</p>
            </div>
            <ExportButtons
              keyPrefix="customers"
              onPdf={() => exportCustomers(mockCustomers, 'pdf')}
              onExcel={() => exportCustomers(mockCustomers, 'excel')}
              loading={exportLoading}
            />
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
