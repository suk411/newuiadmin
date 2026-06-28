import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchTurnoverConfig, updateTurnoverConfig } from '../api/turnoverConfig'
import type { TurnoverRule } from '../api/turnoverConfig'

import { useError } from '../contexts/ErrorContext'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function TurnoverConfig() {
  const [rules, setRules] = useState<TurnoverRule[]>([])
  const [loading, setLoading] = useState(true)
  const { error, setError } = useError()
  const [saving, setSaving] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<TurnoverRule | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)

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

  useEffect(() => { load() }, [])

  const openEdit = (i: number) => {
    setEditIndex(i)
    setForm({ ...rules[i] })
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
      const copy = [...rules]
      copy[editIndex] = form
      await updateTurnoverConfig(copy)
      setRules(copy)
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
          <span className="loading-spinner" />
        </div>
      ) : (
        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Type</th><th>Description</th><th>Multiplier</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {rules.map((r, i) => (
                  <tr key={r._id || i}>
                    <td>{r.type}</td>
                    <td>{r.description}</td>
                    <td>{r.multiplier}</td>
                    <td><span className={`badge ${r.active ? 'badge--success' : 'badge--danger'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
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
              <h3 style={{ margin: 0 }}>Edit {form.type}</h3>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={closeEdit}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 14 }}>
              {dialogError && <div style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 4, fontSize: 13 }}>{dialogError}</div>}
              <div className="filter-group"><label>Type</label><input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
              <div className="filter-group"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="filter-group"><label>Multiplier</label><input type="number" step="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) })} /></div>
              <div className="filter-group"><label>Active</label>
                <button type="button" onClick={() => setForm({ ...form, active: !form.active })} style={{ width: 100, background: form.active ? '#22c55e' : '#ef4444', color: '#fff', border: 'none' }}>{form.active ? 'Active' : 'Inactive'}</button>
              </div>
            </div>
            <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 }}>
              <button className="btn-outline" onClick={closeEdit} disabled={saving}>Cancel</button>
              <button className="btn-filled" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
