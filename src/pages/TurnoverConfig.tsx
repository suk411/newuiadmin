import { useState } from 'react'
import axios from 'axios'
import { fetchTurnoverConfig, updateTurnoverConfig } from '../api/turnoverConfig'
import type { TurnoverRule } from '../api/turnoverConfig'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function TurnoverConfig() {
  const [rules, setRules] = useState<TurnoverRule[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchTurnoverConfig()
      setRules(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  if (!loading && rules.length === 0) load()

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateTurnoverConfig(rules)
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const update = (i: number, key: keyof TurnoverRule, val: any) => {
    const copy = [...rules]
    ;(copy[i] as any)[key] = val
    setRules(copy)
  }

  return (
    <div className="content">
      {error && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13, marginBottom: 8 }}>{error}</div>}

      <section className="card">
        
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Min Amount</th><th>Max Amount</th><th>Multiplier</th></tr></thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={i}>
                  <td><input type="number" value={r.minAmount} onChange={(e) => update(i, 'minAmount', Number(e.target.value))} className="input input--sm" /></td>
                  <td><input type="number" value={r.maxAmount} onChange={(e) => update(i, 'maxAmount', Number(e.target.value))} className="input input--sm" /></td>
                  <td><input type="number" step="0.1" value={r.multiplier} onChange={(e) => update(i, 'multiplier', Number(e.target.value))} className="input input--sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 'var(--space-6) var(--space-7)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-filled" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>Save</button>
        </div>
      </section>
    </div>
  )
}
