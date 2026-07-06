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
      <button className="btn-outline btn-outline--orange" style={{ fontSize: 12 }} onClick={() => setOpen(!open)}>
        Export ▾
      </button>
      {open && (
        <div className="export-dropdown">
          <button className="export-option" onClick={() => { exportCsv(columns, data, filename); setOpen(false) }}>CSV</button>
          <button className="export-option" onClick={() => { exportExcel(columns, data, filename); setOpen(false) }}>Excel</button>
          <button className="export-option" onClick={() => { exportPdf(columns, data, filename); setOpen(false) }}>PDF</button>
        </div>
      )}
    </div>
  )
}