import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicNav } from '../components/PublicNav'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await register(username, email, password)
      navigate('/dashboard')
    } catch {
      // error is surfaced via context
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-charcoal-950">
      <PublicNav />
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-charcoal-900 dark:text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-charcoal-600 dark:text-charcoal-300">
            Set up your savings circle in a couple of minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                minLength={3}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-charcoal-300 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-charcoal-300 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-charcoal-300 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-white"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-600 dark:text-charcoal-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
