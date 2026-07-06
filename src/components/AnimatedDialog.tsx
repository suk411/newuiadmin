import { useState, useEffect, useCallback, useRef } from 'react'

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
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
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

  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) focusable[0].focus()
    }
    if (!open && previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  const handleOverlayClick = useCallback(() => {
    if (animClass !== 'exit') onClose()
  }, [animClass, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
  }, [onClose])

  if (!mounted) return null

  return (
    <div className={`dialog-overlay${animClass ? ` dialog-overlay--${animClass}` : ''}`} onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`dialog${animClass ? ` dialog--${animClass}` : ''}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
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
