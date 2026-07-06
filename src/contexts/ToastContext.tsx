import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import Toast from '../components/Toast'

interface ToastMsg {
  id: number
  text: string
  type: 'error' | 'success'
}

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastContextValue {
  toast: (text: string, type?: 'error' | 'success', action?: ToastAction) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

let toastId = 0
function nextId() { return ++toastId }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  const toast = useCallback((text: string, type: 'error' | 'success' = 'error', action?: ToastAction) => {
    const id = nextId()
    setToasts((prev) => [...prev, { id, text, type, action }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toast toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
