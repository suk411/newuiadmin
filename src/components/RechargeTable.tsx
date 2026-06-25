import type { DepositRecord } from '../api/deposits'

interface Props {
  records: DepositRecord[]
  loading: boolean
  onApprove: (record: DepositRecord) => void
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function RechargeTable({ records, loading, onApprove }: Props) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="empty-state" style={{ padding: '48px 0' }}>
          <span className="spinner" />
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state" style={{ padding: '48px 0' }}>
          No recharge records found
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Mobile</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Channel</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{record.orderId}</td>
              <td>{record.userId}</td>
              <td>{record.mobile}</td>
              <td style={{ fontWeight: 600 }}>₹{Number(record.amount).toLocaleString('en-IN')}</td>
              <td>
                <span className={`badge badge-${record.status}`}>
                  {statusLabels[record.status] || record.status}
                </span>
              </td>
              <td>{record.channel || '—'}</td>
              <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDateTime(record.createdAt)}</td>
              <td>
                {record.status === 'pending' && (
                  <button
                    className="btn btn-success"
                    onClick={() => onApprove(record)}
                    style={{ padding: '2px 10px', fontSize: '12px' }}
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
