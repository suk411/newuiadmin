import { useState, useEffect, useCallback } from 'react'

interface AnimatedDialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function AnimatedDialog({ open, onClose, title, children, footer }: AnimatedDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [animClass, setAnimClass] = useState('')

  useEffect(() => {
    if (open) {
      setMounted(true)
      const raf = requestAnimationFrame(() => setAnimClass('enter'))
      return () => cancelAnimationFrame(raf)
    } else if (mounted) {
      setAnimClass('exit')
      const timer = setTimeout(() => {
        setMounted(false)
        setAnimClass('')
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleOverlayClick = useCallback(() => {
    if (animClass !== 'exit') onClose()
  }, [animClass, onClose])

  if (!mounted) return null

  return (
    <div className={`dialog-overlay${animClass ? ` dialog-overlay--${animClass}` : ''}`} onClick={handleOverlayClick}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`dialog${animClass ? ` dialog--${animClass}` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__header">
          <h3 id="dialog-title" className="dialog__title">{title}</h3>
          <button className="btn-outline dialog__close" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        <div className="dialog__body">{children}</div>
        {footer && <div className="dialog__footer">{footer}</div>}
      </div>
    </div>
  )
}
