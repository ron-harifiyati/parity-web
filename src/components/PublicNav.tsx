import { Link, useNavigate } from 'react-router-dom'

export function PublicNav() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-200/70 bg-white/80 backdrop-blur-md dark:border-charcoal-800/70 dark:bg-charcoal-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary-500 to-navy-600 text-sm font-bold text-white">
            P
          </span>
          <span className="text-lg font-bold tracking-tight text-charcoal-900 dark:text-white">Parity</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="hidden text-sm font-medium text-charcoal-600 transition hover:text-charcoal-900 sm:block dark:text-charcoal-300 dark:hover:text-white"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition hover:bg-primary-700"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  )
}
