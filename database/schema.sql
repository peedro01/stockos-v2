-- ============================================================
-- StockOS — PostgreSQL Schema (Supabase)
-- Execute este script no SQL Editor do Supabase
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── COMPANIES ───────────────────────────────────────────────
create table public.companies (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  cnpj       text unique,
  email      text,
  phone      text,
  address    text,
  city       text,
  state      text,
  logo_url   text,
  created_at timestamptz not null default now()
);

-- ─── USER PROFILES ───────────────────────────────────────────
create type user_role as enum ('admin', 'gerente', 'operador');

create table public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text not null,
  role         user_role not null default 'operador',
  avatar_url   text,
  company_id   uuid not null references public.companies(id) on delete cascade,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  last_sign_in timestamptz
);

-- ─── CATEGORIES ──────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  color       text default '#6366f1',
  company_id  uuid not null references public.companies(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(name, company_id)
);

-- ─── SUPPLIERS ───────────────────────────────────────────────
create table public.suppliers (
  id           uuid primary key default uuid_generate_v4(),
  company_name text not null,
  cnpj         text,
  contact_name text,
  email        text,
  phone        text,
  address      text,
  city         text,
  state        text,
  notes        text,
  is_active    boolean not null default true,
  company_id   uuid not null references public.companies(id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── CUSTOMERS ───────────────────────────────────────────────
create type customer_type as enum ('pf', 'pj');

create table public.customers (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  type       customer_type not null default 'pj',
  document   text,
  email      text,
  phone      text,
  address    text,
  city       text,
  state      text,
  notes      text,
  is_active  boolean not null default true,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── PRODUCTS ────────────────────────────────────────────────
create type product_status as enum ('ativo', 'inativo', 'descontinuado');
create type product_unit   as enum ('un','kg','g','l','ml','cx','pc','par','rolo','m');

create table public.products (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  sku           text not null,
  barcode       text,
  description   text,
  category_id   uuid references public.categories(id) on delete set null,
  brand         text,
  supplier_id   uuid references public.suppliers(id) on delete set null,
  unit          product_unit not null default 'un',
  cost_price    numeric(12,2) not null default 0,
  sale_price    numeric(12,2) not null default 0,
  current_stock integer not null default 0,
  min_stock     integer not null default 0,
  max_stock     integer,
  location      text,
  image_url     text,
  status        product_status not null default 'ativo',
  company_id    uuid not null references public.companies(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(sku, company_id)
);

create index idx_products_company  on public.products(company_id);
create index idx_products_sku      on public.products(sku);
create index idx_products_status   on public.products(status);
create index idx_products_stock    on public.products(current_stock, min_stock);

-- ─── STOCK MOVEMENTS ─────────────────────────────────────────
create type movement_type as enum ('entrada','saida','ajuste','transferencia','perda','inventario');

create table public.stock_movements (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.products(id) on delete restrict,
  type          movement_type not null,
  quantity      integer not null,
  balance_after integer not null default 0,
  unit_cost     numeric(12,2),
  total_cost    numeric(14,2),
  reference     text,
  notes         text,
  user_id       uuid not null references public.user_profiles(id),
  company_id    uuid not null references public.companies(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create index idx_movements_product    on public.stock_movements(product_id);
create index idx_movements_company    on public.stock_movements(company_id);
create index idx_movements_type       on public.stock_movements(type);
create index idx_movements_created_at on public.stock_movements(created_at desc);

-- ─── ALERTS ──────────────────────────────────────────────────
create type alert_severity as enum ('info', 'warning', 'danger');

create table public.stock_alerts (
  id         uuid primary key default uuid_generate_v4(),
  type       text not null,
  title      text not null,
  message    text not null,
  severity   alert_severity not null default 'info',
  is_read    boolean not null default false,
  product_id uuid references public.products(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─── TRIGGERS ────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_suppliers_updated before update on public.suppliers for each row execute function public.handle_updated_at();
create trigger trg_customers_updated before update on public.customers for each row execute function public.handle_updated_at();
create trigger trg_products_updated  before update on public.products  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles(id, email, full_name, role, company_id)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    'operador',
    coalesce((new.raw_user_meta_data->>'company_id')::uuid,
      (select id from public.companies order by created_at limit 1))
  ) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update stock on movement
create or replace function public.apply_stock_movement()
returns trigger language plpgsql as $$
declare
  v_stock   integer;
  v_balance integer;
begin
  select current_stock into v_stock
  from public.products
  where id = new.product_id
  for update;

  if v_stock is null then
    raise exception 'Produto não encontrado';
  end if;

  if new.type in ('saida', 'perda') and new.quantity > v_stock then
    raise exception 'Estoque insuficiente: disponível %, solicitado %', v_stock, new.quantity
      using errcode = 'check_violation';
  end if;

  update public.products set
    current_stock = case
      when new.type = 'entrada'                 then current_stock + new.quantity
      when new.type in ('saida', 'perda')       then current_stock - new.quantity
      when new.type in ('ajuste', 'inventario') then new.quantity
      else current_stock
    end,
    updated_at = now()
  where id = new.product_id
  returning current_stock into v_balance;

  new.balance_after := v_balance;
  return new;
end;
$$;

create trigger trg_stock_movement
  before insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- ─── ALERTAS AUTOMÁTICOS DE ESTOQUE ──────────────────────────
create or replace function public.sync_stock_alerts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old text;
  v_new text;
begin
  v_new := case
    when new.current_stock <= 0 then 'zero'
    when new.current_stock <= new.min_stock then 'low'
    else 'ok'
  end;

  if tg_op = 'UPDATE' then
    v_old := case
      when old.current_stock <= 0 then 'zero'
      when old.current_stock <= old.min_stock then 'low'
      else 'ok'
    end;
    -- só age quando o estado muda (evita alertas repetidos a cada movimentação)
    if v_old = v_new then
      return new;
    end if;
  elsif v_new = 'zero' and new.min_stock <= 0 then
    return new;
  end if;

  delete from public.stock_alerts
  where product_id = new.id and type in ('out_of_stock', 'low_stock');

  if v_new = 'zero' then
    insert into public.stock_alerts (type, title, message, severity, product_id, company_id)
    values (
      'out_of_stock',
      'Estoque zerado: ' || new.name,
      new.name || ' (' || new.sku || ') está sem estoque. Mínimo definido: ' || new.min_stock || ' ' || coalesce(new.unit, 'un') || '.',
      'danger', new.id, new.company_id
    );
  elsif v_new = 'low' then
    insert into public.stock_alerts (type, title, message, severity, product_id, company_id)
    values (
      'low_stock',
      'Estoque baixo: ' || new.name,
      new.name || ' (' || new.sku || ') tem ' || new.current_stock || ' ' || coalesce(new.unit, 'un') || ', abaixo do mínimo de ' || new.min_stock || '.',
      'warning', new.id, new.company_id
    );
  end if;

  return new;
end;
$$;

create trigger trg_products_stock_alerts
  after insert or update of current_stock, min_stock on public.products
  for each row execute function public.sync_stock_alerts();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.companies       enable row level security;
alter table public.user_profiles   enable row level security;
alter table public.categories      enable row level security;
alter table public.suppliers       enable row level security;
alter table public.customers       enable row level security;
alter table public.products        enable row level security;
alter table public.stock_movements enable row level security;
alter table public.stock_alerts    enable row level security;

create or replace function public.my_company_id()
returns uuid language sql stable security definer as $$
  select company_id from public.user_profiles where id = auth.uid();
$$;

create or replace function public.my_role()
returns user_role language sql stable security definer as $$
  select role from public.user_profiles where id = auth.uid();
$$;

create policy "company_isolation" on public.categories       for all using (company_id = public.my_company_id());
create policy "company_isolation" on public.suppliers        for all using (company_id = public.my_company_id());
create policy "company_isolation" on public.customers        for all using (company_id = public.my_company_id());
create policy "company_isolation" on public.products         for all using (company_id = public.my_company_id());
create policy "company_isolation" on public.stock_movements  for all using (company_id = public.my_company_id());
create policy "company_isolation" on public.stock_alerts     for all using (company_id = public.my_company_id());
create policy "own_profile"       on public.user_profiles    for all using (company_id = public.my_company_id());
create policy "own_company"       on public.companies        for select using (id = public.my_company_id());

create policy "admin_only_delete" on public.products for delete
  using (company_id = public.my_company_id() and public.my_role() in ('admin','gerente'));

-- ─── SEED ────────────────────────────────────────────────────
insert into public.companies (id, name, cnpj, email, phone, city, state)
values ('00000000-0000-0000-0000-000000000001','Empresa Demo Ltda.','00.000.000/0001-00','contato@demo.com','(11) 3000-0000','São Paulo','SP');

insert into public.categories (name, color, company_id) values
  ('Eletrônicos','#6366f1','00000000-0000-0000-0000-000000000001'),
  ('Periféricos','#3b82f6','00000000-0000-0000-0000-000000000001'),
  ('Acessórios', '#22c55e','00000000-0000-0000-0000-000000000001'),
  ('Ferramentas','#f59e0b','00000000-0000-0000-0000-000000000001'),
  ('Consumíveis','#ef4444','00000000-0000-0000-0000-000000000001');
