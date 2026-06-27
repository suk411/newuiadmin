import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchGiftCodes, createGiftCode, toggleGiftCode, deleteGiftCode } from '../api/giftCodes'
import type { GiftCode } from '../api/giftCodes'
import { formatDateTime } from '../utils/format'

const LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

function randomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

const defaultForm = {
  code: '',
  rewardAmount: 0,
  turnoverMultiplier: 1,
  maxRedemptions: 100,
  expiryDate: '',
  minDepositToday: 0,
  description: '',
}

export default function GiftCodes() {
  const [records, setRecords] = useState<GiftCode[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const load = async (p = 1) => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT }
      const res = await fetchGiftCodes(params)
      setRecords(res.data)
      setTotal(res.total)
      setPage(res.page)
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(defaultForm)
    setShowCreate(true)
  }

  const closeCreate = () => {
    setShowCreate(false)
    setForm(defaultForm)
  }

  const handleCreate = async () => {
    if (!form.code || !form.rewardAmount) return
    setSaving(true)
    setError('')
    try {
      await createGiftCode(form)
      closeCreate()
      load()
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="content">
      <div className="filters-bar">
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={() => load()} disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Refresh</button>
            <button className="btn-filled" style={{ background: '#22c55e', borderColor: '#22c55e' }}
              onClick={openCreate}>+ New</button>
          </div>
        </div>
      </div>

      {error && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginBottom: 8 }}>{error}</div>}

      {loading ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <span className="loading-spinner" />
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">📋</div>No gift codes found</div>
      ) : (
      <><section className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Code</th><th>Reward (₹)</th><th>Multiplier</th><th>Max Redemptions</th><th>Used</th><th>Expiry</th><th>Min Deposit</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.code} tabIndex={0}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{r.code}</td>
                  <td>₹{r.rewardAmount.toLocaleString('en-IN')}</td>
                  <td>{r.turnoverMultiplier}x</td>
                  <td>{r.maxRedemptions}</td>
                  <td>{r.usedCount}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.expiryDate ? formatDateTime(r.expiryDate) : '-'}</td>
                  <td>₹{r.minDepositToday.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${r.isActive ? 'badge--success' : 'badge--danger'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn btn--sm" style={{ color: '#409eff' }} onClick={async () => { await toggleGiftCode(r.code); load() }}>
                        {r.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={async () => { if (confirm('Delete this code?')) { await deleteGiftCode(r.code); load() } }}>
                        Delete
                      </button>
                    </div>
                  </td>
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
      </section></>
      )}

      {showCreate && (
        <div className="dialog-overlay" onClick={closeCreate}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>Create Gift Code</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={closeCreate}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
              <div className="filter-group"><label>Code</label><div style={{ display: 'flex', gap: 6 }}><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. BONUS50" style={{ flex: 1 }} /><button className="btn" onClick={() => setForm({ ...form, code: randomCode() })} style={{ whiteSpace: 'nowrap', background: '#f59e0b', color: '#fff', border: 'none' }}>Random</button></div></div>
              <div className="filter-group"><label>Reward Amount (₹)</label><input type="number" value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Turnover Multiplier</label><input type="number" step="0.1" value={form.turnoverMultiplier} onChange={(e) => setForm({ ...form, turnoverMultiplier: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Max Redemptions</label><input type="number" value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Expiry Date</label><input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
              <div className="filter-group"><label>Min Deposit Today (₹)</label><input type="number" value={form.minDepositToday} onChange={(e) => setForm({ ...form, minDepositToday: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
              <button className="btn-outline" onClick={closeCreate} disabled={saving}>Cancel</button>
              <button className="btn-filled" onClick={handleCreate} disabled={saving}>
                {saving ? <span className="spinner" /> : null}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
