import { useState } from 'react'
import axios from 'axios'
import { searchUser, searchUserByMobile } from '../api/users'
import type { UserData } from '../api/users'
import { formatDateTime12 } from '../utils/format'

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
      <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
        <div className="filter-group">
          <label>User ID</label>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Mobile</label>
          <input
            type="text"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading || (!userId.trim() && !mobile.trim())}
              style={{ opacity: loading || (!userId.trim() && !mobile.trim()) ? 0.6 : 1 }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setMobile(''); setUser(null); setError(null) }}>
              Reset
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: '13px', margin: 'var(--space-3)' }}>
          {error}
        </div>
      )}

      {user && (<>
        <div className="stat-cards" style={{ marginTop: 'var(--space-3)' }}>
          <section className="card">
            <div style={{ padding: 'var(--space-6) var(--space-7)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', fontSize: '13px' }}>
              <div>
                <div className="stat-card__label" style={{ marginBottom: 2 }}>User ID</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{user.userId}</div>
                <div style={{ marginTop: 4 }}><span className={`badge ${statusBadge(user.status)}`}>{user.status}</span></div>
              </div>
              <div>
                <div className="stat-card__label" style={{ marginBottom: 2 }}>Mobile</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#303133', lineHeight: 1.2 }}>{user.mobile}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>{user.vipLevel}</div>
              </div>
            </div>
          </section>
          <section className="card">
            <div style={{ padding: 'var(--space-6) var(--space-7)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', fontSize: '13px' }}>
              <div>
                <div className="stat-card__label" style={{ marginBottom: 2 }}>Balance</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{user.balance.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 10, color: '#67c23a', marginTop: 4 }}>Withdrawable: ₹{user.withdrawable.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="stat-card__label" style={{ marginBottom: 2 }}>Total Deposits</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{user.totalDeposits.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>Turnover: ₹{user.turnover_requirement.toLocaleString('en-IN')} / ₹{user.total_turnover_completed.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </section>
          <section className="card">
            <div style={{ padding: 'var(--space-6) var(--space-7)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', fontSize: '13px' }}>
              <div>
                <div className="stat-card__label" style={{ marginBottom: 2 }}>Last IP</div>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.lastIp}</div>
                {user.deviceInfo && <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>{user.deviceInfo.city}, {user.deviceInfo.region}</div>}
              </div>
              <div>
                <div className="stat-card__label" style={{ marginBottom: 2 }}>Created</div>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{formatDateTime12(user.createdAt)}</div>
              </div>
            </div>
          </section>
        </div>
      </>)}
    </div>
  )
}
