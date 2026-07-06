import { useState, useEffect } from 'react'
import { fetchDashboard } from '../api/dashboard'

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="stat-label">{label}</span>
      <span style={{ fontSize: 20, fontWeight: 700, color: color || 'inherit', lineHeight: 1.2 }}>{value}</span>
    </div>
  )
}

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
        <div className="dashboard-card">
          <StatCard label="Total Users" value={ov?.totalUsers != null ? ov.totalUsers.toLocaleString() : '—'} color="#409eff" />
          <StatCard label="New Today" value={ov?.newUsers != null ? ov.newUsers.toLocaleString() : '—'} color="#22c55e" />
        </div>
      </section>

      <section aria-label="Deposit statistics" style={{ marginTop: 16 }}>
        <h2 className="section-title">Deposits</h2>
        <div className="dashboard-card">
          <StatCard label="Total Recharges" value={dep?.total != null ? `₹${Number(dep.total).toLocaleString('en-IN')}` : '—'} color="#f97316" />
          <StatCard label="Orders" value={dep?.count != null ? dep.count.toLocaleString() : '—'} color="#409eff" />
          <StatCard label="Pending" value={dep?.pendingCount != null ? dep.pendingCount.toLocaleString() : '—'} color="#ef4444" />
        </div>
      </section>

      <section aria-label="Withdrawal statistics" style={{ marginTop: 16 }}>
        <h2 className="section-title">Withdrawals</h2>
        <div className="dashboard-card">
          <StatCard label="Total Requests" value={wd?.count != null ? wd.count.toLocaleString() : '—'} />
          <StatCard label="Total Amount" value={wd?.total != null ? `₹${Number(wd.total).toLocaleString('en-IN')}` : '—'} color="#f97316" />
          <StatCard label="Success" value={wd?.success?.count != null ? wd.success.count.toLocaleString() : '—'} color="#22c55e" />
          <StatCard label="Pending" value={wd?.pending?.count != null ? wd.pending.count.toLocaleString() : '—'} color="#f97316" />
          <StatCard label="Failed" value={wd?.failed?.count != null ? wd.failed.count.toLocaleString() : '—'} color="#ef4444" />
        </div>
      </section>

      <section aria-label="Agent commission" style={{ marginTop: 16 }}>
        <h2 className="section-title">Agent Commission</h2>
        <div className="dashboard-card">
          <StatCard label="Total Commission" value={ac?.total != null ? `₹${Number(ac.total).toLocaleString('en-IN')}` : '—'} color="#22c55e" />
          <StatCard label="Payments" value={ac?.count ?? 0} />
        </div>
      </section>
    </div>
  )
}
