import { useState } from 'react'
import { useToast } from '../contexts/ToastContext'

interface Props {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const [jumpValue, setJumpValue] = useState('')
  const { toast } = useToast()

  const pages: (number | string)[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  if (start > 1) pages.push(1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('...')
  if (end < totalPages) pages.push(totalPages)

  const handleJump = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const p = parseInt(jumpValue, 10)
    if (p >= 1 && p <= totalPages) {
      onChange(p)
      setJumpValue('')
    } else {
      toast('Page not found')
    }
  }

  return (
    <div style={{ textAlign: 'right', padding: '20px 5px 2px' }}>
      <div className="el-pagination">
        <span className="el-pagination__total">Total {total}</span>
        <button type="button" className="btn-prev" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <i className="el-icon-arrow-left"></i>
        </button>
        <ul className="el-pager">
          {pages[0] !== 1 && <li className="el-pager__more" onClick={() => onChange(1)} style={{ cursor: 'pointer' }}>«</li>}
          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <li key={`ellipsis-${i}`} className="el-pager__more">...</li>
            ) : (
              <li
                key={p}
                className={`number${p === page ? ' active' : ''}`}
                onClick={() => onChange(p)}
              >
                {p}
              </li>
            )
          )}
          {pages[pages.length - 1] !== totalPages && <li className="el-pager__more" onClick={() => onChange(totalPages)} style={{ cursor: 'pointer' }}>»</li>}
        </ul>
        <button type="button" className="btn-next" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          <i className="el-icon-arrow-right"></i>
        </button>
        <span className="el-pagination__jump">
          Go to <input type="number" className="el-input__inner" value={jumpValue} onChange={(e) => setJumpValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleJump(e) }} />
        </span>
      </div>
    </div>
  )
}
