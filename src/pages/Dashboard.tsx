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
        <div style={{ display: 'flex', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Users</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{ov?.totalUsers != null ? ov.totalUsers.toLocaleString() : '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Today</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>{ov?.newUsers != null ? ov.newUsers.toLocaleString() : '—'}</span></div>
        </div>
      </section>

      <section aria-label="Deposit statistics" style={{ marginTop: 16 }}>
        <h2 className="section-title">Deposits</h2>
        <div style={{ display: 'flex', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Recharges</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>{dep?.total != null ? `₹${Number(dep.total).toLocaleString('en-IN')}` : '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{dep?.count != null ? dep.count.toLocaleString() : '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</span><span style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', lineHeight: 1.2 }}>{dep?.pendingCount != null ? dep.pendingCount.toLocaleString() : '—'}</span></div>
        </div>
      </section>

      <section aria-label="Withdrawal statistics" style={{ marginTop: 16 }}>
        <h2 className="section-title">Withdrawals</h2>
        <div style={{ display: 'flex', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Requests</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{wd?.count != null ? wd.count.toLocaleString() : '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>{wd?.total != null ? `₹${Number(wd.total).toLocaleString('en-IN')}` : '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Success</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>{wd?.success?.count != null ? wd.success.count.toLocaleString() : '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>{wd?.pending?.count != null ? wd.pending.count.toLocaleString() : '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed</span><span style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', lineHeight: 1.2 }}>{wd?.failed?.count != null ? wd.failed.count.toLocaleString() : '—'}</span></div>
        </div>
      </section>

      <section aria-label="Agent commission" style={{ marginTop: 16 }}>
        <h2 className="section-title">Agent Commission</h2>
        <div style={{ display: 'flex', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Commission</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>{ac?.total != null ? `₹${Number(ac.total).toLocaleString('en-IN')}` : '—'}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payments</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{ac?.count ?? 0}</span></div>
        </div>
      </section>
    </div>
  )
}
