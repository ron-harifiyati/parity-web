import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { paletteForString } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { currentPeriod } from '../lib/period'
import { useClubRole } from '../lib/roles'
import type { Club, Member } from '../types'

type TransactionType = 'invest' | 'loan' | 'payLoan' | 'interest'

const TRANSACTION_TYPES: { value: TransactionType; label: string; field: string }[] = [
  { value: 'invest', label: 'Record contribution', field: 'investAmount' },
  { value: 'loan', label: 'Record loan taken', field: 'loanAmount' },
  { value: 'payLoan', label: 'Record loan repayment', field: 'payLoanAmount' },
  { value: 'interest', label: 'Record interest payment', field: 'interestAmount' },
]

export default function MemberDetail() {
  const { user } = useAuth()
  const { id: clubId, memberId } = useParams<{ id: string; memberId: string }>()
  const navigate = useNavigate()

  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [confirmAction, setConfirmAction] = useState<'withdraw' | 'remove' | null>(null)

  const load = () => {
    if (!clubId || !memberId) return
    setIsLoading(true)
    Promise.all([api.getClub(clubId), api.getMembers(clubId), api.getMember(clubId, memberId)])
      .then(([clubRes, membersRes, memberRes]) => {
        setClub(clubRes)
        setMembers(membersRes)
        setMember(memberRes)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load this member'))
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [clubId, memberId])

  const { isOwner, isTreasurer } = useClubRole(club, members, user)

  if (isLoading && !member) return <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Loading member…</p>
  if (error)
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </p>
    )
  if (!club || !member || !clubId || !memberId) return null

  const isSelfOwner = member.userId === club.userId
  const canManage = isTreasurer && !member.withdrawnAt

  return (
    <div>
      <Link
        to={`/clubs/${clubId}`}
        className="text-sm font-medium text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200"
      >
        ← {club.title}
      </Link>

      <div className="mt-2 flex items-center gap-3">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${paletteForString(member.username)} text-sm font-bold text-white`}
        >
          {member.username.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal-900 sm:text-3xl dark:text-white">{member.username}</h1>
            {member.isTreasurer && (
              <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700 dark:bg-gold-500/15 dark:text-gold-400">
                Treasurer
              </span>
            )}
            {member.withdrawnAt && (
              <span className="rounded-full bg-charcoal-200 px-2.5 py-1 text-xs font-semibold text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300">
                Withdrawn
              </span>
            )}
          </div>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{member.email}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Invested" value={`$${member.investment}`} />
        <Stat label="Interest earned" value={`$${member.interestAcrued}`} />
        <Stat label="Direct interest paid" value={`$${member.directInterestPayment}`} accent="gold" />
        <Stat label="Loan owing" value={`$${member.owing}`} />
        <Stat label="Interest owing" value={`$${member.interestOwing}`} />
        <Stat label="Total owing" value={`$${member.totalOwing}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          {canManage ? (
            <>
              <TransactionForm clubId={clubId} memberId={memberId} onDone={load} />
              <InterestPoolForm clubId={clubId} memberId={memberId} onDone={load} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-charcoal-300 p-6 text-center text-sm text-charcoal-500 dark:border-charcoal-700 dark:text-charcoal-400">
              {member.withdrawnAt
                ? 'This member has withdrawn — no further transactions can be recorded.'
                : 'Only the club owner or treasurer can record transactions.'}
            </div>
          )}
        </div>

        {isOwner && (
          <div className="rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900">
            <p className="font-medium text-charcoal-900 dark:text-white">Manage member</p>
            <div className="mt-3 flex flex-col gap-2">
              <ToggleTreasurerButton clubId={clubId} memberId={memberId} member={member} onDone={load} />
              {!member.withdrawnAt && (
                <button
                  type="button"
                  disabled={isSelfOwner}
                  onClick={() => setConfirmAction('withdraw')}
                  title={isSelfOwner ? 'Transfer ownership before withdrawing yourself' : undefined}
                  className="rounded-full border border-gold-300 py-2.5 text-sm font-semibold text-gold-700 hover:bg-gold-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gold-500/30 dark:text-gold-400 dark:hover:bg-gold-500/10"
                >
                  Withdraw member
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmAction('remove')}
                className="rounded-full border border-red-200 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Remove from club
              </button>
            </div>
            {isSelfOwner && (
              <p className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">
                You're the club owner — transfer ownership before you can withdraw.
              </p>
            )}
          </div>
        )}
      </div>

      {confirmAction === 'withdraw' && (
        <ConfirmDialog
          title="Withdraw member"
          danger={false}
          confirmLabel="Withdraw"
          body={
            <p>
              This refunds <strong>{member.username}</strong>'s total investment (${member.totalInvestment}) minus
              the club's early withdrawal penalty (${club.earlyWithdrawalPenalty}), and marks them as withdrawn.
              This can't be undone.
            </p>
          }
          onClose={() => setConfirmAction(null)}
          onConfirm={async () => {
            await api.withdrawMember(clubId, memberId)
            load()
          }}
        />
      )}

      {confirmAction === 'remove' && (
        <ConfirmDialog
          title="Remove member"
          danger
          confirmLabel="Remove"
          body={
            <p>
              This permanently removes <strong>{member.username}</strong> from the club. Use this to correct a
              mistake — for a member who has been contributing, use Withdraw instead so their payout is calculated.
            </p>
          }
          onClose={() => setConfirmAction(null)}
          onConfirm={async () => {
            await api.removeMember(clubId, memberId)
            navigate(`/clubs/${clubId}`)
          }}
        />
      )}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'gold' }) {
  return (
    <div className="rounded-2xl border border-charcoal-200 bg-white p-3.5 dark:border-charcoal-800 dark:bg-charcoal-900">
      <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">{label}</p>
      <p
        className={`mt-1 text-base font-bold ${
          accent === 'gold' ? 'text-gold-600 dark:text-gold-400' : 'text-charcoal-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function TransactionForm({ clubId, memberId, onDone }: { clubId: string; memberId: string; onDone: () => void }) {
  const [type, setType] = useState<TransactionType>('invest')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState(currentPeriod())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      const numericAmount = Number(amount)
      const body = {
        period,
        investAmount: type === 'invest' ? numericAmount : undefined,
        loanAmount: type === 'loan' ? numericAmount : undefined,
        payLoanAmount: type === 'payLoan' ? numericAmount : undefined,
        interestAmount: type === 'interest' ? numericAmount : undefined,
      }
      await api.recordTransaction(clubId, memberId, body)
      setAmount('')
      setSuccess('Transaction recorded.')
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900"
    >
      <p className="font-medium text-charcoal-900 dark:text-white">Record transaction</p>

      <select
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType)}
        className="w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
      >
        {TRANSACTION_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tx-amount" className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
            Amount ($)
          </label>
          <input
            id="tx-amount"
            type="number"
            min={1}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="tx-period" className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
            Period (MM-YYYY)
          </label>
          <input
            id="tx-period"
            type="text"
            required
            pattern="\d{2}-\d{4}"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Recording…' : 'Record transaction'}
      </button>
    </form>
  )
}

function InterestPoolForm({ clubId, memberId, onDone }: { clubId: string; memberId: string; onDone: () => void }) {
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setIsSubmitting(true)
    try {
      const res = await api.payInterestPool(clubId, memberId, Number(amount))
      setAmount('')
      setResult(
        res.qualifiesForBonus
          ? `Recorded — now qualifies for the year-end interest share (total direct payment: $${res.totalDirectPayment}).`
          : `Recorded — total direct payment: $${res.totalDirectPayment} (needs $25 to qualify).`,
      )
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900"
    >
      <p className="font-medium text-charcoal-900 dark:text-white">Pay into interest pool</p>
      <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
        Members need $25 in interest (earned or paid directly) to qualify for the year-end interest share.
      </p>
      <div className="flex gap-3">
        <input
          type="number"
          min={1}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount ($)"
          className="flex-1 rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-gold-500 px-5 text-sm font-semibold text-charcoal-900 hover:bg-gold-400 disabled:opacity-60"
        >
          {isSubmitting ? '…' : 'Pay'}
        </button>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {result && (
        <p className="rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-700 dark:bg-gold-500/10 dark:text-gold-400">
          {result}
        </p>
      )}
    </form>
  )
}

function ToggleTreasurerButton({
  clubId,
  memberId,
  member,
  onDone,
}: {
  clubId: string
  memberId: string
  member: Member
  onDone: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClick = async () => {
    setIsSubmitting(true)
    try {
      await api.toggleTreasurer(clubId, memberId)
      onDone()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className="rounded-full border border-charcoal-300 py-2.5 text-sm font-semibold text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-60 dark:border-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
    >
      {member.isTreasurer ? 'Remove treasurer role' : 'Make treasurer'}
    </button>
  )
}
