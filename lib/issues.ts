import type { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Issue } from '@/lib/types'

type ServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>

// Fetch a location's issues, newest first, with affected/confirm counts attached
// from the issue_action_summary view.
export async function getIssuesForLocation(
  supabase: ServerClient,
  locationId: string,
): Promise<Issue[]> {
  const { data: rows } = await supabase
    .from('issues')
    .select('*')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })

  const issues = (rows ?? []) as Issue[]
  if (issues.length === 0) return []

  const { data: summary } = await supabase
    .from('issue_action_summary')
    .select('*')
    .in('issue_id', issues.map((i) => i.id))

  const affected = new Map<string, number>()
  const confirm = new Map<string, number>()
  for (const s of summary ?? []) {
    if (s.type === 'affected') affected.set(s.issue_id, s.n)
    else if (s.type === 'confirm') confirm.set(s.issue_id, s.n)
  }

  return issues.map((i) => ({
    ...i,
    affected_count: affected.get(i.id) ?? 0,
    confirm_count: confirm.get(i.id) ?? 0,
  }))
}
