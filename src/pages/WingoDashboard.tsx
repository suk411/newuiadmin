import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchCurrentRound, fetchCurrentRoundBets, fetchSettledRounds, fetchRoundStats, fetchResultMode, setResultMode } from '../api/wingo'
import type { CurrentRound, RoundStats, CurrentRoundBetsItem, SettledRound, RoundDetail } from '../api/wingo'
import { formatDateTime } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'

const LIMIT = 25

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

const modes = ['30s', '1m', '3m', '5m']

export default function WingoDashboard() {
  const [tab, setTab] = useState<'current' | 'history' | 'resultMode'>('current')
  const [gameMode, setGameMode] = useState('30s')

  const [round, setRound] = useState<CurrentRound | null>(null)
  const [stats, setStats] = useState<RoundStats | null>(null)
  const [bets, setBets] = useState<CurrentRoundBetsItem[]>([])
  const [betsTotal, setBetsTotal] = useState(0)
  const [betsPage, setBetsPage] = useState(1)

  const [settled, setSettled] = useState<SettledRound[]>([])
  const [settledTotal, setSettledTotal] = useState(0)
  const [settledPage, setSettledPage] = useState(1)
  const [settledLoading, setSettledLoading] = useState(false)

  const [roundDetail, setRoundDetail] = useState<RoundDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [resultMode, setResultModeState] = useState('')
  const [modeLoading, setModeLoading] = useState(false)
  const [modeApplyInfo, setModeApplyInfo] = useState<{ currentIssue: string; applyIssue: string } | null>(null)

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [timeLeft, setTimeLeft] = useState(0)

  const loadRound = async (mode: string) => {
    try {
      const res = await fetchCurrentRound(mode)
      setRound(res.round)
      setStats(res.stats)
    } catch { /* ignore */ }
  }

  const loadBets = async (mode: string, p: number) => {
    try {
      const res = await fetchCurrentRoundBets(mode, p, 50)
      setBets(res.data)
      setBetsTotal(res.total)
      setBetsPage(p)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (tab !== 'current') return
    const interval = setInterval(() => loadRound(gameMode), 5000)
    return () => clearInterval(interval)
  }, [tab, gameMode])

  useEffect(() => {
    if (tab !== 'current' || !round) return
    const tick = () => setTimeLeft(Math.max(0, Math.floor((round.endTime - Date.now()) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [tab, round?.endTime, round?.issueNumber])

  const loadSettled = async (mode: string, p: number) => {
    setSettledLoading(true)
    try {
      const res = await fetchSettledRounds(mode, p, LIMIT)
      setSettled(res.data)
      setSettledTotal(res.total)
      setSettledPage(p)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setSettledLoading(false) }
  }

  const loadResultMode = async (mode: string) => {
    setModeLoading(true)
    setModeApplyInfo(null)
    try {
      const res = await fetchResultMode(mode)
      setResultModeState(res.mode)
    } catch { /* ignore */ }
    finally { setModeLoading(false) }
  }

  useEffect(() => {
    if (tab === 'current') {
      loadRound(gameMode)
      loadBets(gameMode, 1)
    } else if (tab === 'history') {
      loadSettled(gameMode, 1)
    } else {
      loadResultMode(gameMode)
    }
  }, [tab, gameMode])

  const handleSetMode = async () => {
    setSaving(true)
    setModeApplyInfo(null)
    try {
      const res = await setResultMode(resultMode, gameMode)
      setModeApplyInfo({ currentIssue: res.currentIssue, applyIssue: res.applyIssue })
      toast(`Mode will apply from issue #${res.applyIssue}`)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setSaving(false) }
  }

  const viewDetail = async (issue: string) => {
    setDetailLoading(true)
    setRoundDetail(null)
    try {
      const res = await fetchRoundStats(issue)
      setRoundDetail(res)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setDetailLoading(false) }
  }

  const modeSelector = (
    <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <label style={{ marginBottom: 0 }}>Game Mode</label>
      <div style={{ display: 'flex', gap: 0 }}>
        {modes.map((m, i) => (
          <button key={m} className={gameMode === m ? 'btn-filled' : 'btn-outline'}
            style={{ borderRadius: i === 0 ? '3px 0 0 3px' : i === modes.length - 1 ? '0 3px 3px 0' : '0' }}
            onClick={() => setGameMode(m)}>
            {m}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="content content--table">
      <div className="filters-bar">
        <div className="filter-group" style={{ flexDirection: 'row', gap: 0 }}>
          {(['current', 'history', 'resultMode'] as const).map(t => (
            <button key={t} className={tab === t ? 'btn-filled' : 'btn-outline'}
              style={{ borderRadius: t === 'current' ? '3px 0 0 3px' : t === 'resultMode' ? '0 3px 3px 0' : '0' }}
              onClick={() => setTab(t)}>
              {t === 'current' ? 'Current Round' : t === 'history' ? 'History' : 'Result Mode'}
            </button>
          ))}
        </div>
        {modeSelector}
      </div>

      {tab === 'current' && (
        <>
          {round && stats && (
            <section className="card" style={{ marginBottom: 16 }}>
              <div style={{ padding: 'var(--space-5) var(--space-7)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 13, color: '#888' }}>Issue #{round.issueNumber}</div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span className={`badge ${round.status === 'open' ? 'badge--warning' : 'badge--success'}`} style={{ fontSize: 13, padding: '4px 12px' }}>{(round.status || '').toUpperCase()}</span>
                    <span style={{ fontSize: 13, color: '#666' }}>Mode: <strong>{round.gameMode}</strong></span>
                    <span style={{ fontSize: 13, color: '#666' }}>Result Mode: <strong>{round.resultMode}</strong></span>
                  </div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    Result: {round.result?.number != null ? `${round.result.number} / ${round.result?.color ?? '—'} / ${round.result?.size ?? '—'}` : <span style={{ color: '#999' }}>— not yet</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 16 }}>
                    <span>Start: {new Date(round.startTime).toISOString().slice(0, 19).replace('T', ' ')}</span>
                    <span>End: {new Date(round.endTime).toISOString().slice(0, 19).replace('T', ' ')}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: timeLeft <= 5 ? '#ef4444' : '#333' }}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>remaining</div>
                </div>
              </div>
              <div style={{ padding: '0 var(--space-7) var(--space-5)', display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
                <span><strong>Bets:</strong> {stats.totalBets}</span>
                <span><strong>Amount:</strong> ₹{stats.totalBetAmount.toLocaleString('en-IN')}</span>
                <span><strong>Users:</strong> {stats.uniqueUsers}</span>
              </div>
              <div style={{ padding: '0 var(--space-7) var(--space-5)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, fontSize: 12 }}>
                {Object.entries(stats.breakdown).map(([key, val]) => (
                  <div key={key} style={{ background: '#f8f9fa', padding: '6px 10px', borderRadius: 4, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{key}</div>
                    <div>₹{Number(val).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card">
            <div style={{ padding: 'var(--space-5) var(--space-7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border, rgb(188,198,222))' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Bets ({betsTotal})</h3>
              <button className="btn-outline btn--sm" onClick={() => loadBets(gameMode, betsPage)} style={{ fontSize: 11 }}>Refresh</button>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>User</th><th>Mobile</th><th>Order No</th><th>Selection</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
                <tbody>
                  {bets.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                      <div className="empty-state"><div className="empty-state__icon">📋</div>No bets found</div>
                    </td></tr>
                  ) : (
                    bets.map(b => (
                      <tr key={b._id} tabIndex={0}>
                        <td>{b.userId}</td>
                        <td>{b.mobile || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.orderNumber}</td>
                        <td><span className="badge badge--info">{b.selectType}</span></td>
                        <td>₹{b.betAmount.toLocaleString('en-IN')}</td>
                        <td><span className={`badge ${b.status === 'won' ? 'badge--success' : b.status === 'lost' ? 'badge--danger' : 'badge--warning'}`}>{b.status}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(b.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={betsPage} total={betsTotal} limit={50} onChange={(p) => loadBets(gameMode, p)} />
          </section>
        </>
      )}

      {tab === 'history' && (
        <>
          <section className="card">
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Issue</th><th>Result</th><th>Bets</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {settledLoading && settled.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}><Spinner /></td></tr>
                  ) : settled.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                      <div className="empty-state"><div className="empty-state__icon">📋</div>No rounds found</div>
                    </td></tr>
                  ) : (
                    settled.map(r => (
                      <tr key={r.issueNumber} tabIndex={0}>
                        <td>{r.issueNumber}</td>
                        <td style={{ fontWeight: 600, color: r.result?.color?.includes('red') ? '#ef4444' : r.result?.color?.includes('green') ? '#22c55e' : '#a855f7' }}>{r.result?.number ?? '—'}</td>
                        <td>{r.stats?.totalBets ?? '—'}</td>
                        <td>₹{r.stats?.totalBetAmount?.toLocaleString('en-IN') ?? '—'}</td>
                        <td><span className={`badge ${r.status === 'closed' ? 'badge--success' : 'badge--warning'}`}>{r.status}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' ')}</td>
                        <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => viewDetail(r.issueNumber)}>View Stats</button></div></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={settledPage} total={settledTotal} limit={LIMIT} onChange={(p) => loadSettled(gameMode, p)} />
          </section>

          {roundDetail && (
            <div className="dialog-overlay" onClick={() => setRoundDetail(null)}>
              <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>Round Stats — {roundDetail.issue.issueNumber}</h3>
                  <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setRoundDetail(null)}>✕</button>
                </div>
                <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', fontSize: 14 }}>
                  <div style={{ display: 'flex', gap: 32, background: '#fff', border: '1px solid #d0d0d0', borderRadius: 4, padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bets</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{roundDetail.stats.totalBets}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{roundDetail.stats.totalBetAmount.toLocaleString('en-IN')}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Payout</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{roundDetail.stats.totalPayout.toLocaleString('en-IN')}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profit/Loss</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: roundDetail.stats.profitLoss >= 0 ? '#22c55e' : '#ef4444' }}>₹{roundDetail.stats.profitLoss.toLocaleString('en-IN')}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Won</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>{roundDetail.stats.wonCount}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lost</span><span style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', lineHeight: 1.2 }}>{roundDetail.stats.lostCount}</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 10, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unique Users</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{roundDetail.stats.uniqueUsers}</span></div>
                  </div>
                  <table className="table">
                    <thead><tr><th>Selection</th><th>Count</th><th>Amount</th></tr></thead>
                    <tbody>
                      {Object.entries(roundDetail.stats.breakdown).map(([key, val]) => (
                        <tr key={key}><td style={{ textTransform: 'capitalize' }}>{key}</td><td>{val.count}</td><td>₹{val.amount.toLocaleString('en-IN')}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'resultMode' && (
        <section className="card">
          <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
            <div className="filter-group" style={{ marginBottom: 16 }}>
              <label>Current Mode</label>
              <div style={{ fontSize: 14, fontWeight: 600, padding: '6px 0' }}>{modeLoading ? 'Loading...' : resultMode || '—'}</div>
            </div>
            <div className="filter-group" style={{ marginBottom: 16 }}>
              <label>Set Result Generation Mode</label>
              <select value={resultMode} onChange={(e) => setResultModeState(e.target.value)} disabled={modeLoading}>
                <option value="">Select mode...</option>
                <option value="RANDOM">RANDOM — Truly random result</option>
                <option value="MAX_PROFIT">MAX_PROFIT — Maximum platform profit</option>
                <option value="MAX_LOSS">MAX_LOSS — Maximum platform loss</option>
              </select>
            </div>
            <button className="btn-filled" onClick={handleSetMode} disabled={saving || !resultMode}>
              {saving ? <Spinner /> : 'Apply Mode'}
            </button>
            {modeApplyInfo && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0f9eb', borderRadius: 4, fontSize: 13 }}>
                Mode will apply from issue <strong>#{modeApplyInfo.applyIssue}</strong>
                <br />
                <span style={{ color: '#888' }}>Current issue: #{modeApplyInfo.currentIssue}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
