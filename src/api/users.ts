import axiosInstance from './axiosInstance'

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
  const res = await axiosInstance.get('/user', { params: { userId } })
  return res.data.data ?? res.data
}

export async function searchUserByMobile(mobile: string): Promise<UserSearchResponse> {
  const res = await axiosInstance.get('/user', { params: { mobile } })
  return res.data.data ?? res.data
}

export async function updateUserStatus(data: { userId: number; status: 'active' | 'suspended' | 'inactive' | 'ban' | 'banned'; remark?: string }): Promise<void> {
  await axiosInstance.patch('/user', data)
}

export async function updateUserPayments(data: { userId: number; type: 'BANK' | 'UPI' | 'UPAY'; [key: string]: unknown }): Promise<void> {
  await axiosInstance.put('/user/payments', data)
}

export async function fetchUsersByIp(ip: string): Promise<{ users: Array<{ userId: number; mobile: string; createdAt: string }> }> {
  const res = await axiosInstance.get('/users-by-ip', { params: { ip } })
  return res.data
}

export async function viewUserPaymentMethods(userId: string): Promise<PaymentMethods> {
  const res = await axiosInstance.get('/user/payment-methods', { params: { userId } })
  return res.data
}

export async function updatePaymentMethod(id: string, data: Record<string, unknown>): Promise<void> {
  await axiosInstance.put(`/user/payment-methods/${id}`, data)
}
