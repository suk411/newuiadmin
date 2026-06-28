import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import RechargeRecords from './pages/RechargeRecords'
import Dashboard from './pages/Dashboard'
import UserSearch from './pages/UserSearch'
import AdminLogs from './pages/AdminLogs'
import Withdrawals from './pages/Withdrawals'
import Transactions from './pages/Transactions'
import BetRecords from './pages/BetRecords'
import GiftCodes from './pages/GiftCodes'
import VipConfig from './pages/VipConfig'
import TurnoverConfig from './pages/TurnoverConfig'
import AgencyDashboard from './pages/AgencyDashboard'
import WingoDashboard from './pages/WingoDashboard'
import Sidebar from './components/Sidebar'
import TagsView from './components/TagsView'
import { titleMap } from './components/TagsView'
import type { TagItem } from './components/TagsView'
import { ErrorProvider, useError } from './contexts/ErrorContext'
import './App.css'

function ProtectedLayoutContent({ onLogout }: { onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const location = useLocation()
  const navigate = useNavigate()
  const { error, setError } = useError()

  useEffect(() => { setError(null) }, [location.pathname])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  const [tags, setTags] = useState<TagItem[]>(() => {
    try {
      const raw = sessionStorage.getItem('visitedTags')
      return raw ? (JSON.parse(raw) as TagItem[]) : [{ path: '/dashboard', title: 'Dashboard' }]
    } catch {
      return [{ path: '/dashboard', title: 'Dashboard' }]
    }
  })

  useEffect(() => {
    sessionStorage.setItem('visitedTags', JSON.stringify(tags))
  }, [tags])

  useEffect(() => {
    setTags((prev) => {
      if (prev.some((t) => t.path === location.pathname)) return prev
      return [...prev, { path: location.pathname, title: titleMap[location.pathname] || location.pathname }]
    })
  }, [location.pathname])

  const handleTagClose = useCallback((path: string) => {
    setTags((prev) => {
      const idx = prev.findIndex((t) => t.path === path)
      if (idx === -1) return prev
      return prev.filter((t) => t.path !== path)
    })
    if (path === location.pathname) {
      const remaining = tags.filter((t) => t.path !== path)
      navigate(remaining.length > 0 ? remaining[remaining.length - 1].path : '/dashboard')
    }
  }, [location.pathname, navigate])

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={() => setSidebarOpen(false)} />
      <div className="main-area">
        <header className="app-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-expanded={sidebarOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarOpen
                  ? <path d="M15 18l-6-6 6-6" />
                  : <path d="M9 18l6-6-6-6" />
                }
              </svg>
            </button>
            <span className="header-title">CS System</span>
          </div>
          <div className="header-right">
            <button className="btn-ghost-icon" aria-label="Refresh data" title="Refresh" onClick={() => window.location.reload()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
            <button
              className="btn-ghost-icon"
              onClick={() => setDarkMode((p) => !p)}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {darkMode
                  ? <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                  : <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                }
              </svg>
            </button>
            <span className="header-admin-label">Admin</span>
            <button className="btn-logout" onClick={onLogout} title="Logout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>
        <TagsView tags={tags} onClose={handleTagClose} />
        {error && <div className="error-banner"><span>{error}</span><button className="error-banner__close" onClick={() => setError(null)}>✕</button></div>}
        <main className="app-content">
          <div key={location.pathname} className="route-transition">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/recharge" element={<RechargeRecords />} />
              <Route path="/users" element={<UserSearch />} />
              <Route path="/logs" element={<AdminLogs />} />
              <Route path="/withdrawals" element={<Withdrawals />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/bets" element={<BetRecords />} />
              <Route path="/gift-codes" element={<GiftCodes />} />
              <Route path="/vip-config" element={<VipConfig />} />
              <Route path="/turnover-config" element={<TurnoverConfig />} />
              <Route path="/agency" element={<AgencyDashboard />} />
              <Route path="/wingo" element={<WingoDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

function ProtectedLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <ErrorProvider>
      <ProtectedLayoutContent onLogout={onLogout} />
    </ErrorProvider>
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
