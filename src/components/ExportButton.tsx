import { useState, useRef, useEffect, useCallback } from 'react'
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

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', keyHandler) }
  }, [])

  return (
    <div ref={ref} className="export-btn-wrap">
      <button className="btn-outline btn-outline--orange" style={{ fontSize: 12 }} onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label="Export data">
        Export ▾
      </button>
      {open && (
        <div className="export-dropdown" role="menu">
          <button className="export-option" role="menuitem" onClick={() => { exportCsv(columns, data, filename); close() }}>CSV</button>
          <button className="export-option" role="menuitem" onClick={() => { exportExcel(columns, data, filename); close() }}>Excel</button>
          <button className="export-option" role="menuitem" onClick={() => { exportPdf(columns, data, filename); close() }}>PDF</button>
        </div>
      )}
    </div>
  )
}