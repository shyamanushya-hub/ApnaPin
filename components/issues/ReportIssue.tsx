'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ISSUE_CATEGORIES } from '@/lib/types'

export function ReportIssue({
  locationId,
  pinCode,
  isAuthed,
}: {
  locationId: string
  pinCode: string
  isAuthed: boolean
}) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('road')
  const [locationText, setLocationText] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isAuthed) {
    return (
      <a
        href="/sign-in"
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
      >
        Sign in to report an issue
      </a>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-sm font-medium text-paper transition-transform hover:-translate-y-px"
      >
        + Report an issue
      </button>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (title.trim().length < 3) {
      setError('Add a short, specific title.')
      return
    }
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      setError('Your session expired — please sign in again.')
      return
    }
    const { error: insertError } = await supabase.from('issues').insert({
      location_id: locationId,
      pin_code: pinCode,
      author_id: user.id,
      title: title.trim(),
      category,
      location_text: locationText.trim() || null,
      description: description.trim() || null,
    })
    setLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setOpen(false)
    setTitle('')
    setLocationText('')
    setDescription('')
    router.refresh()
  }

  const inputCls =
    'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/40'

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-line bg-white p-4">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's the problem? (e.g. Pothole near the flyover)"
        className={inputCls}
        maxLength={160}
      />
      <div className="flex gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} flex-1`}>
          {ISSUE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
        <input
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          placeholder="Where? (near XYZ)"
          className={`${inputCls} flex-1`}
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add detail (optional)"
        rows={2}
        className={inputCls}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-brand-blue px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {loading ? 'Filing…' : 'File issue'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
          className="rounded-full px-3 py-2 text-sm text-ink/50 hover:text-ink"
        >
          Cancel
        </button>
        <span className="ml-auto text-xs text-ink/35">Filed as a verified resident</span>
      </div>
    </form>
  )
}
