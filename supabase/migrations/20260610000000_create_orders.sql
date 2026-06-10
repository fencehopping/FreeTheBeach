create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  shipping_name text,
  shipping_address_json jsonb,
  line_items_json jsonb,
  variant_id text,
  provider_sku text,
  amount_total integer,
  currency text,
  payment_status text,
  fulfillment_status text not null,
  provider_order_id text,
  provider_response_json jsonb,
  fulfillment_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_stripe_checkout_session_id_idx
  on public.orders (stripe_checkout_session_id);

create index if not exists orders_customer_email_idx
  on public.orders (customer_email);

create index if not exists orders_fulfillment_status_idx
  on public.orders (fulfillment_status);

create index if not exists orders_created_at_idx
  on public.orders (created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();
