import { useState, useMemo } from 'react'
import axios from 'axios'
import { searchUser, searchUserByMobile } from '../api/users'
import type { UserSearchResponse } from '../api/users'
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
  const [showTurnover, setShowTurnover] = useState(false)
  const [user, setUser] = useState<UserSearchResponse | null>(null)
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
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card__label">User ID</span>
              <span className={`badge ${statusBadge(user.account.status)}`}>{user.account.status}</span>
            </div>
            <div className="stat-card__value text-blue">{user.user.userId}</div>
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-border, rgb(188,198,222))' }} />
            <div className="stat-card__label">Mobile</div>
            <div className="stat-card__value" style={{ fontSize: 16 }}>{user.user.mobile}</div>
            <div className="stat-card__change">{user.account.vipLevel}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Balance</div>
            <div className="stat-card__value text-green">₹{user.account.balance.toLocaleString('en-IN')}</div>
            <div className="stat-card__change up">Withdrawable: ₹{user.account.withdrawable.toLocaleString('en-IN')}</div>
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-border, rgb(188,198,222))' }} />
            <div className="stat-card__label">Total Deposits</div>
            <div className="stat-card__value text-orange" style={{ fontSize: 16 }}>₹{user.account.totalDeposits.toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Last IP</div>
            <div className="stat-card__value" style={{ fontSize: 16 }}>{user.lastIp}</div>
            {user.deviceInfo && <div className="stat-card__change">{user.deviceInfo.city ?? ''}{user.deviceInfo.city && user.deviceInfo.region ? ', ' : ''}{user.deviceInfo.region ?? ''}</div>}
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-border, rgb(188,198,222))' }} />
            <div className="stat-card__label">Created</div>
            <div className="stat-card__value" style={{ fontSize: 16 }}>{formatDateTime12(user.user.createdAt)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Turnover</div>
            <div className="stat-card__value text-orange">₹{user.account.total_turnover_completed.toLocaleString('en-IN')}</div>
            <div className="stat-card__change">of ₹{user.account.turnover_requirement.toLocaleString('en-IN')}</div>
            <div style={{ marginTop: 8 }}><button className="btn-filled" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setShowTurnover(true)}>View Batches</button></div>
          </div>
        </div>

        {showTurnover && (
          <div className="dialog-overlay" onClick={() => setShowTurnover(false)}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Turnover Batches</span>
                <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setShowTurnover(false)}>✕</button>
              </div>
              <div className="table-wrap" style={{ padding: 'var(--space-6) var(--space-7)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-6)', fontSize: 12 }}>
                  <div><span style={{ color: '#888' }}>Total Required</span><div style={{ fontWeight: 700, fontSize: 16 }}>₹{user.account.turnover_requirement.toLocaleString('en-IN')}</div></div>
                  <div><span style={{ color: '#888' }}>Total Completed</span><div style={{ fontWeight: 700, fontSize: 16, color: '#22c55e' }}>₹{user.account.total_turnover_completed.toLocaleString('en-IN')}</div></div>
                  <div><span style={{ color: '#888' }}>Remaining</span><div style={{ fontWeight: 700, fontSize: 16, color: '#ef4444' }}>₹{(user.account.turnover_requirement - user.account.total_turnover_completed).toLocaleString('en-IN')}</div></div>
                </div>
                <table className="table">
                  <thead><tr><th>Type</th><th>Amount</th><th>Multiplier</th><th>Required</th><th>Completed</th><th>Remaining</th><th>Created</th></tr></thead>
                  <tbody>
                    {user.account.turnover_batches.map((b, i) => (
                      <tr key={i} tabIndex={0}>
                        <td><span className={`badge ${b.type === 'DEPOSIT_BONUS' ? 'badge--warning' : 'badge--info'}`}>{b.type}</span></td>
                        <td>₹{b.amount.toLocaleString('en-IN')}</td>
                        <td>{b.multiplier}x</td>
                        <td>₹{b.required.toLocaleString('en-IN')}</td>
                        <td>₹{b.completed.toLocaleString('en-IN')}</td>
                        <td>₹{(b.required - b.completed).toLocaleString('en-IN')}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(b.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </>)}
    </div>
  )
}
