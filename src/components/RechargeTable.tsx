import type { DepositRecord } from '../api/deposits'
import Spinner from './Spinner'
import { formatDateTime12 } from '../utils/format'

interface Props {
  records: DepositRecord[]
  loading: boolean
  onApprove: (record: DepositRecord) => void
}

const statusMap: Record<string, { label: string; className: string }> = {
  SUCCESS: { label: 'Success', className: 'badge--success' },
  PENDING: { label: 'Pending', className: 'badge--warning' },
  FAILED: { label: 'Failed', className: 'badge--danger' },
}

export default function RechargeTable({ records, loading, onApprove }: Props) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        {loading ? (
          <tbody><tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 0' }}><Spinner /></td></tr></tbody>
        ) : records.length === 0 ? (
          <tbody><tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 0' }}>
            <div className="empty-state"><div className="empty-state__icon">📋</div>No recharge records found</div>
          </td></tr></tbody>
        ) : (
          <tbody>
            {records.map((record) => {
            const st = statusMap[record.status] || { label: record.status, className: 'badge--info' }
            return (
              <tr key={record.orderId} tabIndex={0}>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{record.orderId}</td>
                <td>{record.userId}</td>
                <td>{record.currency === 'INR' ? '₹' : '$'}{Number(record.amount).toLocaleString('en-IN')}{record.bonusOptIn && record.bonusAmount > 0 && <span style={{ color: '#999' }}> +{Number(record.bonusAmount).toLocaleString('en-IN')}</span>}</td>
                <td>{record.channelName}</td>
                <td><span className={`badge ${st.className}`}>{st.label}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(record.createdAt)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{record.updatedAt ? formatDateTime12(record.updatedAt) : '—'}</td>
                <td>
                  <div className="cell-actions">
                    {record.status === 'PENDING' && (
                      <>
                        <button className="btn btn--success btn--sm" onClick={() => onApprove(record)}>Approve</button>
                        <button className="btn btn--danger btn--sm">Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
          </tbody>)}
      </table>
    </div>
  )
}
