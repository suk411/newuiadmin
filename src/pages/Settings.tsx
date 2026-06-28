import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchVipConfig, updateVipConfig } from '../api/vipConfig'
import type { VipTier } from '../api/vipConfig'
import { fetchTurnoverConfig, updateTurnoverConfig } from '../api/turnoverConfig'
import type { TurnoverRule } from '../api/turnoverConfig'
import { fetchGiftCodes, createGiftCode, toggleGiftCode, deleteGiftCode } from '../api/giftCodes'
import type { GiftCode } from '../api/giftCodes'
import { fetchDepositConfig, updateDepositChannel, fetchDepositBonusConfig, updateDepositBonusConfig } from '../api/depositConfig'
import type { DepositChannel, DepositBonusConfig } from '../api/depositConfig'
import { fetchWithdrawalConfig, updateWithdrawalConfig } from '../api/withdrawalConfig'
import type { WithdrawalConfig } from '../api/withdrawalConfig'
import { useError } from '../contexts/ErrorContext'
import { formatDateTime } from '../utils/format'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

function randomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

const GC_LIMIT = 15

export default function Settings() {
  const { setError } = useError()

  // VIP Config
  const [vipTiers, setVipTiers] = useState<VipTier[]>([])
  const [vipLoading, setVipLoading] = useState(false)
  const [vipEditIdx, setVipEditIdx] = useState<number | null>(null)
  const [vipForm, setVipForm] = useState<VipTier | null>(null)
  const [vipSaving, setVipSaving] = useState(false)
  const [vipErr, setVipErr] = useState('')

  // Turnover Config
  const [toRules, setToRules] = useState<TurnoverRule[]>([])
  const [toLoading, setToLoading] = useState(false)
  const [toEditIdx, setToEditIdx] = useState<number | null>(null)
  const [toForm, setToForm] = useState<TurnoverRule | null>(null)
  const [toSaving, setToSaving] = useState(false)
  const [toErr, setToErr] = useState('')

  // Gift Codes
  const [gcRecords, setGcRecords] = useState<GiftCode[]>([])
  const [gcTotal, setGcTotal] = useState(0)
  const [gcPage, setGcPage] = useState(1)
  const [gcLoading, setGcLoading] = useState(false)
  const [gcErr, setGcErr] = useState('')

  // Deposit Config
  const [depChannels, setDepChannels] = useState<DepositChannel[]>([])
  const [depBonus, setDepBonus] = useState<DepositBonusConfig[]>([])
  const [depLoading, setDepLoading] = useState(false)
  const [depSaving, setDepSaving] = useState<string | null>(null)
  const [depErr, setDepErr] = useState('')

  // Withdrawal Config
  const [wdConfig, setWdConfig] = useState<WithdrawalConfig | null>(null)
  const [wdLoading, setWdLoading] = useState(false)
  const [wdPerDay, setWdPerDay] = useState('')
  const [wdMinBank, setWdMinBank] = useState('')
  const [wdMaxBank, setWdMaxBank] = useState('')
  const [wdMinUpi, setWdMinUpi] = useState('')
  const [wdMaxUpi, setWdMaxUpi] = useState('')
  const [wdMinUpay, setWdMinUpay] = useState('')
  const [wdMaxUpay, setWdMaxUpay] = useState('')
  const [wdErr, setWdErr] = useState('')

  const [expanded, setExpanded] = useState<string[]>(['vip', 'turnover', 'giftcodes', 'deposit', 'withdrawal'])

  const toggleSection = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // ---- VIP Config ----
  const loadVip = async () => {
    setVipLoading(true)
    try {
      const data = await fetchVipConfig()
      setVipTiers(Array.isArray(data) ? data : [])
    } catch (err: unknown) { setVipErr(extractError(err)) }
    finally { setVipLoading(false) }
  }

  useEffect(() => { loadVip() }, [])

  const vipOpenEdit = (i: number) => {
    setVipEditIdx(i)
    setVipForm({ ...vipTiers[i] })
    setVipErr('')
  }

  const vipCloseEdit = () => { setVipEditIdx(null); setVipForm(null) }

  const vipHandleSave = async () => {
    if (vipForm == null || vipEditIdx == null) return
    setVipSaving(true)
    setVipErr('')
    try {
      const copy = [...vipTiers]
      copy[vipEditIdx] = vipForm
      await updateVipConfig(copy)
      setVipTiers(copy)
      vipCloseEdit()
    } catch (err: unknown) { setVipErr(extractError(err)) }
    finally { setVipSaving(false) }
  }

  // ---- Turnover Config ----
  const loadTo = async () => {
    setToLoading(true)
    try {
      const data = await fetchTurnoverConfig()
      setToRules(Array.isArray(data) ? data : [])
    } catch (err: unknown) { setToErr(extractError(err)) }
    finally { setToLoading(false) }
  }

  useEffect(() => { loadTo() }, [])

  const toOpenEdit = (i: number) => {
    setToEditIdx(i)
    setToForm({ ...toRules[i] })
    setToErr('')
  }

  const toCloseEdit = () => { setToEditIdx(null); setToForm(null) }

  const toHandleSave = async () => {
    if (toForm == null || toEditIdx == null) return
    setToSaving(true)
    setToErr('')
    try {
      const copy = [...toRules]
      copy[toEditIdx] = toForm
      await updateTurnoverConfig(copy)
      setToRules(copy)
      toCloseEdit()
    } catch (err: unknown) { setToErr(extractError(err)) }
    finally { setToSaving(false) }
  }

  // ---- Gift Codes ----
  const loadGc = async (p = 1) => {
    setGcLoading(true)
    setGcErr('')
    try {
      const res = await fetchGiftCodes({ page: p, limit: GC_LIMIT })
      setGcRecords(res.data)
      setGcTotal(res.total)
      setGcPage(res.page)
    } catch (err: unknown) { setGcErr(extractError(err)) }
    finally { setGcLoading(false) }
  }

  useEffect(() => { loadGc() }, [])

  const gcHandleToggle = async (code: string) => {
    try {
      await toggleGiftCode(code)
      loadGc(gcPage)
    } catch (err: unknown) { setGcErr(extractError(err)) }
  }

  const gcHandleDelete = async (code: string) => {
    if (!confirm(`Delete gift code ${code}?`)) return
    try {
      await deleteGiftCode(code)
      loadGc(gcPage)
    } catch (err: unknown) { setGcErr(extractError(err)) }
  }

  const [gcShowCreate, setGcShowCreate] = useState(false)
  const [gcForm, setGcForm] = useState({ code: '', rewardAmount: 0, turnoverMultiplier: 1, maxRedemptions: 100, expiryDate: '', minDepositToday: 0, description: '' })
  const [gcSaving, setGcSaving] = useState(false)
  const [gcCreateErr, setGcCreateErr] = useState('')

  const gcOpenCreate = () => { setGcForm({ code: '', rewardAmount: 0, turnoverMultiplier: 1, maxRedemptions: 100, expiryDate: '', minDepositToday: 0, description: '' }); setGcShowCreate(true); setGcCreateErr('') }

  const gcHandleCreate = async () => {
    if (!gcForm.code || !gcForm.rewardAmount) return
    setGcSaving(true)
    setGcCreateErr('')
    try {
      await createGiftCode(gcForm)
      setGcShowCreate(false)
      loadGc(1)
    } catch (err: unknown) { setGcCreateErr(extractError(err)) }
    finally { setGcSaving(false) }
  }

  // ---- Deposit Config ----
  const loadDep = async () => {
    setDepLoading(true)
    try {
      const [c, b] = await Promise.all([fetchDepositConfig(), fetchDepositBonusConfig()])
      setDepChannels(c)
      setDepBonus(b)
    } catch (err: unknown) { setDepErr(extractError(err)) }
    finally { setDepLoading(false) }
  }

  useEffect(() => { loadDep() }, [])

  const depToggle = async (channel: string, isActive: boolean) => {
    setDepSaving(channel)
    try {
      const updated = await updateDepositChannel(channel, { isActive })
      setDepChannels(prev => prev.map(c => c.channel === channel ? { ...c, ...updated } : c))
    } catch (err: unknown) { setDepErr(extractError(err)) }
    finally { setDepSaving(null) }
  }

  const depSaveBonus = async (idx: number, bonusRate: number) => {
    const cfg = depBonus[idx]
    setDepSaving(`bonus-${idx}`)
    try {
      const updated = await updateDepositBonusConfig({ depositCount: cfg.depositCount, bonusRate })
      setDepBonus(prev => prev.map((b, i) => i === idx ? { ...b, ...updated } : b))
    } catch (err: unknown) { setDepErr(extractError(err)) }
    finally { setDepSaving(null) }
  }

  // ---- Withdrawal Config ----
  const loadWd = async () => {
    setWdLoading(true)
    try {
      const cfg = await fetchWithdrawalConfig()
      setWdConfig(cfg)
      setWdPerDay(String(cfg.perDayLimit))
      setWdMinBank(String(cfg.limits.BANK.min))
      setWdMaxBank(String(cfg.limits.BANK.max))
      setWdMinUpi(String(cfg.limits.UPI.min))
      setWdMaxUpi(String(cfg.limits.UPI.max))
      setWdMinUpay(String(cfg.limits.UPAY.min))
      setWdMaxUpay(String(cfg.limits.UPAY.max))
    } catch (err: unknown) { setWdErr(extractError(err)) }
    finally { setWdLoading(false) }
  }

  useEffect(() => { loadWd() }, [])

  const wdHandleSave = async () => {
    setWdLoading(true)
    setWdErr('')
    try {
      const updated = await updateWithdrawalConfig({
        perDayLimit: Number(wdPerDay),
        limits: { BANK: { min: Number(wdMinBank), max: Number(wdMaxBank) }, UPI: { min: Number(wdMinUpi), max: Number(wdMaxUpi) }, UPAY: { min: Number(wdMinUpay), max: Number(wdMaxUpay) } },
      })
      setWdConfig(updated)
    } catch (err: unknown) { setWdErr(extractError(err)) }
    finally { setWdLoading(false) }
  }

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
    const open = expanded.includes(id)
    return (
      <section className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card__header" onClick={() => toggleSection(id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-7)', borderBottom: open ? '1px solid var(--color-border, rgb(188,198,222))' : 'none', userSelect: 'none' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h3>
          <span style={{ fontSize: 12, color: '#888' }}>{open ? '▲ Collapse' : '▼ Expand'}</span>
        </div>
        {open && <div style={{ padding: 'var(--space-5) var(--space-7)' }}>{children}</div>}
      </section>
    )
  }

  return (
    <div className="content">
      <div className="page-header"><h2>Settings</h2></div>

      {/* VIP Config */}
      <Section id="vip" title="VIP Config">
        {vipLoading ? <div className="table-wrap" style={{ padding: '24px 0', textAlign: 'center' }}><span className="loading-spinner" /></div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Min Deposit (₹)</th><th>Weekly Bonus (₹)</th><th>Upgrade Bonus (₹)</th><th>Weekly Deposit Req. (₹)</th><th>Actions</th></tr></thead>
              <tbody>
                {vipTiers.map((t, i) => (
                  <tr key={i} tabIndex={0}>
                    <td>{t.name}</td><td>{t.minDeposit.toLocaleString('en-IN')}</td><td>{t.weeklyBonus.toLocaleString('en-IN')}</td><td>{t.upgradeBonus.toLocaleString('en-IN')}</td><td>{t.weeklyDepositRequirement.toLocaleString('en-IN')}</td>
                    <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => vipOpenEdit(i)}>Edit</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {vipErr && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginTop: 8 }}>{vipErr}</div>}
        {vipEditIdx != null && vipForm && (
          <div className="dialog-overlay" onClick={vipCloseEdit}>
            <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: 14 }}>Edit VIP {vipEditIdx + 1}</h3>
                <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={vipCloseEdit}>✕</button>
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
                <div className="filter-group"><label>Name</label><input value={vipForm.name} onChange={(e) => setVipForm({ ...vipForm, name: e.target.value })} /></div>
                <div className="filter-group"><label>Min Deposit (₹)</label><input type="number" value={vipForm.minDeposit} onChange={(e) => setVipForm({ ...vipForm, minDeposit: Number(e.target.value) })} /></div>
                <div className="filter-group"><label>Weekly Bonus (₹)</label><input type="number" value={vipForm.weeklyBonus} onChange={(e) => setVipForm({ ...vipForm, weeklyBonus: Number(e.target.value) })} /></div>
                <div className="filter-group"><label>Upgrade Bonus (₹)</label><input type="number" value={vipForm.upgradeBonus} onChange={(e) => setVipForm({ ...vipForm, upgradeBonus: Number(e.target.value) })} /></div>
                <div className="filter-group"><label>Weekly Deposit Requirement (₹)</label><input type="number" value={vipForm.weeklyDepositRequirement} onChange={(e) => setVipForm({ ...vipForm, weeklyDepositRequirement: Number(e.target.value) })} /></div>
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
                <button className="btn-outline" onClick={vipCloseEdit} disabled={vipSaving}>Cancel</button>
                <button className="btn-filled" onClick={vipHandleSave} disabled={vipSaving}>{vipSaving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Turnover Config */}
      <Section id="turnover" title="Turnover Config">
        {toLoading ? <div className="table-wrap" style={{ padding: '24px 0', textAlign: 'center' }}><span className="loading-spinner" /></div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Type</th><th>Description</th><th>Multiplier</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {toRules.map((r, i) => (
                  <tr key={r._id || i} tabIndex={0}>
                    <td>{r.type}</td><td>{r.description}</td><td>{r.multiplier}</td><td><span className={`badge ${r.active ? 'badge--success' : 'badge--danger'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
                    <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => toOpenEdit(i)}>Edit</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {toErr && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginTop: 8 }}>{toErr}</div>}
        {toEditIdx != null && toForm && (
          <div className="dialog-overlay" onClick={toCloseEdit}>
            <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: 14 }}>Edit {toForm.type}</h3>
                <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={toCloseEdit}>✕</button>
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
                <div className="filter-group"><label>Type</label><input value={toForm.type} onChange={(e) => setToForm({ ...toForm, type: e.target.value })} /></div>
                <div className="filter-group"><label>Description</label><input value={toForm.description} onChange={(e) => setToForm({ ...toForm, description: e.target.value })} /></div>
                <div className="filter-group"><label>Multiplier</label><input type="number" step="0.1" value={toForm.multiplier} onChange={(e) => setToForm({ ...toForm, multiplier: Number(e.target.value) })} /></div>
                <div className="filter-group"><label>Active</label><button type="button" onClick={() => setToForm({ ...toForm, active: !toForm.active })} style={{ width: 100, background: toForm.active ? '#22c55e' : '#ef4444', color: '#fff', border: 'none' }}>{toForm.active ? 'Active' : 'Inactive'}</button></div>
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
                <button className="btn-outline" onClick={toCloseEdit} disabled={toSaving}>Cancel</button>
                <button className="btn-filled" onClick={toHandleSave} disabled={toSaving}>{toSaving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Gift Codes */}
      <Section id="giftcodes" title="Gift Codes">
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <button className="btn-filled" style={{ background: '#22c55e', borderColor: '#22c55e' }} onClick={gcOpenCreate}>+ New</button>
          <button className="btn-outline" onClick={() => loadGc(1)}>Refresh</button>
        </div>
        {gcErr && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginBottom: 8 }}>{gcErr}</div>}
        {gcLoading ? <div className="table-wrap" style={{ padding: '24px 0', textAlign: 'center' }}><span className="loading-spinner" /></div> : gcRecords.length === 0 ? <div className="empty-state"><div className="empty-state__icon">📋</div>No gift codes</div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Code</th><th>Reward</th><th>Multiplier</th><th>Max Redemptions</th><th>Used</th><th>Expires</th><th>Min Deposit</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {gcRecords.map(g => (
                  <tr key={g._id || g.code} tabIndex={0}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{g.code}</td>
                    <td>₹{g.rewardAmount.toLocaleString('en-IN')}</td>
                    <td>{g.turnoverMultiplier}x</td>
                    <td>{g.maxRedemptions}</td>
                    <td>{g.usedCount}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{g.expiryDate ? formatDateTime(g.expiryDate) : '-'}</td>
                    <td>{g.minDepositToday ? `₹${g.minDepositToday.toLocaleString('en-IN')}` : '-'}</td>
                    <td><span className={`badge ${g.isActive ? 'badge--success' : 'badge--danger'}`}>{g.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td><div className="cell-actions">
                      <button className="btn btn--sm" style={{ background: g.isActive ? '#ef4444' : '#22c55e', color: '#fff', border: 'none' }} onClick={() => gcHandleToggle(g.code)}>{g.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn btn--danger btn--sm" onClick={() => gcHandleDelete(g.code)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {gcTotal > 0 && (
          <div className="pagination" style={{ marginTop: 8 }}>
            <span>Page {gcPage} of {Math.ceil(gcTotal / GC_LIMIT)}</span>
            <button className="pagination__btn" disabled={gcPage <= 1} onClick={() => loadGc(gcPage - 1)}>‹</button>
            <button className="pagination__btn active">{gcPage}</button>
            <button className="pagination__btn" disabled={gcPage >= Math.ceil(gcTotal / GC_LIMIT)} onClick={() => loadGc(gcPage + 1)}>›</button>
          </div>
        )}
        {gcShowCreate && (
          <div className="dialog-overlay" onClick={() => setGcShowCreate(false)}>
            <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: 14 }}>Create Gift Code</h3>
                <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setGcShowCreate(false)}>✕</button>
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
                {gcCreateErr && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13 }}>{gcCreateErr}</div>}
                <div className="filter-group"><label>Code</label><div style={{ display: 'flex', gap: 6 }}><input value={gcForm.code} onChange={(e) => setGcForm({ ...gcForm, code: e.target.value.toUpperCase() })} placeholder="e.g. BONUS50" style={{ flex: 1 }} /><button className="btn" onClick={() => setGcForm({ ...gcForm, code: randomCode() })} style={{ whiteSpace: 'nowrap', background: '#f59e0b', color: '#fff', border: 'none' }}>Random</button></div></div>
                <div className="filter-group"><label>Reward Amount (₹)</label><input type="number" value={gcForm.rewardAmount} onChange={(e) => setGcForm({ ...gcForm, rewardAmount: Number(e.target.value) })} /></div>
                <div className="filter-group"><label>Turnover Multiplier</label><input type="number" step="0.1" value={gcForm.turnoverMultiplier} onChange={(e) => setGcForm({ ...gcForm, turnoverMultiplier: Number(e.target.value) })} /></div>
                <div className="filter-group"><label>Max Redemptions</label><input type="number" value={gcForm.maxRedemptions} onChange={(e) => setGcForm({ ...gcForm, maxRedemptions: Number(e.target.value) })} /></div>
                <div className="filter-group"><label>Expiry Date</label><input type="date" value={gcForm.expiryDate} onChange={(e) => setGcForm({ ...gcForm, expiryDate: e.target.value })} /></div>
                <div className="filter-group"><label>Min Deposit Today (₹)</label><input type="number" value={gcForm.minDepositToday} onChange={(e) => setGcForm({ ...gcForm, minDepositToday: Number(e.target.value) })} /></div>
                <div className="filter-group"><label>Description</label><input value={gcForm.description} onChange={(e) => setGcForm({ ...gcForm, description: e.target.value })} /></div>
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
                <button className="btn-outline" onClick={() => setGcShowCreate(false)} disabled={gcSaving}>Cancel</button>
                <button className="btn-filled" onClick={gcHandleCreate} disabled={gcSaving}>{gcSaving ? 'Creating...' : 'Create'}</button>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Deposit Config */}
      <Section id="deposit" title="Deposit Config">
        {depLoading ? <div className="table-wrap" style={{ padding: '24px 0', textAlign: 'center' }}><span className="loading-spinner" /></div> : (
          <>
            <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Channels</h4>
            <div className="table-wrap">
              <table className="table" style={{ marginBottom: 24 }}>
                <thead><tr><th>Channel</th><th>Name</th><th>Min (₹)</th><th>Max (₹)</th><th>Rate</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody>
                  {depChannels.map(c => (
                    <tr key={c.channel} tabIndex={0}>
                      <td>{c.channel}</td><td>{c.name}</td><td>{c.minAmount.toLocaleString('en-IN')}</td><td>{c.maxAmount.toLocaleString('en-IN')}</td><td>{c.exchangeRate ?? '-'}</td>
                      <td><span className={`badge ${c.isActive ? 'badge--success' : 'badge--danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td><div className="cell-actions"><button className="btn btn--sm" style={{ background: c.isActive ? '#ef4444' : '#22c55e', color: '#fff', border: 'none' }} onClick={() => depToggle(c.channel, !c.isActive)} disabled={depSaving === c.channel}>{depSaving === c.channel ? '...' : c.isActive ? 'Deactivate' : 'Activate'}</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Bonus Config</h4>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Deposit #</th><th>Bonus Rate</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody>
                  {depBonus.map((b, i) => (
                    <tr key={b.depositCount} tabIndex={0}>
                      <td>{b.depositCount}</td><td>{b.bonusRate}x</td><td><span className={`badge ${b.active ? 'badge--success' : 'badge--danger'}`}>{b.active ? 'Active' : 'Inactive'}</span></td>
                      <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => { const r = prompt('New bonus rate:', String(b.bonusRate)); if (r) depSaveBonus(i, Number(r)) }} disabled={depSaving === `bonus-${i}`}>{depSaving === `bonus-${i}` ? '...' : 'Edit'}</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {depErr && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginTop: 8 }}>{depErr}</div>}
      </Section>

      {/* Withdrawal Config */}
      <Section id="withdrawal" title="Withdrawal Config">
        {wdLoading && !wdConfig ? <div className="table-wrap" style={{ padding: '24px 0', textAlign: 'center' }}><span className="loading-spinner" /></div> : (
          <>
            <div className="filter-group"><label>Per Day Limit</label><input type="number" value={wdPerDay} onChange={(e) => setWdPerDay(e.target.value)} /></div>
            <h4 style={{ margin: '16px 0 8px', fontSize: 13 }}>BANK Limits</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="filter-group"><label>Min (₹)</label><input type="number" value={wdMinBank} onChange={(e) => setWdMinBank(e.target.value)} /></div>
              <div className="filter-group"><label>Max (₹)</label><input type="number" value={wdMaxBank} onChange={(e) => setWdMaxBank(e.target.value)} /></div>
            </div>
            <h4 style={{ margin: '16px 0 8px', fontSize: 13 }}>UPI Limits</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="filter-group"><label>Min (₹)</label><input type="number" value={wdMinUpi} onChange={(e) => setWdMinUpi(e.target.value)} /></div>
              <div className="filter-group"><label>Max (₹)</label><input type="number" value={wdMaxUpi} onChange={(e) => setWdMaxUpi(e.target.value)} /></div>
            </div>
            <h4 style={{ margin: '16px 0 8px', fontSize: 13 }}>UPAY Limits</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="filter-group"><label>Min (₹)</label><input type="number" value={wdMinUpay} onChange={(e) => setWdMinUpay(e.target.value)} /></div>
              <div className="filter-group"><label>Max (₹)</label><input type="number" value={wdMaxUpay} onChange={(e) => setWdMaxUpay(e.target.value)} /></div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn-filled" onClick={wdHandleSave} disabled={wdLoading}>{wdLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </>
        )}
        {wdErr && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginTop: 8 }}>{wdErr}</div>}
      </Section>
    </div>
  )
}
