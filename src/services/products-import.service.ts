import { supabase } from '@/lib/supabase'
import type { ImportRow } from '@/lib/csv-import'

export type ImportMode = 'skip' | 'update'

export interface ImportResult {
  created: number
  updated: number
  skipped: number
  failed: { line: number; sku: string; message: string }[]
}

const CHUNK = 200

const friendly = (e: any): string => {
  if (e?.code === '23505') return 'SKU já cadastrado'
  if (e?.code === '42501') return 'Sem permissão'
  return e?.message ?? 'Erro desconhecido'
}

/**
 * Importa produtos. O estoque inicial NÃO é gravado direto: o produto nasce com 0 e o
 * saldo entra por uma movimentação de entrada ("Importação CSV"), mantendo o histórico
 * consistente (o trigger do banco atualiza o saldo e os alertas).
 */
export async function importProducts(
  rows: ImportRow[],
  mode: ImportMode,
  ctx: { companyId: string; userId: string },
): Promise<ImportResult> {
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, failed: [] }
  const valid = rows.filter(r => r.errors.length === 0)

  const toCreate = valid.filter(r => !r.exists)
  const toUpdate = valid.filter(r => r.exists && mode === 'update')
  result.skipped = valid.filter(r => r.exists && mode === 'skip').length

  // ── criar ──
  const createdBySku = new Map<string, { id: string; row: ImportRow }>()
  for (let i = 0; i < toCreate.length; i += CHUNK) {
    const chunk = toCreate.slice(i, i + CHUNK)
    const payloads = chunk.map(r => {
      const { current_stock: _stock, ...rest } = r.data
      return { ...rest, company_id: ctx.companyId }
    })
    const { data, error } = await supabase.from('products').insert(payloads).select('id, sku')
    if (!error && data) {
      for (const p of data) {
        const row = chunk.find(r => r.data.sku === p.sku)
        if (row) createdBySku.set(p.sku, { id: p.id, row })
      }
      continue
    }
    // lote falhou (ex.: um SKU duplicado): isola linha a linha
    for (let j = 0; j < chunk.length; j++) {
      const one = await supabase.from('products').insert(payloads[j]).select('id, sku').single()
      if (one.error) result.failed.push({ line: chunk[j].line, sku: chunk[j].data.sku, message: friendly(one.error) })
      else createdBySku.set(one.data.sku, { id: one.data.id, row: chunk[j] })
    }
  }
  result.created = createdBySku.size

  // ── estoque inicial como movimentação de entrada ──
  const withStock = [...createdBySku.values()].filter(c => c.row.data.current_stock > 0)
  for (let i = 0; i < withStock.length; i += CHUNK) {
    const chunk = withStock.slice(i, i + CHUNK)
    const payloads = chunk.map(({ id, row }) => ({
      product_id: id,
      type: 'entrada',
      quantity: row.data.current_stock,
      unit_cost: row.data.cost_price || null,
      total_cost: row.data.cost_price ? Number((row.data.cost_price * row.data.current_stock).toFixed(2)) : null,
      reference: 'Importação CSV',
      user_id: ctx.userId,
      company_id: ctx.companyId,
    }))
    const { error } = await supabase.from('stock_movements').insert(payloads)
    if (!error) continue
    for (let j = 0; j < chunk.length; j++) {
      const one = await supabase.from('stock_movements').insert(payloads[j])
      if (one.error) {
        result.failed.push({
          line: chunk[j].row.line, sku: chunk[j].row.data.sku,
          message: `Produto criado, mas o estoque inicial não foi lançado: ${friendly(one.error)}`,
        })
      }
    }
  }

  // ── atualizar existentes (só campos preenchidos; nunca mexe no estoque nem no SKU) ──
  for (const r of toUpdate) {
    const fields: Record<string, unknown> = {}
    for (const f of r.provided) fields[f] = r.data[f]
    if (Object.keys(fields).length === 0) { result.skipped++; continue }
    const { data, error } = await supabase
      .from('products').update(fields).eq('sku', r.data.sku).select('id')
    if (error) result.failed.push({ line: r.line, sku: r.data.sku, message: friendly(error) })
    else if (!data?.length) result.failed.push({ line: r.line, sku: r.data.sku, message: 'Produto não encontrado' })
    else result.updated++
  }

  return result
}
