import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { Club, Member } from '../types'

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>()
  const [club, setClub] = useState<(Club & { members?: Member[] }) | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([api.getClub(id), api.getMembers(id)])
      .then(([clubRes, membersRes]) => {
        setClub(clubRes)
        setMembers(membersRes)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load this club'))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) return <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Loading club…</p>
  if (error)
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </p>
    )
  if (!club) return null

  return (
    <div>
      <Link to="/clubs" className="text-sm font-medium text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200">
        ← My Clubs
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-charcoal-900 dark:text-white">{club.title}</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Monthly" value={`$${club.monthlyContribution}`} />
        <Stat label="Duration" value={`${club.durationMonths} mo`} />
        <Stat label="Interest" value={`${club.interestRate}%`} accent="gold" />
        <Stat label="Lending limit" value={`$${club.lendingLimit}`} />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-charcoal-900 dark:text-white">Members ({members.length})</h2>
      <div className="mt-3 divide-y divide-charcoal-200 overflow-hidden rounded-2xl border border-charcoal-200 bg-white dark:divide-charcoal-800 dark:border-charcoal-800 dark:bg-charcoal-900">
        {members.length === 0 && (
          <p className="p-4 text-sm text-charcoal-500 dark:text-charcoal-400">No members yet.</p>
        )}
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium text-charcoal-900 dark:text-white">
                {member.username}
                {member.isTreasurer && (
                  <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700 dark:bg-gold-500/15 dark:text-gold-400">
                    Treasurer
                  </span>
                )}
              </p>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                Invested ${member.totalInvestment} · Owing ${member.totalOwing}
              </p>
            </div>
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
