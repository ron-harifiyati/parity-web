import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { paletteForString, StarIcon, TrendingUpIcon, UsersIcon, WalletIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import type { Club } from '../types'

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

interface Stats {
  totalClubs: number
  ownedClubs: number
  treasurerClubs: number
  totalInvested: number
  totalOwing: number
}

export default function Profile() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!user) return
    api
      .getClubs()
      .then((clubs: Club[]) => {
        let ownedClubs = 0
        let treasurerClubs = 0
        let totalInvested = 0
        let totalOwing = 0
        for (const club of clubs) {
          const isOwner = club.userId === user.id
          const myMembership = club.members?.find((m) => m.userId === user.id)
          if (isOwner) ownedClubs++
          if (myMembership?.isTreasurer) treasurerClubs++
          if (myMembership) {
            totalInvested += myMembership.totalInvestment
            totalOwing += myMembership.totalOwing
          }
        }
        setStats({ totalClubs: clubs.length, ownedClubs, treasurerClubs, totalInvested, totalOwing })
      })
      .catch(() => {})
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <span
          className={`grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${paletteForString(user?.username ?? '?')} text-xl font-bold text-white`}
        >
          {initials(user?.username ?? '?')}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 sm:text-3xl dark:text-white">{user?.username}</h1>
          {user?.email && <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{user.email}</p>}
        </div>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<UsersIcon />} tone="navy" label="Clubs" value={String(stats.totalClubs)} />
          <StatCard
            icon={<StarIcon />}
            tone="gold"
            label="Owner / Treasurer"
            value={`${stats.ownedClubs} / ${stats.treasurerClubs}`}
          />
          <StatCard icon={<WalletIcon />} tone="primary" label="Total invested" value={`$${stats.totalInvested.toLocaleString()}`} />
          <StatCard
            icon={<TrendingUpIcon />}
            tone={stats.totalOwing > 0 ? 'red' : 'navy'}
            label="Total owing"
            value={`$${stats.totalOwing.toLocaleString()}`}
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          <PersonalInfoForm />
          <PasswordForm />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900">
            <p className="font-medium text-charcoal-900 dark:text-white">Appearance</p>
            <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">Choose how Parity looks on this device.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  theme === 'light'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'border-charcoal-300 text-charcoal-600 dark:border-charcoal-700 dark:text-charcoal-300'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  theme === 'dark'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'border-charcoal-300 text-charcoal-600 dark:border-charcoal-700 dark:text-charcoal-300'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

const TONE_CLASSES = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  navy: 'bg-navy-50 text-navy-600 dark:bg-navy-500/10 dark:text-navy-300',
  gold: 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: keyof typeof TONE_CLASSES
}) {
  return (
    <div className="rounded-2xl border border-charcoal-200 bg-white p-4 dark:border-charcoal-800 dark:bg-charcoal-900">
      <span className={`grid size-9 place-items-center rounded-xl ${TONE_CLASSES[tone]}`}>{icon}</span>
      <p className="mt-3 text-xs font-medium text-charcoal-500 dark:text-charcoal-400">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-charcoal-900 dark:text-white">{value}</p>
    </div>
  )
}

function PersonalInfoForm() {
  const { user, updateProfile } = useAuth()
  const [username, setUsername] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // On a refreshed session the JWT-derived user has no email yet — sync once
  // AuthContext hydrates the full profile from GET /users/me.
  useEffect(() => {
    if (!user) return
    setUsername(user.username)
    setEmail(user.email ?? '')
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)
    try {
      await updateProfile({ username, email })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900"
    >
      <p className="font-medium text-charcoal-900 dark:text-white">Personal info</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-username" className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
            Username
          </label>
          <input
            id="profile-username"
            required
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          Profile updated.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

function PasswordForm() {
  const { updateProfile } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setIsSubmitting(true)
    try {
      await updateProfile({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900"
    >
      <p className="font-medium text-charcoal-900 dark:text-white">Change password</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="current-password" className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-charcoal-300 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-950 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          Password changed.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Saving…' : 'Change password'}
      </button>
    </form>
  )
}
