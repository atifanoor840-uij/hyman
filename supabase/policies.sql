-- GenzProp RLS policies
--
-- This app authenticates and authorizes in app code (see lib/auth/*.ts) and
-- reads/writes almost everything through the service-role client, which
-- bypasses RLS entirely. RLS here is a defense-in-depth backstop: every
-- table has RLS enabled, and only the two tables the export explicitly
-- marked as public-read/public-write (coupons, pricing_plans) get policies
-- for the anon/authenticated roles — reproduced exactly as exported. Every
-- other table has RLS enabled with zero policies, which means the anon and
-- authenticated roles get denied by default; only the service role (which
-- bypasses RLS) can touch them.

alter table public.users                       enable row level security;
alter table public.affiliates                  enable row level security;
alter table public.challenge_plans             enable row level security;
alter table public.coupons                     enable row level security;
alter table public.pricing_plans               enable row level security;
alter table public.orders                      enable row level security;
alter table public.challenge_inventory         enable row level security;
alter table public.trading_accounts            enable row level security;
alter table public.payouts                     enable row level security;
alter table public.kyc                         enable row level security;
alter table public.certificates                enable row level security;
alter table public.notifications               enable row level security;
alter table public.audit_logs                  enable row level security;
alter table public.email_verification_tokens   enable row level security;
alter table public.referrals                   enable row level security;
alter table public.newsletter_subscribers      enable row level security;

-- ---------------------------------------------------------------------------
-- coupons — public read only (as exported)
-- ---------------------------------------------------------------------------
drop policy if exists "Allow public read of coupons" on public.coupons;
create policy "Allow public read of coupons"
  on public.coupons
  as permissive
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- pricing_plans — public read + open write (as exported)
-- ---------------------------------------------------------------------------
drop policy if exists "Allow public read of pricing_plans" on public.pricing_plans;
create policy "Allow public read of pricing_plans"
  on public.pricing_plans
  as permissive
  for select
  to public
  using (true);

drop policy if exists "Allow service role or authenticated admin to manage pricing_pla" on public.pricing_plans;
create policy "Allow service role or authenticated admin to manage pricing_pla"
  on public.pricing_plans
  as permissive
  for all
  to public
  using (true)
  with check (true);
