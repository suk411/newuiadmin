import { useEffect, useState } from 'react'
import './Toast.css'

export interface ToastMsg {
  id: number
  text: string
  type?: 'error' | 'success'
  action?: { label: string; onClick: () => void }
}

interface Props {
  toasts: ToastMsg[]
  onRemove: (id: number) => void
}

function ToastItem({ toast, onRemove }: { toast: ToastMsg; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false)
  const [collapsing, setCollapsing] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setCollapsing(true), 300)
      setTimeout(() => onRemove(toast.id), 600)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const isSuccess = toast.type === 'success'
  const cls = `toast-item ${isSuccess ? 'toast-item--success' : 'toast-item--error'} ${visible ? 'toast-item--visible' : ''}`

  return (
    <div
      className={cls}
      role="alert"
      style={{
        maxHeight: collapsing ? 0 : 120,
        marginBottom: collapsing ? 0 : 10,
        padding: collapsing ? '0 15px' : '15px 15px 15px 20px',
        overflow: 'hidden',
        transition: 'opacity 0.3s, transform 0.3s, max-height 0.3s, margin-bottom 0.3s, padding 0.3s',
      }}
    >
      {isSuccess ? (
        <svg viewBox="0 0 1024 1024" className="toast-icon">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" />
        </svg>
      ) : (
        <svg viewBox="0 0 1024 1024" className="toast-icon">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-47.2 47.2L512 611.2 393.8 729.4l-47.2-47.2L464.8 564 346.6 445.8l47.2-47.2L512 516.8l118.2-118.2 47.2 47.2L559.2 564l118.2 118.2z" />
        </svg>
      )}
      <span className="toast-text">{toast.text}</span>
      {toast.action && (
        <button className="toast-action" onClick={() => { toast.action!.onClick(); onRemove(toast.id) }}>{toast.action.label}</button>
      )}
    </div>
  )
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
