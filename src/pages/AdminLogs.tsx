import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchLogs } from '../api/logs'
import type { LogEntry } from '../api/logs'
import { formatDateTime } from '../utils/format'
import Spinner from '../components/Spinner'
import { useExportBar } from '../components/ExportBarContext'
import type { ExportColumn } from '../utils/export'

const LOG_COLUMNS: ExportColumn[] = [
  { key: 'level', label: 'Level' },
  { key: 'message', label: 'Message' },
  { key: 'timestamp', label: 'Timestamp' },
]

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [level, setLevel] = useState('')
  const [since, setSince] = useState('')
  const [loading, setLoading] = useState(false)
  const { setExportProps } = useExportBar()

  useEffect(() => {
    setExportProps({ columns: LOG_COLUMNS, data: logs as unknown as Record<string, unknown>[], filename: 'admin-logs' })
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
      <div className="filters-bar">
        <div className="filter-group">
          <label>Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All</option>
            <option value="info">Info</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Since</label>
          <input type="datetime-local" value={since} onChange={(e) => setSince(e.target.value)} />
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={load} disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Apply</button>
            <button type="button" className="btn-outline" onClick={() => { setLevel(''); setSince('') }}>Reset</button>
          </div>
        </div>
      </div>

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
                  <td style={{ whiteSpace: 'nowrap' }}>{log.timestamp}</td>
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
