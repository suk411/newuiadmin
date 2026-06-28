import { useState } from 'react'
import axios from 'axios'
import { fetchWithdrawals, approveWithdrawal, cancelWithdrawal } from '../api/withdrawals'
import type { WithdrawalRecord } from '../api/withdrawals'
import { formatDateTime12 } from '../utils/format'
import WithdrawApproveDialog from '../components/WithdrawApproveDialog'
import { useError } from '../contexts/ErrorContext'

const LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function Withdrawals() {
  const [records, setRecords] = useState<WithdrawalRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const { error, setError } = useError()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState('')
  const [chargeFrom, setChargeFrom] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleUserId = (v: string) => { setUserId(v); if (v) setOrderId('') }
  const handleOrderId = (v: string) => { setOrderId(v); if (v) setUserId('') }
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<any | null>(null)

  const load = async (p = 1) => {
    setLoading(true)
    setError(null)
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
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const [dialogError, setDialogError] = useState<string | null>(null)

  const handleApproveClick = (record: any) => {
    setApproveTarget(record)
    setDialogError(null)
  }

  const handleApproveConfirm = async (chargeFrom: string) => {
    if (!approveTarget) return
    setActionLoading(approveTarget.orderId)
    try {
      await approveWithdrawal(approveTarget.orderId, chargeFrom)
      setApproveTarget(null)
      load(page)
    } catch (err: unknown) {
      setDialogError(extractError(err))
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
      setDialogError(extractError(err))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="content">
      <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); load() }}>
        <div className="filter-group"><label>User ID</label><input placeholder="User ID" value={userId} onChange={(e) => handleUserId(e.target.value)} /></div>
        <div className="filter-group"><label>Order ID</label><input placeholder="Order ID" value={orderId} onChange={(e) => handleOrderId(e.target.value)} /></div>
        <div className="filter-group"><label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group"><label>Charge From</label>
          <select value={chargeFrom} onChange={(e) => setChargeFrom(e.target.value)}>
            <option value="">All</option>
            <option value="platform">Platform</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="filter-group"><label>From</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
        <div className="filter-group"><label>To</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setOrderId(''); setStatus(''); setChargeFrom(''); setDateFrom(''); setDateTo(''); setRecords([]); setTotal(0) }}>Reset</button>
          </div>
        </div>
      </form>

      {loading && records.length === 0 ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <span className="loading-spinner" />
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state"><div className="empty-state__icon">📋</div>No withdrawal records found</div>
      ) : (
      <><section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>User ID</th><th>Order ID</th><th>Payment</th><th>Channel</th><th>Amount</th><th>Charge</th><th>Charge From</th><th>Note</th><th>Created</th><th>Updated</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {records.map((r: any) => {
                const pd = r.paymentDetails || {}
                const payInfo = pd.upiId ? `UPI: ${pd.upiId}` : pd.accountNo ? `${pd.bankName || ''} ${pd.holderName || ''} ${pd.accountNo}`.trim() : '—'
                return (
                <tr key={r.orderId} tabIndex={0}>
                  <td>{r.userId}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.orderId}</td>
                  <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={payInfo}>{payInfo}</td>
                  <td>{r.channelName || '—'}</td>
                  <td>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                  <td>{r.charge != null ? `₹${Number(r.charge).toLocaleString('en-IN')}` : '—'}</td>
                  <td style={{ fontSize: 12 }}>{r.chargeFrom || '—'}</td>
                  <td style={{ fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.note || ''}>{r.note || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDateTime12(r.createdAt)}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{r.updatedAt ? formatDateTime12(r.updatedAt) : '—'}</td>
                  <td><span className={`badge ${['SUCCESS', 'approved'].includes(r.status) ? 'badge--success' : ['FAILED', 'cancelled'].includes(r.status) ? 'badge--danger' : 'badge--warning'}`}>{r.status}</span></td>
                  <td>
                    <div className="cell-actions">
                      {['PENDING', 'pending'].includes(r.status) && (
                        <>
                          <button className="btn btn--success btn--sm" onClick={() => handleApproveClick(r)} disabled={actionLoading === r.orderId}>
                            {actionLoading === r.orderId ? '...' : 'Approve'}
                          </button>
                          <button className="btn btn--danger btn--sm" onClick={() => handleCancel(r.orderId)} disabled={actionLoading === r.orderId}>
                            {actionLoading === r.orderId ? '...' : 'Cancel'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
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

      {dialogError && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginBottom: 8 }}>{dialogError}</div>}
      {approveTarget && (
        <WithdrawApproveDialog
          orderId={approveTarget.orderId}
          userId={approveTarget.userId}
          amount={approveTarget.amount}
          channelName={approveTarget.channelName}
          defaultChargeFrom={chargeFrom || 'platform'}
          loading={actionLoading === approveTarget.orderId}
          onConfirm={handleApproveConfirm}
          onCancel={handleApproveCancel}
        />
      )}
    </div>
  )
}
