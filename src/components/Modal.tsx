import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal-900/50 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border border-charcoal-200 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6 dark:border-charcoal-800 dark:bg-charcoal-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-charcoal-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-charcoal-400 hover:bg-charcoal-100 hover:text-charcoal-700 dark:hover:bg-charcoal-800 dark:hover:text-charcoal-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L10.94 12l-5.72 5.72a.75.75 0 1 0 1.06 1.06L12 13.06l5.72 5.72a.75.75 0 1 0 1.06-1.06L13.06 12l5.72-5.72a.75.75 0 0 0-1.06-1.06L12 10.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
