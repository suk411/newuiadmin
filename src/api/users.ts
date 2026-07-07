import axiosInstance from './axiosInstance'
import { check, required, numeric, oneOf } from '../utils/validate'

export interface UserProfile {
  userId: number
  mobile: string
  admin: boolean
  createdAt: string
  updatedAt: string
}

export interface UserAccount {
  balance: number
  withdrawable: number
  totalDeposits: number
  totalWithdrawals: number
  status: 'active' | 'suspended' | 'inactive' | 'ban' | 'banned'
  statusRemark?: string
  vipLevel: string
  withdrawDailyLimit: number
  turnover_requirement: number
  total_turnover_completed: number
  currency: string
  gameMemberCreated: boolean
  firstDepositBonusGiven: boolean
  createdAt: string
  updatedAt: string
  turnover_batches: TurnoverBatch[]
}

export interface PaymentMethods {
  userId?: number
  holderName?: string
  isDefault?: boolean
  bank?: { bankName: string; ifsc: string; accountNo: string }
  upi?: { address: string }
  upay?: { address: string }
}

export interface DeviceInfo {
  city?: string
  region?: string
  country_name?: string
  asn?: string
  org?: string
  isp?: string
  latitude?: number
  longitude?: number
  timezone?: string
  postal?: string
}

export interface TurnoverBatch {
  type: string
  amount: number
  multiplier: number
  required: number
  completed: number
  createdAt: string
}

export interface UserSearchResponse {
  user: UserProfile
  account: UserAccount
  paymentMethods: PaymentMethods | null
  lastIp: string
  deviceInfo: DeviceInfo | null
  sameIpUsers: number
}

export async function searchUser(userId: string): Promise<UserSearchResponse> {
  check('userId', userId, required(), numeric())
  const res = await axiosInstance.get('/user', { params: { userId } })
  return res.data.data ?? res.data
}

export async function searchUserByMobile(mobile: string): Promise<UserSearchResponse> {
  check('mobile', mobile, required())
  const res = await axiosInstance.get('/user', { params: { mobile } })
  return res.data.data ?? res.data
}

const VALID_STATUSES = ['active', 'suspended', 'inactive', 'ban', 'banned'] as const
const REMARK_REQUIRED = ['suspended', 'banned', 'ban'] as const

export async function updateUserStatus(data: { userId: number; status: 'active' | 'suspended' | 'inactive' | 'ban' | 'banned'; remark?: string }): Promise<void> {
  check('userId', data.userId, required(), numeric())
  check('status', data.status, required(), oneOf(VALID_STATUSES))
  if ((REMARK_REQUIRED as readonly string[]).includes(data.status)) {
    check('remark', data.remark, required())
  }
  await axiosInstance.patch('/user', data)
}

export async function updateUserPayments(data: { userId: number; type: 'BANK' | 'UPI' | 'UPAY'; [key: string]: unknown }): Promise<void> {
  check('userId', data.userId, required(), numeric())
  check('type', data.type, required(), oneOf(['BANK', 'UPI', 'UPAY']))
  if (data.type === 'UPI') check('upiId', data.upiId, required())
  if (data.type === 'BANK') {
    check('accountNo', data.accountNo, required())
    check('accountHolder', data.accountHolder, required())
  }
  if (data.type === 'UPAY') check('rplId', data.rplId, required())
  await axiosInstance.put('/user/payments', data)
}

export async function fetchUsersByIp(ip: string): Promise<{ users: Array<{ userId: number; mobile: string; createdAt: string }> }> {
  check('ip', ip, required())
  const res = await axiosInstance.get('/users-by-ip', { params: { ip } })
  return res.data
}

export async function viewUserPaymentMethods(userId: string): Promise<PaymentMethods> {
  check('userId', userId, required(), numeric())
  const res = await axiosInstance.get('/user/payment-methods', { params: { userId } })
  const body = res.data.data ?? res.data
  return body
}

export interface TurnoverAddResponse {
  status: string
  batchId: string
  type: string
  amount: number
  multiplier: number
  required: number
  totalTurnover: number
}

export interface TurnoverClearResponse {
  status: string
  cleared: boolean
  userId: number
}

export interface TurnoverStatusResponse {
  status: string
  total_required: number
  requirement: number
  completed: number
  progress: number
  canWithdraw: boolean
  batches: TurnoverBatch[]
}

export async function addTurnover(data: { userId: number; amount: number; type?: string }): Promise<TurnoverAddResponse> {
  check('userId', data.userId, required(), numeric())
  check('amount', data.amount, required(), numeric())
  const res = await axiosInstance.post('/turnover/add', data)
  return res.data
}

export async function clearTurnover(data: { userId: number; reason?: string }): Promise<TurnoverClearResponse> {
  check('userId', data.userId, required(), numeric())
  const res = await axiosInstance.post('/turnover/clear', data)
  return res.data
}

export async function checkTurnoverStatus(userId: number): Promise<TurnoverStatusResponse> {
  check('userId', userId, required(), numeric())
  const res = await axiosInstance.get('/turnover-status', { params: { userId } })
  return res.data
}
