import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchVipConfig, updateVipConfig } from '../api/vipConfig'
import type { VipTier } from '../api/vipConfig'

import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import AnimatedDialog from '../components/AnimatedDialog'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function VipConfig() {
  const [tiers, setTiers] = useState<VipTier[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<VipTier | null>(null)
  /**/

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchVipConfig()
      setTiers(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openEdit = (i: number) => {
    setEditIndex(i)
    setForm({ ...tiers[i] })
    /* */
  }

  const closeEdit = () => {
    setEditIndex(null)
    setForm(null)
  }

  const handleSave = async () => {
    if (form == null || editIndex == null) return
    setSaving(true)
    /* */
    try {
      const copy = [...tiers]
      copy[editIndex] = form
      await updateVipConfig(copy)
      setTiers(copy)
      closeEdit()
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="content content--table">
      <section className="card">
        {loading ? (
          <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
            <Spinner />
          </div>
        ) : (
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
        )}
      </section>

      <AnimatedDialog open={editIndex != null && !!form} onClose={closeEdit} title={`Edit VIP ${editIndex != null ? editIndex + 1 : ''}`}
        footer={
          <>
            <button className="btn-outline" onClick={closeEdit} disabled={saving}>Cancel</button>
            <button className="btn-filled" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner /> : null}
              Save
            </button>
          </>
        }
      >
        {form && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
            <div className="filter-group"><label htmlFor="vip-name">Name</label><input id="vip-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="filter-group"><label htmlFor="vip-minDeposit">Min Deposit (₹)</label><input id="vip-minDeposit" type="number" value={form.minDeposit} onChange={(e) => setForm({ ...form, minDeposit: Number(e.target.value) })} /></div>
            <div className="filter-group"><label htmlFor="vip-weeklyBonus">Weekly Bonus (₹)</label><input id="vip-weeklyBonus" type="number" value={form.weeklyBonus} onChange={(e) => setForm({ ...form, weeklyBonus: Number(e.target.value) })} /></div>
            <div className="filter-group"><label htmlFor="vip-upgradeBonus">Upgrade Bonus (₹)</label><input id="vip-upgradeBonus" type="number" value={form.upgradeBonus} onChange={(e) => setForm({ ...form, upgradeBonus: Number(e.target.value) })} /></div>
            <div className="filter-group"><label htmlFor="vip-weeklyDepReq">Weekly Deposit Requirement (₹)</label><input id="vip-weeklyDepReq" type="number" value={form.weeklyDepositRequirement} onChange={(e) => setForm({ ...form, weeklyDepositRequirement: Number(e.target.value) })} /></div>
          </div>
        )}
      </AnimatedDialog>
    </div>
  )
}
