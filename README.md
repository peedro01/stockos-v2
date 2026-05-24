# StockOS — Plataforma de Gestão de Estoque Empresarial

Sistema ERP moderno para controle completo de estoque, produtos, movimentações, fornecedores e clientes.

## 🚀 Início rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Iniciar em desenvolvimento
npm run dev
```

### Modo Demo (sem Supabase)
Se não configurar o Supabase, o sistema roda com dados mockados.
- **Email:** admin@stockos.demo
- **Senha:** demo123

## 🗄️ Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor**
3. Execute o arquivo `database/schema.sql`
4. Copie a `URL` e `anon key` do seu projeto para `.env.local`

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── layout/     # Sidebar, Header
│   ├── ui/         # Button, Input, Card, Badge, Toast...
│   └── shared/     # StockBadge, StockBar, MovementBadge
├── contexts/       # AuthContext (Supabase + demo mode)
├── hooks/          # useToast
├── layouts/        # AppLayout (sidebar + header + outlet)
├── lib/            # supabase.ts, utils.ts, mock-data.ts
├── pages/          # Dashboard, Products, Movements...
├── store/          # Zustand: auth, ui, products
└── types/          # TypeScript types completos
database/
└── schema.sql      # Todas as tabelas, triggers, RLS, seed
```

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | Framework principal |
| Vite | Build tool |
| TailwindCSS | Estilização |
| Supabase | Auth + PostgreSQL + RLS |
| React Router DOM | Roteamento |
| React Hook Form + Zod | Formulários e validação |
| Zustand | Estado global |
| Recharts | Gráficos |
| Lucide React | Ícones |

## 🔐 Controle de acesso

| Role | Permissões |
|---|---|
| **Admin** | Acesso total: usuários, configurações, exclusão |
| **Gerente** | Produtos, movimentações, relatórios, fornecedores |
| **Operador** | Movimentações e consultas |

## 📋 Módulos

- **Dashboard** — KPIs, gráficos de entradas/saídas, distribuição, últimas movimentações
- **Produtos** — CRUD completo, filtros, SKU, código de barras, estoque mínimo
- **Movimentações** — Entrada, saída, ajuste, transferência com histórico completo
- **Fornecedores** — CRUD com CNPJ, contatos e histórico
- **Clientes** — Base PF/PJ com documentos e histórico
- **Relatórios** — Estoque atual, entradas/saídas, mais vendidos, exportação PDF/Excel
- **Alertas** — Estoque baixo/zerado, vencimento, movimentações suspeitas
- **Configurações** — Usuários, permissões, dados da empresa, notificações, auditoria
