interface Props {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const pages: (number | string)[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  if (start > 1) pages.push(1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('...')
  if (end < totalPages) pages.push(totalPages)

  return (
    <div className="pagination">
      <span>Page {page} of {totalPages}</span>
      <button className="pagination__btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`}>...</span>
        ) : (
          <button
            key={p}
            className={`pagination__btn ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button className="pagination__btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        ›
      </button>
    </div>
  )
}
