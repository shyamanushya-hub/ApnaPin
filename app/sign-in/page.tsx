'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Step = 'phone' | 'otp'

export default function SignInPage() {
  const supabase = getSupabaseBrowserClient()

  const [step, setStep] = useState<Step>('phone')
  const [digits, setDigits] = useState('') // 10-digit Indian number, no country code
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const phone = `+91${digits}`

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\d{10}$/.test(digits)) {
      setError('Enter a 10-digit mobile number.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('otp')
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // Full reload so Server Components (header, pages) re-render with the
    // freshly set auth cookie. A soft router.push() would serve a cached,
    // logged-out render.
    window.location.assign('/')
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="text-gray-500 text-sm mt-1">
        Verify your mobile number. You stay anonymous in public unless you choose a display name.
      </p>

      {step === 'phone' ? (
        <form onSubmit={sendOtp} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile number</label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                value={digits}
                onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="flex-1 min-w-0 rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-blue px-4 py-2 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send code'}
          </button>
          <p className="text-center text-sm text-gray-500">
            New to ApnaPin?{' '}
            <a href="/sign-up" className="text-brand-blue hover:underline">Create an account</a>
          </p>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="mt-6 space-y-4">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to <span className="font-medium">{phone}</span>.
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-blue px-4 py-2 text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify & sign in'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('phone'); setCode(''); setError(null) }}
            className="w-full text-sm text-gray-500 hover:text-gray-800"
          >
            ← Use a different number
          </button>
        </form>
      )}
    </div>
  )
}
