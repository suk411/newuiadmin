import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchBotConfig, updateBotConfig } from '../api/botConfig'
import type { BotConfig } from '../api/botConfig'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function TelegramBot() {
  const [config, setConfig] = useState<BotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ownerInput, setOwnerInput] = useState('')
  const [userInput, setUserInput] = useState('')
  const [groupInput, setGroupInput] = useState('')
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchBotConfig()
      setConfig(data)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const addOwner = () => {
    if (!ownerInput.trim()) return
    setConfig(prev => prev ? { ...prev, ownerIds: [...prev.ownerIds, ownerInput.trim()] } : prev)
    setOwnerInput('')
  }

  const removeOwner = (idx: number) => {
    setConfig(prev => prev ? { ...prev, ownerIds: prev.ownerIds.filter((_, i) => i !== idx) } : prev)
  }

  const addUser = () => {
    if (!userInput.trim()) return
    setConfig(prev => prev ? { ...prev, allowedUserIds: [...prev.allowedUserIds, userInput.trim()] } : prev)
    setUserInput('')
  }

  const removeUser = (idx: number) => {
    setConfig(prev => prev ? { ...prev, allowedUserIds: prev.allowedUserIds.filter((_, i) => i !== idx) } : prev)
  }

  const addGroup = () => {
    if (!groupInput.trim()) return
    setConfig(prev => prev ? { ...prev, allowedGroupIds: [...prev.allowedGroupIds, groupInput.trim()] } : prev)
    setGroupInput('')
  }

  const removeGroup = (idx: number) => {
    setConfig(prev => prev ? { ...prev, allowedGroupIds: prev.allowedGroupIds.filter((_, i) => i !== idx) } : prev)
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const updated = await updateBotConfig(config)
      setConfig(updated)
      toast('Bot config saved')
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setSaving(false) }
  }

  return (
    <div className="content content--table">
      <div className="filters-bar">
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={load} disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Refresh</button>
            <button className="btn-filled" style={{ background: '#22c55e', borderColor: '#22c55e' }}
              onClick={handleSave} disabled={saving || !config}>
              {saving ? <Spinner /> : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <section className="card"><div style={{ padding: '48px 0', textAlign: 'center' }}><Spinner /></div></section>
      ) : !config ? (
        <section className="card"><div className="empty-state" style={{ padding: '48px 0' }}><div className="empty-state__icon">📋</div>Failed to load config</div></section>
      ) : (
        <>
          <section className="card">
            <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Owner IDs</h3>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>Owner ID</th><th>Action</th></tr></thead>
                <tbody>
                  {config.ownerIds.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px 0' }}><div className="empty-state"><div className="empty-state__icon">📋</div>No owners</div></td></tr>
                  ) : (
                    config.ownerIds.map((id, i) => (
                      <tr key={i} tabIndex={0}>
                        <td>{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</td>
                        <td><button className="btn btn--danger btn--sm" onClick={() => removeOwner(i)}>Remove</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={ownerInput} onChange={(e) => setOwnerInput(e.target.value)} placeholder="Enter Telegram user ID" style={{ flex: 1, height: 35, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 13 }} />
              <button className="btn-filled" onClick={addOwner} disabled={!ownerInput.trim()} style={{ height: 35, padding: '0 12px' }}>Add</button>
            </div>
          </section>

          <section className="card" style={{ marginTop: 12 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Allowed User IDs</h3>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>User ID</th><th>Action</th></tr></thead>
                <tbody>
                  {config.allowedUserIds.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px 0' }}><div className="empty-state"><div className="empty-state__icon">📋</div>No allowed users</div></td></tr>
                  ) : (
                    config.allowedUserIds.map((id, i) => (
                      <tr key={i} tabIndex={0}>
                        <td>{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</td>
                        <td><button className="btn btn--danger btn--sm" onClick={() => removeUser(i)}>Remove</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Enter Telegram user ID" style={{ flex: 1, height: 35, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 13 }} />
              <button className="btn-filled" onClick={addUser} disabled={!userInput.trim()} style={{ height: 35, padding: '0 12px' }}>Add</button>
            </div>
          </section>

          <section className="card" style={{ marginTop: 12 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Allowed Group IDs</h3>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>Group ID</th><th>Action</th></tr></thead>
                <tbody>
                  {config.allowedGroupIds.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px 0' }}><div className="empty-state"><div className="empty-state__icon">📋</div>No allowed groups</div></td></tr>
                  ) : (
                    config.allowedGroupIds.map((id, i) => (
                      <tr key={i} tabIndex={0}>
                        <td>{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{id}</td>
                        <td><button className="btn btn--danger btn--sm" onClick={() => removeGroup(i)}>Remove</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={groupInput} onChange={(e) => setGroupInput(e.target.value)} placeholder="Enter Telegram group ID (e.g. -100...)" style={{ flex: 1, height: 35, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 13 }} />
              <button className="btn-filled" onClick={addGroup} disabled={!groupInput.trim()} style={{ height: 35, padding: '0 12px' }}>Add</button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
