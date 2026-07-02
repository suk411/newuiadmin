import { useState } from 'react'
import axios from 'axios'
import { fetchTeamStats } from '../api/agency'
import type { TeamStats } from '../api/agency'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: 'Success',
  PENDING: 'Pending',
  FAILED: 'Failed',
  EXPIRED: 'Expired',
  REFUNDED: 'Refunded',
  AUDITING: 'Auditing',
  CANCELLED: 'Cancelled',
}

export default function AgencyDashboard() {
  const [userId, setUserId] = useState('')
  const [tier, setTier] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TeamStats | null>(null)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return
    setLoading(true)
    setData(null)
    try {
      const params: Record<string, string> = { userId: userId.trim() }
      if (tier) params.tier = tier
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const res = await fetchTeamStats(params)
      setData(res)
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setUserId('')
    setTier('')
    setDateFrom('')
    setDateTo('')
    setData(null)
  }

  const renderStatusTable = (
    title: string,
    totals: { totalAmount: number; totalCount: number },
    statuses: Record<string, { amount: number; count: number }>,
  ) => {
    const entries = Object.entries(statuses).filter(([k]) => k !== 'totalAmount' && k !== 'totalCount')
    return (
      <section className="card" style={{ marginTop: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>{title}</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Status</th><th>Count</th><th>Amount (₹)</th></tr></thead>
            <tbody>
              <tr style={{ fontWeight: 600 }}>
                <td>Total</td>
                <td>{totals.totalCount.toLocaleString('en-IN')}</td>
                <td>₹{totals.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
              {entries.map(([status, val]) => (
                <tr key={status}>
                  <td>{STATUS_LABELS[status] ?? status}</td>
                  <td>{val.count.toLocaleString('en-IN')}</td>
                  <td>₹{val.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <div className="content content--table">
      <form className="filters-bar" onSubmit={handleSearch}>
        <div className="filter-group">
          <label>User ID</label>
          <input placeholder="Enter User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Tier</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="">All</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
          </select>
        </div>
        <div className="filter-group">
          <label>From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading || !userId.trim()}
              style={{ opacity: loading || !userId.trim() ? 0.6 : 1 }}>
              {loading ? <Spinner /> : 'Search'}
            </button>
            <button type="button" className="btn-outline" onClick={reset}>Reset</button>
          </div>
        </div>
      </form>

      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner /></div>
      )}

      {data && (
        <div style={{ overflow: 'auto', flex: 1, padding: '0 0 16px' }}>
          <section aria-label="Team breakdown">
            <h2 className="section-title">Team</h2>
            <div className="stat-cards" style={{ marginTop: 12 }}>
              <div className="stat-card">
                <span className="stat-card__label">L1 Members</span>
                <span className="stat-card__value">{data.team.l1.toLocaleString('en-IN')}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">L2 Members</span>
                <span className="stat-card__value">{data.team.l2.toLocaleString('en-IN')}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">L3 Members</span>
                <span className="stat-card__value">{data.team.l3.toLocaleString('en-IN')}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Total Team</span>
                <span className="stat-card__value">{data.team.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </section>

          <section aria-label="First deposit">
            <h2 className="section-title" style={{ marginTop: 24 }}>First Deposit</h2>
            <div className="stat-cards" style={{ marginTop: 12 }}>
              <div className="stat-card">
                <span className="stat-card__label">First Depositors</span>
                <span className="stat-card__value">{data.firstDeposit.count.toLocaleString('en-IN')}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Total Amount</span>
                <span className="stat-card__value text-green">₹{data.firstDeposit.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </section>

          {renderStatusTable('Deposits', { totalAmount: data.deposits.totalAmount, totalCount: data.deposits.totalCount }, data.deposits)}
          {renderStatusTable('Withdrawals', { totalAmount: data.withdrawals.totalAmount, totalCount: data.withdrawals.totalCount }, data.withdrawals)}
        </div>
      )}
    </div>
  )
}