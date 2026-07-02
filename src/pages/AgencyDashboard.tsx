import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchAgencyDashboard, fetchAgencyMembers } from '../api/agency'
import type { AgencyStats, AgencyMember } from '../api/agency'
import { formatDateTime } from '../utils/format'
import Spinner from '../components/Spinner'

const LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function AgencyDashboard() {
  const [stats, setStats] = useState<AgencyStats | null>(null)
  const [members, setMembers] = useState<AgencyMember[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAgencyDashboard().then(setStats).catch(() => {})
    load()
  }, [])

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const res = await fetchAgencyMembers({ page: p, limit: LIMIT })
      setMembers(res.data)
      setTotal(res.total)
      setPage(p)
    } catch (err: unknown) {
      console.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content">
      <section aria-label="Agency statistics">
        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-card__label">Total Agents</span>
            <span className="stat-card__value">{stats ? stats.totalAgents.toLocaleString() : '—'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Active Agents</span>
            <span className="stat-card__value">{stats ? stats.activeAgents.toLocaleString() : '—'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Total Commission</span>
            <span className="stat-card__value">{stats ? `₹${stats.totalCommission.toLocaleString()}` : '—'}</span>
          </div>
        </div>
      </section>

      {loading && members.length === 0 ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <Spinner />
        </div>
      ) : members.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">📋</div>No members found</div>
      ) : (
      <section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>Name</th><th>Commission</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} tabIndex={0}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.id}</td>
                  <td>{m.name}</td>
                  <td>₹{m.commission.toLocaleString()}</td>
                  <td><span className={`badge ${m.status === 'active' ? 'badge--success' : 'badge--danger'}`}>{m.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(m.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="pagination" style={{ position: 'sticky', bottom: 0, background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', marginTop: '-1px' }}>
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
