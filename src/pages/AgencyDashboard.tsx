import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { fetchTeamStats, fetchTeamMembers } from '../api/agency'
import type { TeamStats, TeamMember } from '../api/agency'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import TabButton from '../components/TabButton'
import { useExportBar } from '../components/ExportBarContext'
import type { ExportColumn } from '../utils/export'
import { formatDateTime12 } from '../utils/format'

const MEMBER_LIMIT = 20

const MEMBER_COLUMNS: ExportColumn[] = [
  { key: 'userId', label: 'User ID' },
  { key: 'level', label: 'Level' },
  { key: 'registeredAt', label: 'Registered' },
  { key: 'totalDeposit', label: 'Total Deposit' },
  { key: 'totalWithdrawal', label: 'Total Withdrawal' },
  { key: 'balance', label: 'Balance' },
  { key: 'bindBank', label: 'Bank Bound' },
  { key: 'multipleIp', label: 'Multi IP' },
]

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function AgencyDashboard() {
  const [tab, setTab] = useState<'stats' | 'members'>('stats')
  const [userId, setUserId] = useState('')
  const [tier, setTier] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const [statsLoading, setStatsLoading] = useState(false)
  const [statsData, setStatsData] = useState<TeamStats | null>(null)

  const [membersLoading, setMembersLoading] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [membersTotal, setMembersTotal] = useState(0)
  const [membersPage, setMembersPage] = useState(1)
  const membersFetched = useRef(false)
  const { setExportProps } = useExportBar()

  useEffect(() => {
    if (tab === 'members') {
      setExportProps({ columns: MEMBER_COLUMNS, data: members as unknown as Record<string, unknown>[], filename: 'team-members' })
    }
    return () => setExportProps(null)
  }, [tab, members, setExportProps])

  const buildParams = (extra: Record<string, string | number> = {}) => {
    const p: Record<string, string | number> = { userId: userId.trim(), ...extra }
    if (tier) p.tier = tier
    if (dateFrom) p.dateFrom = dateFrom
    if (dateTo) p.dateTo = dateTo
    return p
  }

  const handleSearchStats = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return
    setStatsLoading(true)
    setStatsData(null)
    try {
      const res = await fetchTeamStats(buildParams() as Record<string, string>)
      setStatsData(res)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setStatsLoading(false) }
  }

  const loadMembers = async (page = 1) => {
    if (!userId.trim()) return
    setMembersLoading(true)
    try {
      const params: Record<string, string | number> = { ...buildParams(), page, limit: MEMBER_LIMIT }
      if (search.trim()) params.search = search.trim()
      const res = await fetchTeamMembers(params)
      setMembers(res.items ?? [])
      setMembersTotal(res.total)
      setMembersPage(res.page)
      membersFetched.current = true
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setMembersLoading(false) }
  }

  const handleSearchMembers = (e: React.FormEvent) => {
    e.preventDefault()
    loadMembers(1)
  }

  const reset = () => {
    setUserId('')
    setTier('')
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setStatsData(null)
    setMembers([])
    setMembersTotal(0)
    membersFetched.current = false
  }

  return (
    <div className="content content--table">
      <div className="filters-bar" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>Stats</TabButton>
          <TabButton active={tab === 'members'} onClick={() => setTab('members')}>Members</TabButton>
        </div>
      </div>
      <form className="filters-bar" onSubmit={tab === 'stats' ? handleSearchStats : handleSearchMembers}>
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
        {tab === 'members' && (
          <div className="filter-group">
            <label>Search UserId</label>
            <input placeholder="Search member ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        )}
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={!userId.trim() || (tab === 'stats' ? statsLoading : membersLoading)}
              style={{ opacity: !userId.trim() || (tab === 'stats' ? statsLoading : membersLoading) ? 0.6 : 1 }}>
              {(tab === 'stats' ? statsLoading : membersLoading) ? <Spinner /> : 'Search'}
            </button>
            <button type="button" className="btn-outline" onClick={reset}>Reset</button>
          </div>
        </div>
      </form>

      <div className="tab-fade-in" key={tab} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {tab === 'stats' && (
        <>
          {statsLoading && <div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner /></div>}
          {statsData && (
            <>
              <section aria-label="Team" style={{ marginTop: 16 }}>
                <h2 className="section-title">Team</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 1</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{(statsData.team.l1 ?? 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 2</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{(statsData.team.l2 ?? 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 3</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{(statsData.team.l3 ?? 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{(statsData.team.total ?? 0).toLocaleString('en-IN')}</span></div>
                </div>
              </section>
              <section aria-label="First Deposit" style={{ marginTop: 16 }}>
                <h2 className="section-title">First Deposit</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {statsData.firstDeposit.l1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 1</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(statsData.firstDeposit.l1.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>}
                  {statsData.firstDeposit.l2 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 2</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(statsData.firstDeposit.l2.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>}
                  {statsData.firstDeposit.l3 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 3</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(statsData.firstDeposit.l3.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>}
                </div>
              </section>
              <section aria-label="Deposits" style={{ marginTop: 16 }}>
                <h2 className="section-title">Deposits</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {statsData.deposits.l1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 1</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.deposits.l1.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.deposits.l1.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                  {statsData.deposits.l2 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 2</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.deposits.l2.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.deposits.l2.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                  {statsData.deposits.l3 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 3</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.deposits.l3.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.deposits.l3.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                </div>
              </section>
              <section aria-label="Withdrawals" style={{ marginTop: 16 }}>
                <h2 className="section-title">Withdrawals</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {statsData.withdrawals.l1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 1</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.withdrawals.l1.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.withdrawals.l1.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                  {statsData.withdrawals.l2 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 2</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.withdrawals.l2.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.withdrawals.l2.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                  {statsData.withdrawals.l3 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tier 3</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.withdrawals.l3.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.withdrawals.l3.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                </div>
              </section>
            </>
          )}
        </>
      )}

      {tab === 'members' && (
        <section className="card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="table-wrap" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <table className="table">
              <thead><tr>
                <th>User ID</th>
                <th>Level</th>
                <th>Registered</th>
                <th>Total Deposit</th>
                <th>Total Withdrawal</th>
                <th>Balance</th>
                <th>Bank Bound</th>
                <th>Multi IP</th>
              </tr></thead>
              <tbody>
                {!membersFetched.current && !membersLoading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div className="empty-state"><div className="empty-state__icon">📋</div>Search a user to view team members</div>
                  </td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 0' }}>
                    {membersLoading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>No team members found</div>}
                  </td></tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.userId} tabIndex={0}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.userId}</td>
                      <td>{m.level}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(m.registeredAt)}</td>
                      <td>₹{m.totalDeposit.toLocaleString('en-IN')}</td>
                      <td>₹{m.totalWithdrawal.toLocaleString('en-IN')}</td>
                      <td>₹{m.balance.toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${m.bindBank ? 'badge--success' : 'badge--danger'}`}>{m.bindBank ? 'Yes' : 'No'}</span></td>
                      <td><span className={`badge ${m.multipleIp ? 'badge--danger' : 'badge--success'}`}>{m.multipleIp ? 'Yes' : 'No'}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={membersPage} total={membersTotal} limit={MEMBER_LIMIT} loading={membersLoading} onChange={(p) => loadMembers(p)} />
        </section>
      )}
      </div>
    </div>
  )
}