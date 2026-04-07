import { useEffect } from 'react'

type FeedbackModalProps = {
  open: boolean
  kind: 'success' | 'error'
  title: string
  message: string
  onClose: () => void
}

export default function FeedbackModal({ open, kind, title, message, onClose }: FeedbackModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="feedback-overlay" role="presentation" onClick={onClose}>
      <section
        className={`feedback-modal glass feedback-${kind}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        aria-describedby="feedback-modal-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="feedback-modal-header">
          <span className="eyebrow">{kind === 'success' ? 'Success' : 'Error'}</span>
          <button type="button" className="ghost-btn feedback-close" onClick={onClose} aria-label="Close message">
            ×
          </button>
        </div>

        <h3 id="feedback-modal-title">{title}</h3>
        <p id="feedback-modal-message">{message}</p>

        <div className="feedback-modal-actions">
          <button type="button" onClick={onClose} className="feedback-dismiss">
            Close
          </button>
        </div>
      </section>
    </div>
  )
}

