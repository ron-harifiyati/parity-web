import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

export default function Settings() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-charcoal-900 dark:text-white">Settings</h1>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-navy-600 text-lg font-semibold text-white">
          {initials(user?.username ?? '?')}
        </span>
        <div>
          <p className="font-semibold text-charcoal-900 dark:text-white">{user?.username}</p>
          {user?.email && <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{user.email}</p>}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-charcoal-200 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900">
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
        className="mt-5 w-full rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
      >
        Log out
      </button>
    </div>
  )
}
