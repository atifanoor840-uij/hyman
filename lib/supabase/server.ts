import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Anon-key Supabase client for Server Components / Route Handlers.
 *
 * This app does NOT use Supabase Auth — sessions are our own signed JWT
 * cookie (see lib/auth/session.ts) and every authenticated write/read goes
 * through the service-role client (lib/supabase/service.ts) with
 * authorization checked in app code. This anon client is only for reading
 * the tables that are intentionally public (e.g. pricing_plans, coupons).
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
