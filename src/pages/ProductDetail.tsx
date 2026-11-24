import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Pencil, Package, DollarSign, Percent, Repeat, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StockBadge, StatusBadge, StockBar, MovementBadge } from '@/components/shared/StockBadge'
import { ProductModal } from '@/components/products/ProductModal'
import { useProductDetail } from '@/hooks/use-product-detail'
import { productsService } from '@/services/products.service'
import { useAlertsStore } from '@/store/alerts.store'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatNumber, formatDate, formatDateTime, getStockStatus, cn } from '@/lib/utils'
import type { MovementType, ProductFormData } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const typeFilters: { key: 'all' | MovementType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'entrada', label: 'Entradas' },
  { key: 'saida', label: 'Saídas' },
  { key: 'ajuste', label: 'Ajustes' },
]

const Stat = ({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string
}) => (
  <Card>
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className={cn('h-3.5 w-3.5', color)} />{label}
      </div>
      <div className="mt-1.5 text-xl font-bold sm:text-2xl">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>}
    </CardContent>
  </Card>
)

const Info = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">{label}</p>
    <p className="mt-0.5 text-sm">{value || '—'}</p>
  </div>
)

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { product, setProduct, movements, isLoading, error, refetch } = useProductDetail(id)
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | MovementType>('all')

  const totals = useMemo(() => {
    let inn = 0, out = 0
    for (const m of movements) {
      if (m.type === 'entrada') inn += m.quantity
      else if (m.type === 'saida' || m.type === 'perda') out += m.quantity
    }
    return { inn, out }
  }, [movements])

  const chartData = useMemo(() => {
    return [...movements]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map(m => ({
        label: new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        saldo: m.balance_after,
      }))
  }, [movements])

  const filtered = filter === 'all' ? movements : movements.filter(m => m.type === filter)

  async function handleSave(data: ProductFormData) {
    if (!product) return
    try {
      if (IS_DEMO) {
        setProduct({ ...product, ...data, updated_at: new Date().toISOString() } as typeof product)
      } else {
        await productsService.update(product.id, data)
        void useAlertsStore.getState().load()
        await refetch()
      }
      toast({ title: '✓ Produto atualizado', description: data.name, variant: 'success' })
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e?.message ?? 'Tente novamente', variant: 'error' })
    }
  }

  if (isLoading && !product) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-5 text-center text-sm text-muted-foreground">
        <p>{error ? `Erro ao carregar: ${error}` : 'Produto não encontrado.'}</p>
        <Button size="sm" className="mt-3 text-xs" onClick={() => navigate('/products')}>Voltar para produtos</Button>
      </div>
    )
  }

  const ss = getStockStatus(product.current_stock, product.min_stock)
  const margin = product.sale_price > 0 ? ((product.sale_price - product.cost_price) / product.sale_price) * 100 : 0

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-5 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <button onClick={() => navigate('/products')}
            className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Produtos
          </button>
          <h1 className="text-lg font-bold sm:text-xl truncate">{product.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{product.sku}</span>
            <StockBadge status={ss} />
            <StatusBadge status={product.status} />
          </div>
        </div>
        <Button size="sm" className="text-xs" onClick={() => setModalOpen(true)}>
          <Pencil className="h-3.5 w-3.5" /> Editar produto
        </Button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Stat icon={Package} label="Estoque atual" value={`${formatNumber(product.current_stock)} ${product.unit}`}
          sub={`mínimo ${formatNumber(product.min_stock)}${product.max_stock ? ` · máx ${formatNumber(product.max_stock)}` : ''}`} color="text-primary" />
        <Stat icon={DollarSign} label="Valor em estoque" value={formatCurrency(product.current_stock * product.cost_price)}
          sub="a custo" color="text-green-400" />
        <Stat icon={Percent} label="Margem" value={`${margin.toFixed(1).replace('.', ',')}%`}
          sub={`${formatCurrency(product.cost_price)} → ${formatCurrency(product.sale_price)}`} color="text-blue-400" />
        <Stat icon={Repeat} label="Movimentações" value={String(movements.length)}
          sub={`+${formatNumber(totals.inn)} entradas · −${formatNumber(totals.out)} saídas`} color="text-amber-400" />
      </div>
      <div className="-mt-1 sm:-mt-2 max-w-xs">
        <StockBar current={product.current_stock} max={product.max_stock ?? product.min_stock * 10} />
      </div>

      <div className="grid gap-3 sm:gap-5 lg:grid-cols-3">
        {/* Dados */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle>Dados do produto</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Info label="Categoria" value={product.category?.name} />
            <Info label="Fornecedor" value={product.supplier?.company_name} />
            <Info label="Marca" value={product.brand} />
            <Info label="Unidade" value={product.unit} />
            <Info label="Código de barras" value={product.barcode} />
            <Info label="Localização" value={product.location} />
            <Info label="Cadastro" value={formatDate(product.created_at)} />
            <Info label="Atualizado" value={formatDate(product.updated_at)} />
            {product.description && <div className="col-span-2"><Info label="Descrição" value={product.description} /></div>}
          </CardContent>
        </Card>

        {/* Evolução do saldo */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle>Evolução do saldo</CardTitle>
            <p className="text-xs text-muted-foreground">Saldo após cada movimentação</p>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            {chartData.length < 2 ? (
              <div className="flex h-[170px] items-center justify-center text-xs text-muted-foreground">
                {chartData.length === 0 ? 'Nenhuma movimentação registrada ainda' : 'Registre mais movimentações para ver a evolução'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={170}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="label" tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9090a8', fontSize: 10 }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #ffffff12', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [formatNumber(v), 'Saldo']} />
                  <Line type="stepAfter" dataKey="saldo" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
          <div>
            <CardTitle>Histórico de movimentações</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} registro(s)</p>
          </div>
          <div className="flex gap-1 rounded-lg border border-border bg-secondary/50 p-0.5">
            {typeFilters.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  filter === t.key ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground')}>
                {t.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  {['Data', 'Tipo', 'Qtd', 'Saldo após', 'Custo un.', 'Usuário', 'Referência'].map(h => (
                    <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                    <td className="px-3 sm:px-4 py-2.5"><MovementBadge type={m.type} /></td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs font-semibold">{formatNumber(m.quantity)}</td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs">{formatNumber(m.balance_after)}</td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs">{m.unit_cost ? formatCurrency(m.unit_cost) : '—'}</td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">{(m as any).user?.full_name ?? '—'}</td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground max-w-[160px] truncate">{m.reference || m.notes || '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">Nenhuma movimentação encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} product={product} />
    </div>
  )
}
