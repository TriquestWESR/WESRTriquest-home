import { supabaseService } from './supabase-server'
export async function auditLog(entry: {
  actor_user_id?: string | null,
  actor_role?: string | null,
  action: string,
  target_table?: string | null,
  target_id?: string | null,
  meta?: any
}) {
  const supa = supabaseService()
  await supa.from('audit_logs').insert({
    actor_user_id: entry.actor_user_id || null,
    actor_role: entry.actor_role || null,
    action: entry.action,
    target_table: entry.target_table || null,
    target_id: entry.target_id || null,
    meta: entry.meta || null
  })
}
