import { type FormEvent, useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import { ClubCard } from '../components/ClubCard'
import { CLUB_LIMITS } from '../lib/clubLimits'
import type { Club } from '../types'

export default function Clubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [monthlyContribution, setMonthlyContribution] = useState(25)
  const [durationMonths, setDurationMonths] = useState(12)
  const [interestRate, setInterestRate] = useState(10)
  const [isCreating, setIsCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadClubs = () => {
    setIsLoading(true)
    api
      .getClubs()
      .then(setClubs)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your clubs'))
      .finally(() => setIsLoading(false))
  }

  useEffect(loadClubs, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsCreating(true)
    try {
      await api.createClub({ title, monthlyContribution, durationMonths, interestRate })
      setTitle('')
      setShowForm(false)
      loadClubs()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not create club')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-white">My Clubs</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {showForm ? 'Cancel' : 'New club'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-5 space-y-4 rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900"
        >
          <div>
            <label htmlFor="title" className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">
              Club name
            </label>
            <input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-charcoal-300 bg-white px-4 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="monthly" className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">
                Monthly $
              </label>
              <input
                id="monthly"
                type="number"
                min={CLUB_LIMITS.monthlyContribution.min}
                max={CLUB_LIMITS.monthlyContribution.max}
                required
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
              />
              <p className="mt-1 text-xs text-charcoal-400">${CLUB_LIMITS.monthlyContribution.min}-${CLUB_LIMITS.monthlyContribution.max}</p>
            </div>
            <div>
              <label htmlFor="duration" className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">
                Months
              </label>
              <input
                id="duration"
                type="number"
                min={CLUB_LIMITS.durationMonths.min}
                max={CLUB_LIMITS.durationMonths.max}
                required
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
              />
              <p className="mt-1 text-xs text-charcoal-400">
                {CLUB_LIMITS.durationMonths.min}-{CLUB_LIMITS.durationMonths.max}
              </p>
            </div>
            <div>
              <label htmlFor="interest" className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">
                Interest %
              </label>
              <input
                id="interest"
                type="number"
                min={CLUB_LIMITS.interestRate.min}
                max={CLUB_LIMITS.interestRate.max}
                required
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
              />
              <p className="mt-1 text-xs text-charcoal-400">
                {CLUB_LIMITS.interestRate.min}-{CLUB_LIMITS.interestRate.max}%
              </p>
            </div>
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className="w-full rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 sm:w-auto sm:px-6"
          >
            {isCreating ? 'Creating…' : 'Create club'}
          </button>
        </form>
      )}

      <div className="mt-6">
        {isLoading && <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Loading your clubs…</p>}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        {!isLoading && !error && clubs.length === 0 && !showForm && (
          <div className="rounded-2xl border border-dashed border-charcoal-300 p-8 text-center dark:border-charcoal-700">
            <p className="text-sm text-charcoal-600 dark:text-charcoal-300">No clubs yet — create your first one.</p>
          </div>
        )}

        {!isLoading && !error && clubs.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
