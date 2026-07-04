import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom'
import Login from './pages/Login'
import RechargeRecords from './pages/RechargeRecords'
import Dashboard from './pages/Dashboard'
import UserSearch from './pages/UserSearch'
import AdminLogs from './pages/AdminLogs'
import Withdrawals from './pages/Withdrawals'
import Transactions from './pages/Transactions'
import BetRecords from './pages/BetRecords'
import Settings from './pages/Settings'
import AgencyDashboard from './pages/AgencyDashboard'
import WingoDashboard from './pages/WingoDashboard'
import Sidebar from './components/Sidebar'
import TagsView from './components/TagsView'
import { titleMap } from './components/TagsView'
import type { TagItem } from './components/TagsView'
import { ExportBarProvider } from './components/ExportBarContext'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { watchAutoComplete, stopAutoComplete } from './utils/autocomplete'
import './App.css'

function ProtectedLayoutContent({ onLogout }: { onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [autoFillOff, setAutoFillOff] = useState(() => localStorage.getItem('autoFillOff') === 'true')
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('autoFillOff', String(autoFillOff))
    const target = document.querySelector('.main-area')
    if (target) watchAutoComplete(target as HTMLElement, autoFillOff)
    return stopAutoComplete
  }, [autoFillOff])

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
              <svg viewBox="0 0 1024 1024" className="hamburger">
                <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"></path>
              </svg>
            </button>
            <div className="breadcrumb" aria-label="Breadcrumb" role="navigation">
              <span className="breadcrumb__item">
                <Link to="/dashboard" className="breadcrumb__link">Homepage</Link>
                <span className="breadcrumb__separator">/</span>
              </span>
              <span className="breadcrumb__item breadcrumb__item--active">
                <span className="breadcrumb__text">{titleMap[location.pathname] || 'Dashboard'}</span>
              </span>
            </div>
          </div>
          <div className="header-right">
            <button className="header-btn-icon" onClick={() => setAutoFillOff((p) => !p)} aria-label="Toggle autocomplete suggestions" title={autoFillOff ? 'Autocomplete OFF' : 'Autocomplete ON'} style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              {autoFillOff && <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />}
            </button>
            <button className="header-btn-icon" onClick={() => setDarkMode((p) => !p)} aria-label="Toggle dark mode" title="Toggle dark mode">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {darkMode
                  ? <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                  : <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                }
              </svg>
            </button>
            <div className="avatar-container">
              <span className="user-icon">👤</span>
              <span className="user-name">GM12</span>
            </div>
            <button className="btn-logout-header" onClick={onLogout} title="Logout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>
          <TagsView tags={tags} onClose={handleTagClose} />
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
                <Route path="/settings" element={<Settings />} />
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
    <ToastProvider>
      <ExportBarProvider>
        <ProtectedLayoutContent onLogout={onLogout} />
      </ExportBarProvider>
    </ToastProvider>
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

  useEffect(() => {
    const handler = () => setToken(null)
    window.addEventListener('session-expired', handler)
    return () => window.removeEventListener('session-expired', handler)
  }, [])

  const handleLogin = (newToken: string) => {
    setToken(newToken)
    window.location.reload()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/login')
  }

  if (!checked) return null

  return (
    <>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/recharge" replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/*" element={token ? <ProtectedLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
