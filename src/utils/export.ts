import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportColumn {
  key: string
  label: string
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportCsv(columns: ExportColumn[], data: Record<string, unknown>[], filename: string) {
  const header = columns.map((c) => `"${c.label}"`).join(',')
  const rows = data.map((row) =>
    columns.map((c) => {
      const v = row[c.key]
      const s = v == null ? '' : String(v)
      return `"${s.replace(/"/g, '""')}"`
    }).join(','),
  )
  const bom = '\uFEFF'
  const csv = bom + header + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

export function exportExcel(columns: ExportColumn[], data: Record<string, unknown>[], filename: string) {
  const rows = data.map((row) => {
    const r: Record<string, unknown> = {}
    columns.forEach((c) => { r[c.label] = row[c.key] })
    return r
  })
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportPdf(columns: ExportColumn[], data: Record<string, unknown>[], filename: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const head = [columns.map((c) => c.label)]
  const body = data.map((row) => columns.map((c) => {
    const v = row[c.key]
    return v == null ? '' : String(v)
  }))
  autoTable(doc, {
    head,
    body,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [32, 143, 255] },
  })
  doc.save(`${filename}.pdf`)
}