import { useState } from 'react'
import { loginAdmin } from '../api/auth'

interface Props {
  onLogin: (token: string) => void
}

export default function Login({ onLogin }: Props) {
  const [number, setNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!number.trim() || !password.trim()) {
      setError('Please enter number and password')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await loginAdmin(number.trim(), password)
      localStorage.setItem('token', res.token)
      onLogin(res.token)
    } catch {
      setError('Invalid credentials or server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>

        <div className="login-field">
          <label>Number</label>
          <input
            type="text"
            placeholder="Enter your number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
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

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  )
}
