import { useState } from 'react'
import axios from 'axios'
import { fetchProviderBets, fetchWingoBets } from '../api/bets'
import type { ProviderBet, WingoBet } from '../api/bets'
import { formatDateTime } from '../utils/format'

const LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function BetRecords() {
  const [tab, setTab] = useState<'provider' | 'wingo'>('provider')
  const [records, setRecords] = useState<(ProviderBet | WingoBet)[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [member, setMember] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  const load = async (p = 1) => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT }
      if (tab === 'provider') {
        if (member) params.member = member
        const res = await fetchProviderBets(params)
        setRecords(res.data)
        setTotal(res.total)
      } else {
        if (orderNumber) params.orderNumber = orderNumber
        const res = await fetchWingoBets(params)
        setRecords(res.data)
        setTotal(res.total)
      }
      setPage(p)
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content">
      <div className="filters-bar">
        {tab === 'provider' ? (
          <div className="filter-group"><label>Member</label><input placeholder="Member" value={member} onChange={(e) => setMember(e.target.value)} /></div>
        ) : (
          <div className="filter-group"><label>Order No</label><input placeholder="Order no" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} /></div>
        )}
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`btn btn--sm ${tab === 'provider' ? 'btn--primary' : ''}`} onClick={() => setTab('provider')}>Provider</button>
            <button className={`btn btn--sm ${tab === 'wingo' ? 'btn--primary' : ''}`} onClick={() => setTab('wingo')}>Wingo</button>
          </div>
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={() => load()} disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setMember(''); setOrderNumber(''); setRecords([]); setTotal(0) }}>Reset</button>
          </div>
        </div>
      </div>

      {error && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13 }}>{error}</div>}

      {loading && records.length === 0 ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <span className="loading-spinner" />
        </div>
      ) : records.length === 0 && !loading ? (
        <div className="empty-state"><div className="empty-state__icon">📋</div>No bet records found</div>
      ) : (
      <><section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {tab === 'provider' ? (
                  <><th>ID</th><th>Member</th><th>Site</th><th>Amount</th><th>Status</th><th>Date</th></>
                ) : (
                  <><th>ID</th><th>User</th><th>Order No</th><th>Issue</th><th>Amount</th><th>Status</th><th>Date</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id} tabIndex={0}>
                  {tab === 'provider' ? (
                    <><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</td>
                      <td>{r.member}</td><td>{r.site}</td>
                      <td>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                      <td><span className="badge badge--success">{r.status}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td></>
                  ) : (
                    <><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</td>
                      <td>{r.userId}</td><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.orderNumber}</td>
                      <td>{r.issueNumber}</td>
                      <td>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                      <td><span className="badge badge--success">{r.status}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td></>
                  )}
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
