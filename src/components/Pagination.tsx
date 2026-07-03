import { useState } from 'react'

interface Props {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const [jumpValue, setJumpValue] = useState('')

  const pages: (number | string)[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  if (start > 1) pages.push(1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('...')
  if (end < totalPages) pages.push(totalPages)

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseInt(jumpValue, 10)
    if (p >= 1 && p <= totalPages) {
      onChange(p)
      setJumpValue('')
    }
  }

  return (
    <div className="block" style={{ textAlign: 'right', padding: '20px 5px 2px' }}>
      <div className="el-pagination">
        <span className="el-pagination__total">Total {total}</span>
        <button
          type="button"
          className="btn-prev"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ‹
        </button>
        <ul className="el-pager">
          {pages.map((p, i) =>
            typeof p === 'string' ? (
              <li key={`ellipsis-${i}`} className="el-pager__more">...</li>
            ) : (
              <li
                key={p}
                className={`el-pager__btn${p === page ? ' active' : ''}`}
                onClick={() => onChange(p)}
              >
                {p}
              </li>
            )
          )}
        </ul>
        <button
          type="button"
          className="btn-next"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          ›
        </button>
        <span className="el-pagination__jump">
          Go to
          <input
            type="text"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleJump(e) }}
          />
        </span>
      </div>
    </div>
  )
}
