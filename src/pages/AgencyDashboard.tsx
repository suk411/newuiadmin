import { useState, useRef } from 'react'
import axios from 'axios'
import { fetchTeamStats, fetchTeamMembers } from '../api/agency'
import type { TeamStats, TeamMember, TierAmount } from '../api/agency'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import ExportButton from '../components/ExportButton'
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

function TierRow({ label, data, amountClass }: { label: string; data: TierAmount; amountClass: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
      <span style={{ fontWeight: 600, minWidth: 30 }}>{label}</span>
      <span className={`stat-card__value ${amountClass}`}>₹{(data?.totalAmount ?? 0).toLocaleString('en-IN')}</span>
      <span className="stat-card__change up">{(data?.totalCount ?? 0).toLocaleString('en-IN')} orders</span>
    </div>
  )
}

function TeamRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
      <span style={{ fontWeight: 600, minWidth: 30 }}>{label}</span>
      <span className="stat-card__value text-blue">{(value ?? 0).toLocaleString('en-IN')} members</span>
    </div>
  )
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
          <button type="button"
            style={{
              padding: '8px 24px', fontSize: 14, fontWeight: 600,
              border: tab === 'stats' ? '1px solid #d0d0d0' : '1px solid transparent',
              borderRadius: 4,
              background: tab === 'stats' ? '#fff' : '#f0f0f0',
              boxShadow: tab === 'stats' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer', color: tab === 'stats' ? '#303133' : '#909399',
              transition: 'all 0.15s',
            }}
            onClick={() => setTab('stats')}>Stats</button>
          <button type="button"
            style={{
              padding: '8px 24px', fontSize: 14, fontWeight: 600,
              border: tab === 'members' ? '1px solid #d0d0d0' : '1px solid transparent',
              borderRadius: 4,
              background: tab === 'members' ? '#fff' : '#f0f0f0',
              boxShadow: tab === 'members' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer', color: tab === 'members' ? '#303133' : '#909399',
              transition: 'all 0.15s',
            }}
            onClick={() => setTab('members')}>Members</button>
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

      {tab === 'stats' && (
        <>
          {statsLoading && <div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner /></div>}
          {statsData && (
            <div className="card" style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, overflow: 'hidden' }}>
              <section aria-label="Team breakdown" style={{ borderRight: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                <h2 className="section-title" style={{ padding: '12px 16px', margin: 0 }}>Team</h2>
                <div style={{ padding: 0 }}>
                  <TeamRow label="L1" value={statsData.team.l1 ?? 0} />
                  <TeamRow label="L2" value={statsData.team.l2 ?? 0} />
                  <TeamRow label="L3" value={statsData.team.l3 ?? 0} />
                  <TeamRow label="Total" value={statsData.team.total ?? 0} />
                </div>
              </section>
              <section aria-label="First deposit" style={{ borderBottom: '1px solid #eee' }}>
                <h2 className="section-title" style={{ padding: '12px 16px', margin: 0 }}>First Deposit</h2>
                <div style={{ padding: 0 }}>
                  {statsData.firstDeposit.l1 && <TierRow label="L1" data={statsData.firstDeposit.l1} amountClass="text-green" />}
                  {statsData.firstDeposit.l2 && <TierRow label="L2" data={statsData.firstDeposit.l2} amountClass="text-green" />}
                  {statsData.firstDeposit.l3 && <TierRow label="L3" data={statsData.firstDeposit.l3} amountClass="text-green" />}
                </div>
              </section>
              <section aria-label="Deposits" style={{ borderRight: '1px solid #eee' }}>
                <h2 className="section-title" style={{ padding: '12px 16px', margin: 0 }}>Deposits</h2>
                <div style={{ padding: 0 }}>
                  {statsData.deposits.l1 && <TierRow label="L1" data={statsData.deposits.l1} amountClass="text-orange" />}
                  {statsData.deposits.l2 && <TierRow label="L2" data={statsData.deposits.l2} amountClass="text-orange" />}
                  {statsData.deposits.l3 && <TierRow label="L3" data={statsData.deposits.l3} amountClass="text-orange" />}
                </div>
              </section>
              <section aria-label="Withdrawals">
                <h2 className="section-title" style={{ padding: '12px 16px', margin: 0 }}>Withdrawals</h2>
                <div style={{ padding: 0 }}>
                  {statsData.withdrawals.l1 && <TierRow label="L1" data={statsData.withdrawals.l1} amountClass="text-orange" />}
                  {statsData.withdrawals.l2 && <TierRow label="L2" data={statsData.withdrawals.l2} amountClass="text-orange" />}
                  {statsData.withdrawals.l3 && <TierRow label="L3" data={statsData.withdrawals.l3} amountClass="text-orange" />}
                </div>
              </section>
            </div>
          )}
        </>
      )}

      {tab === 'members' && (
        <section className="card" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
            <ExportButton columns={MEMBER_COLUMNS} data={members as unknown as Record<string, unknown>[]} filename="team-members" />
          </div>
          <div className="table-wrap">
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
          <Pagination page={membersPage} total={membersTotal} limit={MEMBER_LIMIT} onChange={(p) => loadMembers(p)} />
        </section>
      )}
    </div>
  )
}