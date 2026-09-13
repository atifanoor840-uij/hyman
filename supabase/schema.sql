-- GenzProp Supabase schema
--
-- Transcribed from the exact table/column export provided for this migration
-- (column names, types, and PK/Unique/Nullable constraints are kept exactly
-- as exported, including camelCase identifiers — hence the double quotes).
--
-- Additions beyond the literal export (flagged so they're easy to revert):
--   1. `gen_random_uuid()::text` defaults on standalone "id" columns that
--      aren't themselves a natural/foreign key, so app code doesn't have to
--      generate ids for those tables.
--   2. Foreign key constraints between tables whose column names clearly
--      reference each other (e.g. orders."userId" -> users.id). The export's
--      constraints column only listed Primary/Unique/Nullable, not FKs.
--   3. `now()` defaults on nullable timestamp columns.
--   4. A CHECK constraint on users.role (customer/collaborator/admin/support)
--      per the three-role-plus-collaborator design in the migration plan;
--      the export didn't specify allowed values.
--
-- This app does NOT use Supabase Auth (see lib/auth/*.ts) — all access goes
-- through the service-role client with authorization checked in app code.
-- RLS (supabase/policies.sql) is enabled everywhere as a backstop, not the
-- primary boundary.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id                text primary key,
  name              text not null,
  email             text not null unique,
  phone             text,
  country           text,
  "passwordHash"    text not null,
  role              text not null check (role in ('customer', 'collaborator', 'admin', 'support')),
  status            text not null default 'active',
  "createdAt"       timestamptz default now(),
  "referredBy"      text references public.users (id) on delete set null,
  "emailVerified"   boolean not null default false,
  "emailVerifiedAt" timestamptz
);

-- ---------------------------------------------------------------------------
-- affiliates (1:1 with a collaborator user)
-- ---------------------------------------------------------------------------
create table if not exists public.affiliates (
  "userId"          text primary key references public.users (id) on delete cascade,
  "referralCode"    text not null unique,
  "commissionRate"  numeric not null default 10
);

-- ---------------------------------------------------------------------------
-- challenge_plans
-- ---------------------------------------------------------------------------
create table if not exists public.challenge_plans (
  id                 text primary key default gen_random_uuid()::text,
  name               text not null,
  size               numeric not null,
  price              numeric not null,
  "profitTargetP1"   numeric not null,
  "profitTargetP2"   numeric not null,
  "maxDailyLoss"     numeric not null,
  "maxTotalLoss"     numeric not null,
  "profitSplit"      numeric not null,
  platform           text,
  login              text,
  password           text,
  server             text
);

-- ---------------------------------------------------------------------------
-- coupons
-- ---------------------------------------------------------------------------
create table if not exists public.coupons (
  code               text primary key,
  "discountPercent"  numeric not null,
  status             text not null default 'active',
  "createdAt"        timestamptz default now(),
  "expiresAt"        timestamptz
);

-- ---------------------------------------------------------------------------
-- pricing_plans
-- ---------------------------------------------------------------------------
create table if not exists public.pricing_plans (
  id           text primary key default gen_random_uuid()::text,
  model        text not null,
  size         numeric not null,
  price        numeric not null,
  status       text not null default 'active',
  "createdAt"  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id                        text primary key default gen_random_uuid()::text,
  "userId"                  text references public.users (id) on delete set null,
  "planId"                  text references public.challenge_plans (id) on delete set null,
  "couponUsed"              text references public.coupons (code) on delete set null,
  "amountPaid"              numeric not null,
  "paymentMethod"           text not null,
  status                    text not null default 'pending_payment',
  "gatewayRef"              text,
  "createdAt"               timestamptz default now(),
  "updatedAt"               timestamptz default now(),
  "referralBalanceApplied"  numeric,
  "weekendHoldingAddon"     boolean,
  "legacyRules"             boolean
);

-- ---------------------------------------------------------------------------
-- challenge_inventory
-- ---------------------------------------------------------------------------
create table if not exists public.challenge_inventory (
  id                       text primary key default gen_random_uuid()::text,
  platform                 text not null,
  size                     numeric not null,
  login                    text not null,
  password                 text not null,
  server                   text not null,
  "externalStatisticsId"   text,
  status                   text not null default 'available',
  "orderId"                text references public.orders (id) on delete set null,
  "createdAt"              timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- trading_accounts
-- ---------------------------------------------------------------------------
create table if not exists public.trading_accounts (
  id                       text primary key default gen_random_uuid()::text,
  "userId"                 text references public.users (id) on delete set null,
  "orderId"                text references public.orders (id) on delete set null,
  platform                 text not null,
  login                    text not null,
  "passwordMaster"         text,
  "passwordInvestor"       text,
  server                   text not null,
  "profitTarget"           numeric not null,
  balance                  numeric not null default 0,
  equity                   numeric not null default 0,
  "todayPl"                numeric not null default 0,
  "totalPl"                numeric not null default 0,
  status                   text not null default 'active',
  phase                    text,
  "graphLink"              text,
  "deliveryStatus"         text not null default 'pending',
  "deliveredAt"            timestamptz,
  "createdAt"              timestamptz default now(),
  "externalStatisticsId"   text,
  "statisticsPayload"      jsonb,
  "statisticsUpdatedAt"    timestamptz,
  "statisticsApiId"        text,
  "weekendHoldingAddon"    boolean
);

-- ---------------------------------------------------------------------------
-- payouts
-- ---------------------------------------------------------------------------
create table if not exists public.payouts (
  id                     text primary key default gen_random_uuid()::text,
  "accountId"            text references public.trading_accounts (id) on delete set null,
  "userId"               text references public.users (id) on delete set null,
  amount                 numeric not null,
  "profitSplitAmount"    numeric not null,
  "firmShareAmount"      numeric not null,
  "paymentMethod"        text not null,
  "paymentDetails"       text not null,
  status                 text not null default 'requested',
  "approvedBy"           text references public.users (id) on delete set null,
  "approvedAt"           timestamptz,
  notes                  text,
  "createdAt"            timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- kyc (1:1 with a user)
-- ---------------------------------------------------------------------------
create table if not exists public.kyc (
  "userId"         text primary key references public.users (id) on delete cascade,
  "documentType"   text not null,
  "frontUrl"       text,
  "backUrl"        text,
  "selfieUrl"      text,
  "addressUrl"     text,
  status           text not null default 'pending',
  "rejectReason"   text,
  "updatedAt"      timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------------
create table if not exists public.certificates (
  id             text primary key default gen_random_uuid()::text,
  "userId"       text references public.users (id) on delete set null,
  "accountId"    text references public.trading_accounts (id) on delete set null,
  "traderName"   text not null,
  "accountSize"  numeric not null,
  "planName"     text not null,
  "datePassed"   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id         text primary key default gen_random_uuid()::text,
  "userId"   text references public.users (id) on delete cascade,
  title      text not null,
  message    text not null,
  type       text not null,
  channel    text not null default 'in_app',
  status     text not null default 'pending',
  read       boolean default false,
  "sentAt"   timestamptz
);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id           text primary key default gen_random_uuid()::text,
  "userId"     text references public.users (id) on delete set null,
  "userName"   text not null,
  "targetId"   text not null,
  "targetType" text not null,
  action       text not null,
  description  text not null,
  "createdAt"  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- email_verification_tokens
-- ---------------------------------------------------------------------------
create table if not exists public.email_verification_tokens (
  "tokenHash"  text primary key,
  "userId"     text not null references public.users (id) on delete cascade,
  "expiresAt"  timestamptz not null,
  "createdAt"  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- referrals (composite key: one row per referred-user/order pair)
-- ---------------------------------------------------------------------------
create table if not exists public.referrals (
  "referredUserId"    text not null references public.users (id) on delete cascade,
  "affiliateId"       text references public.affiliates ("userId") on delete set null,
  "orderId"           text not null references public.orders (id) on delete cascade,
  "commissionAmount"  numeric not null default 0,
  status              text not null default 'pending',
  "createdAt"         timestamptz default now(),
  primary key ("referredUserId", "orderId")
);

-- ---------------------------------------------------------------------------
-- newsletter_subscribers
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id                      bigint generated always as identity primary key,
  email                   text not null,
  source                  text not null,
  status                  text not null default 'subscribed',
  "emailStatus"           text not null default 'unconfirmed',
  "confirmationSentAt"    timestamptz,
  "createdAt"             timestamptz not null default now(),
  "updatedAt"             timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes on FK-ish columns used for lookups
-- ---------------------------------------------------------------------------
create index if not exists idx_affiliates_referral_code on public.affiliates ("referralCode");
create index if not exists idx_orders_user_id on public.orders ("userId");
create index if not exists idx_orders_plan_id on public.orders ("planId");
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_challenge_inventory_order_id on public.challenge_inventory ("orderId");
create index if not exists idx_challenge_inventory_status on public.challenge_inventory (status);
create index if not exists idx_trading_accounts_user_id on public.trading_accounts ("userId");
create index if not exists idx_trading_accounts_order_id on public.trading_accounts ("orderId");
create index if not exists idx_payouts_user_id on public.payouts ("userId");
create index if not exists idx_payouts_account_id on public.payouts ("accountId");
create index if not exists idx_certificates_user_id on public.certificates ("userId");
create index if not exists idx_notifications_user_id on public.notifications ("userId");
create index if not exists idx_audit_logs_user_id on public.audit_logs ("userId");
create index if not exists idx_email_verification_tokens_user_id on public.email_verification_tokens ("userId");
create index if not exists idx_referrals_affiliate_id on public.referrals ("affiliateId");
create index if not exists idx_newsletter_subscribers_email on public.newsletter_subscribers (email);
