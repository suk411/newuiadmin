import { useState, useRef, useEffect } from 'react'
import { fetchTeamStats, fetchTeamMembers, fetchAgentCommission, runMidnightCalc, fetchCommissionRanks } from '../api/agency'
import type { TeamStats, TeamMember, AgentCommissionRecord, CommissionRankRecord, CommissionRankSummary } from '../api/agency'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import TabButton from '../components/TabButton'
import { useExportBar } from '../components/ExportBarContext'
import type { ExportColumn } from '../utils/export'
import { extractError } from '../utils/error'
import { formatDateTime12 } from '../utils/format'

const MEMBER_LIMIT = 20
const COMMISSION_LIMIT = 50

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

const COMMISSION_COLUMNS: ExportColumn[] = [
  { key: 'userId', label: 'User ID' },
  { key: 'date', label: 'Date' },
  { key: 'rebateLevel', label: 'Rebate Level' },
  { key: 'l1Bets', label: 'L1 Bets' },
  { key: 'l2Bets', label: 'L2 Bets' },
  { key: 'l3Bets', label: 'L3 Bets' },
  { key: 'l1Rate', label: 'L1 Rate' },
  { key: 'l2Rate', label: 'L2 Rate' },
  { key: 'l3Rate', label: 'L3 Rate' },
  { key: 'l1Amount', label: 'L1 Amount' },
  { key: 'l2Amount', label: 'L2 Amount' },
  { key: 'l3Amount', label: 'L3 Amount' },
  { key: 'totalAmount', label: 'Total Amount' },
  { key: 'status', label: 'Status' },
  { key: 'creditedAt', label: 'Credited At' },
]

const RANK_COLUMNS: ExportColumn[] = [
  { key: 'rank', label: 'Rank' },
  { key: 'userId', label: 'User ID' },
  { key: 'date', label: 'Date' },
  { key: 'rebateLevel', label: 'Rebate Level' },
  { key: 'l1Bets', label: 'L1 Bets' },
  { key: 'l2Bets', label: 'L2 Bets' },
  { key: 'l3Bets', label: 'L3 Bets' },
  { key: 'totalComm', label: 'Total Commission' },
]

export default function AgencyDashboard() {
  const [tab, setTab] = useState<'stats' | 'members' | 'commission' | 'calc' | 'rank'>('stats')
  const [userId, setUserId] = useState('')
  const [tier, setTier] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [rankDate, setRankDate] = useState('')
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const [statsLoading, setStatsLoading] = useState(false)
  const [statsData, setStatsData] = useState<TeamStats | null>(null)

  const [filterOpen, setFilterOpen] = useState(true)
  const [membersLoading, setMembersLoading] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [membersTotal, setMembersTotal] = useState(0)
  const [membersPage, setMembersPage] = useState(1)
  const membersFetched = useRef(false)
  const { setExportProps } = useExportBar()

  const [commissionLoading, setCommissionLoading] = useState(false)
  const [commissionData, setCommissionData] = useState<AgentCommissionRecord[]>([])
  const [commissionTotal, setCommissionTotal] = useState(0)
  const [commissionPage, setCommissionPage] = useState(1)
  const commissionFetched = useRef(false)

  const [calcLoading, setCalcLoading] = useState(false)
  const [calcResult, setCalcResult] = useState<{ processed: number; totalCommission: number } | null>(null)

  const [rankLoading, setRankLoading] = useState(false)
  const [rankData, setRankData] = useState<CommissionRankRecord[]>([])
  const [rankSummary, setRankSummary] = useState<CommissionRankSummary | null>(null)
  const [rankTotal, setRankTotal] = useState(0)
  const [rankPage, setRankPage] = useState(1)

  useEffect(() => {
    if (tab === 'members') {
      setExportProps({
        columns: MEMBER_COLUMNS,
        data: members.map((m) => ({
          userId: m.userId,
          level: m.level,
          registeredAt: formatDateTime12(m.registeredAt),
          totalDeposit: `₹${m.totalDeposit.toLocaleString('en-IN')}`,
          totalWithdrawal: `₹${m.totalWithdrawal.toLocaleString('en-IN')}`,
          balance: `₹${m.balance.toLocaleString('en-IN')}`,
          bindBank: m.bindBank ? 'Yes' : 'No',
          multipleIp: m.multipleIp ? 'Yes' : 'No',
        })),
        filename: 'team-members',
      })
    } else if (tab === 'commission') {
      setExportProps({
        columns: COMMISSION_COLUMNS,
        data: commissionData.map((r) => ({
          userId: r.userId,
          date: formatDateTime12(r.date),
          rebateLevel: r.rebateLevel,
          l1Bets: `₹${r.l1Bets.toLocaleString('en-IN')}`,
          l2Bets: `₹${r.l2Bets.toLocaleString('en-IN')}`,
          l3Bets: `₹${r.l3Bets.toLocaleString('en-IN')}`,
          l1Rate: `${(r.l1Rate * 100).toFixed(2)}%`,
          l2Rate: `${(r.l2Rate * 100).toFixed(2)}%`,
          l3Rate: `${(r.l3Rate * 100).toFixed(2)}%`,
          l1Amount: `₹${r.l1Amount.toLocaleString('en-IN')}`,
          l2Amount: `₹${r.l2Amount.toLocaleString('en-IN')}`,
          l3Amount: `₹${r.l3Amount.toLocaleString('en-IN')}`,
          totalAmount: `₹${r.totalAmount.toLocaleString('en-IN')}`,
          status: r.status,
          creditedAt: formatDateTime12(r.creditedAt),
        })),
        filename: 'agent-commission',
      })
    } else if (tab === 'rank') {
      setExportProps({
        columns: RANK_COLUMNS,
        data: rankData.map((r) => ({
          rank: `#${r.rank}`,
          userId: r.userId,
          date: formatDateTime12(r.date),
          rebateLevel: r.rebateLevel,
          l1Bets: `₹${r.l1Bets.toLocaleString('en-IN')}`,
          l2Bets: `₹${r.l2Bets.toLocaleString('en-IN')}`,
          l3Bets: `₹${r.l3Bets.toLocaleString('en-IN')}`,
          totalComm: `₹${r.totalComm.toLocaleString('en-IN')}`,
        })),
        filename: 'commission-rank',
      })
    }
    return () => setExportProps(null)
  }, [tab, members, commissionData, rankData, setExportProps])

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

  const loadCommission = async (page = 1) => {
    if (!userId.trim()) return
    setCommissionLoading(true)
    try {
      const params: Record<string, string | number> = { userId: userId.trim(), page, limit: COMMISSION_LIMIT }
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const res = await fetchAgentCommission(params)
      setCommissionData(res.data ?? [])
      setCommissionTotal(res.total)
      setCommissionPage(res.page)
      commissionFetched.current = true
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setCommissionLoading(false) }
  }

  const handleSearchCommission = (e: React.FormEvent) => {
    e.preventDefault()
    loadCommission(1)
  }

  const loadRanks = async (page = 1) => {
    setRankLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 50 }
      if (rankDate) params.date = rankDate
      const res = await fetchCommissionRanks(params)
      setRankData(res.data ?? [])
      setRankSummary(res.summary ?? null)
      setRankTotal(res.total)
      setRankPage(res.page)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setRankLoading(false) }
  }

  const handleSearchRanks = (e: React.FormEvent) => {
    e.preventDefault()
    loadRanks(1)
  }

  const handleRunCalc = async () => {
    setCalcLoading(true)
    setCalcResult(null)
    try {
      const res = await runMidnightCalc()
      setCalcResult(res)
      toast(`Processed ${res.processed} records, total commission: ₹${res.totalCommission.toLocaleString('en-IN')}`)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setCalcLoading(false) }
  }

  const reset = () => {
    setUserId('')
    setTier('')
    setDateFrom('')
    setDateTo('')
    setRankDate('')
    setSearch('')
    setStatsData(null)
    setMembers([])
    setMembersTotal(0)
    membersFetched.current = false
    setCommissionData([])
    setCommissionTotal(0)
    commissionFetched.current = false
    setCalcResult(null)
    setRankData([])
    setRankSummary(null)
    setRankTotal(0)
  }

  return (
    <div className="content content--table">
      <div className="filters-bar" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>Stats</TabButton>
          <TabButton active={tab === 'members'} onClick={() => setTab('members')}>Members</TabButton>
          <TabButton active={tab === 'commission'} onClick={() => setTab('commission')}>Commission</TabButton>
          <TabButton active={tab === 'rank'} onClick={() => setTab('rank')}>Rank</TabButton>
          <TabButton active={tab === 'calc'} onClick={() => setTab('calc')}>Midnight Calc</TabButton>
        </div>
      </div>
      {tab !== 'calc' && (
        <form className={"filters-bar" + (filterOpen ? '' : ' filters-bar--collapsed')} onSubmit={tab === 'stats' ? handleSearchStats : tab === 'members' ? handleSearchMembers : tab === 'rank' ? handleSearchRanks : handleSearchCommission}>
          {tab !== 'rank' && (
            <div className="filter-group">
              <label htmlFor="ad-userId">User ID</label>
              <input id="ad-userId" placeholder="Enter User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
          )}
          {tab !== 'rank' && (
            <div className="filter-group">
              <label htmlFor="ad-tier">Tier</label>
              <select id="ad-tier" value={tier} onChange={(e) => setTier(e.target.value)}>
                <option value="">All</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
              </select>
            </div>
          )}
          {tab === 'rank' ? (
            <div className="filter-group">
              <label htmlFor="ad-date">Date</label>
              <input id="ad-date" type="date" value={rankDate} onChange={(e) => setRankDate(e.target.value)} />
            </div>
          ) : (
            <>
              <div className="filter-group">
                <label htmlFor="ad-from">From</label>
                <input id="ad-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="filter-group">
                <label htmlFor="ad-to">To</label>
                <input id="ad-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </>
          )}
          {tab === 'members' && (
            <div className="filter-group">
              <label htmlFor="ad-searchUserId">Search UserId</label>
              <input id="ad-searchUserId" placeholder="Search member ID" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
          <div className="filter-group filter-actions" style={{ alignSelf: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn-filled" disabled={tab === 'rank' ? !rankDate.trim() : !userId.trim()}
                style={{ opacity: tab === 'rank' ? (!rankDate.trim() ? 0.6 : 1) : (!userId.trim() ? 0.6 : 1) }}>
                {(tab === 'stats' ? statsLoading : tab === 'members' ? membersLoading : tab === 'rank' ? rankLoading : commissionLoading) ? <Spinner /> : 'Search'}
              </button>
              <button type="button" className="btn-outline" onClick={reset}>Reset</button>
              <button type="button" className="btn-outline" onClick={() => setFilterOpen(!filterOpen)} style={{ fontSize: 12, padding: '2px 8px' }} aria-label={filterOpen ? 'Collapse filters' : 'Expand filters'}>{filterOpen ? '−' : '+'}</button>
            </div>
          </div>
        </form>
      )}

      <div className="tab-fade-in" key={tab} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {tab === 'stats' && (
        <>
          {statsLoading && <div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner /></div>}
          {statsData && (
            <>
              <section aria-label="Team" style={{ marginTop: 16 }}>
                <h2 className="section-title">Team</h2>
                <div className="dashboard-card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 1</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{(statsData.team.l1 ?? 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 2</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{(statsData.team.l2 ?? 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 3</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{(statsData.team.l3 ?? 0).toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Total</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{(statsData.team.total ?? 0).toLocaleString('en-IN')}</span></div>
                </div>
              </section>
              <section aria-label="First Deposit" style={{ marginTop: 16 }}>
                <h2 className="section-title">First Deposit</h2>
                <div className="dashboard-card">
                  {statsData.firstDeposit.l1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 1</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(statsData.firstDeposit.l1.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>}
                  {statsData.firstDeposit.l2 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 2</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(statsData.firstDeposit.l2.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>}
                  {statsData.firstDeposit.l3 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 3</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(statsData.firstDeposit.l3.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>}
                </div>
              </section>
              <section aria-label="Deposits" style={{ marginTop: 16 }}>
                <h2 className="section-title">Deposits</h2>
                <div className="dashboard-card">
                  {statsData.deposits.l1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 1</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.deposits.l1.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.deposits.l1.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                  {statsData.deposits.l2 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 2</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.deposits.l2.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.deposits.l2.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                  {statsData.deposits.l3 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 3</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.deposits.l3.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.deposits.l3.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                </div>
              </section>
              <section aria-label="Withdrawals" style={{ marginTop: 16 }}>
                <h2 className="section-title">Withdrawals</h2>
                <div className="dashboard-card">
                  {statsData.withdrawals.l1 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 1</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.withdrawals.l1.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.withdrawals.l1.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                  {statsData.withdrawals.l2 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 2</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.withdrawals.l2.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.withdrawals.l2.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
                  {statsData.withdrawals.l3 && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Tier 3</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(statsData.withdrawals.l3.totalAmount ?? 0).toLocaleString('en-IN')} ({(statsData.withdrawals.l3.totalCount ?? 0).toLocaleString('en-IN')})</span></div>}
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

      {tab === 'commission' && (
        <section className="card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="table-wrap" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <table className="table">
              <thead><tr>
                <th>User ID</th>
                <th>Date</th>
                <th>Rebate Level</th>
                <th>L1 Bets</th>
                <th>L2 Bets</th>
                <th>L3 Bets</th>
                <th>L1 Rate</th>
                <th>L2 Rate</th>
                <th>L3 Rate</th>
                <th>L1 Amount</th>
                <th>L2 Amount</th>
                <th>L3 Amount</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Credited At</th>
              </tr></thead>
              <tbody>
                {!commissionFetched.current && !commissionLoading ? (
                  <tr><td colSpan={15} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div className="empty-state"><div className="empty-state__icon">📋</div>Search a user to view commission records</div>
                  </td></tr>
                ) : commissionData.length === 0 ? (
                  <tr><td colSpan={15} style={{ textAlign: 'center', padding: '48px 0' }}>
                    {commissionLoading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>No commission records found</div>}
                  </td></tr>
                ) : (
                  commissionData.map((r, i) => (
                    <tr key={i} tabIndex={0}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.userId}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(r.date)}</td>
                      <td>{r.rebateLevel}</td>
                      <td>₹{r.l1Bets.toLocaleString('en-IN')}</td>
                      <td>₹{r.l2Bets.toLocaleString('en-IN')}</td>
                      <td>₹{r.l3Bets.toLocaleString('en-IN')}</td>
                      <td>{(r.l1Rate * 100).toFixed(2)}%</td>
                      <td>{(r.l2Rate * 100).toFixed(2)}%</td>
                      <td>{(r.l3Rate * 100).toFixed(2)}%</td>
                      <td>₹{r.l1Amount.toLocaleString('en-IN')}</td>
                      <td>₹{r.l2Amount.toLocaleString('en-IN')}</td>
                      <td>₹{r.l3Amount.toLocaleString('en-IN')}</td>
                      <td><strong>₹{r.totalAmount.toLocaleString('en-IN')}</strong></td>
                      <td><span className={`badge ${r.status === 'CREDITED' ? 'badge--success' : 'badge--warning'}`}>{r.status}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(r.creditedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={commissionPage} total={commissionTotal} limit={COMMISSION_LIMIT} loading={commissionLoading} onChange={(p) => loadCommission(p)} />
        </section>
      )}

      {tab === 'rank' && (
        <section className="card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {rankSummary && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: '12px 16px', background: '#f0f7ff', borderBottom: '1px solid #d0d0d0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Commission</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>₹{rankSummary.totalComm.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Highest Amount</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#f97316' }}>₹{rankSummary.highestAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Agents</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#409eff' }}>{rankSummary.totalAgents.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
          <div className="table-wrap" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <table className="table">
              <thead><tr>
                <th>Rank</th>
                <th>User ID</th>
                <th>Date</th>
                <th>Rebate Level</th>
                <th>L1 Bets</th>
                <th>L2 Bets</th>
                <th>L3 Bets</th>
                <th>Total Commission</th>
              </tr></thead>
              <tbody>
                {rankData.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 0' }}>
                    {rankLoading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>Select date range and search to view rankings</div>}
                  </td></tr>
                ) : (
                  rankData.map((r) => (
                    <tr key={r.rank} tabIndex={0}>
                      <td style={{ fontWeight: 700, color: r.rank <= 3 ? '#f59e0b' : undefined }}>#{r.rank}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.userId}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(r.date)}</td>
                      <td>{r.rebateLevel}</td>
                      <td>₹{r.l1Bets.toLocaleString('en-IN')}</td>
                      <td>₹{r.l2Bets.toLocaleString('en-IN')}</td>
                      <td>₹{r.l3Bets.toLocaleString('en-IN')}</td>
                      <td><strong>₹{r.totalComm.toLocaleString('en-IN')}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={rankPage} total={rankTotal} limit={50} loading={rankLoading} onChange={(p) => loadRanks(p)} />
        </section>
      )}

      {tab === 'calc' && (
        <section className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <h2 className="section-title" style={{ width: '100%' }}>Midnight Calculation</h2>
          <p style={{ color: '#666', fontSize: 13, textAlign: 'center', margin: 0 }}>
            Processes all unclaimed DailyGameStats and credits agent wallets.
          </p>
          <button className="btn-filled" onClick={handleRunCalc} disabled={calcLoading}
            style={{ padding: '12px 32px', fontSize: 14, height: 'auto' }}>
            {calcLoading ? <Spinner /> : 'Run Midnight Calc'}
          </button>
          {calcResult && (
            <div style={{ background: '#f0f7ff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Processed</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#409eff' }}>{calcResult.processed}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 12, marginBottom: 4 }}>Total Commission Credited</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>₹{calcResult.totalCommission.toLocaleString('en-IN')}</div>
            </div>
          )}
        </section>
      )}
      </div>
    </div>
  )
}