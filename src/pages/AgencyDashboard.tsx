import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchAgencyDashboard, fetchAgencyMembers, fetchAgencyLevels, updateAgencyLevel } from '../api/agency'
import { fetchDashboard } from '../api/dashboard'
import type { AgencyStats, AgencyMember, AgencyLevelConfig } from '../api/agency'
import type { AgentCommission } from '../api/dashboard'
import { formatDateTime } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'

const LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function AgencyDashboard() {
  const [stats, setStats] = useState<AgencyStats | null>(null)
  const [commission, setCommission] = useState<AgentCommission | null>(null)
  const [members, setMembers] = useState<AgencyMember[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [levels, setLevels] = useState<AgencyLevelConfig[]>([])
  const [levelsLoading, setLevelsLoading] = useState(true)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<AgencyLevelConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAgencyDashboard().then(setStats).catch(() => {})
    fetchDashboard('today').then((raw: any) => {
      setCommission(raw?.agentCommission ?? raw?.data?.agentCommission ?? null)
    }).catch(() => {})
    loadLevels()
    load()
  }, [])

  const loadLevels = async () => {
    setLevelsLoading(true)
    try {
      const data = await fetchAgencyLevels()
      setLevels(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLevelsLoading(false)
    }
  }

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

  const openEdit = (i: number) => {
    setEditIndex(i)
    setForm({ ...levels[i] })
  }

  const closeEdit = () => {
    setEditIndex(null)
    setForm(null)
  }

  const handleSave = async () => {
    if (form == null || editIndex == null) return
    setSaving(true)
    try {
      const updated = await updateAgencyLevel(form.level, {
        minMembers: form.minMembers,
        minBets: form.minBets,
        minDeposit: form.minDeposit,
        l1Rate: form.l1Rate,
        l2Rate: form.l2Rate,
        l3Rate: form.l3Rate,
      })
      const copy = [...levels]
      copy[editIndex] = updated
      setLevels(copy)
      closeEdit()
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="content content--table">
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

      <section aria-label="Admin dashboard commission">
        <h2 className="section-title">Admin Dashboard Commission</h2>
        <div className="stat-cards" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <span className="stat-card__label">Total Commission (today)</span>
            <span className="stat-card__value text-green">{commission?.total != null ? `₹${Number(commission.total).toLocaleString('en-IN')}` : '—'}</span>
            <span className="stat-card__change up">{commission?.count ?? 0} payments</span>
          </div>
        </div>
      </section>

      <section aria-label="Agency level configs">
        <h2 className="section-title">Agency Level Configs</h2>
        <div className="card" style={{ marginTop: 12 }}>
          <div className="table-wrap">
            {levelsLoading ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner /></div>
            ) : levels.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">📋</div>No level configs found</div>
            ) : (
            <table className="table">
              <thead><tr><th>Level</th><th>Min Members</th><th>Min Bets (₹)</th><th>Min Deposit (₹)</th><th>L1 Rate</th><th>L2 Rate</th><th>L3 Rate</th><th>Actions</th></tr></thead>
              <tbody>
                {levels.map((l, i) => (
                  <tr key={l._id}>
                    <td>{l.level}</td>
                    <td>{l.minMembers.toLocaleString('en-IN')}</td>
                    <td>{l.minBets.toLocaleString('en-IN')}</td>
                    <td>{l.minDeposit.toLocaleString('en-IN')}</td>
                    <td>{(l.l1Rate * 100).toFixed(0)}%</td>
                    <td>{(l.l2Rate * 100).toFixed(0)}%</td>
                    <td>{(l.l3Rate * 100).toFixed(0)}%</td>
                    <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => openEdit(i)}>Edit</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="table-wrap">
          {loading && members.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <Spinner />
            </div>
          ) : members.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">📋</div>No members found</div>
          ) : (
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
          )}
        </div>
        {!loading && total > 0 && (
          <div className="pagination">
            <span>Page {page} of {Math.ceil(total / LIMIT)}</span>
            <button className="pagination__btn" disabled={page <= 1} onClick={() => load(page - 1)}>‹</button>
            <button className="pagination__btn active">{page}</button>
            <button className="pagination__btn" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => load(page + 1)}>›</button>
          </div>
        )}
      </section>

      {editIndex != null && form && (
        <div className="dialog-overlay" onClick={closeEdit}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>Edit Level {form.level}</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={closeEdit}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
              <div className="filter-group"><label>Min Members</label><input type="number" value={form.minMembers} onChange={(e) => setForm({ ...form, minMembers: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Min Bets (₹)</label><input type="number" value={form.minBets} onChange={(e) => setForm({ ...form, minBets: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Min Deposit (₹)</label><input type="number" value={form.minDeposit} onChange={(e) => setForm({ ...form, minDeposit: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>L1 Rate (decimal, e.g. 0.15 = 15%)</label><input type="number" step="0.01" value={form.l1Rate} onChange={(e) => setForm({ ...form, l1Rate: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>L2 Rate (decimal)</label><input type="number" step="0.01" value={form.l2Rate} onChange={(e) => setForm({ ...form, l2Rate: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>L3 Rate (decimal)</label><input type="number" step="0.01" value={form.l3Rate} onChange={(e) => setForm({ ...form, l3Rate: Number(e.target.value) })} /></div>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
              <button className="btn-outline" onClick={closeEdit} disabled={saving}>Cancel</button>
              <button className="btn-filled" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
