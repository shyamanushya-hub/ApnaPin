import { getIssueCategory, getIssueStatus, type Issue } from '@/lib/types'

function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}

export function IssueCard({ issue }: { issue: Issue }) {
  const cat = getIssueCategory(issue.category)
  const st = getIssueStatus(issue.status)
  const isResolved = issue.status === 'resolved'

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper text-lg">
          {cat.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium leading-snug text-ink">{issue.title}</h3>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.tone}`}>
              {st.label}
            </span>
          </div>

          {issue.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-ink/55">{issue.description}</p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink/45">
            {issue.location_text ? <span>📍 {issue.location_text}</span> : null}
            <span>{cat.label}</span>
            <span>·</span>
            <span>
              {isResolved && issue.resolved_at
                ? `confirmed fixed ${daysSince(issue.resolved_at)}d ago`
                : `open ${daysSince(issue.created_at)}d`}
            </span>
            {(issue.affected_count ?? 0) > 0 ? (
              <>
                <span>·</span>
                <span>{issue.affected_count} affected</span>
              </>
            ) : null}
            {(issue.confirm_count ?? 0) > 0 ? (
              <>
                <span>·</span>
                <span>{issue.confirm_count} verified this</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
