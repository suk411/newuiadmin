import { useState, useMemo } from 'react'
import axios from 'axios'
import { searchUser, searchUserByMobile, updateUserStatus, fetchUsersByIp, viewUserPaymentMethods, updateUserPayments } from '../api/users'
import type { UserSearchResponse, PaymentMethods } from '../api/users'
import { formatDateTime12 } from '../utils/format'

function extractError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response?.data?.msg) return err.response.data.msg
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

function statusBadge(status: string): string {
  switch (status) {
    case 'active': return 'badge--success'
    case 'suspended': return 'badge--warning'
    case 'blocked':
    case 'inactive':
    case 'ban':
    case 'banned': return 'badge--danger'
    default: return 'badge--info'
  }
}

export default function UserSearch() {
  const [userId, setUserId] = useState('')
  const [mobile, setMobile] = useState('')
  const [showTurnover, setShowTurnover] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('active')
  const [statusRemark, setStatusRemark] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showIpUsers, setShowIpUsers] = useState(false)
  const [ipUsers, setIpUsers] = useState<Array<{ userId: number; mobile: string; createdAt: string }>>([])
  const [ipUsersLoading, setIpUsersLoading] = useState(false)
  const [showPmDialog, setShowPmDialog] = useState(false)
  const [pmData, setPmData] = useState<PaymentMethods | null>(null)
  const [pmType, setPmType] = useState<'BANK' | 'UPI' | 'UPAY'>('BANK')
  const [pmForm, setPmForm] = useState<Record<string, string>>({})
  const [pmUpdating, setPmUpdating] = useState(false)
  const [user, setUser] = useState<UserSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setError(null)
    setUser(null)

    if (!userId.trim() && !mobile.trim()) {
      setError('Please fill in at least one field')
      return
    }

    setLoading(true)
    try {
      const result = userId.trim()
        ? await searchUser(userId.trim())
        : await searchUserByMobile(mobile.trim())
      setUser(result)
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSameIp = async () => {
    if (!user) return
    setIpUsersLoading(true)
    try {
      const res = await fetchUsersByIp(user.lastIp)
      setIpUsers(res.users ?? [])
      setShowIpUsers(true)
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setIpUsersLoading(false)
    }
  }

  const handleLoadPaymentMethods = async () => {
    if (!user) return
    try {
      const data = await viewUserPaymentMethods(String(user.user.userId))
      setPmData(data)
      setPmForm({})
      setPmType('BANK')
      setShowPmDialog(true)
    } catch (err: unknown) {
      setError(extractError(err))
    }
  }

  const handleUpdatePayment = async () => {
    if (!user) return
    setPmUpdating(true)
    try {
      const body = { userId: user.user.userId, type: pmType, ...pmForm } as any
      await updateUserPayments(body)
      setShowPmDialog(false)
      setPmForm({})
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setPmUpdating(false)
    }
  }

  const handleStatusChange = async () => {
    if (!user) return
    setUpdatingStatus(true)
    try {
      await updateUserStatus({ userId: user.user.userId, status: newStatus as 'active' | 'suspended' | 'inactive' | 'ban' | 'banned', remark: statusRemark })
      setUser({ ...user, account: { ...user.account, status: newStatus as any } })
      setShowStatusDialog(false)
      setStatusRemark('')
    } catch (err: unknown) {
      setError(extractError(err))
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="content">
      <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); handleSearch() }}>
        <div className="filter-group">
          <label>User ID</label>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Mobile</label>
          <input
            type="text"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading || (!userId.trim() && !mobile.trim())}
              style={{ opacity: loading || (!userId.trim() && !mobile.trim()) ? 0.6 : 1 }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setMobile(''); setUser(null); setError(null) }}>
              Reset
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: '13px', margin: 'var(--space-3)' }}>
          {error}
        </div>
      )  }

      {user && (<>
        <div className="stat-cards" style={{ marginTop: 'var(--space-3)' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card__label">User ID</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className={`badge ${statusBadge(user.account.status)}`}>{user.account.status}</span>
                <button className="btn-filled" style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => { setNewStatus(user.account.status); setShowStatusDialog(true) }}>Change Status</button>
              </div>
            </div>
            <div className="stat-card__value text-blue">{user.user.userId}</div>
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-border, rgb(188,198,222))' }} />
            <div className="stat-card__label">Mobile</div>
            <div className="stat-card__value" style={{ fontSize: 16 }}>{user.user.mobile}</div>
            <div className="stat-card__change">{user.account.vipLevel}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Balance</div>
            <div className="stat-card__value text-green">₹{user.account.balance.toLocaleString('en-IN')}</div>
            <div className="stat-card__change up">Withdrawable: ₹{user.account.withdrawable.toLocaleString('en-IN')}</div>
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-border, rgb(188,198,222))' }} />
            <div className="stat-card__label">Total Deposits</div>
            <div className="stat-card__value text-orange" style={{ fontSize: 16 }}>₹{user.account.totalDeposits.toLocaleString('en-IN')}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card__label">Payment Methods</span>
              <button className="btn-filled" style={{ fontSize: 10, padding: '2px 8px' }} onClick={handleLoadPaymentMethods}>View</button>
            </div>
            <div style={{ fontSize: 11 }}>Holder: {user.paymentMethods?.holderName || '-'}</div>
            <div style={{ fontSize: 11 }}>Bank: {user.paymentMethods?.bank?.bankName || '-'} / {user.paymentMethods?.bank?.ifsc || '-'} / {user.paymentMethods?.bank?.accountNo || '-'}</div>
            <div style={{ fontSize: 11 }}>UPI: {user.paymentMethods?.upi?.address || '-'}</div>
            <div style={{ fontSize: 11 }}>UPAY: {user.paymentMethods?.upay?.address || '-'}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card__label">Last IP</span>
              <button className="btn-filled" style={{ fontSize: 10, padding: '2px 8px' }} onClick={handleLoadSameIp} disabled={ipUsersLoading}>{ipUsersLoading ? 'Loading...' : 'Same IP Users'}</button>
            </div>
            <div className="stat-card__value" style={{ fontSize: 16 }}>{user.lastIp}</div>
            {user.deviceInfo && <div className="stat-card__change">{user.deviceInfo.city ?? ''}{user.deviceInfo.city && user.deviceInfo.region ? ', ' : ''}{user.deviceInfo.region ?? ''}</div>}
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-border, rgb(188,198,222))' }} />
            <div className="stat-card__label">Created</div>
            <div className="stat-card__value" style={{ fontSize: 16 }}>{formatDateTime12(user.user.createdAt)}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card__label">Turnover</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="stat-card__change">₹{user.account.total_turnover_completed.toLocaleString('en-IN')}</span>
                <button className="btn-filled" style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => setShowTurnover(true)}>View Batches</button>
              </div>
            </div>
            <div className="stat-card__value text-orange">₹{user.account.turnover_requirement.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {showStatusDialog && user && (
          <div className="dialog-overlay" onClick={() => { setShowStatusDialog(false); setStatusRemark('') }}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Change Status — User #{user.user.userId}</h3>
              <div className="filter-group" style={{ marginBottom: 12 }}><label>Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="ban">Ban</option>
                  <option value="banned">Banned</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="filter-group"><label>Remark *</label><input placeholder="Enter remark (required)" value={statusRemark} onChange={(e) => setStatusRemark(e.target.value)} /></div>
              <div className="dialog-actions">
                <button className="btn-outline" onClick={() => { setShowStatusDialog(false); setStatusRemark('') }} disabled={updatingStatus}>Cancel</button>
                <button className="btn-filled" onClick={handleStatusChange} disabled={updatingStatus || !statusRemark.trim()}>{updatingStatus ? 'Updating...' : 'Update'}</button>
              </div>
            </div>
          </div>
        )}
        {showIpUsers && (
          <div className="dialog-overlay" onClick={() => { setShowIpUsers(false); setIpUsers([]) }}>
            <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '60vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 700 }}>Users with IP: {user?.lastIp}</span>
                <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => { setShowIpUsers(false); setIpUsers([]) }}>✕</button>
              </div>
              <div className="table-wrap" style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto' }}>
                {ipUsers.length === 0 ? (
                  <div className="empty-state"><div className="empty-state__icon">👥</div>No other users found</div>
                ) : (
                  <table className="table">
                    <thead><tr><th>User ID</th><th>Mobile</th><th>Created</th></tr></thead>
                    <tbody>
                      {ipUsers.map((u) => (
                        <tr key={u.userId} tabIndex={0}>
                          <td>{u.userId}</td>
                          <td>{u.mobile}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
        {showPmDialog && user && (
          <div className="dialog-overlay" onClick={() => setShowPmDialog(false)}>
            <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '50vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 700 }}>Payment Methods — User #{user.user.userId}</span>
                <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setShowPmDialog(false)}>✕</button>
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto' }}>
                {pmData && (
                  <div style={{ marginBottom: 'var(--space-6)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', fontSize: 13 }}>
                    {pmData.holderName && <div><strong>Holder Name:</strong> {pmData.holderName}</div>}
                    {pmData.bank?.bankName && <div><strong>Bank:</strong> {pmData.bank.bankName} / {pmData.bank.ifsc} / {pmData.bank.accountNo}</div>}
                    {pmData.upi?.address && <div><strong>UPI:</strong> {pmData.upi.address}</div>}
                    {pmData.upay?.address && <div><strong>UPAY:</strong> {pmData.upay.address}</div>}
                    {!pmData.holderName && !pmData.bank?.bankName && !pmData.upi?.address && !pmData.upay?.address && <div style={{ color: '#888' }}>No payment methods on file</div>}
                  </div>
                )}
                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--color-border, rgb(188,198,222))' }} />
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Add / Update Payment</div>
                <div className="filter-group" style={{ marginBottom: 10 }}><label>Type</label>
                  <select value={pmType} onChange={(e) => { setPmType(e.target.value as any); setPmForm({}) }}>
                    <option value="BANK">Bank</option>
                    <option value="UPI">UPI</option>
                    <option value="UPAY">UPAY</option>
                  </select>
                </div>
                {pmType === 'BANK' && (<>
                  <div className="filter-group"><label>Bank Name</label><input placeholder="e.g. SBI" value={pmForm.bankName ?? ''} onChange={(e) => setPmForm({ ...pmForm, bankName: e.target.value })} /></div>
                  <div className="filter-group"><label>IFSC</label><input placeholder="e.g. SBIN0001234" value={pmForm.ifsc ?? ''} onChange={(e) => setPmForm({ ...pmForm, ifsc: e.target.value })} /></div>
                  <div className="filter-group"><label>Account No</label><input placeholder="Account number" value={pmForm.accountNo ?? ''} onChange={(e) => setPmForm({ ...pmForm, accountNo: e.target.value })} /></div>
                  <div className="filter-group"><label>Account Holder</label><input placeholder="Holder name" value={pmForm.accountHolder ?? ''} onChange={(e) => setPmForm({ ...pmForm, accountHolder: e.target.value })} /></div>
                </>)}
                {pmType === 'UPI' && (<>
                  <div className="filter-group"><label>UPI ID</label><input placeholder="e.g. name@paytm" value={pmForm.upiId ?? ''} onChange={(e) => setPmForm({ ...pmForm, upiId: e.target.value })} /></div>
                  <div className="filter-group"><label>Account Holder</label><input placeholder="Holder name" value={pmForm.accountHolder ?? ''} onChange={(e) => setPmForm({ ...pmForm, accountHolder: e.target.value })} /></div>
                </>)}
                {pmType === 'UPAY' && (<>
                  <div className="filter-group"><label>RPL ID</label><input placeholder="e.g. RPL123456" value={pmForm.rplId ?? ''} onChange={(e) => setPmForm({ ...pmForm, rplId: e.target.value })} /></div>
                  <div className="filter-group"><label>Account Holder</label><input placeholder="Holder name" value={pmForm.accountHolder ?? ''} onChange={(e) => setPmForm({ ...pmForm, accountHolder: e.target.value })} /></div>
                </>)}
              </div>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderTop: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button className="btn-outline" onClick={() => setShowPmDialog(false)} disabled={pmUpdating}>Cancel</button>
                <button className="btn-filled" onClick={handleUpdatePayment} disabled={pmUpdating || Object.keys(pmForm).length === 0}>{pmUpdating ? 'Saving...' : 'Save Payment'}</button>
              </div>
            </div>
          </div>
        )}
        {showTurnover && (
          <div className="dialog-overlay" onClick={() => setShowTurnover(false)}>
            <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: '70vw', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ padding: 'var(--space-6) var(--space-7)', borderBottom: '1px solid var(--color-border, rgb(188,198,222))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontWeight: 700 }}>Turnover Batches</span>
                <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setShowTurnover(false)}>✕</button>
              </div>
              <div className="table-wrap" style={{ padding: 'var(--space-6) var(--space-7)', flex: 1, overflow: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-6)', fontSize: 12 }}>
                  <div><span style={{ color: '#888' }}>Total Required</span><div style={{ fontWeight: 700, fontSize: 16 }}>₹{user.account.turnover_requirement.toLocaleString('en-IN')}</div></div>
                  <div><span style={{ color: '#888' }}>Total Completed</span><div style={{ fontWeight: 700, fontSize: 16, color: '#22c55e' }}>₹{user.account.total_turnover_completed.toLocaleString('en-IN')}</div></div>
                  <div><span style={{ color: '#888' }}>Remaining</span><div style={{ fontWeight: 700, fontSize: 16, color: '#ef4444' }}>₹{(user.account.turnover_requirement - user.account.total_turnover_completed).toLocaleString('en-IN')}</div></div>
                </div>
                <table className="table">
                  <thead><tr><th>Type</th><th>Amount</th><th>Multiplier</th><th>Required</th><th>Completed</th><th>Remaining</th><th>Created</th></tr></thead>
                  <tbody>
                    {user.account.turnover_batches.map((b, i) => (
                      <tr key={i} tabIndex={0}>
                        <td>{b.type}</td>
                        <td>₹{b.amount.toLocaleString('en-IN')}</td>
                        <td>{b.multiplier}x</td>
                        <td>₹{b.required.toLocaleString('en-IN')}</td>
                        <td>₹{b.completed.toLocaleString('en-IN')}</td>
                        <td>₹{(b.required - b.completed).toLocaleString('en-IN')}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime12(b.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </>)}
    </div>
  )
}
