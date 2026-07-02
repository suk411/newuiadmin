import { useState } from 'react'
import axios from 'axios'
import { fetchTransactions } from '../api/transactions'
import type { TransactionRecord } from '../api/transactions'
import { formatDateTime12 } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'

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
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [type, setType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleUserId = (v: string) => { setUserId(v); if (v) { setOrderId(''); setTransactionId('') } }
  const handleOrderId = (v: string) => { setOrderId(v); if (v) { setUserId(''); setTransactionId('') } }
  const handleTransactionId = (v: string) => { setTransactionId(v); if (v) { setUserId(''); setOrderId('') } }

  const hasAny = userId || orderId || transactionId

  const load = async (p = 1) => {
    if (!hasAny) return
    setLoading(true)
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
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content">
      <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); load() }}>
        <div className="filter-group"><label>User ID</label><input placeholder="User ID" value={userId} onChange={(e) => handleUserId(e.target.value)} /></div>
        <div className="filter-group"><label>Order ID</label><input placeholder="Order ID" value={orderId} onChange={(e) => handleOrderId(e.target.value)} /></div>
        <div className="filter-group"><label>Transaction ID</label><input placeholder="Transaction ID" value={transactionId} onChange={(e) => handleTransactionId(e.target.value)} /></div>
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
            <button type="submit" className="btn-filled" disabled={loading || !hasAny}
              style={{ opacity: loading || !hasAny ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setOrderId(''); setTransactionId(''); setType(''); setDateFrom(''); setDateTo(''); setRecords([]); setTotal(0) }}>Reset</button>
          </div>
        </div>
      </form>

      {loading && records.length === 0 ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <Spinner />
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">📋</div>No transactions found</div>
      ) : (
      <><section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>User ID</th><th>Order ID</th><th>Type</th><th>Amount</th><th>Charge</th><th>Balance</th><th>Status</th><th>Remark</th><th>Created</th><th>Updated</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.orderId} tabIndex={0}>
                  <td>{r.userId}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.orderId}</td>
                  <td>{r.type}</td>
                  <td>₹{r.amount.toLocaleString('en-IN')}</td>
                  <td>₹{r.charge.toLocaleString('en-IN')}</td>
                  <td>₹{r.balanceAfter.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${r.status === 'SUCCESS' ? 'badge--success' : r.status === 'FAILED' ? 'badge--danger' : 'badge--warning'}`}>{r.status}</span></td>
                  <td>{r.remark || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(r.createdAt)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(r.updatedAt)}</td>
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
      </section></>
      )}
    </div>
  )
}
