import { useState, useMemo } from 'react'
import axios from 'axios'
import { searchUser, searchUserByMobile, updateUserStatus, fetchUsersByIp, viewUserPaymentMethods, updateUserPayments, addTurnover, clearTurnover, checkTurnoverStatus } from '../api/users'
import type { UserSearchResponse, PaymentMethods, TurnoverStatusResponse } from '../api/users'
import { formatDateTime12 } from '../utils/format'
import { useToast } from '../contexts/ToastContext'
import Spinner from '../components/Spinner'
import AnimatedDialog from '../components/AnimatedDialog'

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

  const handleUserId = (v: string) => { setUserId(v); if (v) setMobile('') }
  const handleMobile = (v: string) => { setMobile(v); if (v) setUserId('') }
  const [showTurnover, setShowTurnover] = useState(false)
  const [turnoverStatus, setTurnoverStatus] = useState<TurnoverStatusResponse | null>(null)
  const [turnoverLoading, setTurnoverLoading] = useState(false)
  const [showAddTurnover, setShowAddTurnover] = useState(false)
  const [addTurnoverAmount, setAddTurnoverAmount] = useState('')
  const [addTurnoverType, setAddTurnoverType] = useState('ADMIN_BONUS')
  const [addTurnoverSaving, setAddTurnoverSaving] = useState(false)
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
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setUser(null)

    if (!userId.trim() && !mobile.trim()) {
      toast('Please fill in at least one field')
      return
    }

    setLoading(true)
    try {
      const result = userId.trim()
        ? await searchUser(userId.trim())
        : await searchUserByMobile(mobile.trim())
      setUser(result)
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSameIp = async () => {
    if (!user) return
    setIpUsersLoading(true)
    /* */
    setShowIpUsers(true)
    try {
      const res = await fetchUsersByIp(user.lastIp)
      setIpUsers(res.users ?? [])
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setIpUsersLoading(false)
    }
  }

  const handleLoadPaymentMethods = async () => {
    if (!user) return
    /* */
    setShowPmDialog(true)
    try {
      const data = await viewUserPaymentMethods(String(user.user.userId))
      setPmData(data)
      setUser({ ...user, paymentMethods: data })
      setPmForm({})
      setPmType('BANK')
    } catch (err: unknown) {
      toast(extractError(err))
    }
  }

  const handleUpdatePayment = async () => {
    if (!user) return
    setPmUpdating(true)
    /* */
    try {
      const body = { userId: user.user.userId, type: pmType, ...pmForm } as any
      await updateUserPayments(body)
      setShowPmDialog(false)
      setPmForm({})
    } catch (err: unknown) {
      toast(extractError(err))
    } finally {
      setPmUpdating(false)
    }
  }

  const handleCheckTurnover = async () => {
    if (!user) return
    setTurnoverLoading(true)
    try {
      const res = await checkTurnoverStatus(user.user.userId)
      setTurnoverStatus(res)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setTurnoverLoading(false) }
  }

  const handleAddTurnover = async () => {
    if (!user || !addTurnoverAmount) return
    setAddTurnoverSaving(true)
    try {
      const res = await addTurnover({ userId: user.user.userId, amount: Number(addTurnoverAmount), type: addTurnoverType })
      setTurnoverStatus(prev => prev ? { ...prev, total_required: prev.total_required + res.required, completed: prev.completed, progress: Math.round((prev.completed / (prev.total_required + res.required)) * 100), batches: [...prev.batches, { type: res.type, amount: res.amount, multiplier: res.multiplier, required: res.required, completed: 0, createdAt: new Date().toISOString() }] } : null)
      setAddTurnoverAmount('')
      setShowAddTurnover(false)
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setAddTurnoverSaving(false) }
  }

  const handleClearTurnover = async () => {
    if (!user) return
    if (!confirm('Clear all turnover for this user?')) return
    setTurnoverLoading(true)
    try {
      await clearTurnover({ userId: user.user.userId, reason: 'Admin cleared' })
      setTurnoverStatus(null)
      handleCheckTurnover()
    } catch (err: unknown) { toast(extractError(err)) }
    finally { setTurnoverLoading(false) }
  }

  const handleStatusChange = async () => {
    if (!user) return
    setUpdatingStatus(true)
    /* */
    try {
      await updateUserStatus({ userId: user.user.userId, status: newStatus as 'active' | 'suspended' | 'inactive' | 'ban' | 'banned', remark: statusRemark })
      setUser({ ...user, account: { ...user.account, status: newStatus as any } })
      setShowStatusDialog(false)
      setStatusRemark('')
    } catch (err: unknown) {
      toast(extractError(err))
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
            onChange={(e) => handleUserId(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Mobile</label>
          <input
            type="text"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={(e) => handleMobile(e.target.value)}
          />
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-filled" disabled={loading || (!userId.trim() && !mobile.trim())}
              style={{ opacity: loading || (!userId.trim() && !mobile.trim()) ? 0.6 : 1 }}>
              {loading ? <Spinner /> : 'Search'}
            </button>
            <button type="button" className="btn-outline" onClick={() => { setUserId(''); setMobile(''); setUser(null) }}>
              Reset
            </button>
          </div>
        </div>
      </form>

      {user && (<>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div className="dashboard-card" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">User ID</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>{user.user.userId}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Status</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.account.status}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Mobile</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.user.mobile}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">VIP Level</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.account.vipLevel}</span></div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className={`badge ${statusBadge(user.account.status)}`} style={{ fontSize: 10 }}>{user.account.status}</span>
              <button className="btn-filled" style={{ minWidth: 110, textAlign: 'center' }} onClick={() => { setNewStatus(user.account.status); setShowStatusDialog(true) }}>Change Status</button>
            </div>
          </div>
          <div className="dashboard-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Balance</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{user.account.balance.toLocaleString('en-IN')}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Withdrawable</span><span style={{ fontSize: 20, fontWeight: 700, color: '#409eff', lineHeight: 1.2 }}>₹{user.account.withdrawable.toLocaleString('en-IN')}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Total Deposits</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{user.account.totalDeposits.toLocaleString('en-IN')}</span></div>
          </div>
          <div className="dashboard-card" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Holder</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.paymentMethods?.holderName || '-'}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Bank</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.paymentMethods?.bank?.bankName || '-'}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">IFSC</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.paymentMethods?.bank?.ifsc || '-'}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Account</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.paymentMethods?.bank?.accountNo || '-'}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">UPI</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.paymentMethods?.upi?.address || '-'}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">UPAY</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.paymentMethods?.upay?.address || '-'}</span></div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-filled" style={{ minWidth: 110, textAlign: 'center' }} onClick={handleLoadPaymentMethods}>View</button>
            </div>
          </div>
          <div className="dashboard-card" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Last IP</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.lastIp}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Location</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{user.deviceInfo ? [user.deviceInfo.city, user.deviceInfo.region].filter(Boolean).join(', ') : '-'}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Created</span><span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{formatDateTime12(user.user.createdAt)}</span></div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-filled" style={{ minWidth: 110, textAlign: 'center' }} onClick={handleLoadSameIp} disabled={ipUsersLoading}>{ipUsersLoading ? <Spinner /> : 'Same IP Users'}</button>
            </div>
          </div>
          <div className="dashboard-card" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Requirement</span><span style={{ fontSize: 20, fontWeight: 700, color: '#f97316', lineHeight: 1.2 }}>₹{user.account.turnover_requirement.toLocaleString('en-IN')}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="stat-label">Completed</span><span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>₹{user.account.total_turnover_completed.toLocaleString('en-IN')}</span></div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-filled" style={{ minWidth: 110, textAlign: 'center' }} onClick={() => { setShowTurnover(true) }}>View Batches</button>
            </div>
          </div>
        </div>

        <AnimatedDialog open={showStatusDialog && !!user} onClose={() => { setShowStatusDialog(false); setStatusRemark('') }} title={`Change Status — User #${user?.user.userId ?? ''}`}
          footer={
            <>
              <button className="btn-outline" onClick={() => { setShowStatusDialog(false); setStatusRemark('') }} disabled={updatingStatus}>Cancel</button>
              <button className="btn-filled" onClick={handleStatusChange} disabled={updatingStatus || !statusRemark.trim()}>{updatingStatus ? <Spinner /> : 'Update'}</button>
            </>
          }
        >
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
        </AnimatedDialog>
        <AnimatedDialog open={showIpUsers} onClose={() => { setShowIpUsers(false); setIpUsers([]) }} title={`Users with IP: ${user?.lastIp ?? ''}`}>
          {ipUsers.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">👥</div>No other users found</div>
          ) : (
            <div className="table-wrap">
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
            </div>
          )}
        </AnimatedDialog>
        <AnimatedDialog open={showPmDialog && !!user} onClose={() => setShowPmDialog(false)} title={`Payment Methods — User #${user?.user.userId ?? ''}`}
          footer={
            <>
              <button className="btn-outline" onClick={() => setShowPmDialog(false)} disabled={pmUpdating}>Cancel</button>
              <button className="btn-filled" onClick={handleUpdatePayment} disabled={pmUpdating || Object.keys(pmForm).length === 0}>{pmUpdating ? <Spinner /> : 'Save Payment'}</button>
            </>
          }
        >
          {pmData && (
            <div style={{ marginBottom: 'var(--space-6)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 13 }}>
              <div><strong>Holder Name:</strong> {pmData.holderName || '-'}</div>
              <div><strong>Bank Name:</strong> {pmData.bank?.bankName || '-'}</div>
              <div><strong>IFSC:</strong> {pmData.bank?.ifsc || '-'}</div>
              <div><strong>Account No:</strong> {pmData.bank?.accountNo || '-'}</div>
              <div><strong>UPI:</strong> {pmData.upi?.address || '-'}</div>
              <div><strong>UPAY:</strong> {pmData.upay?.address || '-'}</div>
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
        </AnimatedDialog>
        <AnimatedDialog open={showTurnover && !!user} onClose={() => { setShowTurnover(false); setShowAddTurnover(false); setTurnoverStatus(null) }} title={`Turnover — User #${user?.user.userId ?? ''}`}
          footer={
            <>
              <button className="btn btn--primary btn--sm" onClick={handleCheckTurnover} disabled={turnoverLoading}>Check Status</button>
              <button className="btn btn--sm" style={{ background: '#22c55e', color: '#fff', border: 'none' }} onClick={() => { setShowAddTurnover(true); handleCheckTurnover() }}>Add Turnover</button>
              <button className="btn btn--danger btn--sm" onClick={handleClearTurnover} disabled={turnoverLoading}>Clear Turnover</button>
            </>
          }
        >
          {turnoverStatus && (
            <div className="turnover-status-card">
              <div><span className="turnover-label">Total Required</span><div style={{ fontWeight: 700, fontSize: 15 }}>₹{turnoverStatus.total_required.toLocaleString('en-IN')}</div></div>
              <div><span className="turnover-label">Completed</span><div style={{ fontWeight: 700, fontSize: 15, color: '#22c55e' }}>₹{turnoverStatus.completed.toLocaleString('en-IN')}</div></div>
              <div><span className="turnover-label">Remaining</span><div style={{ fontWeight: 700, fontSize: 15, color: '#f97316' }}>₹{turnoverStatus.requirement.toLocaleString('en-IN')}</div></div>
              <div><span className="turnover-label">Progress</span><div style={{ fontWeight: 700, fontSize: 15 }}>{turnoverStatus.progress}%</div></div>
              <div><span className="turnover-label">Can Withdraw</span><div style={{ fontWeight: 700, fontSize: 15, color: turnoverStatus.canWithdraw ? '#22c55e' : '#ef4444' }}>{turnoverStatus.canWithdraw ? 'Yes' : 'No'}</div></div>
            </div>
          )}
          {showAddTurnover && (
            <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
              <div className="filter-group" style={{ flex: '1 1 100px', minWidth: 0 }}><label>Amount</label><input type="number" value={addTurnoverAmount} onChange={(e) => setAddTurnoverAmount(e.target.value)} style={{ width: '100%' }} /></div>
              <div className="filter-group" style={{ flex: '1 1 140px', minWidth: 0 }}><label>Type</label>
                <select value={addTurnoverType} onChange={(e) => setAddTurnoverType(e.target.value)} style={{ width: '100%' }}>
                  <option value="ADMIN_BONUS">ADMIN_BONUS</option>
                  <option value="DEPOSIT">DEPOSIT</option>
                  <option value="BONUS">BONUS</option>
                  <option value="SIGNUP_BONUS">SIGNUP_BONUS</option>
                  <option value="FIRST_DEPOSIT_BONUS">FIRST_DEPOSIT_BONUS</option>
                  <option value="VIP_BONUS">VIP_BONUS</option>
                  <option value="WEEKLY_BONUS">WEEKLY_BONUS</option>
                  <option value="UPGRADE_BONUS">UPGRADE_BONUS</option>
                  <option value="GIFT_CODE">GIFT_CODE</option>
                  <option value="DEPOSIT_BONUS">DEPOSIT_BONUS</option>
                </select>
              </div>
              <button className="btn btn--sm" style={{ background: '#22c55e', color: '#fff', border: 'none', height: 44 }} onClick={handleAddTurnover} disabled={addTurnoverSaving || !addTurnoverAmount}>{addTurnoverSaving ? <Spinner /> : 'Add'}</button>
            </div>
          )}
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Type</th><th>Amount</th><th>Multiplier</th><th>Required</th><th>Completed</th><th>Remaining</th><th>Created</th></tr></thead>
              <tbody>
                {(turnoverStatus?.batches ?? user?.account?.turnover_batches ?? []).map((b, i) => (
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
        </AnimatedDialog>
      </>)}
    </div>
  )
}
