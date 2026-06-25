import { useEffect } from 'react'

export interface ToastMsg {
  id: number
  text: string
}

interface Props {
  toasts: ToastMsg[]
  onRemove: (id: number) => void
}

let toastId = 0
export function nextId() { return ++toastId }

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMsg; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div className="toast" onClick={() => onRemove(toast.id)}>
      {toast.text}
    </div>
  )
}
