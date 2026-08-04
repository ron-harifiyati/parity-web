import { useState } from 'react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  title: string
  body: React.ReactNode
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => Promise<void> | void
  onClose: () => void
}

export function ConfirmDialog({ title, body, confirmLabel = 'Confirm', danger, onConfirm, onClose }: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-sm text-charcoal-600 dark:text-charcoal-300">{body}</div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full border border-charcoal-300 py-2.5 text-sm font-semibold text-charcoal-700 hover:bg-charcoal-50 dark:border-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isSubmitting ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
