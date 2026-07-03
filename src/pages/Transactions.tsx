import { useState } from 'react'
import axios from 'axios'
import { fetchTransactions } from '../api/transactions'
import type { TransactionRecord } from '../api/transactions'
import { formatDateTime12 } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import ExportButton from '../components/ExportButton'
import type { ExportColumn } from '../utils/export'

const LIMIT = 20

const TRANSACTION_COLUMNS: ExportColumn[] = [
  { key: 'userId', label: 'User ID' },
  { key: 'orderId', label: 'Order ID' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'charge', label: 'Charge' },
  { key: 'balanceAfter', label: 'Balance After' },
  { key: 'status', label: 'Status' },
  { key: 'remark', label: 'Remark' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' },
]

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
    <div className="content content--table">
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

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
          <ExportButton columns={TRANSACTION_COLUMNS} data={records as unknown as Record<string, unknown>[]} filename="transactions" />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>User ID</th><th>Order ID</th><th>Type</th><th>Amount</th><th>Charge</th><th>Balance</th><th>Status</th><th>Remark</th><th>Created</th><th>Updated</th></tr></thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '48px 0' }}>
                  {loading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>No transactions found</div>}
                </td></tr>
              ) : (
                records.map((r) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={LIMIT} onChange={(p) => load(p)} />
      </section>
    </div>
  )
}
