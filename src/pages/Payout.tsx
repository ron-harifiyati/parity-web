import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { paletteForString } from '../components/icons'
import type { Payout as PayoutType } from '../types'

export default function Payout() {
  const { id: clubId } = useParams<{ id: string }>()
  const [payout, setPayout] = useState<PayoutType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clubId) return
    api
      .getPayout(clubId)
      .then(setPayout)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load payout'))
      .finally(() => setIsLoading(false))
  }, [clubId])

  if (isLoading) return <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Calculating payout…</p>
  if (error)
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </p>
    )
  if (!payout || !clubId) return null

  return (
    <div className="max-w-4xl">
      <Link
        to={`/clubs/${clubId}`}
        className="text-sm font-medium text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200"
      >
        ← {payout.clubTitle}
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-charcoal-900 sm:text-3xl dark:text-white">Year-end payout</h1>
      <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
        Each member's base share, plus an interest share for those who've earned or paid at least $25 in interest.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total contributions" value={`$${payout.totalContributions}`} />
        <Stat label="Interest pool" value={`$${payout.totalInterestPool}`} accent="gold" />
        <Stat label="Base share" value={`$${payout.baseSharePerMember}`} />
        <Stat label="Qualifiers" value={String(payout.numberOfQualifiers)} />
      </div>

      <div className="mt-6 divide-y divide-charcoal-200 overflow-hidden rounded-2xl border border-charcoal-200 bg-white dark:divide-charcoal-800 dark:border-charcoal-800 dark:bg-charcoal-900">
        {payout.payouts.map((p) => (
          <div key={p.memberId} className="flex items-center gap-3 p-4 sm:px-5">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${paletteForString(p.username)} text-xs font-bold text-white`}
            >
              {p.username.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal-900 dark:text-white">{p.username}</p>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                Base ${p.baseShare}
                {p.interestShare > 0 && (
                  <span className="text-gold-600 dark:text-gold-400"> + ${p.interestShare} interest</span>
                )}
                {p.outstandingDebt > 0 && <span> · ${p.outstandingDebt} debt deducted</span>}
              </p>
            </div>
            <p
              className={`shrink-0 text-lg font-bold ${
                p.total >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              ${p.total}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'gold' }) {
  return (
    <div className="rounded-2xl border border-charcoal-200 bg-white p-4 dark:border-charcoal-800 dark:bg-charcoal-900">
      <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          accent === 'gold' ? 'text-gold-600 dark:text-gold-400' : 'text-charcoal-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
