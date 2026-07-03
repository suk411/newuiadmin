import { useState, useRef } from 'react'
import axios from 'axios'
import { fetchTeamStats, fetchTeamMembers } from '../api/agency'
import type { TeamStats, TeamMember, TierAmount } from '../api/agency'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
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

function TierRow({ label, data }: { label: string; data: TierAmount }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
      <span style={{ fontWeight: 600, minWidth: 30 }}>{label}</span>
      <span style={{ color: 'var(--color-primary, #208fff)', fontWeight: 600 }}>₹{(data?.totalAmount ?? 0).toLocaleString('en-IN')}</span>
      <span>{(data?.totalCount ?? 0).toLocaleString('en-IN')} orders</span>
    </div>
  )
}

function TeamRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
      <span style={{ fontWeight: 600, minWidth: 30 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{(value ?? 0).toLocaleString('en-IN')} members</span>
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

  const renderTierCard = (title: string, data: { l1: TierAmount; l2: TierAmount; l3: TierAmount }) => (
    <section aria-label={title} style={{ marginTop: 24 }}>
      <h2 className="section-title">{title}</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data.l1 && <TierRow label="L1" data={data.l1} />}
        {data.l2 && <TierRow label="L2" data={data.l2} />}
        {data.l3 && <TierRow label="L3" data={data.l3} />}
      </div>
    </section>
  )

  return (
    <div className="content content--table">
      <div className="filters-bar" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button"
            style={{
              padding: '8px 24px', fontSize: 14, fontWeight: 600,
              border: 'none', borderBottom: tab === 'stats' ? '3px solid var(--color-primary, #208fff)' : '3px solid transparent',
              background: 'none', cursor: 'pointer', color: tab === 'stats' ? 'var(--color-primary, #208fff)' : '#666',
              transition: 'all 0.15s',
            }}
            onClick={() => setTab('stats')}>Stats</button>
          <button type="button"
            style={{
              padding: '8px 24px', fontSize: 14, fontWeight: 600,
              border: 'none', borderBottom: tab === 'members' ? '3px solid var(--color-primary, #208fff)' : '3px solid transparent',
              background: 'none', cursor: 'pointer', color: tab === 'members' ? 'var(--color-primary, #208fff)' : '#666',
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
            <div style={{ overflow: 'auto', flex: 1, padding: '0 0 16px' }}>
              <section aria-label="Team breakdown" style={{ marginTop: 24 }}>
                <h2 className="section-title">Team</h2>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <TeamRow label="L1" value={statsData.team.l1 ?? 0} />
                  <TeamRow label="L2" value={statsData.team.l2 ?? 0} />
                  <TeamRow label="L3" value={statsData.team.l3 ?? 0} />
                  <TeamRow label="Total" value={statsData.team.total ?? 0} />
                </div>
              </section>

              {renderTierCard('First Deposit', statsData.firstDeposit)}
              {renderTierCard('Deposits', statsData.deposits)}
              {renderTierCard('Withdrawals', statsData.withdrawals)}
            </div>
          )}
        </>
      )}

      {tab === 'members' && (
        <section className="card" style={{ flex: 1, overflow: 'auto' }}>
          {membersLoading ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner /></div>
          ) : !membersFetched.current ? (
            <div className="empty-state"><div className="empty-state__icon">📋</div>Search a user to view team members</div>
          ) : members.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">📋</div>No team members found</div>
          ) : (
            <>
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
                    {members.map((m) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
              {membersTotal > 0 && (
                <div className="pagination">
                  <span>Page {membersPage} of {Math.ceil(membersTotal / MEMBER_LIMIT)}</span>
                  <button className="pagination__btn" disabled={membersPage <= 1} onClick={() => loadMembers(membersPage - 1)}>‹</button>
                  <button className="pagination__btn active">{membersPage}</button>
                  <button className="pagination__btn" disabled={membersPage >= Math.ceil(membersTotal / MEMBER_LIMIT)} onClick={() => loadMembers(membersPage + 1)}>›</button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}