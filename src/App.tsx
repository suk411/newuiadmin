import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import RechargeRecords from './pages/RechargeRecords'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/Sidebar'
import './App.css'

function ProtectedLayout({ onLogout }: { onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={() => setSidebarOpen(false)} />
      <div className="main-area">
        <header className="app-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={sidebarOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <span className="header-title">CS System</span>
            <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
              <input className="header-search" type="text" placeholder="Search order ID, user..." aria-label="Search recharge orders" />
            </div>
          </div>
          <div className="header-right">
            <button className="btn-ghost-icon" aria-label="Refresh data" title="Refresh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
            <span className="header-link">Need help?</span>
            <span className="header-admin-label">Admin</span>
            <button className="btn-filled-2" onClick={onLogout} style={{ cursor: 'pointer' }}>Logout</button>
          </div>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/recharge" replace />} />
            <Route path="/recharge" element={<RechargeRecords />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const navigate = useNavigate()

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
    navigate('/login')
  }

  if (!checked) return null

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/recharge" replace /> : <Login onLogin={handleLogin} />} />
      <Route path="/*" element={token ? <ProtectedLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
