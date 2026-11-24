import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Upload, Download, FileText, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { mockCategories, mockSuppliers } from '@/lib/mock-data'
import { useAuthStore } from '@/store/auth.store'
import { useAlertsStore } from '@/store/alerts.store'
import { useSettingsStore, resolveSettings } from '@/store/settings.store'
import { parseCsv, buildRows, MODEL_CSV, MAX_ROWS, type ImportRow, type Lookups } from '@/lib/csv-import'
import { importProducts, type ImportMode, type ImportResult } from '@/services/products-import.service'
import { formatNumber, formatCurrency, cn } from '@/lib/utils'
import type { Product } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

interface Props {
  open: boolean
  onClose: () => void
  onDone: () => void
  existingProducts: Product[]
  /** modo demo: cria o produto só em memória */
  onDemoCreate: (data: any) => Promise<unknown>
}

const MAX_FILE_BYTES = 2 * 1024 * 1024
const PREVIEW_LIMIT = 200

export function ImportProductsModal({ open, onClose, onDone, existingProducts, onDemoCreate }: Props) {
  const user = useAuthStore(s => s.user)
  const defaultUnit = useSettingsStore(s => resolveSettings(s.company).defaultUnit)
  const fileRef = useRef<HTMLInputElement>(null)

  const [lookups, setLookups] = useState<Lookups | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [problem, setProblem] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [mode, setMode] = useState<ImportMode>('skip')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  // reinicia ao abrir
  useEffect(() => {
    if (!open) return
    setStep('upload'); setRows([]); setProblem(null); setResult(null); setFileName('')
    setMode('skip'); setTruncated(false); setImporting(false)
  }, [open])

  // categorias, fornecedores e SKUs existentes
  useEffect(() => {
    if (!open) return
    if (IS_DEMO) {
      setLookups({
        categories: mockCategories.map(c => ({ id: c.id, name: c.name })),
        suppliers: mockSuppliers.map(s => ({ id: s.id, name: s.company_name })),
        existingSkus: new Set(existingProducts.map(p => p.sku)),
        defaultUnit,
      })
      return
    }
    let alive = true
    Promise.all([
      supabase.from('categories').select('id, name'),
      supabase.from('suppliers').select('id, company_name'),
      supabase.from('products').select('sku').limit(10000),
    ]).then(([c, s, p]) => {
      if (!alive) return
      setLookups({
        categories: (c.data ?? []).map((x: any) => ({ id: x.id, name: x.name })),
        suppliers: (s.data ?? []).map((x: any) => ({ id: x.id, name: x.company_name })),
        existingSkus: new Set((p.data ?? []).map((x: any) => x.sku as string)),
        defaultUnit,
      })
    }, () => {})
    return () => { alive = false }
  }, [open, existingProducts, defaultUnit])

  const counts = useMemo(() => {
    const errors = rows.filter(r => r.errors.length > 0).length
    const existing = rows.filter(r => r.errors.length === 0 && r.exists).length
    const fresh = rows.filter(r => r.errors.length === 0 && !r.exists).length
    const importable = fresh + (mode === 'update' ? existing : 0)
    return { errors, existing, fresh, importable }
  }, [rows, mode])

  function downloadModel() {
    const blob = new Blob(['\uFEFF' + MODEL_CSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'modelo-produtos.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFile(file: File | undefined) {
    if (!file || !lookups) return
    setProblem(null)
    if (file.size > MAX_FILE_BYTES) { setProblem('Arquivo muito grande (máximo 2 MB).'); return }
    try {
      const text = await file.text()
      const parsed = buildRows(parseCsv(text), lookups)
      if (parsed.missingColumns.length) {
        setProblem(`Colunas obrigatórias não encontradas: ${parsed.missingColumns.join(', ')}. Baixe o modelo para ver o formato.`)
        return
      }
      if (parsed.rows.length === 0) { setProblem('Nenhuma linha de produto encontrada no arquivo.'); return }
      setFileName(file.name); setRows(parsed.rows); setTruncated(parsed.truncated); setStep('preview')
    } catch {
      setProblem('Não foi possível ler o arquivo. Salve como CSV (UTF-8) e tente de novo.')
    }
  }

  async function handleImport() {
    setImporting(true)
    try {
      let res: ImportResult
      if (IS_DEMO) {
        res = { created: 0, updated: 0, skipped: 0, failed: [] }
        for (const r of rows.filter(r => r.errors.length === 0)) {
          if (r.exists) { res.skipped++; continue }
          await onDemoCreate({ ...r.data, category_id: r.data.category_id ?? undefined, supplier_id: r.data.supplier_id ?? undefined })
          res.created++
        }
      } else {
        res = await importProducts(rows, mode, {
          companyId: user?.company_id ?? '00000000-0000-0000-0000-000000000001',
          userId: user?.id ?? '',
        })
        void useAlertsStore.getState().load()
      }
      setResult(res)
      setStep('done')
      onDone()
    } catch (e: any) {
      setProblem(e?.message ?? 'Erro ao importar. Tente novamente.')
    } finally {
      setImporting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={importing ? undefined : onClose} />
      <div className="relative w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold">Importar produtos (CSV)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === 'upload' && 'Envie uma planilha salva como CSV'}
              {step === 'preview' && `${fileName} — confira antes de importar`}
              {step === 'done' && 'Importação concluída'}
            </p>
          </div>
          <button onClick={onClose} disabled={importing}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="p-5 space-y-4">
              <button onClick={() => fileRef.current?.click()} disabled={!lookups}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-60">
                {lookups ? <Upload className="h-6 w-6" /> : <Loader2 className="h-6 w-6 animate-spin" />}
                <span className="text-sm font-medium">{lookups ? 'Escolher arquivo CSV' : 'Carregando...'}</span>
                <span className="text-xs">Até {formatNumber(MAX_ROWS)} produtos · máximo 2 MB</span>
              </button>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
                onChange={e => { void handleFile(e.target.files?.[0]); e.target.value = '' }} />

              {problem && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{problem}</p>}

              <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground space-y-1.5">
                <p><span className="font-semibold text-foreground">Obrigatórias:</span> nome, sku.</p>
                <p><span className="font-semibold text-foreground">Opcionais:</span> categoria, fornecedor, unidade, custo, venda, estoque, minimo, maximo, codigo_barras, marca, localizacao, descricao, status.</p>
                <p>Aceita separador <code>;</code> ou <code>,</code> e decimais como <code>12,50</code>. Categoria e fornecedor precisam já estar cadastrados (senão o produto entra sem eles).</p>
                <p>O <span className="font-semibold text-foreground">estoque</span> informado entra como uma movimentação de entrada "Importação CSV", então aparece no histórico.</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={downloadModel}>
                <Download className="h-3.5 w-3.5" /> Baixar modelo CSV
              </Button>
            </div>
          )}

          {step === 'preview' && (
            <div className="p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-secondary px-2 py-1 font-semibold">{rows.length} linhas</span>
                <span className="rounded-md bg-green-500/15 px-2 py-1 font-semibold text-green-400">{counts.fresh} novos</span>
                {counts.existing > 0 && <span className="rounded-md bg-amber-500/15 px-2 py-1 font-semibold text-amber-400">{counts.existing} já existem</span>}
                {counts.errors > 0 && <span className="rounded-md bg-red-500/15 px-2 py-1 font-semibold text-red-400">{counts.errors} com erro (não serão importadas)</span>}
              </div>
              {truncated && <p className="text-xs text-amber-400">O arquivo tem mais de {MAX_ROWS} linhas: só as primeiras {MAX_ROWS} foram lidas.</p>}
              {problem && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{problem}</p>}

              {counts.existing > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
                  <span className="text-xs text-muted-foreground">SKU que já existe:</span>
                  <select value={mode} onChange={e => setMode(e.target.value as ImportMode)} disabled={IS_DEMO}
                    className="h-7 rounded-md border border-border bg-secondary px-2 text-xs text-foreground outline-none">
                    <option value="skip">Ignorar</option>
                    <option value="update">Atualizar dados (sem mexer no estoque)</option>
                  </select>
                </div>
              )}

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      {['Linha', 'Produto', 'SKU', 'Estoque', 'Custo', 'Venda', 'Situação'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, PREVIEW_LIMIT).map(r => {
                      const hasError = r.errors.length > 0
                      return (
                        <tr key={r.line} className={cn('border-b border-border/30 align-top', hasError && 'bg-red-500/5')}>
                          <td className="px-3 py-2 text-[10px] text-muted-foreground">{r.line}</td>
                          <td className="px-3 py-2 text-xs font-medium max-w-[180px] truncate">{r.data.name || '—'}</td>
                          <td className="px-3 py-2"><span className="font-mono text-[10px] text-muted-foreground">{r.data.sku || '—'}</span></td>
                          <td className="px-3 py-2 text-xs">{formatNumber(r.data.current_stock)}</td>
                          <td className="px-3 py-2 text-xs">{formatCurrency(r.data.cost_price)}</td>
                          <td className="px-3 py-2 text-xs">{formatCurrency(r.data.sale_price)}</td>
                          <td className="px-3 py-2 text-[11px]">
                            {hasError ? (
                              <span className="text-red-400">{r.errors.join(' · ')}</span>
                            ) : r.exists ? (
                              <span className="text-amber-400">{mode === 'update' ? 'Atualizar' : 'Já existe — ignorar'}</span>
                            ) : (
                              <span className="text-green-400">Novo</span>
                            )}
                            {!hasError && r.warnings.length > 0 && <div className="text-amber-400/80">{r.warnings.join(' · ')}</div>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length > PREVIEW_LIMIT && (
                <p className="text-[11px] text-muted-foreground">Mostrando as primeiras {PREVIEW_LIMIT} linhas; todas as válidas serão importadas.</p>
              )}
            </div>
          )}

          {step === 'done' && result && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-semibold">Importação concluída</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'Criados', value: result.created, color: 'text-green-400' },
                  { label: 'Atualizados', value: result.updated, color: 'text-blue-400' },
                  { label: 'Ignorados', value: result.skipped, color: 'text-amber-400' },
                  { label: 'Falharam', value: result.failed.length, color: 'text-red-400' },
                ].map(c => (
                  <div key={c.label} className="rounded-lg border border-border bg-secondary/40 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
                    <p className={cn('mt-1 text-xl font-bold', c.color)}>{c.value}</p>
                  </div>
                ))}
              </div>
              {result.failed.length > 0 && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-400"><FileText className="h-3.5 w-3.5" /> O que falhou</p>
                  <ul className="space-y-1 text-xs text-muted-foreground max-h-40 overflow-y-auto">
                    {result.failed.map((f, i) => <li key={i}>Linha {f.line} ({f.sku}): {f.message}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3 flex-shrink-0">
          {step === 'preview' ? (
            <>
              <Button variant="outline" size="sm" className="text-xs" disabled={importing} onClick={() => { setStep('upload'); setRows([]); setProblem(null) }}>
                Trocar arquivo
              </Button>
              <Button size="sm" className="text-xs" disabled={importing || counts.importable === 0} onClick={handleImport}>
                {importing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Importando...</> : `Importar ${counts.importable} produto(s)`}
              </Button>
            </>
          ) : (
            <>
              <span />
              <Button size="sm" className="text-xs" variant={step === 'done' ? 'default' : 'outline'} onClick={onClose}>
                {step === 'done' ? 'Fechar' : 'Cancelar'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
