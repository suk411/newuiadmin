import { useState, useEffect } from 'react'
import { fetchDashboard } from '../api/dashboard'

export default function Dashboard() {
  const [d, setD] = useState<any>(null)

  useEffect(() => {
    fetchDashboard('today').then((raw: any) => {
      setD(raw?.data ?? raw)
    }).catch(() => {})
  }, [])

  const ov = d?.overview
  const dep = d?.deposits
  const wd = d?.withdrawals
  const ac = d?.agentCommission

  return (
    <div className="content">
      <section aria-label="User statistics">
        <h2 className="section-title">Users</h2>
        <div className="stat-cards" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <span className="stat-card__label">Total Users</span>
            <span className="stat-card__value text-blue">{ov?.totalUsers != null ? ov.totalUsers.toLocaleString() : '—'}</span>
            <span className="stat-card__change">Registered accounts</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">New Today</span>
            <span className="stat-card__value text-green">{ov?.newUsers != null ? ov.newUsers.toLocaleString() : '—'}</span>
            <span className="stat-card__change up">+{ov?.newUsers ?? 0} today</span>
          </div>
        </div>
      </section>

      <section aria-label="Deposit statistics">
        <h2 className="section-title">Deposits</h2>
        <div className="stat-cards" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card__label">Total Recharges</span>
              <span className="stat-card__change up">{dep?.count ?? 0} orders</span>
            </div>
            <span className="stat-card__value text-orange">{dep?.total != null ? `₹${Number(dep.total).toLocaleString('en-IN')}` : '—'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Pending</span>
            <span className="stat-card__value text-red">{dep?.pendingCount != null ? dep.pendingCount.toLocaleString() : '—'}</span>
            <span className="stat-card__change down">Awaiting approval</span>
          </div>
        </div>
      </section>

      <section aria-label="Withdrawal statistics">
        <h2 className="section-title">Withdrawals</h2>
        <div className="stat-cards" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <span className="stat-card__label">Total Requests</span>
            <span className="stat-card__value">{wd?.count != null ? wd.count.toLocaleString() : '—'}</span>
            <span className="stat-card__change">All withdrawals</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Total Amount</span>
            <span className="stat-card__value text-orange">{wd?.total != null ? `₹${Number(wd.total).toLocaleString('en-IN')}` : '—'}</span>
            <span className="stat-card__change">Charge: ₹{wd?.chargeTotal != null ? Number(wd.chargeTotal).toLocaleString('en-IN') : '—'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Success</span>
            <span className="stat-card__value text-green">{wd?.success?.count != null ? wd.success.count.toLocaleString() : '—'}</span>
            <span className="stat-card__change up">₹{wd?.success?.total != null ? Number(wd.success.total).toLocaleString('en-IN') : '—'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Pending</span>
            <span className="stat-card__value text-orange">{wd?.pending?.count != null ? wd.pending.count.toLocaleString() : '—'}</span>
            <span className="stat-card__change">₹{wd?.pending?.total != null ? Number(wd.pending.total).toLocaleString('en-IN') : '—'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Failed</span>
            <span className="stat-card__value text-red">{wd?.failed?.count != null ? wd.failed.count.toLocaleString() : '—'}</span>
            <span className="stat-card__change down">₹{wd?.failed?.total != null ? Number(wd.failed.total).toLocaleString('en-IN') : '—'}</span>
          </div>
        </div>
      </section>

      <section aria-label="Agent commission">
        <h2 className="section-title">Agent Commission</h2>
        <div className="stat-cards" style={{ marginTop: 12 }}>
          <div className="stat-card">
            <span className="stat-card__label">Total Commission</span>
            <span className="stat-card__value text-green">{ac?.total != null ? `₹${Number(ac.total).toLocaleString('en-IN')}` : '—'}</span>
            <span className="stat-card__change up">{ac?.count ?? 0} payments</span>
          </div>
        </div>
      </section>
    </div>
  )
}
