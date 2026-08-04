import { Link } from 'react-router-dom'
import { paletteForString, UsersIcon } from './icons'
import type { Club } from '../types'

function initials(title: string) {
  const words = title.trim().split(/\s+/)
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || 'C'
}

export function ClubCard({ club }: { club: Club }) {
  const pot = club.totalInvestment ?? 0
  const members = club.totalMembers ?? 0

  return (
    <Link
      to={`/clubs/${club.id}`}
      className="group flex flex-col rounded-2xl border border-charcoal-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg hover:shadow-charcoal-900/5 dark:border-charcoal-800 dark:bg-charcoal-900 dark:hover:border-primary-500/40"
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${paletteForString(club.title)} text-sm font-bold text-white`}
        >
          {initials(club.title)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-charcoal-900 dark:text-white">{club.title}</h3>
          <p className="flex items-center gap-1 text-xs text-charcoal-500 dark:text-charcoal-400">
            <UsersIcon className="size-3.5" />
            {members} member{members === 1 ? '' : 's'}
          </p>
        </div>
        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
          {club.interestRate}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-charcoal-50 px-3 py-2 dark:bg-charcoal-800/60">
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Monthly</p>
          <p className="font-semibold text-charcoal-900 dark:text-white">${club.monthlyContribution}</p>
        </div>
        <div className="rounded-lg bg-charcoal-50 px-3 py-2 dark:bg-charcoal-800/60">
          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Duration</p>
          <p className="font-semibold text-charcoal-900 dark:text-white">{club.durationMonths} mo</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-charcoal-100 pt-3 dark:border-charcoal-800">
        <span className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Total pot</span>
        <span className="font-bold text-primary-600 dark:text-primary-400">${pot.toLocaleString()}</span>
      </div>
    </Link>
  )
}
