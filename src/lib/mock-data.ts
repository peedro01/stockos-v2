import type {
  Product, Supplier, Customer, StockMovement, StockAlert,
  DashboardStats, ChartDataPoint, CategoryDistribution, Category, UserProfile
} from '../types'

export const mockCategories: Category[] = [
  { id: '1', name: 'Eletrônicos', color: '#6366f1', company_id: '1', created_at: '2025-01-01' },
  { id: '2', name: 'Periféricos', color: '#3b82f6', company_id: '1', created_at: '2025-01-01' },
  { id: '3', name: 'Acessórios', color: '#22c55e', company_id: '1', created_at: '2025-01-01' },
  { id: '4', name: 'Ferramentas', color: '#f59e0b', company_id: '1', created_at: '2025-01-01' },
  { id: '5', name: 'Consumíveis', color: '#ef4444', company_id: '1', created_at: '2025-01-01' },
]

export const mockSuppliers: Supplier[] = [
  { id: '1', company_name: 'TechCabo Inc.', cnpj: '12.345.678/0001-90', contact_name: 'Roberto Alves', email: 'contato@techcabo.com', phone: '(11) 99812-3456', city: 'São Paulo', state: 'SP', is_active: true, company_id: '1', created_at: '2025-01-15', updated_at: '2025-05-01' },
  { id: '2', company_name: 'MechKeys BR', cnpj: '98.765.432/0001-11', contact_name: 'Camila Souza', email: 'vendas@mechkeys.com.br', phone: '(21) 98741-2233', city: 'Rio de Janeiro', state: 'RJ', is_active: true, company_id: '1', created_at: '2025-01-20', updated_at: '2025-04-15' },
  { id: '3', company_name: 'ErgoPro Ltda.', cnpj: '55.443.221/0001-33', contact_name: 'Fernando Dias', email: 'f.dias@ergopro.com', phone: '(31) 97632-8811', city: 'Belo Horizonte', state: 'MG', is_active: false, company_id: '1', created_at: '2025-02-10', updated_at: '2025-03-01' },
  { id: '4', company_name: 'VisionTech Distribuidora', cnpj: '33.221.990/0001-22', contact_name: 'Lucia Martins', email: 'lucia@visiontech.com.br', phone: '(41) 96543-1100', city: 'Curitiba', state: 'PR', is_active: true, company_id: '1', created_at: '2025-02-28', updated_at: '2025-05-10' },
]

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Empresa Alpha SA', type: 'pj', document: '11.222.333/0001-44', email: 'compras@alpha.com.br', phone: '(11) 3321-8800', city: 'São Paulo', state: 'SP', is_active: true, company_id: '1', created_at: '2025-01-10', updated_at: '2025-05-18' },
  { id: '2', name: 'João Fonseca', type: 'pf', document: '321.654.987-00', email: 'j.fonseca@gmail.com', phone: '(11) 98877-1234', city: 'Guarulhos', state: 'SP', is_active: true, company_id: '1', created_at: '2025-02-05', updated_at: '2025-05-21' },
  { id: '3', name: 'Beta Distribuidora', type: 'pj', document: '22.333.444/0001-55', email: 'beta@betadist.com', phone: '(21) 3344-9900', city: 'Niterói', state: 'RJ', is_active: false, company_id: '1', created_at: '2025-03-01', updated_at: '2025-04-02' },
  { id: '4', name: 'Maria Clara Oliveira', type: 'pf', document: '123.456.789-01', email: 'mcl.oliveira@hotmail.com', phone: '(31) 99900-1122', city: 'Contagem', state: 'MG', is_active: true, company_id: '1', created_at: '2025-03-15', updated_at: '2025-05-15' },
]

export const mockProducts: Product[] = [
  { id: '1', name: 'Cabo HDMI 2.0 3m', sku: 'CAB-00412', barcode: '7891234560412', category_id: '1', category: mockCategories[0], brand: 'TechCabo', supplier_id: '1', supplier: mockSuppliers[0], unit: 'un', cost_price: 18.90, sale_price: 34.90, current_stock: 320, min_stock: 50, max_stock: 500, location: 'A-02-03', status: 'ativo', company_id: '1', created_at: '2025-01-20', updated_at: '2025-05-23' },
  { id: '2', name: 'Teclado Mecânico RGB', sku: 'TEC-00198', barcode: '7891234560198', category_id: '2', category: mockCategories[1], brand: 'MechKeys', supplier_id: '2', supplier: mockSuppliers[1], unit: 'un', cost_price: 189.00, sale_price: 349.00, current_stock: 18, min_stock: 20, max_stock: 100, location: 'B-01-05', status: 'ativo', company_id: '1', created_at: '2025-01-22', updated_at: '2025-05-23' },
  { id: '3', name: 'Webcam HD 1080p', sku: 'WEB-00334', barcode: '7891234560334', category_id: '1', category: mockCategories[0], brand: 'VisionTech', supplier_id: '4', supplier: mockSuppliers[3], unit: 'un', cost_price: 129.00, sale_price: 249.00, current_stock: 0, min_stock: 10, max_stock: 80, location: 'A-03-01', status: 'ativo', company_id: '1', created_at: '2025-02-01', updated_at: '2025-05-23' },
  { id: '4', name: 'Mouse Ergonômico Sem Fio', sku: 'MOU-00082', barcode: '7891234560082', category_id: '2', category: mockCategories[1], brand: 'ErgoPro', supplier_id: '3', supplier: mockSuppliers[2], unit: 'un', cost_price: 67.00, sale_price: 129.90, current_stock: 245, min_stock: 30, max_stock: 400, location: 'B-02-04', status: 'ativo', company_id: '1', created_at: '2025-02-05', updated_at: '2025-05-22' },
  { id: '5', name: 'Suporte Notebook Ajustável', sku: 'SUP-00571', barcode: '7891234560571', category_id: '3', category: mockCategories[2], brand: 'StandMaster', supplier_id: '1', supplier: mockSuppliers[0], unit: 'un', cost_price: 45.00, sale_price: 89.90, current_stock: 7, min_stock: 15, max_stock: 200, location: 'C-01-02', status: 'ativo', company_id: '1', created_at: '2025-02-10', updated_at: '2025-05-23' },
  { id: '6', name: 'Hub USB-C 7 Portas', sku: 'HUB-00089', barcode: '7891234560089', category_id: '1', category: mockCategories[0], brand: 'TechCabo', supplier_id: '1', supplier: mockSuppliers[0], unit: 'un', cost_price: 89.00, sale_price: 169.90, current_stock: 0, min_stock: 15, max_stock: 120, location: 'A-02-07', status: 'ativo', company_id: '1', created_at: '2025-02-15', updated_at: '2025-05-20' },
  { id: '7', name: 'Headset Gamer 7.1', sku: 'HEA-00621', barcode: '7891234560621', category_id: '2', category: mockCategories[1], brand: 'SoundWave', supplier_id: '2', supplier: mockSuppliers[1], unit: 'un', cost_price: 210.00, sale_price: 399.90, current_stock: 42, min_stock: 10, max_stock: 150, location: 'B-03-01', status: 'ativo', company_id: '1', created_at: '2025-03-01', updated_at: '2025-05-19' },
  { id: '8', name: 'Cabo USB-C para USB-C 1m', sku: 'CAB-00503', barcode: '7891234560503', category_id: '1', category: mockCategories[0], brand: 'TechCabo', supplier_id: '1', supplier: mockSuppliers[0], unit: 'un', cost_price: 12.50, sale_price: 24.90, current_stock: 580, min_stock: 100, max_stock: 1000, location: 'A-01-01', status: 'ativo', company_id: '1', created_at: '2025-03-10', updated_at: '2025-05-22' },
  { id: '9', name: 'Monitor 24" Full HD IPS', sku: 'MON-00055', barcode: '7891234560055', category_id: '1', category: mockCategories[0], brand: 'ViewMax', supplier_id: '4', supplier: mockSuppliers[3], unit: 'un', cost_price: 780.00, sale_price: 1299.90, current_stock: 14, min_stock: 5, max_stock: 50, location: 'D-01-01', status: 'ativo', company_id: '1', created_at: '2025-03-20', updated_at: '2025-05-21' },
  { id: '10', name: 'Mousepad XXL Gaming', sku: 'PAD-00177', barcode: '7891234560177', category_id: '3', category: mockCategories[2], brand: 'SurfPro', supplier_id: '2', supplier: mockSuppliers[1], unit: 'un', cost_price: 35.00, sale_price: 69.90, current_stock: 3, min_stock: 20, max_stock: 200, location: 'C-02-05', status: 'ativo', company_id: '1', created_at: '2025-04-01', updated_at: '2025-05-23' },
]

export const mockMovements: StockMovement[] = [
  { id: '1', product_id: '1', product: mockProducts[0], type: 'entrada', quantity: 200, balance_after: 320, unit_cost: 18.90, total_cost: 3780, reference: 'NF 44821', notes: 'Recebimento fornecedor', user_id: 'u1', company_id: '1', created_at: '2025-05-23T14:32:18' },
  { id: '2', product_id: '2', product: mockProducts[1], type: 'saida', quantity: 15, balance_after: 18, unit_cost: 349.00, total_cost: 5235, reference: 'Pedido #3821', notes: 'Venda cliente Alpha', user_id: 'u2', company_id: '1', created_at: '2025-05-23T13:10:05' },
  { id: '3', product_id: '5', product: mockProducts[4], type: 'ajuste', quantity: 5, balance_after: 7, notes: 'Correção de inventário', user_id: 'u3', company_id: '1', created_at: '2025-05-23T11:45:33' },
  { id: '4', product_id: '4', product: mockProducts[3], type: 'transferencia', quantity: 30, balance_after: 245, notes: 'Transferência Depósito B → A', user_id: 'u4', company_id: '1', created_at: '2025-05-23T10:20:11' },
  { id: '5', product_id: '8', product: mockProducts[7], type: 'entrada', quantity: 300, balance_after: 580, unit_cost: 12.50, total_cost: 3750, reference: 'NF 44800', user_id: 'u1', company_id: '1', created_at: '2025-05-22T16:00:00' },
  { id: '6', product_id: '7', product: mockProducts[6], type: 'saida', quantity: 8, balance_after: 42, reference: 'Pedido #3819', user_id: 'u2', company_id: '1', created_at: '2025-05-22T14:30:00' },
  { id: '7', product_id: '3', product: mockProducts[2], type: 'saida', quantity: 8, balance_after: 0, reference: 'Pedido #3817', notes: 'Último item', user_id: 'u2', company_id: '1', created_at: '2025-05-22T11:00:00' },
  { id: '8', product_id: '9', product: mockProducts[8], type: 'entrada', quantity: 10, balance_after: 14, unit_cost: 780.00, total_cost: 7800, reference: 'NF 44755', user_id: 'u1', company_id: '1', created_at: '2025-05-21T09:00:00' },
]

export const mockAlerts: StockAlert[] = [
  { id: '1', type: 'out_of_stock', title: '12 produtos com estoque zerado', message: 'Webcam HD 1080p, Hub USB-C 7 Portas e mais 10 produtos precisam de reposição urgente.', severity: 'danger', is_read: false, company_id: '1', created_at: '2025-05-23T08:00:00' },
  { id: '2', type: 'low_stock', title: '37 produtos abaixo do estoque mínimo', message: 'Teclado Mecânico RGB, Suporte Notebook e mais 35 produtos estão abaixo do mínimo.', severity: 'warning', is_read: false, company_id: '1', created_at: '2025-05-23T08:00:00' },
  { id: '3', type: 'inventory_overdue', title: 'Inventário pendente há 32 dias', message: 'O último inventário completo foi realizado em 22/04/2025. Recomendamos realizar um novo inventário.', severity: 'info', is_read: false, company_id: '1', created_at: '2025-05-23T08:00:00' },
  { id: '4', type: 'expiry_warning', title: '5 produtos próximos ao vencimento', message: 'Produtos com validade nos próximos 30 dias identificados no lote L-2025-441.', severity: 'warning', is_read: false, company_id: '1', created_at: '2025-05-22T08:00:00' },
  { id: '5', type: 'suspicious_movement', title: 'Movimentação suspeita detectada', message: 'Saída atípica de 150 unidades do SKU-00198 pelo usuário operador3 às 02:41.', severity: 'info', is_read: true, company_id: '1', created_at: '2025-05-22T08:00:00' },
]

export const mockDashboardStats: DashboardStats = {
  totalProducts: 1284,
  totalStock: 48630,
  lowStockCount: 37,
  outOfStockCount: 12,
  monthlyInbound: 4821,
  monthlyOutbound: 3290,
  totalStockValue: 842000,
  monthlyInboundChange: 18,
  monthlyOutboundChange: -5,
}

export const mockChartData: ChartDataPoint[] = [
  { month: 'Jan', entradas: 3200, saidas: 2800 },
  { month: 'Fev', entradas: 4100, saidas: 3300 },
  { month: 'Mar', entradas: 3800, saidas: 3100 },
  { month: 'Abr', entradas: 4300, saidas: 3500 },
  { month: 'Mai', entradas: 4821, saidas: 3290 },
]

export const mockCategoryDistribution: CategoryDistribution[] = [
  { name: 'Eletrônicos', value: 32, color: '#6366f1' },
  { name: 'Ferramentas', value: 21, color: '#3b82f6' },
  { name: 'Químicos', value: 18, color: '#22c55e' },
  { name: 'Alimentos', value: 15, color: '#f59e0b' },
  { name: 'Outros', value: 14, color: '#5a5a72' },
]

export const mockStockEvolution = [
  { month: 'Jan', value: 720 },
  { month: 'Fev', value: 755 },
  { month: 'Mar', value: 790 },
  { month: 'Abr', value: 820 },
  { month: 'Mai', value: 842 },
]

export const mockUsers: UserProfile[] = [
  { id: 'u1', email: 'admin@empresa.com', full_name: 'Admin Root', role: 'admin', company_id: '1', created_at: '2025-01-01', last_sign_in: '2025-05-23T15:00:00', is_active: true },
  { id: 'u2', email: 'joao@empresa.com', full_name: 'João Silva', role: 'gerente', company_id: '1', created_at: '2025-01-15', last_sign_in: '2025-05-23T14:32:00', is_active: true },
  { id: 'u3', email: 'maria@empresa.com', full_name: 'Maria Lima', role: 'operador', company_id: '1', created_at: '2025-02-01', last_sign_in: '2025-05-23T13:10:00', is_active: true },
  { id: 'u4', email: 'pedro@empresa.com', full_name: 'Pedro Melo', role: 'operador', company_id: '1', created_at: '2025-02-10', last_sign_in: '2025-05-22T17:00:00', is_active: true },
]
