import { useState, useRef, useEffect } from 'react'
import { exportCsv, exportExcel, exportPdf } from '../utils/export'
import type { ExportColumn } from '../utils/export'

interface Props {
  columns: ExportColumn[]
  data: Record<string, unknown>[]
  filename: string
}

export default function ExportButton({ columns, data, filename }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setOpen(!open)}>
        Export ▾
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          background: '#fff', border: '1px solid var(--color-border, #d0d5dd)',
          borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          zIndex: 100, minWidth: 120, overflow: 'hidden',
        }}>
          <button className="export-option" onClick={() => { exportCsv(columns, data, filename); setOpen(false) }}>CSV</button>
          <button className="export-option" onClick={() => { exportExcel(columns, data, filename); setOpen(false) }}>Excel</button>
          <button className="export-option" onClick={() => { exportPdf(columns, data, filename); setOpen(false) }}>PDF</button>
        </div>
      )}
    </div>
  )
}