import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchVipConfig, updateVipConfig } from '../api/vipConfig'
import type { VipTier } from '../api/vipConfig'

import { useError } from '../contexts/ErrorContext'
import Spinner from '../components/Spinner'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function VipConfig() {
  const [tiers, setTiers] = useState<VipTier[]>([])
  const [loading, setLoading] = useState(true)
  const { error, setError } = useError()
  const [saving, setSaving] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<VipTier | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchVipConfig()
      setTiers(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openEdit = (i: number) => {
    setEditIndex(i)
    setForm({ ...tiers[i] })
    setDialogError(null)
  }

  const closeEdit = () => {
    setEditIndex(null)
    setForm(null)
  }

  const handleSave = async () => {
    if (form == null || editIndex == null) return
    setSaving(true)
    setDialogError(null)
    try {
      const copy = [...tiers]
      copy[editIndex] = form
      await updateVipConfig(copy)
      setTiers(copy)
      closeEdit()
    } catch (err: unknown) {
      setDialogError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="content">
      {loading ? (
        <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
          <Spinner />
        </div>
      ) : (
        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Level</th><th>Name</th><th>Min Deposit (₹)</th><th>Weekly Bonus (₹)</th><th>Upgrade Bonus (₹)</th><th>Weekly Deposit Req. (₹)</th><th>Actions</th></tr></thead>
              <tbody>
                {tiers.map((t, i) => (
                  <tr key={i}>
                    <td>VIP {i + 1}</td>
                    <td>{t.name}</td>
                    <td>{t.minDeposit.toLocaleString('en-IN')}</td>
                    <td>{t.weeklyBonus.toLocaleString('en-IN')}</td>
                    <td>{t.upgradeBonus.toLocaleString('en-IN')}</td>
                    <td>{t.weeklyDepositRequirement.toLocaleString('en-IN')}</td>
                    <td><div className="cell-actions"><button className="btn btn--primary btn--sm" onClick={() => openEdit(i)}>Edit</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {editIndex != null && form && (
        <div className="dialog-overlay" onClick={closeEdit}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>Edit VIP {editIndex + 1}</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={closeEdit}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
              {dialogError && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13 }}>{dialogError}</div>}
              <div className="filter-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="filter-group"><label>Min Deposit (₹)</label><input type="number" value={form.minDeposit} onChange={(e) => setForm({ ...form, minDeposit: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Weekly Bonus (₹)</label><input type="number" value={form.weeklyBonus} onChange={(e) => setForm({ ...form, weeklyBonus: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Upgrade Bonus (₹)</label><input type="number" value={form.upgradeBonus} onChange={(e) => setForm({ ...form, upgradeBonus: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Weekly Deposit Requirement (₹)</label><input type="number" value={form.weeklyDepositRequirement} onChange={(e) => setForm({ ...form, weeklyDepositRequirement: Number(e.target.value) })} /></div>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
              <button className="btn-outline" onClick={closeEdit} disabled={saving}>Cancel</button>
              <button className="btn-filled" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
