-- GenzProp offers
--
-- Standalone, idempotent migration. Safe to run against an existing database:
--   node scripts/run-sql.mjs supabase/offers.sql
-- The same statements are also in schema.sql so a fresh install picks them up.
--
-- The two promo concepts are deliberately separate:
--
--   Coupons  change the PRICE and require a code typed at checkout.
--   Offers   grant an EXTRA (a second account, a free retry, a free add-on) and
--            apply AUTOMATICALLY to every matching order — no code involved.
--
-- An offer carries a *type* deciding what the customer gets, and an optional
-- list of plan ids it is restricted to (empty = every plan).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------------
create table if not exists public.offers (
  id                 text primary key default gen_random_uuid()::text,
  -- Optional internal reference for reporting. Customers never type it.
  code               text unique,
  name               text not null,
  -- bogo | free_retry | free_addon
  type               text not null,
  -- Empty array = applies to every plan. Otherwise only these challenge_plans.id.
  "planIds"          text[] not null default '{}',
  status             text not null default 'active',
  "startsAt"         timestamptz,
  "expiresAt"        timestamptz,
  -- null = unlimited
  "maxRedemptions"   integer,
  "perUserLimit"     integer,
  "timesRedeemed"    integer not null default 0,
  description        text,
  "createdAt"        timestamptz default now(),
  "updatedAt"        timestamptz default now(),
  constraint offers_type_check check (type in ('bogo', 'free_retry', 'free_addon')),
  constraint offers_status_check check (status in ('active', 'inactive'))
);

-- ---------------------------------------------------------------------------
-- offer_redemptions
--
-- One row per offer used on an order. `status` tracks the entitlement:
--   pending    accepted at checkout, nothing granted yet
--   fulfilled  the benefit was granted (BOGO second account, add-on flag, …)
--   consumed   a free_retry was spent on a replacement order
-- ---------------------------------------------------------------------------
create table if not exists public.offer_redemptions (
  id             text primary key default gen_random_uuid()::text,
  "offerId"      text references public.offers (id) on delete set null,
  -- The offer's name, copied at redemption time so it survives later edits.
  "offerCode"    text not null,
  "offerType"    text not null,
  "userId"       text references public.users (id) on delete set null,
  "orderId"      text references public.orders (id) on delete cascade,
  status         text not null default 'pending',
  notes          text,
  "createdAt"    timestamptz default now(),
  "fulfilledAt"  timestamptz,
  constraint offer_redemptions_status_check check (status in ('pending', 'fulfilled', 'consumed'))
);

-- Opt-in advertising for COUPON codes: when true the code is listed in the
-- checkout sidebar so customers can tap to apply it. Private codes stay false
-- and must be typed in. (Offers need no flag — they apply automatically and are
-- always shown as included.)
alter table public.coupons add column if not exists "showAtCheckout" boolean not null default false;

-- Upgrading a database created by an earlier version of this file, where offers
-- were code-based and could carry a discount value.
alter table public.offers alter column code drop not null;
alter table public.offers drop constraint if exists offers_type_check;
alter table public.offers add  constraint offers_type_check check (type in ('bogo', 'free_retry', 'free_addon'));
alter table public.offers drop column if exists value;
alter table public.offers drop column if exists "showAtCheckout";

-- Records which offer code an order was placed with, for display and reporting.
alter table public.orders add column if not exists "offerCode" text;
-- Set when a free_retry entitlement creates a replacement order.
alter table public.orders add column if not exists "retryOfOrderId" text;

create index if not exists idx_offers_code on public.offers (code);
create index if not exists idx_offers_status on public.offers (status);
create index if not exists idx_offer_redemptions_offer_id on public.offer_redemptions ("offerId");
create index if not exists idx_offer_redemptions_user_id on public.offer_redemptions ("userId");
create index if not exists idx_offer_redemptions_order_id on public.offer_redemptions ("orderId");
create index if not exists idx_offer_redemptions_status on public.offer_redemptions (status);

-- RLS backstop: app code authorizes and uses the service-role client, which
-- bypasses RLS. Enabling it with no policies denies anon/authenticated.
alter table public.offers            enable row level security;
alter table public.offer_redemptions enable row level security;
