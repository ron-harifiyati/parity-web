import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { paletteForString } from '../components/icons'
import type { TransactionRecord } from '../types'

/**
 * NOTE: this page calls api.getClubTransactions, which expects a
 * `GET /clubs/:id/transactions?page=&limit=` route on parity-api that does not exist
 * yet — this frontend is ready, but needs that backend endpoint to actually work.
 *
 * Expected response shape:
 *   {
 *     transactions: Array<{
 *       id, memberId, username, clubId, period,
 *       investAmount, interestAmount, payLoanAmount, loanAmount, withdrawalAmount,
 *       createdAt
 *     }>,
 *     page, limit, totalCount, totalPages
 *   }
 * Sorted newest first (by createdAt desc). Any club member (not just owner/treasurer)
 * should be able to view — same access level as GET /members, i.e. clubAuth only.
 */

const PAGE_SIZE = 20

function describeTransaction(t: TransactionRecord): { label: string; amount: number; tone: string }[] {
  const parts: { label: string; amount: number; tone: string }[] = []
  if (t.investAmount > 0) parts.push({ label: 'Contribution', amount: t.investAmount, tone: 'text-primary-600 dark:text-primary-400' })
  if (t.loanAmount > 0) parts.push({ label: 'Loan taken', amount: t.loanAmount, tone: 'text-gold-600 dark:text-gold-400' })
  if (t.payLoanAmount > 0) parts.push({ label: 'Loan repayment', amount: t.payLoanAmount, tone: 'text-navy-600 dark:text-navy-400' })
  if (t.interestAmount > 0) parts.push({ label: 'Interest payment', amount: t.interestAmount, tone: 'text-gold-600 dark:text-gold-400' })
  if (t.withdrawalAmount > 0) parts.push({ label: 'Withdrawal refund', amount: t.withdrawalAmount, tone: 'text-charcoal-600 dark:text-charcoal-300' })
  return parts.length > 0 ? parts : [{ label: 'No amount recorded', amount: 0, tone: 'text-charcoal-400' }]
}

export default function ClubRecords() {
  const { id: clubId } = useParams<{ id: string }>()
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ transactions: TransactionRecord[]; totalCount: number; totalPages: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clubId) return
    setIsLoading(true)
    setError(null)
    api
      .getClubTransactions(clubId, page, PAGE_SIZE)
      .then((res) => setData(res))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load transaction records'))
      .finally(() => setIsLoading(false))
  }, [clubId, page])

  if (!clubId) return null

  return (
    <div className="max-w-4xl">
      <Link
        to={`/clubs/${clubId}`}
        className="text-sm font-medium text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200"
      >
        ← Back to club
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-charcoal-900 sm:text-3xl dark:text-white">Transaction records</h1>
      <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
        Every contribution, loan, repayment, and interest payment recorded in this club, newest first.
      </p>

      {isLoading && <p className="mt-6 text-sm text-charcoal-500 dark:text-charcoal-400">Loading records…</p>}

      {error && !isLoading && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      {!isLoading && !error && data && (
        <>
          {data.transactions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-charcoal-300 p-8 text-center dark:border-charcoal-700">
              <p className="text-sm text-charcoal-600 dark:text-charcoal-300">No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-charcoal-200 overflow-hidden rounded-2xl border border-charcoal-200 bg-white dark:divide-charcoal-800 dark:border-charcoal-800 dark:bg-charcoal-900">
              {data.transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-4 sm:px-5">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${paletteForString(t.username)} text-xs font-bold text-white`}
                  >
                    {t.username.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-charcoal-900 dark:text-white">{t.username}</p>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{t.period}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    {describeTransaction(t).map((part, i) => (
                      <p key={i} className={`text-sm font-semibold ${part.tone}`}>
                        {part.label}
                        {part.amount > 0 && ` · $${part.amount}`}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full border border-charcoal-300 px-4 py-2 text-sm font-semibold text-charcoal-700 hover:bg-charcoal-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
              >
                ← Previous
              </button>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                Page {page} of {data.totalPages} · {data.totalCount} total
              </p>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="rounded-full border border-charcoal-300 px-4 py-2 text-sm font-semibold text-charcoal-700 hover:bg-charcoal-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
