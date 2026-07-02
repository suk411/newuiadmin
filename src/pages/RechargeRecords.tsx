import { useState, useCallback } from 'react'
import axios from 'axios'
import { fetchDeposits, approveDeposit } from '../api/deposits'
import type { DepositRecord, DepositFilters } from '../api/deposits'
import RechargeFilters from '../components/RechargeFilters'
import RechargeTable from '../components/RechargeTable'
import ApproveDialog from '../components/ApproveDialog'
import Pagination from '../components/Pagination'
import { useToast } from '../contexts/ToastContext'

const DEFAULT_LIMIT = 20

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) {
    return err.response.data.msg
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function RechargeRecords() {
  const [records, setRecords] = useState<DepositRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<DepositFilters | null>(null)
  const [approving, setApproving] = useState(false)
  const [approveTarget, setApproveTarget] = useState<DepositRecord | null>(null)

  const loadRecords = useCallback(async (filters: DepositFilters) => {
    setLoading(true)
    try {
      const res = await fetchDeposits(filters)
      setRecords(res.data ?? [])
      setTotal(res.total ?? 0)
      setPage(res.page ?? 1)
      setCurrentFilters(filters)
    } catch (err: unknown) {
      const msg = extractError(err)
      toast(msg)
      setRecords([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [toast])

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
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setApproving(false)
    }
  }

  const handleApproveCancel = () => {
    setApproveTarget(null)
  }

  return (
    <div className="content content--table">
      <RechargeFilters onSearch={handleSearch} loading={loading} />
      <section className="card">
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
      </section>

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
