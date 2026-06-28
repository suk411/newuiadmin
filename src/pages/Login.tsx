import { useState } from 'react'
import { loginAdmin } from '../api/auth'
import bgLogo from '../assets/bgLogo.png'

interface Props {
  onLogin: (token: string) => void
}

export default function Login({ onLogin }: Props) {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobile.trim() || !password.trim()) {
      setError('Please enter mobile and password')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await loginAdmin(mobile.trim(), password)
      localStorage.setItem('token', res.token)
      onLogin(res.token)
    } catch {
      setError('Invalid credentials or server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="login-page"
      style={{
        background: `var(--color-bg) url(${bgLogo}) center / cover no-repeat`,
      }}
    >
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>

        <div className="login-field">
          <label>Mobile</label>
          <input
            type="text"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="login-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-filled" style={{ width: '100%', marginTop: 'var(--space-5)' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  )
}
