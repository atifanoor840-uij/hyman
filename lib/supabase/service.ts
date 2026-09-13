import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client — bypasses RLS entirely.
 * ONLY use inside Route Handlers/Server Actions for privileged operations
 * (webhooks, admin/CRM actions, impersonation, order fulfillment). Never
 * import this from a client component or expose the service-role key to
 * the browser.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase service-role configuration (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).")
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
