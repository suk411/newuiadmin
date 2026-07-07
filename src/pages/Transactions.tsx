import { useState, useEffect } from 'react'
import { fetchTransactions } from '../api/transactions'
import type { TransactionRecord } from '../api/transactions'
import { formatDateTime12 } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import { useExportBar } from '../components/ExportBarContext'
import type { ExportColumn } from '../utils/export'
import { extractError } from '../utils/error'

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

export default function Transactions() {
  const [records, setRecords] = useState<TransactionRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(true)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [type, setType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { setExportProps } = useExportBar()

  useEffect(() => {
    setExportProps({
      columns: TRANSACTION_COLUMNS,
      data: records.map((r) => ({
        userId: r.userId,
        orderId: r.orderId,
        type: r.type,
        amount: `₹${r.amount.toLocaleString('en-IN')}`,
        charge: `₹${r.charge.toLocaleString('en-IN')}`,
        balanceAfter: `₹${r.balanceAfter.toLocaleString('en-IN')}`,
        status: r.status,
        remark: r.remark || '-',
        createdAt: formatDateTime12(r.createdAt),
        updatedAt: formatDateTime12(r.updatedAt),
      })),
      filename: 'transactions',
    })
    return () => setExportProps(null)
  }, [records, setExportProps])

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
      <form className={"filters-bar" + (filterOpen ? '' : ' filters-bar--collapsed')} onSubmit={(e) => { e.preventDefault(); load() }}>
        <div className="filter-groups">
          <div className="filter-group"><label htmlFor="txn-user">User ID</label><input id="txn-user" placeholder="User ID" value={userId} onChange={(e) => handleUserId(e.target.value)} /></div>
          <div className="filter-group"><label htmlFor="txn-order">Order ID</label><input id="txn-order" placeholder="Order ID" value={orderId} onChange={(e) => handleOrderId(e.target.value)} /></div>
          <div className="filter-group"><label htmlFor="txn-txnid">Transaction ID</label><input id="txn-txnid" placeholder="Transaction ID" value={transactionId} onChange={(e) => handleTransactionId(e.target.value)} /></div>
          <div className="filter-group"><label htmlFor="txn-type">Type</label>
            <select id="txn-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="bet">Bet</option>
            </select>
          </div>
          <div className="filter-group"><label htmlFor="txn-from">From</label><input id="txn-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
          <div className="filter-group"><label htmlFor="txn-to">To</label><input id="txn-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        </div>
        <div className="filter-group filter-actions" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading || !hasAny}
              style={{ opacity: loading || !hasAny ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setOrderId(''); setTransactionId(''); setType(''); setDateFrom(''); setDateTo(''); setRecords([]); setTotal(0) }}>Reset</button>
            <button type="button" className="btn-outline" onClick={() => setFilterOpen(!filterOpen)} style={{ fontSize: 12, padding: '2px 8px' }} aria-label={filterOpen ? 'Collapse filters' : 'Expand filters'}>{filterOpen ? '−' : '+'}</button>
          </div>
        </div>
      </form>

      <section className="card">
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
        <Pagination page={page} total={total} limit={LIMIT} loading={loading} onChange={(p) => load(p)} />
      </section>
    </div>
  )
}
