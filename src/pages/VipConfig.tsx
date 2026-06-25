import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchVipConfig, updateVipConfig } from '../api/vipConfig'
import type { VipTier } from '../api/vipConfig'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function VipConfig() {
  const [tiers, setTiers] = useState<VipTier[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateVipConfig(tiers)
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const update = (i: number, key: keyof VipTier, val: any) => {
    const copy = [...tiers]
    ;(copy[i] as any)[key] = val
    setTiers(copy)
  }

  return (
    <div className="content">
      {error && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginBottom: 8 }}>{error}</div>}

      <section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Level</th><th>Name</th><th>Deposit Threshold</th><th>Withdrawal Limit</th><th>Benefits</th></tr></thead>
            <tbody>
              {tiers.map((t, i) => (
                <tr key={t.level}>
                  <td>{t.level}</td>
                  <td><input value={t.name} onChange={(e) => update(i, 'name', e.target.value)} className="input input--sm" /></td>
                  <td><input type="number" value={t.depositThreshold} onChange={(e) => update(i, 'depositThreshold', Number(e.target.value))} className="input input--sm" /></td>
                  <td><input type="number" value={t.withdrawalLimit} onChange={(e) => update(i, 'withdrawalLimit', Number(e.target.value))} className="input input--sm" /></td>
                  <td><input value={(t.benefits || []).join(', ')} onChange={(e) => update(i, 'benefits', e.target.value.split(',').map((s: string) => s.trim()))} className="input input--sm" placeholder="Comma-separated" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 'var(--space-6) var(--space-7)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-filled" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>Save Changes</button>
        </div>
      </section>
    </div>
  )
}
