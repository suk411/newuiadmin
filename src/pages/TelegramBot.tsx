import { useState, useEffect, useCallback } from 'react'
import { fetchBotConfig, updateBotConfig } from '../api/botConfig'
import type { BotConfig } from '../api/botConfig'
import { useToast } from '../contexts/ToastContext'
import { extractError } from '../utils/error'
import Spinner from '../components/Spinner'

export default function TelegramBot() {
  const [config, setConfig] = useState<BotConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ownerInput, setOwnerInput] = useState('')
  const [userInput, setUserInput] = useState('')
  const [groupInput, setGroupInput] = useState('')
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchBotConfig()
      setConfig(data)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [])

  const saveAndUpdate = async (patch: (prev: BotConfig) => BotConfig) => {
    if (!config) return
    setSaving(true)
    try {
      const next = patch(config)
      const updated = await updateBotConfig(next)
      setConfig(updated)
      toast('Saved')
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setSaving(false) }
  }

  const addOwner = () => {
    if (!ownerInput.trim() || !config) return
    const val = ownerInput.trim()
    setOwnerInput('')
    saveAndUpdate(prev => ({ ...prev, ownerIds: [...prev.ownerIds, val] }))
  }

  const removeOwner = (idx: number) => {
    saveAndUpdate(prev => ({ ...prev, ownerIds: prev.ownerIds.filter((_, i) => i !== idx) }))
  }

  const addUser = () => {
    if (!userInput.trim() || !config) return
    const val = userInput.trim()
    setUserInput('')
    saveAndUpdate(prev => ({ ...prev, allowedUserIds: [...prev.allowedUserIds, val] }))
  }

  const removeUser = (idx: number) => {
    saveAndUpdate(prev => ({ ...prev, allowedUserIds: prev.allowedUserIds.filter((_, i) => i !== idx) }))
  }

  const addGroup = () => {
    if (!groupInput.trim() || !config) return
    const val = groupInput.trim()
    setGroupInput('')
    saveAndUpdate(prev => ({ ...prev, allowedGroupIds: [...prev.allowedGroupIds, val] }))
  }

  const removeGroup = (idx: number) => {
    saveAndUpdate(prev => ({ ...prev, allowedGroupIds: prev.allowedGroupIds.filter((_, i) => i !== idx) }))
  }

  return (
    <div className="content content--table">
      <div className="filters-bar">
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div className="btn-row">
            <button className="btn-filled" onClick={load} disabled={loading || saving} aria-label="Refresh bot config">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <section className="card"><div className="spinner-wrap"><Spinner /></div></section>
      ) : !config ? (
        <section className="card"><div className="empty-state spinner-wrap"><div className="empty-state__icon">📋</div>Failed to load config</div></section>
      ) : (
        <>
          <section className="card bot-section">
            <div className="bot-section__header">
              <h3 className="bot-section__title">Owner IDs</h3>
              <div className="input-addon">
                <input className="bot-input" value={ownerInput} onChange={(e) => setOwnerInput(e.target.value)} placeholder="Enter Telegram user ID" aria-label="Add owner ID" />
                <button className="btn-filled bot-add-btn" onClick={addOwner} disabled={!ownerInput.trim() || saving} aria-label="Add owner">{saving ? <Spinner size={12} /> : 'Add'}</button>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>Owner ID</th><th>Action</th></tr></thead>
                <tbody>
                  {config.ownerIds.length === 0 ? (
                    <tr><td colSpan={3} className="empty-cell"><div className="empty-state"><div className="empty-state__icon">📋</div>No owners</div></td></tr>
                  ) : (
                    config.ownerIds.map((id, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td className="cell-mono">{id}</td>
                        <td><button className="btn btn--danger btn--sm" onClick={() => removeOwner(i)} disabled={saving}>Remove</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card bot-section">
            <div className="bot-section__header">
              <h3 className="bot-section__title">Allowed User IDs</h3>
              <div className="input-addon">
                <input className="bot-input" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Enter Telegram user ID" aria-label="Add allowed user ID" />
                <button className="btn-filled bot-add-btn" onClick={addUser} disabled={!userInput.trim() || saving} aria-label="Add user">{saving ? <Spinner size={12} /> : 'Add'}</button>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>User ID</th><th>Action</th></tr></thead>
                <tbody>
                  {config.allowedUserIds.length === 0 ? (
                    <tr><td colSpan={3} className="empty-cell"><div className="empty-state"><div className="empty-state__icon">📋</div>No allowed users</div></td></tr>
                  ) : (
                    config.allowedUserIds.map((id, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td className="cell-mono">{id}</td>
                        <td><button className="btn btn--danger btn--sm" onClick={() => removeUser(i)} disabled={saving}>Remove</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card bot-section">
            <div className="bot-section__header">
              <h3 className="bot-section__title">Allowed Group IDs</h3>
              <div className="input-addon">
                <input className="bot-input" value={groupInput} onChange={(e) => setGroupInput(e.target.value)} placeholder="Enter Telegram group ID (e.g. -100...)" aria-label="Add group ID" />
                <button className="btn-filled bot-add-btn" onClick={addGroup} disabled={!groupInput.trim() || saving} aria-label="Add group">{saving ? <Spinner size={12} /> : 'Add'}</button>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>#</th><th>Group ID</th><th>Action</th></tr></thead>
                <tbody>
                  {config.allowedGroupIds.length === 0 ? (
                    <tr><td colSpan={3} className="empty-cell"><div className="empty-state"><div className="empty-state__icon">📋</div>No allowed groups</div></td></tr>
                  ) : (
                    config.allowedGroupIds.map((id, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td className="cell-mono">{id}</td>
                        <td><button className="btn btn--danger btn--sm" onClick={() => removeGroup(i)} disabled={saving}>Remove</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
