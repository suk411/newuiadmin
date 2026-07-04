import { useState } from 'react'
import Spinner from './Spinner'

interface Props {
  orderId: string
  userId: number
  amount: number
  channelName: string
  defaultChargeFrom: string
  loading: boolean
  onConfirm: (chargeFrom: string) => void
  onCancel: () => void
}

export default function WithdrawApproveDialog({ orderId, userId, amount, channelName, defaultChargeFrom, loading, onConfirm, onCancel }: Props) {
  const [chargeFrom, setChargeFrom] = useState(defaultChargeFrom || 'platform')

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h3 style={{ margin: 0 }}>Approve Withdrawal</h3>
          <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={onCancel}>✕</button>
        </div>
        <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '14px' }}>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>User ID:</strong> {userId}</p>
          <p><strong>Channel:</strong> {channelName}</p>
          <p><strong>Amount:</strong> ₹{Number(amount).toLocaleString('en-IN')}</p>
          <div className="filter-group">
            <label>Charge From</label>
            <select value={chargeFrom} onChange={(e) => setChargeFrom(e.target.value)}>
              <option value="platform">Platform</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
        <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
          <button className="btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn-filled" onClick={() => onConfirm(chargeFrom)} disabled={loading}>
            {loading ? <Spinner /> : null}
            Confirm Approve
          </button>
        </div>
      </div>
    </div>
  )
}
