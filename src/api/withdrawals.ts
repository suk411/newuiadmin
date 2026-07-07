import axiosInstance from './axiosInstance'
import { check, required, numeric, min, max, oneOf } from '../utils/validate'

export interface PaymentDetails {
  upiId?: string
  accountNo?: string
  ifsc?: string
  bankName?: string
  rplId?: string
  holderName?: string
}

export interface WithdrawalRecord {
  orderId: string
  userId: number
  amount: number
  charge: number
  currency: string
  status: string
  method: string
  paymentMethod: string
  channelName: string
  chargeFrom: string
  note: string
  paymentDetails: PaymentDetails
  createdAt: string
  updatedAt: string
}

export interface WithdrawalListResponse {
  data: WithdrawalRecord[]
  total: number
  page: number
  limit: number
}

export async function fetchWithdrawals(params: Record<string, string | number>): Promise<WithdrawalListResponse> {
  check('limit', params.limit, numeric(), min(1), max(100))
  const res = await axiosInstance.get('/withdrawals', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0, page: body.page ?? 1, limit: body.limit ?? 20 }
  }
  return { data: [], total: 0, page: 1, limit: 20 }
}

export async function approveWithdrawal(orderId: string, chargeFrom: string): Promise<void> {
  check('orderId', orderId, required())
  check('chargeFrom', chargeFrom, required(), oneOf(['user', 'platform']))
  await axiosInstance.post('/withdrawals/approve', { orderId, chargeFrom })
}

export async function cancelWithdrawal(orderId: string, reason: string): Promise<void> {
  check('orderId', orderId, required())
  await axiosInstance.post('/withdrawals/cancel', { orderId, reason })
}
