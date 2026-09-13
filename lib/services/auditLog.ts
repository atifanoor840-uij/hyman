import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"

export interface AuditLogInput {
  userId?: string | null
  userName: string
  targetId: string
  targetType: string
  action: string
  description: string
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("audit_logs").insert({
    id: randomUUID(),
    userId: input.userId ?? null,
    userName: input.userName,
    targetId: input.targetId,
    targetType: input.targetType,
    action: input.action,
    description: input.description,
  })
  if (error) console.error("[auditLog] failed to write:", error.message)
}
