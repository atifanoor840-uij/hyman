import "server-only"

import { randomUUID } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service"

export interface NotificationRow {
  id: string
  userId: string | null
  title: string
  message: string
  type: string
  channel: string
  status: string
  read: boolean | null
  sentAt: string | null
}

const COLUMNS = "id,userId,title,message,type,channel,status,read,sentAt"

export async function listNotificationsForUser(userId: string): Promise<NotificationRow[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("notifications")
    .select(COLUMNS)
    .eq("userId", userId)
    .order("sentAt", { ascending: false })
    .limit(100)
  if (error) throw error
  return (data as NotificationRow[]) ?? []
}

export async function createNotification(input: {
  userId: string
  title: string
  message: string
  type: string
}): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("notifications").insert({
    id: randomUUID(),
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    channel: "in_app",
    status: "sent",
    read: false,
    sentAt: new Date().toISOString(),
  })
  if (error) throw error
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id).eq("userId", userId)
  if (error) throw error
}
