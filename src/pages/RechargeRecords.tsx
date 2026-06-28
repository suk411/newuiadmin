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

  const toggleChannel = async (channel: string, isActive: boolean) => {
    setConfigSaving(channel)
    try {
      const updated = await updateDepositChannel(channel, { isActive })
      setChannels(prev => prev.map(c => c.channel === channel ? { ...c, ...updated } : c))
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
                        <td><div className="cell-actions"><button className="btn btn--sm" style={{ background: c.isActive ? '#ef4444' : '#22c55e', color: '#fff', border: 'none' }} onClick={() => toggleChannel(c.channel, !c.isActive)} disabled={configSaving === c.channel}>{configSaving === c.channel ? '...' : c.isActive ? 'Deactivate' : 'Activate'}</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Bonus Config</h4>
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
