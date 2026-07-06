import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchProviderBets, fetchWingoBets, fetchDailyStats } from '../api/bets'
import type { ProviderBet, WingoBet, DailyStat, BetSummary } from '../api/bets'
import { formatDateTime12 } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import TabButton from '../components/TabButton'
import { useExportBar } from '../components/ExportBarContext'
import type { ExportColumn } from '../utils/export'
import { useSearchSuggest } from '../hooks/useSearchSuggest'

const LIMIT = 20
type Tab = 'provider' | 'wingo' | 'daily'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function BetRecords() {
  const fmt = (v: number) => { const a = Math.abs(v).toLocaleString('en-IN'); return v >= 0 ? `₹${a}` : `-₹${a}` }
  const [tab, setTab] = useState<Tab>('provider')
  const [records, setRecords] = useState<(ProviderBet | WingoBet)[]>([])
  const [dailyRecords, setDailyRecords] = useState<DailyStat[]>([])
  const [summary, setSummary] = useState<BetSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [member, setMember] = useState('')
  const [site, setSite] = useState('')
  const [provStatus, setProvStatus] = useState('')
  const [provDateFrom, setProvDateFrom] = useState('')
  const [provDateTo, setProvDateTo] = useState('')

  const [wingoUserId, setWingoUserId] = useState('')
  const [gameMode, setGameMode] = useState('')
  const [wingoStatus, setWingoStatus] = useState('')
  const [wingoDateFrom, setWingoDateFrom] = useState('')
  const [wingoDateTo, setWingoDateTo] = useState('')

  const [dailyUserId, setDailyUserId] = useState('')
  const [dailyDateFrom, setDailyDateFrom] = useState('')
  const [dailyDateTo, setDailyDateTo] = useState('')

  const canSearch = tab === 'provider' ? (member || site || provStatus || provDateFrom || provDateTo) :
    tab === 'wingo' ? (wingoUserId || gameMode || wingoStatus || wingoDateFrom || wingoDateTo) :
    (dailyUserId || dailyDateFrom || dailyDateTo)

  const { setExportProps } = useExportBar()
  const memberSuggest = useSearchSuggest('member')
  const wingoSuggest = useSearchSuggest('wingoUserId')
  const dailySuggest = useSearchSuggest('dailyUserId')

  const fmtAmt = (v: number) => `₹${v.toLocaleString('en-IN')}`
  const fmtTime = (v: string | undefined | null) => v ? formatDateTime12(v) : '—'

  useEffect(() => {
    if (tab === 'daily') {
      setExportProps({
        columns: [
          { key: 'date', label: 'Date' },
          { key: 'wingoBetCount', label: 'Wingo Bets' },
          { key: 'wingoTotalAmt', label: 'Wingo Total Amt' },
          { key: 'wingoPayout', label: 'Wingo Payout' },
          { key: 'wingoWon', label: 'Wingo Won' },
          { key: 'wingoLost', label: 'Wingo Lost' },
          { key: 'providerBetCount', label: 'Prov Bets' },
          { key: 'providerTotalAmt', label: 'Prov Total Amt' },
          { key: 'providerPayout', label: 'Prov Payout' },
        ],
        data: dailyRecords.map((r) => ({
          date: formatDateTime12(r.date),
          wingoBetCount: r.wingo?.betCount ?? 0,
          wingoTotalAmt: fmtAmt(r.wingo?.totalAmount ?? 0),
          wingoPayout: fmtAmt(r.wingo?.totalPayout ?? 0),
          wingoWon: r.wingo?.wonCount ?? 0,
          wingoLost: r.wingo?.lostCount ?? 0,
          providerBetCount: r.provider?.betCount ?? 0,
          providerTotalAmt: fmtAmt(r.provider?.totalAmount ?? 0),
          providerPayout: fmtAmt(r.provider?.totalPayout ?? 0),
        })),
        filename: 'daily-stats',
      })
    } else if (tab === 'provider') {
      setExportProps({
        columns: [
          { key: 'userId', label: 'User ID' },
          { key: 'game', label: 'Site' },
          { key: 'amount', label: 'Amount' },
          { key: 'payout', label: 'Payout' },
          { key: 'gameId', label: 'Game ID' },
          { key: 'product', label: 'Product' },
          { key: 'status', label: 'Status' },
          { key: 'settleTime', label: 'Settle Time' },
          { key: 'createdAt', label: 'Created At' },
        ],
        data: (records as ProviderBet[]).map((r) => ({
          userId: r.userId,
          game: r.game,
          amount: fmtAmt(Number(r.amount ?? 0)),
          payout: fmtAmt(Number(r.payout ?? 0)),
          gameId: r.gameId,
          product: r.product,
          status: r.status === 1 ? 'Valid' : r.status,
          settleTime: fmtTime(r.settleTime),
          createdAt: formatDateTime12(r.createdAt),
        })),
        filename: 'provider-bets',
      })
    } else {
      setExportProps({
        columns: [
          { key: 'userId', label: 'User ID' },
          { key: 'gameMode', label: 'Mode' },
          { key: 'amount', label: 'Amount' },
          { key: 'realAmount', label: 'Real Amt' },
          { key: 'fee', label: 'Fee' },
          { key: 'payout', label: 'Payout' },
          { key: 'selectType', label: 'Bet On' },
          { key: 'issueNumber', label: 'Issue' },
          { key: 'orderNumber', label: 'Order No' },
          { key: 'status', label: 'Status' },
          { key: 'settleTime', label: 'Settle Time' },
          { key: 'createdAt', label: 'Created At' },
        ],
        data: (records as WingoBet[]).map((r) => ({
          userId: r.userId,
          gameMode: r.gameMode,
          amount: fmtAmt(Number(r.amount ?? 0)),
          realAmount: fmtAmt(Number(r.realAmount ?? 0)),
          fee: fmtAmt(Number(r.fee ?? 0)),
          payout: fmtAmt(Number(r.payout ?? 0)),
          selectType: r.selectType,
          issueNumber: r.issueNumber,
          orderNumber: r.orderNumber,
          status: r.status,
          settleTime: fmtTime(r.settleTime),
          createdAt: formatDateTime12(r.createdAt),
        })),
        filename: 'wingo-bets',
      })
    }
    return () => setExportProps(null)
  }, [tab, records, dailyRecords, setExportProps])

  const load = async (p = 1) => {
    if (!canSearch) { toast('Please apply at least one filter'); return }
    setLoading(true)
    setSummary(null)
    try {
      if (tab === 'daily') {
        if (dailyUserId) dailySuggest.saveValue(dailyUserId)
        const params: Record<string, string | number> = { page: p, limit: LIMIT }
        if (dailyUserId) params.userId = dailyUserId
        if (dailyDateFrom) params.dateFrom = dailyDateFrom
        if (dailyDateTo) params.dateTo = dailyDateTo
        const res = await fetchDailyStats(params)
        setDailyRecords(res.data)
        setTotal(res.total)
      } else if (tab === 'provider') {
        if (member) memberSuggest.saveValue(member)
        const params: Record<string, string | number> = { page: p, limit: LIMIT }
        if (member) params.member = member.startsWith('u') ? member : `u${member}`
        if (site) params.site = site
        if (provStatus) params.status = provStatus
        if (provDateFrom) params.dateFrom = provDateFrom
        if (provDateTo) params.dateTo = provDateTo
        const res = await fetchProviderBets(params)
        setRecords(res.data)
        setTotal(res.total)
        setSummary(res.summary)
      } else {
        if (wingoUserId) wingoSuggest.saveValue(wingoUserId)
        const params: Record<string, string | number> = { page: p, limit: LIMIT }
        if (wingoUserId) params.userId = wingoUserId
        if (gameMode) params.gameMode = gameMode
        if (wingoStatus) params.status = wingoStatus
        if (wingoDateFrom) params.dateFrom = wingoDateFrom
        if (wingoDateTo) params.dateTo = wingoDateTo
        const res = await fetchWingoBets(params)
        setRecords(res.data)
        setTotal(res.total)
        setSummary(res.summary)
      }
      setPage(p)
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMember(''); setSite(''); setProvStatus(''); setProvDateFrom(''); setProvDateTo('')
    setWingoUserId(''); setGameMode(''); setWingoStatus(''); setWingoDateFrom(''); setWingoDateTo('')
    setDailyUserId(''); setDailyDateFrom(''); setDailyDateTo('')
    setRecords([]); setDailyRecords([]); setTotal(0); setSummary(null)
  }

  return (
    <div className="content content--table">
      <div className="filters-bar filters-bar--tabs">
        <div className="btn-row">
          <TabButton active={tab === 'provider'} onClick={() => { setTab('provider'); reset() }}>Provider</TabButton>
          <TabButton active={tab === 'wingo'} onClick={() => { setTab('wingo'); reset() }}>Wingo</TabButton>
          <TabButton active={tab === 'daily'} onClick={() => { setTab('daily'); reset() }}>Daily Stats</TabButton>
        </div>
      </div>
      <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); load() }}>
        {tab === 'provider' ? (
          <>
            <div className="filter-group"><label htmlFor="bet-member">Member</label><input id="bet-member" placeholder="User ID or u+userId" value={member} onChange={(e) => setMember(e.target.value)} list={memberSuggest.listId} onFocus={memberSuggest.loadSuggestions} /><datalist id={memberSuggest.listId}>{memberSuggest.items.map((v, i) => <option key={i} value={v} />)}</datalist></div>
            <div className="filter-group"><label htmlFor="bet-site">Site</label>
              <select id="bet-site" value={site} onChange={(e) => setSite(e.target.value)}>
                <option value="">All</option>
                <option value="JE">JE</option>
                <option value="PG">PG</option>
                <option value="JD">JD</option>
                <option value="TU">TU</option>
              </select>
            </div>
            <div className="filter-group"><label htmlFor="bet-prov-status">Status</label>
              <select id="bet-prov-status" value={provStatus} onChange={(e) => setProvStatus(e.target.value)}>
                <option value="">All</option>
                <option value="1">Valid</option>
              </select>
            </div>
            <div className="filter-group"><label htmlFor="bet-prov-from">From</label><input id="bet-prov-from" type="date" value={provDateFrom} onChange={(e) => setProvDateFrom(e.target.value)} /></div>
            <div className="filter-group"><label htmlFor="bet-prov-to">To</label><input id="bet-prov-to" type="date" value={provDateTo} onChange={(e) => setProvDateTo(e.target.value)} /></div>
          </>
        ) : tab === 'wingo' ? (
          <>
            <div className="filter-group"><label htmlFor="bet-wingo-user">User ID</label><input id="bet-wingo-user" placeholder="User ID" value={wingoUserId} onChange={(e) => setWingoUserId(e.target.value)} list={wingoSuggest.listId} onFocus={wingoSuggest.loadSuggestions} /><datalist id={wingoSuggest.listId}>{wingoSuggest.items.map((v, i) => <option key={i} value={v} />)}</datalist></div>
            <div className="filter-group"><label htmlFor="bet-game-mode">Game Mode</label>
              <select id="bet-game-mode" value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
                <option value="">All</option>
                <option value="30s">30s</option>
                <option value="1m">1m</option>
                <option value="3m">3m</option>
                <option value="5m">5m</option>
              </select>
            </div>
            <div className="filter-group"><label htmlFor="bet-wingo-status">Status</label>
              <select id="bet-wingo-status" value={wingoStatus} onChange={(e) => setWingoStatus(e.target.value)}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="filter-group"><label htmlFor="bet-wingo-from">From</label><input id="bet-wingo-from" type="date" value={wingoDateFrom} onChange={(e) => setWingoDateFrom(e.target.value)} /></div>
            <div className="filter-group"><label htmlFor="bet-wingo-to">To</label><input id="bet-wingo-to" type="date" value={wingoDateTo} onChange={(e) => setWingoDateTo(e.target.value)} /></div>
          </>
        ) : (
          <>
            <div className="filter-group"><label htmlFor="bet-daily-user">User ID</label><input id="bet-daily-user" placeholder="User ID" value={dailyUserId} onChange={(e) => setDailyUserId(e.target.value)} list={dailySuggest.listId} onFocus={dailySuggest.loadSuggestions} /><datalist id={dailySuggest.listId}>{dailySuggest.items.map((v, i) => <option key={i} value={v} />)}</datalist></div>
            <div className="filter-group"><label htmlFor="bet-daily-from">From</label><input id="bet-daily-from" type="date" value={dailyDateFrom} onChange={(e) => setDailyDateFrom(e.target.value)} /></div>
            <div className="filter-group"><label htmlFor="bet-daily-to">To</label><input id="bet-daily-to" type="date" value={dailyDateTo} onChange={(e) => setDailyDateTo(e.target.value)} /></div>
          </>
        )}
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading || !canSearch}
              style={{ opacity: loading || !canSearch ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={reset}>Reset</button>
          </div>
        </div>
      </form>

      {(tab === 'provider' || tab === 'wingo') && summary && records.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', margin: '12px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(summary.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Payout</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(summary.totalPayout ?? 0).toLocaleString('en-IN')}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net P&L</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: (summary.totalPayout ?? 0) - (summary.totalAmount ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>{fmt((summary.totalPayout ?? 0) - (summary.totalAmount ?? 0))}</span></div>
        </div>
      )}

      <section className="card">
        <div className="table-wrap">
          {tab === 'daily' ? (
            <div className="tab-fade-in" key="daily">
              {loading && dailyRecords.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner /></div>
              ) : dailyRecords.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px 0' }}><div className="empty-state__icon">📋</div>No stats found</div>
              ) : (
                dailyRecords.map((r, i) => (
                  <div key={i} style={{ marginTop: i === 0 ? 0 : 20 }}>
                    <h3 style={{ margin: '4px 0 8px', padding: '8px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-color, #303133)', background: '#f0f7ff', borderRadius: 4 }}>Data of {formatDateTime12(r.date)}</h3>
                      <section aria-label="Wingo">
                        <h2 className="section-title">Wingo</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>totalAmount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(r.wingo?.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>totalPayout</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(r.wingo?.totalPayout ?? 0).toLocaleString('en-IN')}</span></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net P/L</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: (r.wingo?.totalPayout ?? 0) - (r.wingo?.totalAmount ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>{fmt((r.wingo?.totalPayout ?? 0) - (r.wingo?.totalAmount ?? 0))}</span></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>betCount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{r.wingo?.betCount ?? 0}</span></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>wonCount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>{r.wingo?.wonCount ?? 0}</span></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>lostCount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', lineHeight: 1.2 }}>{r.wingo?.lostCount ?? 0}</span></div>
                        </div>
                      </section>
                      <section aria-label="Provider" style={{ marginTop: 16 }}>
                        <h2 className="section-title">Provider</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>totalAmount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{(r.provider?.totalAmount ?? 0).toLocaleString('en-IN')}</span></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>totalPayout</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{(r.provider?.totalPayout ?? 0).toLocaleString('en-IN')}</span></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net P/L</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: (r.provider?.totalPayout ?? 0) - (r.provider?.totalAmount ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>{fmt((r.provider?.totalPayout ?? 0) - (r.provider?.totalAmount ?? 0))}</span></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>betCount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{r.provider?.betCount ?? 0}</span></div>
                        </div>
                      </section>
                  </div>
                ))
              )}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  {tab === 'provider' ? (
                    <><th>User ID</th><th>Site</th><th>Amount</th><th>Payout</th><th>Game ID</th><th>Product</th><th>Status</th><th>Settle Time</th><th>Created At</th></>
                  ) : (
                    <><th>User ID</th><th>Mode</th><th>Amount</th><th>Real Amt</th><th>Fee</th><th>Payout</th><th>Bet On</th><th>Issue</th><th>Order No</th><th>Status</th><th>Settle Time</th><th>Created At</th></>
                  )}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={tab === 'provider' ? 9 : 12} style={{ textAlign: 'center', padding: '48px 0' }}>
                    {loading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>No bet records found</div>}
                  </td></tr>
                ) : (
                  records.map((r: any, i: number) => (
                    <tr key={i} tabIndex={0}>
                      {tab === 'provider' ? (
                        <><td>{r.userId}</td>
                          <td>{r.game}</td>
                          <td>₹{Number(r.amount ?? 0).toLocaleString('en-IN')}</td>
                          <td>₹{Number(r.payout ?? 0).toLocaleString('en-IN')}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.gameId}</td>
                          <td>{r.product}</td>
                          <td><span className={`badge ${r.status === 1 ? 'badge--success' : 'badge--warning'}`}>{r.status === 1 ? 'Valid' : r.status}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{r.settleTime ? formatDateTime12(r.settleTime) : '—'}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(r.createdAt)}</td></>
                      ) : (
                        <><td>{r.userId}</td>
                          <td>{r.gameMode}</td>
                          <td>₹{Number(r.amount ?? 0).toLocaleString('en-IN')}</td>
                          <td>₹{Number(r.realAmount ?? 0).toLocaleString('en-IN')}</td>
                          <td>₹{Number(r.fee ?? 0).toLocaleString('en-IN')}</td>
                          <td>₹{Number(r.payout ?? 0).toLocaleString('en-IN')}</td>
                          <td>{r.selectType}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.issueNumber}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.orderNumber}</td>
                          <td><span className={`badge ${r.status === 'won' ? 'badge--success' : r.status === 'lost' ? 'badge--danger' : 'badge--warning'}`}>{r.status}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{r.settleTime ? formatDateTime12(r.settleTime) : '—'}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(r.createdAt)}</td></>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} total={total} limit={LIMIT} loading={loading} onChange={(p) => load(p)} />
      </section>
    </div>
  )
}