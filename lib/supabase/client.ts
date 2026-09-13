"use client"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Browser-side anon-key Supabase client.
 *
 * This app does NOT use Supabase Auth — our own signed JWT cookie is the
 * session (see lib/auth/session.ts). Only use this client for reading
 * tables that are intentionally public (e.g. pricing_plans, coupons);
 * everything else goes through our own /api/* routes.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
