interface Props {
  show: boolean
  onLogin: () => void
}

export default function SessionExpiredDialog({ show, onLogin }: Props) {
  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div className="login-card" style={{ textAlign: 'center' }}>
        <h1>Session Expired</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
          Your session has expired.<br />Please login again to continue.
        </p>
        <button
          className="btn-filled"
          style={{ width: '100%' }}
          onClick={onLogin}
        >
          Login
        </button>
      </div>
    </div>
  )
}
