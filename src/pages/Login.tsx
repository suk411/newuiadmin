import { useState } from 'react'
import { loginAdmin } from '../api/auth'
import Spinner from '../components/Spinner'
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
        background: `#000 url(${bgLogo}) center / cover no-repeat`,
      }}
    >
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>

        <div className="login-field">
          <label htmlFor="login-mobile">Mobile</label>
          <input
            id="login-mobile"
            type="text"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            autoComplete="username"
            aria-required="true"
          />
        </div>

        <div className="login-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-required="true"
          />
        </div>

        <button type="submit" className="btn-filled btn--full" disabled={loading} aria-busy={loading}>
          {loading ? <Spinner /> : 'Sign In'}
        </button>

        {error && <div className="login-error" role="alert">{error}</div>}
      </form>
    </div>
  )
}
