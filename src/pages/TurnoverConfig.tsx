import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchTurnoverConfig, updateTurnoverConfig } from '../api/turnoverConfig'
import type { TurnoverRule } from '../api/turnoverConfig'

import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import AnimatedDialog from '../components/AnimatedDialog'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function TurnoverConfig() {
  const [rules, setRules] = useState<TurnoverRule[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [form, setForm] = useState<TurnoverRule | null>(null)
  /**/

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchTurnoverConfig()
      setRules(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openEdit = (i: number) => {
    setEditIndex(i)
    setForm({ ...rules[i] })
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
      const copy = [...rules]
      copy[editIndex] = form
      await updateTurnoverConfig(copy)
      setRules(copy)
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
        )}
      </section>

      <AnimatedDialog open={editIndex != null && !!form} onClose={closeEdit} title={`Edit ${form?.type ?? ''}`}
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
            <div className="filter-group"><label htmlFor="to-type">Type</label><input id="to-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
            <div className="filter-group"><label htmlFor="to-description">Description</label><input id="to-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="filter-group"><label htmlFor="to-multiplier">Multiplier</label><input id="to-multiplier" type="number" step="0.1" value={form.multiplier} onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) })} /></div>
            <div className="filter-group"><label htmlFor="to-active">Active</label>
              <button id="to-active" type="button" onClick={() => setForm({ ...form, active: !form.active })} style={{ width: 100, background: form.active ? '#22c55e' : '#ef4444', color: '#fff', border: 'none' }}>{form.active ? 'Active' : 'Inactive'}</button>
            </div>
          </div>
        )}
      </AnimatedDialog>
    </div>
  )
}
