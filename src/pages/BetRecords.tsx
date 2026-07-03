import { useState } from 'react'
import axios from 'axios'
import { fetchProviderBets, fetchWingoBets } from '../api/bets'
import type { ProviderBet, WingoBet } from '../api/bets'
import { formatDateTime } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import ExportButton from '../components/ExportButton'
import type { ExportColumn } from '../utils/export'

const LIMIT = 20

const BET_COLUMNS: ExportColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'member', label: 'Member' },
  { key: 'site', label: 'Site' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Date' },
]

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default function BetRecords() {
  const [tab, setTab] = useState<'provider' | 'wingo'>('provider')
  const [records, setRecords] = useState<(ProviderBet | WingoBet)[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  const handleMember = (v: string) => { setMember(v); if (v) setOrderNumber('') }
  const handleOrderNo = (v: string) => { setOrderNumber(v); if (v) setMember('') }

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT }
      if (tab === 'provider') {
        if (member) params.member = member
        const res = await fetchProviderBets(params)
        setRecords(res.data)
        setTotal(res.total)
      } else {
        if (orderNumber) params.orderNumber = orderNumber
        const res = await fetchWingoBets(params)
        setRecords(res.data)
        setTotal(res.total)
      }
      setPage(p)
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content content--table">
      <div className="filters-bar">
        {tab === 'provider' ? (
          <div className="filter-group"><label>Member</label><input placeholder="Member" value={member} onChange={(e) => handleMember(e.target.value)} /></div>
        ) : (
          <div className="filter-group"><label>Order No</label><input placeholder="Order no" value={orderNumber} onChange={(e) => handleOrderNo(e.target.value)} /></div>
        )}
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`btn btn--sm ${tab === 'provider' ? 'btn--primary' : ''}`} onClick={() => { setTab('provider'); setOrderNumber('') }}>Provider</button>
            <button className={`btn btn--sm ${tab === 'wingo' ? 'btn--primary' : ''}`} onClick={() => { setTab('wingo'); setMember('') }}>Wingo</button>
          </div>
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn-filled" onClick={() => load()} disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}>Search</button>
            <button type="button" className="btn-outline" onClick={() => { setMember(''); setOrderNumber(''); setRecords([]); setTotal(0) }}>Reset</button>
          </div>
        </div>
      </div>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
          <ExportButton columns={BET_COLUMNS} data={records as unknown as Record<string, unknown>[]} filename="bet-records" />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {tab === 'provider' ? (
                  <><th>ID</th><th>Member</th><th>Site</th><th>Amount</th><th>Status</th><th>Date</th></>
                ) : (
                  <><th>ID</th><th>User</th><th>Order No</th><th>Issue</th><th>Amount</th><th>Status</th><th>Date</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={tab === 'provider' ? 6 : 7} style={{ textAlign: 'center', padding: '48px 0' }}>
                  {loading ? <Spinner /> : <div className="empty-state"><div className="empty-state__icon">📋</div>No bet records found</div>}
                </td></tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r.id} tabIndex={0}>
                    {tab === 'provider' ? (
                      <><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</td>
                        <td>{r.member}</td><td>{r.site}</td>
                        <td>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                        <td><span className="badge badge--success">{r.status}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td></>
                    ) : (
                      <><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</td>
                        <td>{r.userId}</td><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.orderNumber}</td>
                        <td>{r.issueNumber}</td>
                        <td>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                        <td><span className="badge badge--success">{r.status}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td></>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={LIMIT} loading={loading} onChange={(p) => load(p)} />
      </section>
    </div>
  )
}
