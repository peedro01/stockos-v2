// Parser e validação do CSV de produtos (funções puras, sem dependências)

export const UNITS = ['un', 'kg', 'g', 'l', 'ml', 'cx', 'pc', 'par', 'rolo', 'm'] as const
export const STATUSES = ['ativo', 'inativo', 'descontinuado'] as const
export const MAX_ROWS = 1000

export interface ImportProduct {
  name: string
  sku: string
  category_id: string | null
  supplier_id: string | null
  unit: string
  cost_price: number
  sale_price: number
  current_stock: number
  min_stock: number
  max_stock: number | null
  barcode: string | null
  brand: string | null
  location: string | null
  description: string | null
  status: string
}

export interface ImportRow {
  line: number          // linha no arquivo (cabeçalho = 1)
  data: ImportProduct
  errors: string[]
  warnings: string[]
  exists: boolean       // SKU já cadastrado
  provided: (keyof ImportProduct)[]  // campos preenchidos no CSV (usado ao atualizar existentes)
}

export interface Lookups {
  categories: { id: string; name: string }[]
  suppliers: { id: string; name: string }[]
  existingSkus: Set<string>
  defaultUnit: string
}

export const MODEL_CSV =
  'nome;sku;categoria;fornecedor;unidade;custo;venda;estoque;minimo;maximo;codigo_barras;marca;localizacao;descricao;status\n' +
  'Cabo HDMI 2.0 3m;CAB-00412;Eletrônicos;TechCabo Inc.;un;18,90;34,90;320;50;500;7891234567890;TechCabo;Prateleira A1;Cabo HDMI 4K;ativo\n' +
  'Teclado Mecânico RGB;TEC-00198;Periféricos;;un;189,00;349,00;18;20;;;MechKeys;;;ativo\n'

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const key = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

const ALIASES: Record<string, string[]> = {
  name: ['nome', 'produto', 'name', 'nome_do_produto'],
  sku: ['sku', 'codigo', 'cod', 'codigo_sku'],
  category: ['categoria', 'category'],
  supplier: ['fornecedor', 'supplier'],
  unit: ['unidade', 'un', 'unit'],
  cost_price: ['custo', 'custo_r', 'preco_custo', 'preco_de_custo', 'cost_price', 'cost'],
  sale_price: ['venda', 'venda_r', 'preco_venda', 'preco_de_venda', 'preco', 'sale_price', 'price'],
  current_stock: ['estoque', 'estoque_atual', 'quantidade', 'saldo', 'current_stock', 'stock'],
  min_stock: ['minimo', 'estoque_minimo', 'estoque_min', 'min_stock'],
  max_stock: ['maximo', 'estoque_maximo', 'estoque_max', 'max_stock'],
  barcode: ['codigo_de_barras', 'codigo_barras', 'ean', 'barcode'],
  brand: ['marca', 'brand'],
  location: ['localizacao', 'local', 'location'],
  description: ['descricao', 'description'],
  status: ['status', 'situacao'],
}

/** Lê CSV (separador ; , ou tab; aspas; BOM; quebras de linha \r\n). */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, '')
  const firstLine = src.split(/\r?\n/, 1)[0] ?? ''
  const count = (c: string) => firstLine.split(c).length - 1
  const delimiter = count(';') >= count(',') && count(';') >= count('\t') ? ';' : count('\t') > count(',') ? '\t' : ','

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === delimiter) {
      row.push(field); field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field); field = ''
      rows.push(row); row = []
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }

  return rows.filter(r => r.some(cell => cell.trim() !== ''))
}

/** "1.234,56" | "12,5" | "12.5" | "R$ 10,00" → número (NaN se inválido) */
export function parseNumber(raw: string): number {
  let s = raw.replace(/R\$/gi, '').replace(/\s/g, '')
  if (s === '') return NaN
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if ((s.match(/\./g) ?? []).length > 1) s = s.replace(/\./g, '')
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN
}

export function buildRows(table: string[][], lookups: Lookups): { rows: ImportRow[]; missingColumns: string[]; truncated: boolean } {
  if (table.length === 0) return { rows: [], missingColumns: ['nome', 'sku'], truncated: false }

  const headers = table[0].map(key)
  const col: Record<string, number> = {}
  for (const [field, names] of Object.entries(ALIASES)) {
    const idx = headers.findIndex(h => names.includes(h))
    if (idx >= 0) col[field] = idx
  }
  const missingColumns = ['name', 'sku'].filter(f => col[f] === undefined).map(f => (f === 'name' ? 'nome' : 'sku'))
  if (missingColumns.length) return { rows: [], missingColumns, truncated: false }

  const get = (cells: string[], field: string) => (col[field] === undefined ? '' : (cells[col[field]] ?? '').trim())
  const catByName = new Map(lookups.categories.map(c => [norm(c.name), c.id]))
  const supByName = new Map(lookups.suppliers.map(s => [norm(s.name), s.id]))
  const existing = new Set([...lookups.existingSkus].map(norm))
  const seen = new Map<string, number>()

  const body = table.slice(1)
  const truncated = body.length > MAX_ROWS
  const rows: ImportRow[] = body.slice(0, MAX_ROWS).map((cells, i) => {
    const line = i + 2
    const errors: string[] = []
    const warnings: string[] = []

    const name = get(cells, 'name')
    const sku = get(cells, 'sku')
    if (!name) errors.push('Nome obrigatório')
    if (!sku) errors.push('SKU obrigatório')

    const skuKey = norm(sku)
    if (sku) {
      const first = seen.get(skuKey)
      if (first !== undefined) errors.push(`SKU repetido no arquivo (linha ${first})`)
      else seen.set(skuKey, line)
    }

    const num = (field: string, label: string, opts: { integer?: boolean; optional?: boolean } = {}): number | null => {
      const raw = get(cells, field)
      if (raw === '') return opts.optional ? null : 0
      const n = parseNumber(raw)
      if (Number.isNaN(n)) { errors.push(`${label} inválido ("${raw}")`); return null }
      if (n < 0) { errors.push(`${label} não pode ser negativo`); return null }
      if (opts.integer && !Number.isInteger(n)) { errors.push(`${label} deve ser inteiro`); return null }
      return n
    }

    const cost = num('cost_price', 'Custo')
    const sale = num('sale_price', 'Venda')
    const stock = num('current_stock', 'Estoque', { integer: true })
    const min = num('min_stock', 'Mínimo', { integer: true })
    const max = num('max_stock', 'Máximo', { integer: true, optional: true })

    const unitRaw = norm(get(cells, 'unit'))
    let unit = lookups.defaultUnit
    if (unitRaw) {
      if ((UNITS as readonly string[]).includes(unitRaw)) unit = unitRaw
      else errors.push(`Unidade inválida ("${get(cells, 'unit')}"). Use: ${UNITS.join(', ')}`)
    }

    const statusRaw = norm(get(cells, 'status'))
    let status = 'ativo'
    if (statusRaw) {
      if ((STATUSES as readonly string[]).includes(statusRaw)) status = statusRaw
      else errors.push(`Status inválido ("${get(cells, 'status')}")`)
    }

    let category_id: string | null = null
    const catRaw = get(cells, 'category')
    if (catRaw) {
      category_id = catByName.get(norm(catRaw)) ?? null
      if (!category_id) warnings.push(`Categoria "${catRaw}" não existe — ficará sem categoria`)
    }
    let supplier_id: string | null = null
    const supRaw = get(cells, 'supplier')
    if (supRaw) {
      supplier_id = supByName.get(norm(supRaw)) ?? null
      if (!supplier_id) warnings.push(`Fornecedor "${supRaw}" não existe — ficará sem fornecedor`)
    }

    const provided: (keyof ImportProduct)[] = []
    if (name) provided.push('name')
    if (category_id) provided.push('category_id')
    if (supplier_id) provided.push('supplier_id')
    if (unitRaw && (UNITS as readonly string[]).includes(unitRaw)) provided.push('unit')
    if (get(cells, 'cost_price') !== '' && cost !== null) provided.push('cost_price')
    if (get(cells, 'sale_price') !== '' && sale !== null) provided.push('sale_price')
    if (get(cells, 'min_stock') !== '' && min !== null) provided.push('min_stock')
    if (get(cells, 'max_stock') !== '' && max !== null) provided.push('max_stock')
    for (const f of ['barcode', 'brand', 'location', 'description'] as const) {
      if (get(cells, f) !== '') provided.push(f)
    }
    if (statusRaw && (STATUSES as readonly string[]).includes(statusRaw)) provided.push('status')

    return {
      line,
      errors,
      warnings,
      provided,
      exists: !!sku && existing.has(skuKey),
      data: {
        name, sku, category_id, supplier_id, unit,
        cost_price: cost ?? 0, sale_price: sale ?? 0,
        current_stock: stock ?? 0, min_stock: min ?? 0, max_stock: max,
        barcode: get(cells, 'barcode') || null,
        brand: get(cells, 'brand') || null,
        location: get(cells, 'location') || null,
        description: get(cells, 'description') || null,
        status,
      },
    }
  })

  return { rows, missingColumns: [], truncated }
}
