import { useState } from 'react'
import AnimatedDialog from './AnimatedDialog'
import Spinner from './Spinner'

interface Props {
  open: boolean
  orderId: string
  userId: number
  amount: number
  channelName: string
  defaultChargeFrom: string
  loading: boolean
  onConfirm: (chargeFrom: string) => void
  onClose: () => void
}

export default function WithdrawApproveDialog({ open, orderId, userId, amount, channelName, defaultChargeFrom, loading, onConfirm, onClose }: Props) {
  const [chargeFrom, setChargeFrom] = useState(defaultChargeFrom || 'platform')

  return (
    <AnimatedDialog open={open} onClose={onClose} title="Approve Withdrawal"
      footer={
        <>
          <button className="btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-filled" onClick={() => onConfirm(chargeFrom)} disabled={loading}>
            {loading ? <Spinner /> : null}
            Confirm Approve
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '14px' }}>
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Channel:</strong> {channelName}</p>
        <p><strong>Amount:</strong> ₹{Number(amount).toLocaleString('en-IN')}</p>
        <div className="filter-group">
          <label htmlFor="wd-chargeFrom">Charge From</label>
          <select id="wd-chargeFrom" value={chargeFrom} onChange={(e) => setChargeFrom(e.target.value)}>
            <option value="platform">Platform</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
    </AnimatedDialog>
  )
}
