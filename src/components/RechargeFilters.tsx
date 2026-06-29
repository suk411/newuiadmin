import { useState } from 'react'
import type { DepositFilters } from '../api/deposits'

interface Props {
  onSearch: (filters: DepositFilters) => void
  loading: boolean
}

const emptyFilters = (page = 1, limit = 20): DepositFilters => ({
  userId: '',
  mobile: '',
  orderId: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  page,
  limit,
})

export default function RechargeFilters({ onSearch, loading }: Props) {
  const [filters, setFilters] = useState<DepositFilters>(emptyFilters())

  const handleChange = (field: keyof DepositFilters, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [field]: value }
      if (value && field === 'userId') { next.mobile = ''; next.orderId = '' }
      else if (value && field === 'mobile') { next.userId = ''; next.orderId = '' }
      else if (value && field === 'orderId') { next.userId = ''; next.mobile = '' }
      return next
    })
  }

  const hasAnyFilter = filters.userId || filters.mobile || filters.orderId || filters.status || filters.dateFrom || filters.dateTo

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasAnyFilter) return
    onSearch({ ...filters, page: 1 })
  }

  const handleReset = () => {
    const reset = emptyFilters()
    setFilters(reset)
  }

  return (
    <form className="filters-bar" onSubmit={handleSubmit}>
      <div className="filter-group">
        <label>User ID</label>
        <input
          placeholder="Enter user ID"
          value={filters.userId}
          onChange={(e) => handleChange('userId', e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>Phone</label>
        <input
          placeholder="Enter phone number"
          value={filters.mobile}
          onChange={(e) => handleChange('mobile', e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>Order ID</label>
        <input
          placeholder="Enter order ID"
          value={filters.orderId}
          onChange={(e) => handleChange('orderId', e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="filter-group">
        <label>From</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleChange('dateFrom', e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleChange('dateTo', e.target.value)}
        />
      </div>
      <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" className="btn-filled" disabled={loading || !hasAnyFilter}
            style={{ opacity: loading || !hasAnyFilter ? 0.6 : 1 }}>
            Search
          </button>
          <button type="button" className="btn-outline" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </form>
  )
}
