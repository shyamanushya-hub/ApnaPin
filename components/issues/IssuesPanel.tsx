import type { Issue } from '@/lib/types'
import { IssueCard } from './IssueCard'
import { ReportIssue } from './ReportIssue'

export function IssuesPanel({
  issues,
  locationId,
  pinCode,
  isAuthed,
}: {
  issues: Issue[]
  locationId: string
  pinCode: string
  isAuthed: boolean
}) {
  const open = issues.filter((i) => i.status !== 'resolved')
  const resolved = issues.filter((i) => i.status === 'resolved')

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-medium text-ink">Civic issues</h2>
        <p className="mt-1 text-sm text-ink/55">
          Reported → Verified → In&nbsp;Progress → Community&nbsp;Resolved. Every issue is filed by a
          verified resident, and a fix is only marked when residents confirm it — ApnaPin never claims
          an authority resolved anything.
        </p>
        <div className="mt-4">
          <ReportIssue locationId={locationId} pinCode={pinCode} isAuthed={isAuthed} />
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-4 py-10 text-center">
          <p className="text-sm text-ink/55">No civic issues reported here yet.</p>
          <p className="mt-1 text-xs text-ink/40">Be the first to flag a local problem.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {open.length > 0 ? (
            <div className="space-y-3">
              {open.map((i) => (
                <IssueCard key={i.id} issue={i} />
              ))}
            </div>
          ) : null}

          {resolved.length > 0 ? (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Resolved
              </h3>
              <div className="space-y-3">
                {resolved.map((i) => (
                  <IssueCard key={i.id} issue={i} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
