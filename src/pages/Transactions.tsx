import { useState } from 'react'
import axios from 'axios'
import { fetchTransactions } from '../api/transactions'
import type { TransactionRecord } from '../api/transactions'
import { formatDateTime } from '../utils/format'

const LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function Transactions() {
  const [records, setRecords] = useState<TransactionRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [type, setType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasAny = userId || orderId || transactionId

  const load = async (p = 1) => {
    if (!hasAny) return
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT }
      if (userId) params.userId = userId
      if (orderId) params.orderId = orderId
      if (transactionId) params.transactionId = transactionId
      if (type) params.type = type
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const res = await fetchTransactions(params)
      setRecords(res.data)
      setTotal(res.total)
      setPage(res.page)
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content">
      <div className="filters-bar">
        <div className="filter-group"><label>User ID</label><input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} /></div>
        <div className="filter-group"><label>Order ID</label><input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} /></div>
        <div className="filter-group"><label>Transaction ID</label><input placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} /></div>
        <div className="filter-group"><label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="bet">Bet</option>
          </select>
        </div>
        <div className="filter-group"><label>From</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
        <div className="filter-group"><label>To</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={() => load()} disabled={loading || !hasAny}
              style={{ opacity: loading || !hasAny ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setOrderId(''); setTransactionId(''); setType(''); setDateFrom(''); setDateTo(''); setRecords([]); setTotal(0) }}>Reset</button>
          </div>
        </div>
      </div>

      {error && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13 }}>{error}</div>}

      {loading && records.length === 0 ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <span className="loading-spinner" />
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">📋</div>No transactions found</div>
      ) : (
      <><section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} tabIndex={0}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</td>
                  <td>{r.userId}</td>
                  <td>{r.type}</td>
                  <td>₹{r.amount.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${r.status === 'success' ? 'badge--success' : r.status === 'failed' ? 'badge--danger' : 'badge--warning'}`}>{r.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td>
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
