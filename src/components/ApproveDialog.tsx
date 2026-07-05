import type { DepositRecord } from '../api/deposits'
import AnimatedDialog from './AnimatedDialog'
import Spinner from './Spinner'

interface Props {
  open: boolean
  record: DepositRecord | null
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ApproveDialog({ open, record, loading, onConfirm, onClose }: Props) {
  return (
    <AnimatedDialog open={open} onClose={onClose} title="Approve Recharge"
      footer={
        <>
          <button className="btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-filled" onClick={onConfirm} disabled={loading || !record}>
            {loading ? <Spinner /> : null}
            Confirm Approve
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '14px' }}>
        <p><strong>Order ID:</strong> {record?.orderId}</p>
        <p><strong>User ID:</strong> {record?.userId}</p>
        <p><strong>Channel:</strong> {record?.channelName}</p>
        <p><strong>Amount:</strong> ₹{Number(record?.amount ?? 0).toLocaleString('en-IN')}{record?.bonusOptIn && (record?.bonusAmount ?? 0) > 0 && <span style={{ color: '#999' }}> +{Number(record?.bonusAmount).toLocaleString('en-IN')}</span>}</p>
      </div>
    </AnimatedDialog>
  )
}
