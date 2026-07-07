import { useState, useEffect, useCallback } from 'react'
import { fetchDashboard } from '../api/dashboard'
import type { DashboardResponse } from '../api/dashboard'
import { useTheme } from '../contexts/ThemeContext'
import Spinner from '../components/Spinner'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

const COLORS_LIGHT = ['#409eff', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#14b8a6', '#eab308']
const COLORS_DARK  = ['#60a5fa', '#4ade80', '#fb923c', '#f87171', '#a78bfa', '#2dd4bf', '#facc15']

function fmt(num: number | undefined | null, suffix = ''): string {
  if (num == null) return '—'
  const n = Number(num)
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(1) + 'Cr' + suffix
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + 'L' + suffix
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K' + suffix
  return '₹' + n.toLocaleString('en-IN') + suffix
}

function fmtCount(num: number | undefined | null): string {
  if (num == null) return '—'
  return Number(num).toLocaleString('en-IN')
}

function pct(rate: number | undefined | null): string {
  if (rate == null) return '—'
  return (Number(rate) * 100).toFixed(1) + '%'
}

function PeriodBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button className={'period-btn' + (active ? ' period-btn--active' : '')} onClick={onClick}>
      {label}
    </button>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="dash-stat">
      <span className="dash-stat__label">{label}</span>
      <span className="dash-stat__value" style={color ? { color } : undefined}>{value}</span>
      {sub && <span className="dash-stat__sub">{sub}</span>}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dash-chart-card">
      <h3 className="dash-chart-card__title">{title}</h3>
      {children}
    </div>
  )
}

interface PeriodOption { label: string; value: string }
const PERIODS: PeriodOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Month', value: 'month' },
  { label: 'All', value: '' },
]

export default function Dashboard() {
  const { theme } = useTheme()
  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT

  const [period, setPeriod] = useState('today')
  const [date, setDate] = useState('')
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p: string, d: string) => {
    setLoading(true)
    try {
      const res = await fetchDashboard(p || undefined, d || undefined)
      setData(res)
    } catch { /* toast handled upstream */ }
    setLoading(false)
  }, [])

  useEffect(() => { load(period, date) }, [period, date, load])

  const d = data
  const ov = d?.overview
  const dep = d?.deposits
  const wd = d?.withdrawals
  const ac = d?.agentCommission
  const pf = d?.platform
  const kpi = d?.kpi
  const tr = d?.trends
  const dist = d?.distributions

  return (
    <div className="content">
      <div className="period-bar">
        {PERIODS.map(p => (
          <PeriodBtn key={p.value} active={period === p.value}
            onClick={() => { setPeriod(p.value); setDate('') }} label={p.label} />
        ))}
        <input type="date" className="period-date" value={date}
          onChange={e => { setDate(e.target.value); setPeriod('') }}
          aria-label="Custom date" />
        {loading && <Spinner />}
      </div>

      {!d ? null : (
        <>
          <div className="dash-section">
            <div className="dash-grid dash-grid--4">
              <StatCard label="Total Users" value={fmtCount(ov?.totalUsers)} color={colors[0]} />
              <StatCard label="New" value={fmtCount(ov?.newUsers)} sub="this period" color={colors[1]} />
              <StatCard label="Active Users" value={fmtCount(kpi?.activeUsers)} sub="this period" color={colors[2]} />
              <StatCard label="Users Who Deposited" value={fmtCount(kpi?.usersWhoDeposited)} color={colors[3]} />
            </div>
          </div>

          <div className="dash-section">
            <div className="dash-grid dash-grid--4">
              <StatCard label="Total Deposits" value={fmt(dep?.total)} sub={`${fmtCount(dep?.count)} orders · ${fmtCount(dep?.pendingCount)} pending`} color={colors[0]} />
              <StatCard label="Total Withdrawals" value={fmt(wd?.total)} sub={`${fmtCount(wd?.count)} requests · ${pct(kpi?.withdrawalSuccessRate)} success`} color={colors[2]} />
              <StatCard label="Agent Commission" value={fmt(ac?.total)} sub={`${fmtCount(ac?.count)} payments`} color={colors[1]} />
              <StatCard label="Platform Balance" value={fmt(pf?.totalBalance)} sub={`${fmt(pf?.totalWithdrawable)} withdrawable · ${fmt(pf?.pendingTurnover)} pending turnover`} color={colors[5]} />
            </div>
          </div>

          {kpi && (
            <div className="dash-section">
              <h2 className="section-title">KPIs</h2>
              <div className="dash-grid dash-grid--6">
                <StatCard label="Avg Deposit" value={fmt(kpi.avgDepositAmount)} />
                <StatCard label="Avg Withdrawal" value={fmt(kpi.avgWithdrawalAmount)} />
                <StatCard label="Deposit Success" value={pct(kpi.depositSuccessRate)} />
                <StatCard label="Withdrawal Success" value={pct(kpi.withdrawalSuccessRate)} />
                <StatCard label="Repeat Depositors" value={fmtCount(kpi.repeatDepositors)} />
              </div>
            </div>
          )}

          {tr && (
            <div className="dash-section">
              <h2 className="section-title">Trends</h2>
              <div className="dash-chart-row">
                <ChartCard title="Deposits & Withdrawals">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={tr.deposits.map((_, i) => ({
                      date: tr.deposits[i]?.date ?? '',
                      deposits: tr.deposits[i]?.amount ?? 0,
                      withdrawals: tr.withdrawals[i]?.amount ?? 0,
                    }))}>
                      <defs>
                        <linearGradient id="dashDepGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/><stop offset="95%" stopColor={colors[0]} stopOpacity={0}/></linearGradient>
                        <linearGradient id="dashWdGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors[2]} stopOpacity={0.3}/><stop offset="95%" stopColor={colors[2]} stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                      <Tooltip />
                      <Area type="monotone" dataKey="deposits" stroke={colors[0]} fill="url(#dashDepGrad)" name="Deposits" />
                      <Area type="monotone" dataKey="withdrawals" stroke={colors[2]} fill="url(#dashWdGrad)" name="Withdrawals" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Net Cashflow">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={tr.netCashflow.map(p => ({ date: p.date, amount: p.amount ?? 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                      <Tooltip />
                      <Bar dataKey="amount" fill={colors[1]} name="Net Cashflow" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <div className="dash-chart-row">
                <ChartCard title="Signups">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={tr.signups.map(p => ({ date: p.date, count: p.count ?? 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke={colors[4]} fill={colors[4] + '33'} name="Signups" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          )}

          {dist && (
            <div className="dash-section">
              <h2 className="section-title">Distributions</h2>
              <div className="dash-chart-row">
                {dist.depositsByChannel.length > 0 && (
                  <ChartCard title="Deposits by Channel">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dist.depositsByChannel.map(d => ({ name: d.channel, amount: d.amount ?? 0 }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} stroke="var(--color-text-secondary, #888)" />
                        <Tooltip />
                        <Bar dataKey="amount" fill={colors[0]} radius={[0,2,2,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
                {dist.withdrawalsByMethod.length > 0 && (
                  <ChartCard title="Withdrawals by Method">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dist.withdrawalsByMethod.map(d => ({ name: d.method, amount: d.amount ?? 0 }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} stroke="var(--color-text-secondary, #888)" />
                        <Tooltip />
                        <Bar dataKey="amount" fill={colors[2]} radius={[0,2,2,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
                {dist.transactionTypes.length > 0 && (
                  <ChartCard title="Transaction Types">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dist.transactionTypes.map(d => ({ name: d.type, amount: d.amount ?? 0 }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} stroke="var(--color-text-secondary, #888)" />
                        <Tooltip />
                        <Bar dataKey="amount" fill={colors[5]} radius={[0,2,2,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
              </div>
              <div className="dash-chart-row">
                {dist.usersByVipLevel.length > 0 && (
                  <ChartCard title="Users by VIP Level">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dist.usersByVipLevel.map(d => ({ name: d.level, count: d.count }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary, #888)" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} stroke="var(--color-text-secondary, #888)" />
                        <Tooltip />
                        <Bar dataKey="count" fill={colors[4]} radius={[0,2,2,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
                {dist.usersByStatus.length > 0 && (
                  <ChartCard title="Users by Status">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={dist.usersByStatus.map(d => ({ name: d.status, value: d.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {dist.usersByStatus.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
                {dist.depositByStatus.length > 0 && (
                  <ChartCard title="Deposits by Status">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={dist.depositByStatus.map(d => ({ name: d.status, value: d.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {dist.depositByStatus.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
              </div>
            </div>
          )}

          {kpi?.pendingQueueAging && kpi.pendingQueueAging.length > 0 && (
            <div className="dash-section">
              <h2 className="section-title">Pending Queue Aging</h2>
              <div className="dash-aging">
                {kpi.pendingQueueAging.map(b => (
                  <div key={b.bucket} className="dash-aging__item">
                    <span className="dash-aging__bucket">{b.bucket}</span>
                    <span className="dash-aging__count">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
