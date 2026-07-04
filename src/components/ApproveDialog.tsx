import type { DepositRecord } from '../api/deposits'
import Spinner from './Spinner'

interface Props {
  record: DepositRecord
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ApproveDialog({ record, loading, onConfirm, onCancel }: Props) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h3 style={{ margin: 0 }}>Approve Recharge</h3>
          <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={onCancel}>✕</button>
        </div>
        <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '14px' }}>
          <p><strong>Order ID:</strong> {record.orderId}</p>
          <p><strong>User ID:</strong> {record.userId}</p>
          <p><strong>Channel:</strong> {record.channelName}</p>
          <p><strong>Amount:</strong> ₹{Number(record.amount).toLocaleString('en-IN')}{record.bonusOptIn && record.bonusAmount > 0 && <span style={{ color: '#999' }}> +{Number(record.bonusAmount).toLocaleString('en-IN')}</span>}</p>
        </div>
        <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
          <button className="btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn-filled" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner /> : null}
            Confirm Approve
          </button>
        </div>
      </div>
    </div>
  )
}
