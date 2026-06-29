import { useEffect, useState } from 'react'

export interface ToastMsg {
  id: number
  text: string
  type?: 'error' | 'success'
}

interface Props {
  toasts: ToastMsg[]
  onRemove: (id: number) => void
}

const style: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 380,
    padding: '15px 15px 15px 20px',
    backgroundColor: '#fef0f0',
    border: '1px solid #fde2e2',
    borderRadius: 4,
    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
    pointerEvents: 'auto',
    marginBottom: 10,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: 14,
    lineHeight: 1.2,
    color: '#f56c6c',
  },
  toastSuccess: {
    backgroundColor: '#f0f9eb',
    border: '1px solid #e1f3d8',
    color: '#67c23a',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
    fill: '#f56c6c',
    flexShrink: 0,
  },
  iconSuccess: {
    fill: '#67c23a',
  },
  msg: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.2,
    color: '#f56c6c',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  msgSuccess: {
    color: '#67c23a',
  },
}

const errorIcon = (
  <svg viewBox="0 0 1024 1024" style={style.icon}>
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-47.2 47.2L512 611.2 393.8 729.4l-47.2-47.2L464.8 564 346.6 445.8l47.2-47.2L512 516.8l118.2-118.2 47.2 47.2L559.2 564l118.2 118.2z" />
  </svg>
)

const successIcon = (
  <svg viewBox="0 0 1024 1024" style={{ ...style.icon, ...style.iconSuccess }}>
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" />
  </svg>
)

function ToastItem({ toast, onRemove }: { toast: ToastMsg; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const isSuccess = toast.type === 'success'

  return (
    <div
      style={{
        ...style.toast,
        ...(isSuccess ? style.toastSuccess : {}),
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 0.3s, transform 0.3s',
      }}
    >
      {isSuccess ? successIcon : errorIcon}
      {toast.text}
    </div>
  )
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div style={style.container}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
