import type { Product, StockMovement, Supplier, Customer } from '@/types'
import { formatCurrency, formatDateTime, getStockStatus } from './utils'

// ─── EXCEL ────────────────────────────────────────────────────────────────────
export async function exportToExcel(data: Record<string, unknown>[], filename: string) {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dados')

  // Auto column width
  const cols = Object.keys(data[0] ?? {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] ?? '').length)) + 2
  }))
  ws['!cols'] = cols

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// ─── PDF ──────────────────────────────────────────────────────────────────────
export async function exportToPDF(
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][],
  filename: string
) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape' })

  // Header
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, 297, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('StockOS', 14, 13)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 60, 13)

  // Subtitle
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.text(`${subtitle} • Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 28)

  // Table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 32,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    margin: { left: 14, right: 14 },
  })

  doc.save(`${filename}.pdf`)
}

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────
export async function exportProducts(products: Product[], format: 'excel' | 'pdf') {
  if (format === 'excel') {
    const data = products.map(p => ({
      'Nome': p.name,
      'SKU': p.sku,
      'Código de barras': p.barcode ?? '',
      'Categoria': p.category?.name ?? '',
      'Marca': p.brand ?? '',
      'Fornecedor': p.supplier?.company_name ?? '',
      'Unidade': p.unit,
      'Custo (R$)': p.cost_price,
      'Venda (R$)': p.sale_price,
      'Estoque atual': p.current_stock,
      'Estoque mínimo': p.min_stock,
      'Localização': p.location ?? '',
      'Status': p.status,
    }))
    await exportToExcel(data, `produtos_${new Date().toISOString().split('T')[0]}`)
  } else {
    const headers = ['Nome', 'SKU', 'Categoria', 'Estoque', 'Mín.', 'Custo', 'Venda', 'Status']
    const rows = products.map(p => [
      p.name,
      p.sku,
      p.category?.name ?? '—',
      String(p.current_stock),
      String(p.min_stock),
      formatCurrency(p.cost_price),
      formatCurrency(p.sale_price),
      p.status,
    ])
    await exportToPDF('Relatório de Produtos', `${products.length} produtos`, headers, rows, `produtos_${new Date().toISOString().split('T')[0]}`)
  }
}

// ─── CSV (mesmo formato da importação de produtos) ────────────────────────────
const CSV_HEADER = ['nome', 'sku', 'categoria', 'fornecedor', 'unidade', 'custo', 'venda', 'estoque', 'minimo', 'maximo', 'codigo_barras', 'marca', 'localizacao', 'descricao', 'status']

// Texto que começa com = + - @ vira fórmula ao abrir no Excel; o apóstrofo neutraliza.
const safeText = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v)
const csvCell = (v: string) => (/[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const csvNum = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n).replace('.', ','))

export function productsToCsv(products: Product[]): string {
  const lines = [CSV_HEADER.join(';')]
  for (const p of products) {
    lines.push([
      safeText(p.name), safeText(p.sku), safeText(p.category?.name ?? ''), safeText(p.supplier?.company_name ?? ''),
      p.unit, csvNum(p.cost_price), csvNum(p.sale_price), csvNum(p.current_stock), csvNum(p.min_stock), csvNum(p.max_stock),
      safeText(p.barcode ?? ''), safeText(p.brand ?? ''), safeText(p.location ?? ''), safeText(p.description ?? ''), p.status,
    ].map(c => csvCell(String(c))).join(';'))
  }
  return lines.join('\r\n') + '\r\n'
}

export function exportProductsCsv(products: Product[]) {
  const blob = new Blob(['\uFEFF' + productsToCsv(products)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `produtos_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── MOVIMENTAÇÕES ────────────────────────────────────────────────────────────
export async function exportMovements(movements: StockMovement[], format: 'excel' | 'pdf') {
  const typeLabels: Record<string, string> = {
    entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste',
    transferencia: 'Transferência', perda: 'Perda', inventario: 'Inventário'
  }

  if (format === 'excel') {
    const data = movements.map(m => ({
      'Produto': m.product?.name ?? '—',
      'SKU': m.product?.sku ?? '—',
      'Tipo': typeLabels[m.type] ?? m.type,
      'Quantidade': m.type === 'entrada' ? `+${m.quantity}` : m.type === 'saida' ? `-${m.quantity}` : `±${m.quantity}`,
      'Saldo após': m.balance_after,
      'Custo unit.': m.unit_cost ?? '',
      'Total': m.total_cost ?? '',
      'Referência': m.reference ?? '',
      'Observações': m.notes ?? '',
      'Data/Hora': formatDateTime(m.created_at),
    }))
    await exportToExcel(data, `movimentacoes_${new Date().toISOString().split('T')[0]}`)
  } else {
    const headers = ['Produto', 'Tipo', 'Qtd', 'Saldo', 'Referência', 'Data']
    const rows = movements.map(m => [
      m.product?.name ?? '—',
      typeLabels[m.type] ?? m.type,
      m.type === 'entrada' ? `+${m.quantity}` : m.type === 'saida' ? `-${m.quantity}` : `±${m.quantity}`,
      String(m.balance_after),
      m.reference ?? '—',
      formatDateTime(m.created_at),
    ])
    await exportToPDF('Relatório de Movimentações', `${movements.length} registros`, headers, rows, `movimentacoes_${new Date().toISOString().split('T')[0]}`)
  }
}

// ─── FORNECEDORES ─────────────────────────────────────────────────────────────
export async function exportSuppliers(suppliers: Supplier[], format: 'excel' | 'pdf') {
  if (format === 'excel') {
    const data = suppliers.map(s => ({
      'Empresa': s.company_name,
      'CNPJ': s.cnpj ?? '',
      'Responsável': s.contact_name ?? '',
      'Email': s.email ?? '',
      'Telefone': s.phone ?? '',
      'Cidade': s.city ?? '',
      'UF': s.state ?? '',
      'Status': s.is_active ? 'Ativo' : 'Inativo',
    }))
    await exportToExcel(data, `fornecedores_${new Date().toISOString().split('T')[0]}`)
  } else {
    const headers = ['Empresa', 'CNPJ', 'Responsável', 'Email', 'Cidade/UF', 'Status']
    const rows = suppliers.map(s => [
      s.company_name, s.cnpj ?? '—', s.contact_name ?? '—',
      s.email ?? '—', s.city && s.state ? `${s.city}/${s.state}` : '—',
      s.is_active ? 'Ativo' : 'Inativo',
    ])
    await exportToPDF('Relatório de Fornecedores', `${suppliers.length} fornecedores`, headers, rows, `fornecedores_${new Date().toISOString().split('T')[0]}`)
  }
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
export async function exportCustomers(customers: Customer[], format: 'excel' | 'pdf') {
  if (format === 'excel') {
    const data = customers.map(c => ({
      'Nome': c.name,
      'Tipo': c.type.toUpperCase(),
      'Documento': c.document ?? '',
      'Email': c.email ?? '',
      'Telefone': c.phone ?? '',
      'Cidade': c.city ?? '',
      'UF': c.state ?? '',
      'Status': c.is_active ? 'Ativo' : 'Inativo',
    }))
    await exportToExcel(data, `clientes_${new Date().toISOString().split('T')[0]}`)
  } else {
    const headers = ['Nome', 'Tipo', 'Documento', 'Email', 'Cidade/UF', 'Status']
    const rows = customers.map(c => [
      c.name, c.type.toUpperCase(), c.document ?? '—',
      c.email ?? '—', c.city && c.state ? `${c.city}/${c.state}` : '—',
      c.is_active ? 'Ativo' : 'Inativo',
    ])
    await exportToPDF('Relatório de Clientes', `${customers.length} clientes`, headers, rows, `clientes_${new Date().toISOString().split('T')[0]}`)
  }
}

// ─── PRODUTOS CRÍTICOS ────────────────────────────────────────────────────────
export async function exportCriticalProducts(products: Product[], format: 'excel' | 'pdf') {
  const critical = products.filter(p => {
    const ss = getStockStatus(p.current_stock, p.min_stock)
    return ss === 'low' || ss === 'out'
  })

  if (format === 'excel') {
    const data = critical.map(p => ({
      'Nome': p.name,
      'SKU': p.sku,
      'Estoque atual': p.current_stock,
      'Estoque mínimo': p.min_stock,
      'Situação': p.current_stock === 0 ? 'ZERADO' : 'ABAIXO DO MÍNIMO',
      'Fornecedor': p.supplier?.company_name ?? '—',
    }))
    await exportToExcel(data, `produtos_criticos_${new Date().toISOString().split('T')[0]}`)
  } else {
    const headers = ['Nome', 'SKU', 'Estoque', 'Mínimo', 'Situação', 'Fornecedor']
    const rows = critical.map(p => [
      p.name, p.sku, String(p.current_stock), String(p.min_stock),
      p.current_stock === 0 ? 'ZERADO' : 'ABAIXO DO MÍNIMO',
      p.supplier?.company_name ?? '—',
    ])
    await exportToPDF('Produtos Críticos', `${critical.length} produtos críticos`, headers, rows, `criticos_${new Date().toISOString().split('T')[0]}`)
  }
}
