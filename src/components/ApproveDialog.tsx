import type { DepositRecord } from '../api/deposits'

interface Props {
  record: DepositRecord
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ApproveDialog({ record, loading, onConfirm, onCancel }: Props) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Approve Recharge</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '14px' }}>
          <p><strong>Order ID:</strong> {record.orderId}</p>
          <p><strong>User ID:</strong> {record.userId}</p>
          <p><strong>Channel:</strong> {record.channelName}</p>
          <p><strong>Amount:</strong> ₹{Number(record.amount).toLocaleString('en-IN')}</p>
        </div>
        <div className="dialog-actions">
          <button className="btn-outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-filled" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            Confirm Approve
          </button>
        </div>
      </div>
    </div>
  )
}
