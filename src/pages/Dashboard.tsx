import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { ClubCard } from '../components/ClubCard'
import { useAuth } from '../context/AuthContext'
import type { Club } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .getClubs()
      .then(setClubs)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your clubs'))
      .finally(() => setIsLoading(false))
  }, [])

  const totalMonthly = clubs.reduce((sum, c) => sum + c.monthlyContribution, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-900 dark:text-white">
        Welcome back{user ? `, ${user.username}` : ''}
      </h1>
      <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">Here's where your circles stand.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-charcoal-200 bg-white p-4 dark:border-charcoal-800 dark:bg-charcoal-900">
          <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Your clubs</p>
          <p className="mt-1 text-2xl font-bold text-charcoal-900 dark:text-white">{clubs.length}</p>
        </div>
        <div className="rounded-2xl border border-charcoal-200 bg-white p-4 dark:border-charcoal-800 dark:bg-charcoal-900">
          <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Combined monthly</p>
          <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">${totalMonthly}</p>
        </div>
        <div className="rounded-2xl border border-charcoal-200 bg-white p-4 dark:border-charcoal-800 dark:bg-charcoal-900">
          <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Avg. interest</p>
          <p className="mt-1 text-2xl font-bold text-gold-600 dark:text-gold-400">
            {clubs.length ? Math.round(clubs.reduce((s, c) => s + c.interestRate, 0) / clubs.length) : 0}%
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900 dark:text-white">Your clubs</h2>
        <Link to="/clubs" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
          View all
        </Link>
      </div>

      <div className="mt-4">
        {isLoading && <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Loading your clubs…</p>}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        {!isLoading && !error && clubs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-charcoal-300 p-8 text-center dark:border-charcoal-700">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
              You're not part of a club yet.
            </p>
            <Link
              to="/clubs"
              className="mt-3 inline-block rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Create your first circle
            </Link>
          </div>
        )}

        {!isLoading && !error && clubs.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.slice(0, 6).map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
