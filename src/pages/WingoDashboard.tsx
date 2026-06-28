import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchCurrentRound, fetchCurrentRoundBets, fetchSettledRounds, fetchRoundStats, fetchResultMode, setResultMode } from '../api/wingo'
import type { CurrentRound, RoundStats, CurrentRoundBetsItem, SettledRound, RoundDetail } from '../api/wingo'
import { formatDateTime } from '../utils/format'
import { useError } from '../contexts/ErrorContext'

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

  const { error, setError } = useError()
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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

  const loadSettled = async (mode: string, p: number) => {
    setSettledLoading(true)
    try {
      const res = await fetchSettledRounds(mode, p, LIMIT)
      setSettled(res.data)
      setSettledTotal(res.total)
      setSettledPage(p)
    } catch (err: unknown) { setError(extractError(err)) }
    finally { setSettledLoading(false) }
  }

  const loadResultMode = async (mode: string) => {
    setModeLoading(true)
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
    setError('')
    try {
      await setResultMode(resultMode, gameMode)
    } catch (err: unknown) { setError(extractError(err)) }
    finally { setSaving(false) }
  }

  const viewDetail = async (issue: string) => {
    setDetailLoading(true)
    setRoundDetail(null)
    setDialogError(null)
    try {
      const res = await fetchRoundStats(issue)
      setRoundDetail(res)
    } catch (err: unknown) { setDialogError(extractError(err)) }
    finally { setDetailLoading(false) }
  }

  const modeSelector = (
    <div className="filter-group">
      <label>Game Mode</label>
      <select value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
        {modes.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  )

  return (
    <div className="content">
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
              <div style={{ padding: 'var(--space-5) var(--space-7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div><strong>Issue:</strong> {round.issueNumber} &nbsp; <strong>Status:</strong> <span className={`badge ${round.status === 'open' ? 'badge--warning' : 'badge--success'}`}>{round.status}</span></div>
                <div><strong>Bets:</strong> {stats.totalBets} &nbsp; <strong>Amount:</strong> ₹{stats.totalBetAmount.toLocaleString('en-IN')} &nbsp; <strong>Users:</strong> {stats.uniqueUsers}</div>
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
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>User</th><th>Mobile</th><th>Order No</th><th>Selection</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
                <tbody>
                  {bets.map(b => (
                    <tr key={b._id} tabIndex={0}>
                      <td>{b.userId}</td>
                      <td>{b.mobile || '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.orderNumber}</td>
                      <td><span className="badge badge--info">{b.selectType}</span></td>
                      <td>₹{b.betAmount.toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${b.status === 'won' ? 'badge--success' : b.status === 'lost' ? 'badge--danger' : 'badge--warning'}`}>{b.status}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {betsTotal > 50 && (
              <div className="pagination">
                <span>Page {betsPage} of {Math.ceil(betsTotal / 50)}</span>
                <button className="pagination__btn" disabled={betsPage <= 1} onClick={() => loadBets(gameMode, betsPage - 1)}>‹</button>
                <button className="pagination__btn active">{betsPage}</button>
                <button className="pagination__btn" disabled={betsPage >= Math.ceil(betsTotal / 50)} onClick={() => loadBets(gameMode, betsPage + 1)}>›</button>
              </div>
            )}
          </section>
        </>
      )}

      {tab === 'history' && (
        <>
          <section className="card">
            {settledLoading && settled.length === 0 ? (
              <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}><span className="loading-spinner" /></div>
            ) : settled.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">📋</div>No rounds found</div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Issue</th><th>Result</th><th>Bets</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {settled.map(r => (
                      <tr key={r.issueNumber} tabIndex={0}>
                        <td>{r.issueNumber}</td>
                        <td style={{ fontWeight: 600 }}>{r.result != null ? r.result : '—'}</td>
                        <td>{r.stats.totalBets}</td>
                        <td>₹{r.stats.totalBetAmount.toLocaleString('en-IN')}</td>
                        <td><span className={`badge ${r.status === 'closed' ? 'badge--success' : 'badge--warning'}`}>{r.status}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td>
                        <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => viewDetail(r.issueNumber)}>View Stats</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {settledTotal > 0 && (
              <div className="pagination">
                <span>Page {settledPage} of {Math.ceil(settledTotal / LIMIT)}</span>
                <button className="pagination__btn" disabled={settledPage <= 1} onClick={() => loadSettled(gameMode, settledPage - 1)}>‹</button>
                <button className="pagination__btn active">{settledPage}</button>
                <button className="pagination__btn" disabled={settledPage >= Math.ceil(settledTotal / LIMIT)} onClick={() => loadSettled(gameMode, settledPage + 1)}>›</button>
              </div>
            )}
          </section>

          {roundDetail && (
            <div className="dialog-overlay" onClick={() => setRoundDetail(null)}>
              <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>Round Stats — {roundDetail.issue.issueNumber}</h3>
                  <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setRoundDetail(null)}>✕</button>
                </div>
                <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', fontSize: 14 }}>
                  {dialogError && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginBottom: 8 }}>{dialogError}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div className="stat-card"><span className="stat-card__label">Total Bets</span><span className="stat-card__value">{roundDetail.stats.totalBets}</span></div>
                    <div className="stat-card"><span className="stat-card__label">Total Amount</span><span className="stat-card__value">₹{roundDetail.stats.totalBetAmount.toLocaleString('en-IN')}</span></div>
                    <div className="stat-card"><span className="stat-card__label">Total Payout</span><span className="stat-card__value">₹{roundDetail.stats.totalPayout.toLocaleString('en-IN')}</span></div>
                    <div className="stat-card"><span className="stat-card__label">Profit/Loss</span><span className="stat-card__value" style={{ color: roundDetail.stats.profitLoss >= 0 ? '#22c55e' : '#ef4444' }}>₹{roundDetail.stats.profitLoss.toLocaleString('en-IN')}</span></div>
                    <div className="stat-card"><span className="stat-card__label">Won</span><span className="stat-card__value">{roundDetail.stats.wonCount}</span></div>
                    <div className="stat-card"><span className="stat-card__label">Lost</span><span className="stat-card__value">{roundDetail.stats.lostCount}</span></div>
                    <div className="stat-card"><span className="stat-card__label">Unique Users</span><span className="stat-card__value">{roundDetail.stats.uniqueUsers}</span></div>
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
              <label>Result Generation Mode</label>
              <select value={resultMode} onChange={(e) => setResultModeState(e.target.value)} disabled={modeLoading}>
                <option value="">Select mode...</option>
                <option value="RANDOM">RANDOM — Truly random result</option>
                <option value="MAX_PROFIT">MAX_PROFIT — Maximum platform profit</option>
                <option value="MAX_LOSS">MAX_LOSS — Maximum platform loss</option>
              </select>
            </div>
            <button className="btn-filled" onClick={handleSetMode} disabled={saving || !resultMode}>
              {saving ? 'Saving...' : 'Apply Mode'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
