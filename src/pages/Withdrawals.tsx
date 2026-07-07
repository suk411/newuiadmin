import { useState, useEffect } from 'react'
import { fetchWithdrawals, approveWithdrawal, cancelWithdrawal } from '../api/withdrawals'
import type { WithdrawalRecord } from '../api/withdrawals'
import { formatDateTime12 } from '../utils/format'
import WithdrawApproveDialog from '../components/WithdrawApproveDialog'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import { useExportBar } from '../components/ExportBarContext'
import type { ExportColumn } from '../utils/export'
import { extractError } from '../utils/error'

const LIMIT = 20

const WITHDRAWAL_COLUMNS: ExportColumn[] = [
  { key: 'userId', label: 'User ID' },
  { key: 'orderId', label: 'Order ID' },
  { key: 'amount', label: 'Amount' },
  { key: 'charge', label: 'Charge' },
  { key: 'currency', label: 'Currency' },
  { key: 'status', label: 'Status' },
  { key: 'method', label: 'Method' },
  { key: 'channelName', label: 'Channel' },
  { key: 'chargeFrom', label: 'Charge From' },
  { key: 'note', label: 'Note' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' },
]

export default function Withdrawals() {
  const [records, setRecords] = useState<WithdrawalRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(true)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState('')
  const [chargeFrom, setChargeFrom] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { setExportProps } = useExportBar()

  useEffect(() => {
    setExportProps({
      columns: WITHDRAWAL_COLUMNS,
      data: records.map((r) => ({
        userId: r.userId,
        orderId: r.orderId,
        amount: `₹${Number(r.amount).toLocaleString('en-IN')}`,
        charge: r.charge != null ? `₹${Number(r.charge).toLocaleString('en-IN')}` : '—',
        currency: r.currency,
        status: r.status,
        method: r.method,
        channelName: r.channelName || '—',
        chargeFrom: r.chargeFrom || '—',
        note: r.note || '—',
        createdAt: formatDateTime12(r.createdAt),
        updatedAt: r.updatedAt ? formatDateTime12(r.updatedAt) : '—',
      })),
      filename: 'withdrawals',
    })
    return () => setExportProps(null)
  }, [records, setExportProps])

  const hasAnyFilter = userId || orderId || status || chargeFrom || dateFrom || dateTo

  const handleUserId = (v: string) => { setUserId(v); if (v) setOrderId('') }
  const handleOrderId = (v: string) => { setOrderId(v); if (v) setUserId('') }
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<any | null>(null)

  const load = async (p = 1) => {
    if (!hasAnyFilter) { toast('Please apply at least one filter'); return }
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT }
      if (userId) params.userId = userId
      if (orderId) params.orderId = orderId
      if (status) params.status = status
      if (chargeFrom) params.chargeFrom = chargeFrom
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const res = await fetchWithdrawals(params)
      setRecords(res.data)
      setTotal(res.total)
      setPage(res.page)
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (record: any) => {
    setApproveTarget(record)
  }

  const handleApproveConfirm = async (chargeFrom: string) => {
    if (!approveTarget) return
    setActionLoading(approveTarget.orderId)
    try {
      await approveWithdrawal(approveTarget.orderId, chargeFrom)
      setApproveTarget(null)
      load(page)
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproveCancel = () => {
    setApproveTarget(null)
  }

  const handleCancel = async (orderId: string) => {
    const reason = prompt('Enter cancellation reason:')
    if (!reason) return
    setActionLoading(orderId)
    try {
      await cancelWithdrawal(orderId, reason)
      load(page)
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="content content--table">
      <form className={"filters-bar" + (filterOpen ? '' : ' filters-bar--collapsed')} onSubmit={(e) => { e.preventDefault(); load() }}>
        <div className="filter-group"><label htmlFor="wd-user">User ID</label><input id="wd-user" placeholder="User ID" value={userId} onChange={(e) => handleUserId(e.target.value)} /></div>
        <div className="filter-group"><label htmlFor="wd-order">Order ID</label><input id="wd-order" placeholder="Order ID" value={orderId} onChange={(e) => handleOrderId(e.target.value)} /></div>
        <div className="filter-group"><label htmlFor="wd-status">Status</label>
          <select id="wd-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group"><label htmlFor="wd-charge">Charge From</label>
          <select id="wd-charge" value={chargeFrom} onChange={(e) => setChargeFrom(e.target.value)}>
            <option value="">All</option>
            <option value="platform">Platform</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="filter-group"><label htmlFor="wd-from">From</label><input id="wd-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
        <div className="filter-group"><label htmlFor="wd-to">To</label><input id="wd-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        <div className="filter-group filter-actions" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading || !hasAnyFilter}
              style={{ opacity: loading || !hasAnyFilter ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setOrderId(''); setStatus(''); setChargeFrom(''); setDateFrom(''); setDateTo(''); setRecords([]); setTotal(0) }}>Reset</button>
            <button type="button" className="btn-outline" onClick={() => setFilterOpen(!filterOpen)} style={{ fontSize: 12, padding: '2px 8px' }} aria-label={filterOpen ? 'Collapse filters' : 'Expand filters'}>{filterOpen ? '−' : '+'}</button>
          </div>
        </div>
      </form>

      <section className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>User ID</th><th>Order ID</th><th>Payment</th><th>Channel</th><th>Amount</th><th>Charge</th><th>Charge From</th><th>Note</th><th>Created</th><th>Updated</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '48px 0' }}>
                  {loading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>No withdrawal records found</div>}
                </td></tr>
              ) : (
                records.map((r: any) => {
                  const pd = r.paymentDetails || {}
                  const payInfo = pd.upiId ? `UPI: ${pd.upiId}` : pd.accountNo ? `${pd.bankName || ''} ${pd.holderName || ''} ${pd.accountNo}`.trim() : '—'
                  return (
                  <tr key={r.orderId} tabIndex={0}>
                    <td>{r.userId}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.orderId}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }} title={payInfo}>{payInfo}</td>
                    <td>{r.channelName || '—'}</td>
                    <td>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                    <td>{r.charge != null ? `₹${Number(r.charge).toLocaleString('en-IN')}` : '—'}</td>
                    <td style={{ fontSize: 12 }}>{r.chargeFrom || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }} title={r.note || ''}>{r.note || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDateTime12(r.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{r.updatedAt ? formatDateTime12(r.updatedAt) : '—'}</td>
                    <td><span className={`badge ${['SUCCESS', 'approved'].includes(r.status) ? 'badge--success' : ['FAILED', 'cancelled'].includes(r.status) ? 'badge--danger' : 'badge--warning'}`}>{r.status}</span></td>
                    <td>
                      <div className="cell-actions">
                        {['PENDING', 'pending'].includes(r.status) && (
                          <>
                            <button className="btn btn--success btn--sm" onClick={() => handleApproveClick(r)} disabled={actionLoading === r.orderId}>
                              {actionLoading === r.orderId ? <Spinner /> : 'Approve'}
                            </button>
                            <button className="btn btn--danger btn--sm" onClick={() => handleCancel(r.orderId)} disabled={actionLoading === r.orderId}>
                              {actionLoading === r.orderId ? <Spinner /> : 'Cancel'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={LIMIT} loading={loading} onChange={(p) => load(p)} />
      </section>

      <WithdrawApproveDialog
        open={!!approveTarget}
        orderId={approveTarget?.orderId ?? ''}
        userId={approveTarget?.userId ?? 0}
        amount={approveTarget?.amount ?? 0}
        channelName={approveTarget?.channelName ?? ''}
        defaultChargeFrom={chargeFrom || 'platform'}
        loading={actionLoading === approveTarget?.orderId}
        onConfirm={handleApproveConfirm}
        onClose={handleApproveCancel}
      />

    </div>
  )
}
