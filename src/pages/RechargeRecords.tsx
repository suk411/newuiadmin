import { useState, useCallback } from 'react'
import axios from 'axios'
import { fetchDeposits, approveDeposit } from '../api/deposits'
import type { DepositRecord, DepositFilters } from '../api/deposits'
import RechargeFilters from '../components/RechargeFilters'
import RechargeTable from '../components/RechargeTable'
import ApproveDialog from '../components/ApproveDialog'
import Pagination from '../components/Pagination'
import ExportButton from '../components/ExportButton'
import type { ExportColumn } from '../utils/export'
import { useToast } from '../contexts/ToastContext'

const DEFAULT_LIMIT = 20

const RECHARGE_COLUMNS: ExportColumn[] = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'userId', label: 'User ID' },
  { key: 'amount', label: 'Amount' },
  { key: 'receivedAmount', label: 'Received Amount' },
  { key: 'currency', label: 'Currency' },
  { key: 'status', label: 'Status' },
  { key: 'channelName', label: 'Channel' },
  { key: 'gatewayOrderNo', label: 'Gateway Order' },
  { key: 'bonusOptIn', label: 'Bonus Opt-In' },
  { key: 'bonusAmount', label: 'Bonus Amount' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' },
]

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
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
          <ExportButton columns={RECHARGE_COLUMNS} data={records as unknown as Record<string, unknown>[]} filename="recharge-records" />
        </div>
        <RechargeTable
          records={records}
          loading={loading}
          onApprove={handleApproveClick}
        />
        <Pagination page={page} total={total} limit={DEFAULT_LIMIT} loading={loading} onChange={handlePageChange} />
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
