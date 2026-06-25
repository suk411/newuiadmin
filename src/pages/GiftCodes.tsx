import { useState } from 'react'
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

export default function GiftCodes() {
  const [records, setRecords] = useState<GiftCode[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = async (p = 1) => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT }
      if (statusFilter) params.status = statusFilter
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

  const handleCreate = async () => {
    if (!newCode || !newAmount) return
    try {
      await createGiftCode({ code: newCode, amount: Number(newAmount), description: newDesc })
      setShowCreate(false)
      setNewCode('')
      setNewAmount('')
      setNewDesc('')
      load()
    } catch (err: unknown) {
      setError(extractError(err))
    }
  }

  return (
    <div className="content">
      <div className="filters-bar">
        <div className="filter-group"><label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={() => load()} disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setStatusFilter(''); setRecords([]); setTotal(0) }}>Reset</button>
            <button className="btn-filled" style={{ background: '#22c55e', borderColor: '#22c55e' }}
              onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? 'Cancel' : '+ New'}
            </button>
          </div>
        </div>
      </div>

      {error && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13 }}>{error}</div>}

      {showCreate && (
        <section className="card" style={{ marginBottom: 16 }}>
          <div className="card__header"><span className="card__title">Create Gift Code</span></div>
          <div style={{ display: 'flex', gap: 12, padding: 12 }}>
            <input placeholder="Code" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} />
            <input placeholder="Amount" type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <button className="btn btn--primary btn--sm" onClick={handleCreate}>Save</button>
          </div>
        </section>
      )}

      {loading && records.length === 0 ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <span className="loading-spinner" />
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">📋</div>No gift codes found</div>
      ) : (
      <><section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Code</th><th>Amount</th><th>Description</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.code} tabIndex={0}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{r.code}</td>
                  <td>₹{r.amount.toLocaleString('en-IN')}</td>
                  <td>{r.description}</td>
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
    </div>
  )
}
