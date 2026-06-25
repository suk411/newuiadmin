import { useState, useEffect, useCallback } from 'react'
import { fetchDeposits, approveDeposit } from '../api/deposits'
import type { DepositRecord, DepositFilters } from '../api/deposits'
import RechargeFilters from '../components/RechargeFilters'
import RechargeTable from '../components/RechargeTable'
import ApproveDialog from '../components/ApproveDialog'
import Pagination from '../components/Pagination'

const DEFAULT_LIMIT = 20

export default function RechargeRecords() {
  const [records, setRecords] = useState<DepositRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<DepositFilters | null>(null)
  const [approving, setApproving] = useState(false)
  const [approveTarget, setApproveTarget] = useState<DepositRecord | null>(null)

  const loadRecords = useCallback(async (filters: DepositFilters) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchDeposits(filters)
      setRecords(res.data ?? [])
      setTotal(res.total ?? 0)
      setPage(res.page ?? 1)
      setCurrentFilters(filters)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load recharge records'
      setError(msg)
      setRecords([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords({ page: 1, limit: DEFAULT_LIMIT })
  }, [loadRecords])

  const handleSearch = (filters: DepositFilters) => {
    loadRecords(filters)
  }

  const handlePageChange = (newPage: number) => {
    if (currentFilters) {
      loadRecords({ ...currentFilters, page: newPage, limit: DEFAULT_LIMIT })
    }
  }

  const handleApproveClick = (record: DepositRecord) => {
    setApproveTarget(record)
  }

  const handleApproveConfirm = async () => {
    if (!approveTarget) return
    setApproving(true)
    try {
      await approveDeposit(approveTarget.orderId)
      setApproveTarget(null)
      if (currentFilters) {
        loadRecords({ ...currentFilters, page, limit: DEFAULT_LIMIT })
      }
    } catch {
      setError('Failed to approve deposit')
    } finally {
      setApproving(false)
    }
  }

  const handleApproveCancel = () => {
    setApproveTarget(null)
  }

  return (
    <div>
      <RechargeFilters onSearch={handleSearch} loading={loading} />

      {error && (
        <div
          style={{
            margin: 'var(--space-4) var(--space-8)',
            padding: 'var(--space-3) var(--space-4)',
            background: '#fef2f2',
            color: '#dc2626',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      <RechargeTable
        records={records}
        loading={loading}
        onApprove={handleApproveClick}
      />

      {total > 0 && (
        <Pagination
          page={page}
          total={total}
          limit={DEFAULT_LIMIT}
          onChange={handlePageChange}
        />
      )}

      {approveTarget && (
        <ApproveDialog
          record={approveTarget}
          loading={approving}
          onConfirm={handleApproveConfirm}
          onCancel={handleApproveCancel}
        />
      )}
    </div>
  )
}
