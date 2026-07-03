import bgLogo from '../assets/bgLogo.png'

interface Props {
  show: boolean
}

export default function SessionExpiredDialog({ show }: Props) {
  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#000',
      }}
    >
      <div
        style={{
          background: `url(${bgLogo}) center / cover no-repeat`,
          position: 'absolute', inset: 0, opacity: 0.5,
        }}
      />
      <div className="login-card" style={{ position: 'relative', textAlign: 'center' }}>
        <h1>Session Expired</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
          Your session has expired.<br />Please login again to continue.
        </p>
        <button
          className="btn-filled"
          style={{ width: '100%' }}
          onClick={() => { window.location.href = '/#/login' }}
        >
          Login
        </button>
      </div>
    </div>
  )
}
