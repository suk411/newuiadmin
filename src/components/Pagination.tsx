import { useState } from 'react'
import { useToast } from '../contexts/ToastContext'

interface Props {
  page: number
  total: number
  limit: number
  loading?: boolean
  onChange: (page: number) => void
}

export default function Pagination({ page, total, limit, loading, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const [jumpValue, setJumpValue] = useState('')
  const { toast } = useToast()

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
        <span className="el-pagination__total">Total {totalPages}</span>
        <button type="button" className="btn-prev" disabled={page <= 1 || loading} onClick={() => onChange(page - 1)}>
          <i className="el-icon-arrow-left"></i>
        </button>
        <ul className="el-pager">
          <li className={`number active${loading ? ' is-loading' : ''}`}>
            {loading ? <span className="pagination-spinner" /> : page}
          </li>
        </ul>
        <button type="button" className="btn-next" disabled={page >= totalPages || loading} onClick={() => onChange(page + 1)}>
          <i className="el-icon-arrow-right"></i>
        </button>
        <span className="el-pagination__jump">
          Go to <input type="number" className="el-input__inner" value={jumpValue} onChange={(e) => setJumpValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleJump(e) }} disabled={loading} />
        </span>
      </div>
    </div>
  )
}