import { Link } from 'react-router-dom'
import type { Club } from '../types'

export function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      to={`/clubs/${club.id}`}
      className="block rounded-2xl border border-charcoal-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-md dark:border-charcoal-800 dark:bg-charcoal-900 dark:hover:border-primary-500/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-charcoal-900 dark:text-white">{club.title}</h3>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
            ${club.monthlyContribution}/mo · {club.durationMonths} months
          </p>
        </div>
        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
          {club.interestRate}% interest
        </span>
      </div>
    </Link>
  )
}
