import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
      : 'text-charcoal-600 hover:text-charcoal-900 dark:text-charcoal-300 dark:hover:text-white'
  }`

const tabClasses = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition ${
    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-charcoal-500 dark:text-charcoal-400'
  }`

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5.5">
      <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </svg>
  )
}

function ClubsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5.5">
      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5.5">
      <path
        fillRule="evenodd"
        d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function AppLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-950">
      <header className="sticky top-0 z-40 border-b border-charcoal-200/70 bg-white/80 backdrop-blur-md dark:border-charcoal-800/70 dark:bg-charcoal-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary-500 to-navy-600 text-sm font-bold text-white">
                P
              </span>
              <span className="text-lg font-bold tracking-tight text-charcoal-900 dark:text-white">Parity</span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink to="/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>
              <NavLink to="/clubs" className={navLinkClasses}>
                My Clubs
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/settings"
              aria-label="Settings and profile"
              className="hidden size-9 place-items-center rounded-full bg-navy-600 text-sm font-semibold text-white transition hover:bg-navy-700 sm:grid"
            >
              {initials(user?.username ?? '?')}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar — most users are on mobile, so this (not the header) is primary nav there */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-charcoal-200 bg-white/95 backdrop-blur-md sm:hidden dark:border-charcoal-800 dark:bg-charcoal-950/95">
        <NavLink to="/dashboard" className={tabClasses} end>
          <DashboardIcon />
          Dashboard
        </NavLink>
        <NavLink to="/clubs" className={tabClasses}>
          <ClubsIcon />
          Clubs
        </NavLink>
        <NavLink to="/settings" className={tabClasses}>
          <span className="grid size-5.5 place-items-center">
            <SettingsIcon />
          </span>
          {user?.username ?? 'Settings'}
        </NavLink>
      </nav>
    </div>
  )
}
