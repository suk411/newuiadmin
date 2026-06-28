import { useState, useCallback } from 'react'
import axios from 'axios'
import { fetchDeposits, approveDeposit } from '../api/deposits'
import type { DepositRecord, DepositFilters } from '../api/deposits'
import { fetchDepositConfig, updateDepositChannel, fetchDepositBonusConfig, updateDepositBonusConfig } from '../api/depositConfig'
import type { DepositChannel, DepositBonusConfig } from '../api/depositConfig'
import RechargeFilters from '../components/RechargeFilters'
import RechargeTable from '../components/RechargeTable'
import ApproveDialog from '../components/ApproveDialog'
import Pagination from '../components/Pagination'
import Toast, { nextId } from '../components/Toast'
import type { ToastMsg } from '../components/Toast'
import { useError } from '../contexts/ErrorContext'

const DEFAULT_LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) {
    return err.response.data.msg
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function RechargeRecords() {
  const [records, setRecords] = useState<DepositRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const { error, setError } = useError()
  const [loading, setLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<DepositFilters | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)
  const [approveTarget, setApproveTarget] = useState<DepositRecord | null>(null)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [channels, setChannels] = useState<DepositChannel[]>([])
  const [bonusConfigs, setBonusConfigs] = useState<DepositBonusConfig[]>([])
  const [configLoading, setConfigLoading] = useState(false)
  const [configSaving, setConfigSaving] = useState<string | null>(null)
  const [editChan, setEditChan] = useState<DepositChannel | null>(null)
  const [editChanMin, setEditChanMin] = useState('')
  const [editChanMax, setEditChanMax] = useState('')
  const [editChanActive, setEditChanActive] = useState(false)

  const addToast = useCallback((text: string) => {
    const id = nextId()
    setToasts((prev) => [...prev, { id, text }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const loadRecords = useCallback(async (filters: DepositFilters) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchDeposits(filters)
      setRecords(res.data ?? [])
      setTotal(res.total ?? 0)
      setPage(res.page ?? 1)
      setCurrentFilters(filters)
    } catch (err: unknown) {
      const msg = extractError(err)
      setError(msg)
      addToast(msg)
      setRecords([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [addToast, setError])

  const handleSearch = (filters: DepositFilters) => {
    loadRecords(filters)
  }

  const handlePageChange = (newPage: number) => {
    if (currentFilters) {
      loadRecords({ ...currentFilters, page: newPage, limit: DEFAULT_LIMIT })
    }
  }

  const handleApproveClick = (record: DepositRecord) => {
    setApproveTarget(record)
    setDialogError(null)
  }

  const handleApproveConfirm = async () => {
    if (!approveTarget) return
    setApproving(true)
    try {
      await approveDeposit(approveTarget.orderId)
      setApproveTarget(null)
      if (currentFilters) {
        loadRecords({ ...currentFilters, page, limit: DEFAULT_LIMIT })
      }
    } catch (err: unknown) {
      const msg = extractError(err)
      setDialogError(msg)
      addToast(msg)
    } finally {
      setApproving(false)
    }
  }

  const handleApproveCancel = () => {
    setApproveTarget(null)
  }

  const openConfig = async () => {
    setShowConfig(true)
    setConfigLoading(true)
    try {
      const [c, b] = await Promise.all([fetchDepositConfig(), fetchDepositBonusConfig()])
      setChannels(c)
      setBonusConfigs(b)
    } catch (err: unknown) {
      setDialogError(extractError(err))
    } finally {
      setConfigLoading(false)
    }
  }

  const openChanEdit = (c: DepositChannel) => {
    setEditChan(c)
    setEditChanMin(String(c.minAmount))
    setEditChanMax(String(c.maxAmount))
    setEditChanActive(c.isActive)
    setDialogError(null)
  }

  const saveChanEdit = async () => {
    if (!editChan) return
    setConfigSaving(editChan.channel)
    try {
      const updated = await updateDepositChannel(editChan.channel, { minAmount: Number(editChanMin), maxAmount: Number(editChanMax), isActive: editChanActive })
      setChannels(prev => prev.map(c => c.channel === editChan.channel ? { ...c, ...updated } : c))
      setEditChan(null)
    } catch (err: unknown) {
      setDialogError(extractError(err))
    } finally {
      setConfigSaving(null)
    }
  }

  const addBonusConfig = async () => {
    const c = prompt('Deposit number (e.g. 4):')
    if (!c) return
    const r = prompt('Bonus rate (e.g. 0.2):')
    if (!r) return
    setConfigSaving('new-bonus')
    try {
      await updateDepositBonusConfig({ depositCount: Number(c), bonusRate: Number(r) })
      const b = await fetchDepositBonusConfig()
      setBonusConfigs(b)
    } catch (err: unknown) {
      setDialogError(extractError(err))
    } finally {
      setConfigSaving(null)
    }
  }

  const saveBonusConfig = async (idx: number, bonusRate: number) => {
    const cfg = bonusConfigs[idx]
    setConfigSaving(`bonus-${idx}`)
    try {
      const updated = await updateDepositBonusConfig({ depositCount: cfg.depositCount, bonusRate })
      setBonusConfigs(prev => prev.map((b, i) => i === idx ? { ...b, ...updated } : b))
    } catch (err: unknown) {
      setDialogError(extractError(err))
    } finally {
      setConfigSaving(null)
    }
  }

  return (
    <div className="content">
      <RechargeFilters onSearch={handleSearch} loading={loading} onConfig={openConfig} />

      <Toast toasts={toasts} onRemove={removeToast} />

      <RechargeTable
        records={records}
        loading={loading}
        onApprove={handleApproveClick}
      />
      {total > 0 && (
        <Pagination
          page={page}
          total={total}
          limit={DEFAULT_LIMIT}
          onChange={handlePageChange}
        />
      )}

      {dialogError && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginBottom: 8 }}>{dialogError}</div>}
      {approveTarget && (
        <ApproveDialog
          record={approveTarget}
          loading={approving}
          onConfirm={handleApproveConfirm}
          onCancel={handleApproveCancel}
        />
      )}

      {showConfig && (
        <div className="dialog-overlay" onClick={() => setShowConfig(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Deposit Config</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setShowConfig(false)}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', fontSize: 14 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Channels</h4>
              {configLoading ? (
                <div style={{ padding: '24px 0', textAlign: 'center' }}><span className="loading-spinner" /></div>
              ) : (
                <table className="table" style={{ marginBottom: 24 }}>
                  <thead><tr><th>Channel</th><th>Name</th><th>Min (₹)</th><th>Max (₹)</th><th>Rate</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {channels.map(c => (
                      <tr key={c.channel} tabIndex={0}>
                        <td>{c.channel}</td>
                        <td>{c.name}</td>
                        <td>{c.minAmount.toLocaleString('en-IN')}</td>
                        <td>{c.maxAmount.toLocaleString('en-IN')}</td>
                        <td>{c.exchangeRate ?? '-'}</td>
                        <td><span className={`badge ${c.isActive ? 'badge--success' : 'badge--danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => openChanEdit(c)}>Edit</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {editChan && (
                <div className="dialog" style={{ width: '100%', marginTop: 16, border: '1px solid var(--color-border, rgb(188,198,222))' }}>
                  <div style={{ padding: 'var(--space-5) var(--space-7)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border, rgb(188,198,222))' }}>
                    <h4 style={{ margin: 0, fontSize: 13 }}>Edit Channel: {editChan.channel}</h4>
                    <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setEditChan(null)}>✕</button>
                  </div>
                  <div style={{ padding: 'var(--space-5) var(--space-7)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
                    {dialogError && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13 }}>{dialogError}</div>}
                    <div className="filter-group"><label>Min Amount (₹)</label><input type="number" value={editChanMin} onChange={(e) => setEditChanMin(e.target.value)} /></div>
                    <div className="filter-group"><label>Max Amount (₹)</label><input type="number" value={editChanMax} onChange={(e) => setEditChanMax(e.target.value)} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: 13, fontWeight: 500 }}>Active:</label>
                      <button className="btn btn--sm" style={{ background: editChanActive ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} onClick={() => setEditChanActive(!editChanActive)}>{editChanActive ? 'Active' : 'Inactive'}</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button className="btn-filled" onClick={saveChanEdit} disabled={configSaving === editChan.channel}>{configSaving === editChan.channel ? 'Saving...' : 'Save'}</button>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 13 }}>Bonus Config</h4>
                <button className="btn btn--sm" style={{ background: '#22c55e', color: '#fff', border: 'none' }} onClick={addBonusConfig} disabled={configSaving === 'new-bonus'}>{configSaving === 'new-bonus' ? '...' : '+ New'}</button>
              </div>
              {configLoading ? null : (
                <table className="table">
                  <thead><tr><th>Deposit #</th><th>Bonus Rate</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {bonusConfigs.map((b, i) => (
                      <tr key={b.depositCount} tabIndex={0}>
                        <td>{b.depositCount}</td>
                        <td>{b.bonusRate}x</td>
                        <td><span className={`badge ${b.active ? 'badge--success' : 'badge--danger'}`}>{b.active ? 'Active' : 'Inactive'}</span></td>
                        <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => { const r = prompt('New bonus rate:', String(b.bonusRate)); if (r) saveBonusConfig(i, Number(r)) }} disabled={configSaving === `bonus-${i}`}>{configSaving === `bonus-${i}` ? '...' : 'Edit'}</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
