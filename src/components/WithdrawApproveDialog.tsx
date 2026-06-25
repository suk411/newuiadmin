import { useState } from 'react'

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
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Approve Withdrawal</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '14px' }}>
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
        <div className="dialog-actions">
          <button className="btn-outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-filled" onClick={() => onConfirm(chargeFrom)} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            Confirm Approve
          </button>
        </div>
      </div>
    </div>
  )
}
