import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { paletteForString } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { CLUB_LIMITS } from '../lib/clubLimits'
import { useClubRole } from '../lib/roles'
import type { Club, Member } from '../types'

export default function ClubDetail() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [club, setClub] = useState<(Club & { members?: Member[] }) | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const load = () => {
    if (!id) return
    setIsLoading(true)
    Promise.all([api.getClub(id), api.getMembers(id)])
      .then(([clubRes, membersRes]) => {
        setClub(clubRes)
        setMembers(membersRes)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load this club'))
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [id])

  const { isOwner, isTreasurer } = useClubRole(club, members, user)

  // Only show the full loading state on first load — re-fetches after a mutation (via
  // `load()`) should update in place, not unmount the tree and reset local UI state
  // (collapsed sections, in-form success messages) on every action.
  if (isLoading && !club) return <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Loading club…</p>
  if (error)
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </p>
    )
  if (!club || !id) return null

  return (
    <div>
      <Link to="/clubs" className="text-sm font-medium text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200">
        ← My Clubs
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-charcoal-900 sm:text-3xl dark:text-white">{club.title}</h1>
        {isOwner && (
          <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-700 dark:bg-navy-500/15 dark:text-navy-300">
            Owner
          </span>
        )}
        {!isOwner && isTreasurer && (
          <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-700 dark:bg-gold-500/15 dark:text-gold-400">
            Treasurer
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Monthly" value={`$${club.monthlyContribution}`} />
        <Stat label="Duration" value={`${club.durationMonths} mo`} />
        <Stat label="Interest" value={`${club.interestRate}%`} accent="gold" />
        <Stat label="Lending limit" value={`$${club.lendingLimit}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-charcoal-200 bg-white dark:border-charcoal-800 dark:bg-charcoal-900">
            <div className="flex items-center justify-between p-5 pb-0">
              <h2 className="text-lg font-semibold text-charcoal-900 dark:text-white">Members ({members.length})</h2>
            </div>

            <div className="mt-4 divide-y divide-charcoal-200 dark:divide-charcoal-800">
              {members.length === 0 && (
                <p className="p-5 text-sm text-charcoal-500 dark:text-charcoal-400">No members yet.</p>
              )}
              {members.map((member) => (
                <Link
                  key={member.id}
                  to={`/clubs/${id}/members/${member.id}`}
                  className="flex items-center gap-3 p-4 transition hover:bg-charcoal-50 sm:px-5 dark:hover:bg-charcoal-800/60"
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${paletteForString(member.username)} text-xs font-bold text-white`}
                  >
                    {member.username.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-charcoal-900 dark:text-white">
                      {member.username}
                      {member.isTreasurer && (
                        <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700 dark:bg-gold-500/15 dark:text-gold-400">
                          Treasurer
                        </span>
                      )}
                      {member.withdrawnAt && (
                        <span className="rounded-full bg-charcoal-200 px-2 py-0.5 text-[11px] font-semibold text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300">
                          Withdrawn
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                      Invested ${member.totalInvestment} · Owing ${member.totalOwing}
                    </p>
                  </div>
                  <span aria-hidden className="text-charcoal-300 dark:text-charcoal-600">
                    →
                  </span>
                </Link>
              ))}
            </div>

            {isOwner && (
              <div className="border-t border-charcoal-200 p-4 sm:p-5 dark:border-charcoal-800">
                <AddMemberForm clubId={id} onDone={load} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to={`/clubs/${id}/payout`}
            className="flex items-center justify-between rounded-2xl border border-gold-200 bg-gold-50 p-4 text-sm font-semibold text-gold-800 hover:bg-gold-100 dark:border-gold-500/20 dark:bg-gold-500/10 dark:text-gold-300 dark:hover:bg-gold-500/15"
          >
            Year-end payout calculator
            <span aria-hidden>→</span>
          </Link>

          {isTreasurer && <TreasurerTools clubId={id} onDone={load} />}
          {isOwner && <OwnershipTransfer clubId={id} ownerId={club.userId} members={members} onDone={load} />}
          {isOwner && (
            <ClubSettingsForm club={club} onSaved={load} onDeleteRequest={() => setShowDeleteConfirm(true)} />
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete club"
          danger
          confirmLabel="Delete club"
          body={<p>This permanently deletes <strong>{club.title}</strong> and all its members. This can't be undone.</p>}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            await api.deleteClub(id)
            navigate('/clubs')
          }}
        />
      )}
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

function TreasurerTools({ clubId, onDone }: { clubId: string; onDone: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isAccruing, setIsAccruing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckMissed = async () => {
    setIsChecking(true)
    setError(null)
    setMessage(null)
    try {
      const res = await api.checkMissedPayments(clubId)
      setMessage(
        res.missedCount !== undefined
          ? `${res.message} — ${res.missedCount} missed, ${res.loanedCount ?? 0} auto-loaned for ${res.period}.`
          : `${res.message} (period ${res.period})`,
      )
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not check missed payments')
    } finally {
      setIsChecking(false)
    }
  }

  const handleAccrue = async () => {
    setIsAccruing(true)
    setError(null)
    setMessage(null)
    try {
      const res = await api.accrueInterest(clubId)
      setMessage(`${res.message} — $${res.totalInterestAccrued} across ${res.members.length} member(s) for ${res.period}.`)
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not accrue interest')
    } finally {
      setIsAccruing(false)
    }
  }

  return (
    <div className="rounded-2xl border border-charcoal-200 bg-white dark:border-charcoal-800 dark:bg-charcoal-900">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="font-medium text-charcoal-900 dark:text-white">Treasurer tools</span>
        <span className={`text-charcoal-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden>
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="space-y-3 border-t border-charcoal-200 p-5 dark:border-charcoal-800">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleCheckMissed}
              disabled={isChecking}
              className="flex-1 rounded-full border border-charcoal-300 py-2.5 text-sm font-semibold text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-60 dark:border-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
            >
              {isChecking ? 'Checking…' : 'Check missed payments'}
            </button>
            <button
              type="button"
              onClick={handleAccrue}
              disabled={isAccruing}
              className="flex-1 rounded-full border border-charcoal-300 py-2.5 text-sm font-semibold text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-60 dark:border-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
            >
              {isAccruing ? 'Accruing…' : 'Accrue interest'}
            </button>
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function AddMemberForm({ clubId, onDone }: { clubId: string; onDone: () => void }) {
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await api.addMember(clubId, username)
      setUsername('')
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add member')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add member by username"
          className="flex-1 rounded-full border border-charcoal-300 bg-white px-4 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  )
}

function OwnershipTransfer({
  clubId,
  ownerId,
  members,
  onDone,
}: {
  clubId: string
  ownerId: string
  members: Member[]
  onDone: () => void
}) {
  const [targetId, setTargetId] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeMembers = members.filter((m) => !m.withdrawnAt)
  const transferCandidates = activeMembers.filter((m) => m.userId !== ownerId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!targetId) return
    setError(null)
    setIsSubmitting(true)
    try {
      await api.transferOwnership(clubId, targetId)
      setIsOpen(false)
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not transfer ownership')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (activeMembers.length <= 1) return null

  return (
    <div className="rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900">
      <button type="button" onClick={() => setIsOpen((v) => !v)} className="w-full text-left">
        <p className="font-medium text-charcoal-900 dark:text-white">Transfer ownership</p>
        <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
          Hand the club to another active member. They become the new treasurer.
        </p>
      </button>
      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            required
            className="flex-1 rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
          >
            <option value="">Select new owner…</option>
            {transferCandidates.map((m) => (
              <option key={m.id} value={m.userId}>
                {m.username}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting || !targetId}
            className="rounded-full bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Transferring…' : 'Transfer'}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

function ClubSettingsForm({
  club,
  onSaved,
  onDeleteRequest,
}: {
  club: Club
  onSaved: () => void
  onDeleteRequest: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(club.title)
  const [monthlyContribution, setMonthlyContribution] = useState(club.monthlyContribution)
  const [interestRate, setInterestRate] = useState(club.interestRate)
  const [paymentDay, setPaymentDay] = useState(club.paymentDay)
  const [gracePeriodDays, setGracePeriodDays] = useState(club.gracePeriodDays)
  const [earlyWithdrawalPenalty, setEarlyWithdrawalPenalty] = useState(club.earlyWithdrawalPenalty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await api.updateClub(club.id, {
        title,
        monthlyContribution,
        interestRate,
        paymentDay,
        gracePeriodDays,
        earlyWithdrawalPenalty,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-charcoal-200 bg-white dark:border-charcoal-800 dark:bg-charcoal-900">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="font-medium text-charcoal-900 dark:text-white">Club settings</span>
        <span className={`text-charcoal-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden>
          ▾
        </span>
      </button>
      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-charcoal-200 p-5 dark:border-charcoal-800">
          <div>
            <label htmlFor="settings-title" className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
              Club name
            </label>
            <input
              id="settings-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={`Monthly $ (${CLUB_LIMITS.monthlyContribution.min}-${CLUB_LIMITS.monthlyContribution.max})`}
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              min={CLUB_LIMITS.monthlyContribution.min}
              max={CLUB_LIMITS.monthlyContribution.max}
            />
            <NumberField
              label={`Interest % (${CLUB_LIMITS.interestRate.min}-${CLUB_LIMITS.interestRate.max})`}
              value={interestRate}
              onChange={setInterestRate}
              min={CLUB_LIMITS.interestRate.min}
              max={CLUB_LIMITS.interestRate.max}
            />
            <NumberField label="Payment day (1-31)" value={paymentDay} onChange={setPaymentDay} min={1} max={31} />
            <NumberField
              label={`Grace days (${CLUB_LIMITS.gracePeriodDays.min}-${CLUB_LIMITS.gracePeriodDays.max})`}
              value={gracePeriodDays}
              onChange={setGracePeriodDays}
              min={CLUB_LIMITS.gracePeriodDays.min}
              max={CLUB_LIMITS.gracePeriodDays.max}
            />
            <NumberField
              label={`Withdrawal penalty $ (${CLUB_LIMITS.earlyWithdrawalPenalty.min}-${CLUB_LIMITS.earlyWithdrawalPenalty.max})`}
              value={earlyWithdrawalPenalty}
              onChange={setEarlyWithdrawalPenalty}
              min={CLUB_LIMITS.earlyWithdrawalPenalty.min}
              max={CLUB_LIMITS.earlyWithdrawalPenalty.max}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save settings'}
            </button>
            <button
              type="button"
              onClick={onDeleteRequest}
              className="flex-1 rounded-full border border-red-200 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Delete club
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}) {
  return (
    <div>
      <label className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        required
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
      />
    </div>
  )
}
