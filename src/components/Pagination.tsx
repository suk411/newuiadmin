import { useState } from 'react'

interface Props {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, limit, onChange }: Props) {
  const [goto, setGoto] = useState('')
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const pages: (number | string)[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  if (start > 1) pages.push(1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('...')
  if (end < totalPages) pages.push(totalPages)

  const handleGoto = (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseInt(goto, 10)
    if (p >= 1 && p <= totalPages) {
      onChange(p)
      setGoto('')
    }
  }

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹ Prev
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--color-text-secondary)' }}>...</span>
        ) : (
          <button
            key={p}
            className={p === page ? 'active' : ''}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next ›
      </button>
      <form className="goto-input" onSubmit={handleGoto}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Go to</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goto}
          onChange={(e) => setGoto(e.target.value)}
          placeholder=""
        />
      </form>
    </div>
  )
}
