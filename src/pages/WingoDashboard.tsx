import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchWingoDashboard, fetchWingoGames } from '../api/wingo'
import type { WingoStats, WingoGame } from '../api/wingo'
import { formatDateTime } from '../utils/format'

const LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function WingoDashboard() {
  const [stats, setStats] = useState<WingoStats | null>(null)
  const [games, setGames] = useState<WingoGame[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchWingoDashboard().then(setStats).catch(() => {})
  }, [])

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT }
      if (statusFilter) params.status = statusFilter
      const res = await fetchWingoGames(params)
      setGames(res.data)
      setTotal(res.total)
      setPage(p)
    } catch (err: unknown) {
      console.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="content">
      <section aria-label="Wingo statistics">
        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-card__label">Total Bets</span>
            <span className="stat-card__value">{stats ? stats.totalBets.toLocaleString() : '—'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Total Payout</span>
            <span className="stat-card__value">{stats ? `₹₹{stats.totalPayout.toLocaleString()}` : '—'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Active Users</span>
            <span className="stat-card__value">{stats ? stats.activeUsers.toLocaleString() : '—'}</span>
          </div>
        </div>
      </section>

      <div className="filters-bar">
        <div className="filter-group"><label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={() => load(1)} disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setStatusFilter(''); load(1) }}>Reset</button>
          </div>
        </div>
      </div>

      {loading && games.length === 0 ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <span className="loading-spinner" />
        </div>
      ) : games.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">📋</div>No games found</div>
      ) : (
      <section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>Issue</th><th>Result</th><th>Bets</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id} tabIndex={0}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.id}</td>
                  <td>{g.issueNumber}</td>
                  <td style={{ fontWeight: 600 }}>{g.result || '—'}</td>
                  <td>{g.totalBets.toLocaleString()}</td>
                  <td><span className={`badge ${g.status === 'closed' ? 'badge--success' : 'badge--warning'}`}>{g.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(g.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="pagination">
            <span>Page {page} of {Math.ceil(total / LIMIT)}</span>
            <button className="pagination__btn" disabled={page <= 1} onClick={() => load(page - 1)}>‹</button>
            <button className="pagination__btn active">{page}</button>
            <button className="pagination__btn" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => load(page + 1)}>›</button>
          </div>
        )}
      </section>
      )}
    </div>
  )
}
