import { useState } from 'react'
import axios from 'axios'
import { searchUser, searchUserByMobile } from '../api/users'
import type { UserData } from '../api/users'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

function statusBadge(status: string): string {
  switch (status) {
    case 'active': return 'badge--success'
    case 'suspended': return 'badge--warning'
    case 'blocked':
    case 'inactive': return 'badge--danger'
    default: return 'badge--info'
  }
}

export default function UserSearch() {
  const [userId, setUserId] = useState('')
  const [mobile, setMobile] = useState('')
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setError(null)
    setUser(null)

    if (!userId.trim() && !mobile.trim()) {
      setError('Please fill in at least one field')
      return
    }

    setLoading(true)
    try {
      const result = userId.trim()
        ? await searchUser(userId.trim())
        : await searchUserByMobile(mobile.trim())
      setUser(result)
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content">
      <div className="filters-bar">
        <div className="filter-group">
          <label>User ID</label>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="filter-group">
          <label>Mobile</label>
          <input
            type="text"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={handleSearch} disabled={loading || (!userId.trim() && !mobile.trim())}
              style={{ opacity: loading || (!userId.trim() && !mobile.trim()) ? 0.6 : 1 }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setMobile(''); setUser(null); setError(null) }}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: '13px', margin: 'var(--space-3)' }}>
          {error}
        </div>
      )}

      {user && (
        <div className="card" style={{ margin: 'var(--space-3)' }}>
          <div className="card__header">
            <span className="card__title">User Profile</span>
            <span className={`badge ${statusBadge(user.status)}`}>{user.status}</span>
          </div>
          <div style={{ padding: 'var(--space-6) var(--space-7)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', fontSize: '13px' }}>
            <div><strong>User ID:</strong> {user.userId}</div>
            <div><strong>Mobile:</strong> {user.mobile}</div>
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Balance:</strong> {user.balance.toLocaleString()}</div>
            <div><strong>Status:</strong> {user.status}</div>
            <div><strong>Created:</strong> {user.createdAt}</div>
          </div>
        </div>
      )}
    </div>
  )
}
