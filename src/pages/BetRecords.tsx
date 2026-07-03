import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchProviderBets, fetchWingoBets, fetchDailyStats } from '../api/bets'
import type { ProviderBet, WingoBet, DailyStat } from '../api/bets'
import { formatDateTime } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import { useExportBar } from '../components/ExportBarContext'
import type { ExportColumn } from '../utils/export'

const LIMIT = 20
type Tab = 'provider' | 'wingo' | 'daily'

const tabBtn = (isActive: boolean) => ({
  padding: '6px 19px', fontSize: 11, fontWeight: 600,
  border: isActive ? '1px solid #d0d0d0' : '1px solid transparent',
  borderRadius: 4,
  background: isActive ? '#f97316' : '#f0f0f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  cursor: 'pointer', color: isActive ? '#fff' : '#909399',
  transition: 'all 0.15s',
} as const)

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function BetRecords() {
  const [tab, setTab] = useState<Tab>('provider')
  const [records, setRecords] = useState<(ProviderBet | WingoBet)[]>([])
  const [dailyRecords, setDailyRecords] = useState<DailyStat[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [userId, setUserId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { setExportProps } = useExportBar()

  useEffect(() => {
    if (tab === 'daily') {
      setExportProps({
        columns: [
          { key: 'date', label: 'Date' },
          { key: 'wingoBetCount', label: 'Wingo Bets' },
          { key: 'wingoTotalBets', label: 'Wingo Amt' },
          { key: 'wingoPayout', label: 'Wingo Payout' },
          { key: 'wingoWon', label: 'Wingo Won' },
          { key: 'wingoLost', label: 'Wingo Lost' },
          { key: 'providerBetCount', label: 'Prov Bets' },
          { key: 'providerTotalBets', label: 'Prov Amt' },
          { key: 'providerPayout', label: 'Prov Payout' },
          { key: 'providerNetPL', label: 'Prov Net PL' },
        ],
        data: dailyRecords.map((r) => ({
          date: r.date,
          wingoBetCount: r.wingo.betCount,
          wingoTotalBets: r.wingo.totalBets,
          wingoPayout: r.wingo.totalPayout,
          wingoWon: r.wingo.wonCount,
          wingoLost: r.wingo.lostCount,
          providerBetCount: r.provider.betCount,
          providerTotalBets: r.provider.totalBets,
          providerPayout: r.provider.totalPayout,
          providerNetPL: r.provider.netPL,
        })),
        filename: 'daily-stats',
      })
    } else {
      setExportProps({ columns: [], data: records as unknown as Record<string, unknown>[], filename: 'bet-records' })
    }
    return () => setExportProps(null)
  }, [tab, records, dailyRecords, setExportProps])

  const handleMember = (v: string) => { setMember(v); if (v) setOrderNumber('') }
  const handleOrderNo = (v: string) => { setOrderNumber(v); if (v) setMember('') }

  const load = async (p = 1) => {
    setLoading(true)
    try {
      if (tab === 'daily') {
        const params: Record<string, string | number> = { page: p, limit: LIMIT }
        if (userId) params.userId = userId
        if (dateFrom) params.dateFrom = dateFrom
        if (dateTo) params.dateTo = dateTo
        const res = await fetchDailyStats(params)
        setDailyRecords(res.data)
        setTotal(res.total)
      } else if (tab === 'provider') {
        const params: Record<string, string | number> = { page: p, limit: LIMIT }
        if (member) params.member = member
        const res = await fetchProviderBets(params)
        setRecords(res.data)
        setTotal(res.total)
      } else {
        const params: Record<string, string | number> = { page: p, limit: LIMIT }
        if (orderNumber) params.orderNumber = orderNumber
        const res = await fetchWingoBets(params)
        setRecords(res.data)
        setTotal(res.total)
      }
      setPage(p)
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content content--table">
      <div className="filters-bar">
        {tab === 'provider' ? (
          <div className="filter-group"><label>Member</label><input placeholder="Member (u12345)" value={member} onChange={(e) => handleMember(e.target.value)} /></div>
        ) : tab === 'wingo' ? (
          <div className="filter-group"><label>Order No</label><input placeholder="Order no" value={orderNumber} onChange={(e) => handleOrderNo(e.target.value)} /></div>
        ) : (
          <>
            <div className="filter-group"><label>User ID</label><input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} /></div>
            <div className="filter-group"><label>From</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
            <div className="filter-group"><label>To</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
          </>
        )}
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={tabBtn(tab === 'provider')}
              onClick={() => { setTab('provider'); setOrderNumber(''); setUserId('') }}>Provider</button>
            <button type="button" style={tabBtn(tab === 'wingo')}
              onClick={() => { setTab('wingo'); setMember(''); setUserId('') }}>Wingo</button>
            <button type="button" style={tabBtn(tab === 'daily')}
              onClick={() => { setTab('daily'); setMember(''); setOrderNumber('') }}>Daily Stats</button>
          </div>
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={() => load()} disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setMember(''); setOrderNumber(''); setUserId(''); setDateFrom(''); setDateTo(''); setRecords([]); setDailyRecords([]); setTotal(0) }}>Reset</button>
          </div>
        </div>
      </div>

      <section className="card">
        <div className="table-wrap">
          {tab === 'daily' ? (
            <table className="table">
              <thead><tr>
                <th>Date</th>
                <th>Wingo Bets</th>
                <th>Wingo Amt</th>
                <th>Wingo Payout</th>
                <th>Wingo Won</th>
                <th>Wingo Lost</th>
                <th>Prov Bets</th>
                <th>Prov Amt</th>
                <th>Prov Payout</th>
                <th>Prov Net PL</th>
              </tr></thead>
              <tbody>
                {dailyRecords.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '48px 0' }}>
                    {loading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>No stats found</div>}
                  </td></tr>
                ) : (
                  dailyRecords.map((r, i) => (
                    <tr key={i} tabIndex={0}>
                      <td style={{ whiteSpace: 'nowrap' }}>{r.date}</td>
                      <td>{r.wingo.betCount}</td>
                      <td>₹{r.wingo.totalBets.toLocaleString('en-IN')}</td>
                      <td>₹{r.wingo.totalPayout.toLocaleString('en-IN')}</td>
                      <td>{r.wingo.wonCount}</td>
                      <td>{r.wingo.lostCount}</td>
                      <td>{r.provider.betCount}</td>
                      <td>₹{r.provider.totalBets.toLocaleString('en-IN')}</td>
                      <td>₹{r.provider.totalPayout.toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${r.provider.netPL >= 0 ? 'badge--success' : 'badge--danger'}`}>₹{r.provider.netPL.toLocaleString('en-IN')}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  {tab === 'provider' ? (
                    <><th>ID</th><th>Member</th><th>Site</th><th>Amount</th><th>Status</th><th>Date</th></>
                  ) : (
                    <><th>ID</th><th>User</th><th>Order No</th><th>Issue</th><th>Amount</th><th>Status</th><th>Date</th></>
                  )}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={tab === 'provider' ? 6 : 7} style={{ textAlign: 'center', padding: '48px 0' }}>
                    {loading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>No bet records found</div>}
                  </td></tr>
                ) : (
                  records.map((r: any) => (
                    <tr key={r.id} tabIndex={0}>
                      {tab === 'provider' ? (
                        <><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</td>
                          <td>{r.member}</td><td>{r.site}</td>
                          <td>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                          <td><span className="badge badge--success">{r.status}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td></>
                      ) : (
                        <><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</td>
                          <td>{r.userId}</td><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.orderNumber}</td>
                          <td>{r.issueNumber}</td>
                          <td>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                          <td><span className="badge badge--success">{r.status}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td></>
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