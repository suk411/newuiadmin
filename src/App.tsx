import { useState, useEffect } from 'react'
import Login from './pages/Login'
import RechargeRecords from './pages/RechargeRecords'
import './App.css'

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) setToken(stored)
    setChecked(true)
  }, [])

  const handleLogin = (newToken: string) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!checked) return null

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '6px 20px',
        borderBottom: '1px solid var(--color-border)',
        gap: '10px',
        fontSize: '12px',
      }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Admin</span>
        <button
          className="btn-filled-2"
          onClick={handleLogout}
          style={{ cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      <RechargeRecords />
    </main>
  )
}
