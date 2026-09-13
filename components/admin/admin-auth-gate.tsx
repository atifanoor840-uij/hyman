// Route protection for /admin/* now happens server-side in middleware.ts
// (real session cookie + role check), so this no longer needs its own
// client-side redirect logic — it used to check a bearer token that the
// current auth system never sets.
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
