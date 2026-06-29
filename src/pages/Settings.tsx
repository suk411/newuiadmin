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
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
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
  const { toast } = useToast()

  // VIP Config
  const [vipTiers, setVipTiers] = useState<VipTier[]>([])
  const [vipLoading, setVipLoading] = useState(false)
  const [vipEditIdx, setVipEditIdx] = useState<number | null>(null)
  const [vipForm, setVipForm] = useState<VipTier | null>(null)
  const [vipSaving, setVipSaving] = useState(false)

  // Turnover Config
  const [toRules, setToRules] = useState<TurnoverRule[]>([])
  const [toLoading, setToLoading] = useState(false)
  const [toEditIdx, setToEditIdx] = useState<number | null>(null)
  const [toForm, setToForm] = useState<TurnoverRule | null>(null)
  const [toSaving, setToSaving] = useState(false)

  // Gift Codes
  const [gcRecords, setGcRecords] = useState<GiftCode[]>([])
  const [gcTotal, setGcTotal] = useState(0)
  const [gcPage, setGcPage] = useState(1)
  const [gcLoading, setGcLoading] = useState(false)

  // Deposit Config
  const [depChannels, setDepChannels] = useState<DepositChannel[]>([])
  const [depBonus, setDepBonus] = useState<DepositBonusConfig[]>([])
  const [depLoading, setDepLoading] = useState(false)
  const [depSaving, setDepSaving] = useState<string | null>(null)

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

  // dialog visibility
  const [showVip, setShowVip] = useState(false)
  const [showTo, setShowTo] = useState(false)
  const [showGc, setShowGc] = useState(false)
  const [showDep, setShowDep] = useState(false)
  const [showWd, setShowWd] = useState(false)

  // ---- VIP Config ----
  const loadVip = async () => {
    setVipLoading(true)
    try {
      const data = await fetchVipConfig()
      setVipTiers(Array.isArray(data) ? data : [])
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setVipLoading(false) }
  }

  const vipOpenDialog = () => { setShowVip(true); loadVip() }
  const vipCloseDialog = () => { setShowVip(false); setVipEditIdx(null); setVipForm(null) }

  const vipOpenEdit = (i: number) => {
    setVipEditIdx(i)
    setVipForm({ ...vipTiers[i] })
  }

  const vipCloseEdit = () => { setVipEditIdx(null); setVipForm(null) }

  const vipHandleSave = async () => {
    if (vipForm == null || vipEditIdx == null) return
    setVipSaving(true)
    /* */
    try {
      const copy = [...vipTiers]
      copy[vipEditIdx] = vipForm
      await updateVipConfig(copy)
      setVipTiers(copy)
      vipCloseEdit()
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setVipSaving(false) }
  }

  // ---- Turnover Config ----
  const loadTo = async () => {
    setToLoading(true)
    try {
      const data = await fetchTurnoverConfig()
      setToRules(Array.isArray(data) ? data : [])
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setToLoading(false) }
  }

  const toOpenDialog = () => { setShowTo(true); loadTo() }
  const toCloseDialog = () => { setShowTo(false); setToEditIdx(null); setToForm(null); /* */ }

  const toOpenEdit = (i: number) => {
    setToEditIdx(i)
    setToForm({ ...toRules[i] })
    /* */
  }

  const toCloseEdit = () => { setToEditIdx(null); setToForm(null) }

  const toHandleSave = async () => {
    if (toForm == null || toEditIdx == null) return
    setToSaving(true)
    /* */
    try {
      const copy = [...toRules]
      copy[toEditIdx] = toForm
      await updateTurnoverConfig(copy)
      setToRules(copy)
      toCloseEdit()
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setToSaving(false) }
  }

  // ---- Gift Codes ----
  const loadGc = async (p = 1) => {
    setGcLoading(true)
    /* */
    try {
      const res = await fetchGiftCodes({ page: p, limit: GC_LIMIT })
      setGcRecords(res.data)
      setGcTotal(res.total)
      setGcPage(res.page)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setGcLoading(false) }
  }

  const gcOpenDialog = () => { setShowGc(true); loadGc() }
  const gcCloseDialog = () => { setShowGc(false); setGcRecords([]); setGcShowCreate(false); /* */ }

  const gcHandleToggle = async (code: string) => {
    try {
      await toggleGiftCode(code)
      loadGc(gcPage)
    } catch (err: unknown) { toast(extractError(err)) }
  }

  const gcHandleDelete = async (code: string) => {
    if (!confirm(`Delete gift code ${code}?`)) return
    try {
      await deleteGiftCode(code)
      loadGc(gcPage)
    } catch (err: unknown) { toast(extractError(err)) }
  }

  const [gcShowCreate, setGcShowCreate] = useState(false)
  const [gcForm, setGcForm] = useState({ code: '', rewardAmount: 0, turnoverMultiplier: 1, maxRedemptions: 100, expiryDate: '', minDepositToday: 0, description: '' })
  const [gcSaving, setGcSaving] = useState(false)

  const gcOpenCreate = () => { setGcForm({ code: '', rewardAmount: 0, turnoverMultiplier: 1, maxRedemptions: 100, expiryDate: '', minDepositToday: 0, description: '' }); setGcShowCreate(true); /* */ }

  const gcHandleCreate = async () => {
    if (!gcForm.code || !gcForm.rewardAmount) return
    setGcSaving(true)
    /* */
    try {
      await createGiftCode(gcForm)
      setGcShowCreate(false)
      loadGc(1)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setGcSaving(false) }
  }

  // ---- Deposit Config ----
  const loadDep = async () => {
    setDepLoading(true)
    try {
      const [c, b] = await Promise.all([fetchDepositConfig(), fetchDepositBonusConfig()])
      setDepChannels(c)
      setDepBonus(b)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setDepLoading(false) }
  }

  const depOpenDialog = () => { setShowDep(true); loadDep() }
  const depCloseDialog = () => { setShowDep(false); setEditChan(null); /* */ }

  const depAddBonus = async () => {
    const c = prompt('Deposit number (e.g. 4):')
    if (!c) return
    const r = prompt('Bonus rate (e.g. 0.2):')
    if (!r) return
    setDepSaving('new-bonus')
    try {
      await updateDepositBonusConfig({ depositCount: Number(c), bonusRate: Number(r) })
      await loadDep()
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setDepSaving(null) }
  }

  const [editChan, setEditChan] = useState<DepositChannel | null>(null)
  const [editChanMin, setEditChanMin] = useState('')
  const [editChanMax, setEditChanMax] = useState('')
  const [editChanActive, setEditChanActive] = useState(false)
  const [editChanRate, setEditChanRate] = useState('')
  const [editChanName, setEditChanName] = useState('')
  const [editChanDesc, setEditChanDesc] = useState('')
  const [editChanSort, setEditChanSort] = useState('')

  const depOpenEdit = (c: DepositChannel) => {
    setEditChan(c)
    setEditChanMin(String(c.minAmount))
    setEditChanMax(String(c.maxAmount))
    setEditChanActive(c.isActive)
    setEditChanRate(c.exchangeRate != null ? String(c.exchangeRate) : '')
    setEditChanName(c.name || '')
    setEditChanDesc(c.description || '')
    setEditChanSort(c.sortOrder != null ? String(c.sortOrder) : '')
  }

  const depSaveChan = async () => {
    if (!editChan) return
    setDepSaving(editChan.channel)
    try {
      const body: Record<string, unknown> = { minAmount: Number(editChanMin), maxAmount: Number(editChanMax), isActive: editChanActive }
      if (editChanRate) body.exchangeRate = Number(editChanRate)
      if (editChanName) body.name = editChanName
      body.description = editChanDesc
      if (editChanSort) body.sortOrder = Number(editChanSort)
      const updated = await updateDepositChannel(editChan.channel, body)
      setDepChannels(prev => prev.map(c => c.channel === editChan.channel ? { ...c, ...updated } : c))
      setEditChan(null)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setDepSaving(null) }
  }

  const [editBonusIdx, setEditBonusIdx] = useState<number | null>(null)
  const [editBonusCount, setEditBonusCount] = useState('')
  const [editBonusRate, setEditBonusRate] = useState('')
  const [editBonusActive, setEditBonusActive] = useState(true)

  const depOpenBonusEdit = (idx: number) => {
    const b = depBonus[idx]
    setEditBonusIdx(idx)
    setEditBonusCount(String(b.depositCount))
    setEditBonusRate(String(b.bonusRate))
    setEditBonusActive(b.active)
  }

  const depSaveBonusEdit = async () => {
    if (editBonusIdx == null) return
    setDepSaving(`bonus-${editBonusIdx}`)
    try {
      const updated = await updateDepositBonusConfig({ depositCount: Number(editBonusCount), bonusRate: Number(editBonusRate), active: editBonusActive })
      setDepBonus(prev => prev.map((b, i) => i === editBonusIdx ? { ...b, ...updated } : b))
      setEditBonusIdx(null)
    } catch (err: unknown) { toast(extractError(err)) }
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
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setWdLoading(false) }
  }

  const wdOpenDialog = () => { setShowWd(true); loadWd() }
  const wdCloseDialog = () => { setShowWd(false); /* */ }

  const wdHandleSave = async () => {
    setWdLoading(true)
    /* */
    try {
      const updated = await updateWithdrawalConfig({
        perDayLimit: Number(wdPerDay),
        limits: { BANK: { min: Number(wdMinBank), max: Number(wdMaxBank) }, UPI: { min: Number(wdMinUpi), max: Number(wdMaxUpi) }, UPAY: { min: Number(wdMinUpay), max: Number(wdMaxUpay) } },
      })
      setWdConfig(updated)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setWdLoading(false) }
  }

  function SettingsCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
    return (
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ padding: 'var(--space-5) var(--space-7)', flex: 1 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>{title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{desc}</p>
        </div>
        <div style={{ padding: '0 var(--space-7) var(--space-5)' }}>
          <button className="btn-filled" onClick={onClick}>Edit</button>
        </div>
      </section>
    )
  }

  return (
    <div className="content">
      <div className="page-header"><h2>Settings</h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        <SettingsCard title="VIP Config" desc="Manage VIP tier levels, bonuses, and deposit requirements" onClick={vipOpenDialog} />
        <SettingsCard title="Turnover Config" desc="Configure turnover rules, multipliers, and active states" onClick={toOpenDialog} />
        <SettingsCard title="Gift Codes" desc="Create and manage gift codes with rewards and limits" onClick={gcOpenDialog} />
        <SettingsCard title="Deposit Config" desc="Manage deposit channels, min/max amounts, and bonus config" onClick={depOpenDialog} />
        <SettingsCard title="Withdrawal Config" desc="Per-day limits and per-channel withdrawal restrictions" onClick={wdOpenDialog} />
      </div>

      {/* VIP Dialog */}
      {showVip && (
        <div className="dialog-overlay" onClick={vipCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>VIP Config</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={vipCloseDialog}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', fontSize: 14 }}>
              {vipLoading ? <div style={{ padding: '24px 0', textAlign: 'center' }}><Spinner /></div> : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {vipEditIdx != null && vipForm && (
        <div className="dialog-overlay" onClick={vipCloseEdit}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Edit VIP {vipEditIdx != null ? vipEditIdx + 1 : ''}</h3>
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
              <button className="btn-filled" onClick={vipHandleSave} disabled={vipSaving}>{vipSaving ? <Spinner /> : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Turnover Dialog */}
      {showTo && (
        <div className="dialog-overlay" onClick={toCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Turnover Config</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={toCloseDialog}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', fontSize: 14 }}>
              {toLoading ? <div style={{ padding: '24px 0', textAlign: 'center' }}><Spinner /></div> : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
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
              <button className="btn-filled" onClick={toHandleSave} disabled={toSaving}>{toSaving ? <Spinner /> : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Codes Dialog */}
      {showGc && (
        <div className="dialog-overlay" onClick={gcCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Gift Codes</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={gcCloseDialog}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', fontSize: 14 }}>
              <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                <button className="btn-filled" style={{ background: '#22c55e', borderColor: '#22c55e' }} onClick={gcOpenCreate}>+ New</button>
                <button className="btn-outline" onClick={() => loadGc(1)}>Refresh</button>
              </div>
              {gcLoading ? <div style={{ padding: '24px 0', textAlign: 'center' }}><Spinner /></div> : gcRecords.length === 0 ? <div className="empty-state"><div className="empty-state__icon">📋</div>No gift codes</div> : (
                <>
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
                  {gcTotal > 0 && (
                    <div className="pagination" style={{ marginTop: 8 }}>
                      <span>Page {gcPage} of {Math.ceil(gcTotal / GC_LIMIT)}</span>
                      <button className="pagination__btn" disabled={gcPage <= 1} onClick={() => loadGc(gcPage - 1)}>‹</button>
                      <button className="pagination__btn active">{gcPage}</button>
                      <button className="pagination__btn" disabled={gcPage >= Math.ceil(gcTotal / GC_LIMIT)} onClick={() => loadGc(gcPage + 1)}>›</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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
              <button className="btn-filled" onClick={gcHandleCreate} disabled={gcSaving}>{gcSaving ? <Spinner /> : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Dialog */}
      {showDep && (
        <div className="dialog-overlay" onClick={depCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Deposit Config</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={depCloseDialog}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', fontSize: 14 }}>
              {depLoading ? <div style={{ padding: '24px 0', textAlign: 'center' }}><Spinner /></div> : (
                <>
                  <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Channels</h4>
                  <div className="table-wrap">
                    <table className="table" style={{ marginBottom: 24 }}>
                      <thead><tr><th>Channel</th><th>Name</th><th>Min (₹)</th><th>Max (₹)</th><th>Rate</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {depChannels.map(c => (
                          <tr key={c.channel} tabIndex={0}>
                            <td>{c.channel}</td><td>{c.name}</td><td>{c.minAmount.toLocaleString('en-IN')}</td><td>{c.maxAmount.toLocaleString('en-IN')}</td><td>{c.exchangeRate ?? '-'}</td>
                            <td><span className={`badge ${c.isActive ? 'badge--success' : 'badge--danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                            <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => depOpenEdit(c)}>Edit</button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 13 }}>Bonus Config</h4>
                    <button className="btn btn--sm" style={{ background: '#22c55e', color: '#fff', border: 'none' }} onClick={depAddBonus} disabled={depSaving === 'new-bonus'}>{depSaving === 'new-bonus' ? <Spinner /> : '+ New'}</button>
                  </div>
                  <div className="table-wrap">
                    <table className="table">
                      <thead><tr><th>Deposit #</th><th>Bonus Rate</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {depBonus.map((b, i) => (
                          <tr key={b.depositCount} tabIndex={0}>
                            <td>{b.depositCount}</td><td>{b.bonusRate}x</td><td><span className={`badge ${b.active ? 'badge--success' : 'badge--danger'}`}>{b.active ? 'Active' : 'Inactive'}</span></td>
                            <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => depOpenBonusEdit(i)} disabled={depSaving === `bonus-${i}`}>{depSaving === `bonus-${i}` ? <Spinner /> : 'Edit'}</button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {editChan && (
        <div className="dialog-overlay" onClick={() => setEditChan(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Edit Channel: {editChan.channel}</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setEditChan(null)}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
              <div className="filter-group"><label>Name</label><input value={editChanName} onChange={(e) => setEditChanName(e.target.value)} /></div>
              <div className="filter-group"><label>Description</label><input value={editChanDesc} onChange={(e) => setEditChanDesc(e.target.value)} /></div>
              <div className="filter-group"><label>Min Amount (₹)</label><input type="number" value={editChanMin} onChange={(e) => setEditChanMin(e.target.value)} /></div>
              <div className="filter-group"><label>Max Amount (₹)</label><input type="number" value={editChanMax} onChange={(e) => setEditChanMax(e.target.value)} /></div>
              <div className="filter-group"><label>Exchange Rate</label><input type="number" step="0.01" value={editChanRate} onChange={(e) => setEditChanRate(e.target.value)} /></div>
              <div className="filter-group"><label>Sort Order</label><input type="number" value={editChanSort} onChange={(e) => setEditChanSort(e.target.value)} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Active:</label>
                <button className="btn btn--sm" style={{ background: editChanActive ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} onClick={() => setEditChanActive(!editChanActive)}>{editChanActive ? 'Active' : 'Inactive'}</button>
              </div>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
              <button className="btn-outline" onClick={() => setEditChan(null)}>Cancel</button>
              <button className="btn-filled" onClick={depSaveChan} disabled={depSaving === editChan.channel}>{depSaving === editChan.channel ? <Spinner /> : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {editBonusIdx != null && (
        <div className="dialog-overlay" onClick={() => setEditBonusIdx(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Edit Bonus Config</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setEditBonusIdx(null)}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
              <div className="filter-group"><label>Deposit Number</label><input type="number" value={editBonusCount} onChange={(e) => setEditBonusCount(e.target.value)} /></div>
              <div className="filter-group"><label>Bonus Rate</label><input type="number" step="0.1" min="0" max="10" value={editBonusRate} onChange={(e) => setEditBonusRate(e.target.value)} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Active:</label>
                <button className="btn btn--sm" style={{ background: editBonusActive ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} onClick={() => setEditBonusActive(!editBonusActive)}>{editBonusActive ? 'Active' : 'Inactive'}</button>
              </div>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
              <button className="btn-outline" onClick={() => setEditBonusIdx(null)}>Cancel</button>
              <button className="btn-filled" onClick={depSaveBonusEdit} disabled={depSaving === `bonus-${editBonusIdx}`}>{depSaving === `bonus-${editBonusIdx}` ? <Spinner /> : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Dialog */}
      {showWd && (
        <div className="dialog-overlay" onClick={wdCloseDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Withdrawal Config</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={wdCloseDialog}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', fontSize: 14 }}>
              {wdLoading && !wdConfig ? <div style={{ padding: '24px 0', textAlign: 'center' }}><Spinner /></div> : (
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
                    <button className="btn-filled" onClick={wdHandleSave} disabled={wdLoading}>{wdLoading ? <Spinner /> : 'Save'}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
