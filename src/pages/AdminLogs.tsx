import { useState, useEffect } from 'react'
import { fetchLogs } from '../api/logs'
import type { LogEntry } from '../api/logs'
import { formatDateTime12 } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import { useExportBar } from '../components/ExportBarContext'
import { extractError } from '../utils/error'
import type { ExportColumn } from '../utils/export'

const LOG_COLUMNS: ExportColumn[] = [
  { key: 'level', label: 'Level' },
  { key: 'message', label: 'Message' },
  { key: 'timestamp', label: 'Timestamp' },
]

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [level, setLevel] = useState('')
  const [since, setSince] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { setExportProps } = useExportBar()

  useEffect(() => {
    setExportProps({
      columns: LOG_COLUMNS,
      data: logs.map((log) => ({
        level: log.level,
        message: log.message,
        timestamp: formatDateTime12(log.timestamp),
      })),
      filename: 'admin-logs',
    })
    return () => setExportProps(null)
  }, [logs, setExportProps])

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchLogs(level || undefined, since || undefined, 100)
      setLogs(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      console.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="content content--table">
      <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); if (!level && !since) { toast('Please select a level or date'); return }; load() }}>
        <div className="filter-group">
          <label htmlFor="log-level">Level</label>
          <select id="log-level" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All</option>
            <option value="info">Info</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="log-since">Since</label>
          <input id="log-since" type="datetime-local" value={since} onChange={(e) => setSince(e.target.value)} />
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading || (!level && !since)}
              style={{ opacity: loading || (!level && !since) ? 0.6 : 1 }}>Apply</button>
            <button type="button" className="btn-outline" onClick={() => { setLevel(''); setSince('') }}>Reset</button>
          </div>
        </div>
      </form>

      <section className="card">
        {loading && logs.length === 0 ? (
          <div className="table-wrap" style={{ padding: '48px 0', textAlign: 'center' }}>
            <Spinner />
          </div>
        ) : logs.length === 0 ? (
          <div className="table-wrap"><div className="empty-state"><div className="empty-state__icon">📋</div>No logs found</div></div>
        ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Message</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} tabIndex={0}>
                  <td><span className={`badge ${log.level === 'error' ? 'badge--danger' : 'badge--info'}`}>{log.level}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.message}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </section>
    </div>
  )
}
