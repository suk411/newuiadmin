import axiosInstance from './axiosInstance'
import { check, required, numeric, min, max, oneOf } from '../utils/validate'

const TX_TYPES = ['DEPOSIT', 'WITHDRAW', 'WITHDRAW_REFUND', 'BET', 'WIN', 'REFUND', 'BONUS', 'ADMIN', 'SIGNUP_BONUS', 'FIRST_DEPOSIT_BONUS', 'GIFT_CODE', 'AGENT_COMMISSION', 'WEEKLY_BONUS', 'UPGRADE_BONUS', 'gameIn', 'gameOut'] as const

export interface TransactionRecord {
  orderId: string
  userId: number
  type: string
  amount: number
  charge: number
  balanceAfter: number
  status: string
  remark: string
  createdAt: string
  updatedAt: string
}

export interface TransactionListResponse {
  data: TransactionRecord[]
  total: number
  page: number
  limit: number
}

export async function fetchTransactions(params: Record<string, string | number>): Promise<TransactionListResponse> {
  check('params', params.userId || params.orderId || params.transactionId, required())
  if (params.userId) check('userId', params.userId, numeric())
  if (params.type) check('type', params.type, oneOf(TX_TYPES))
  check('limit', params.limit, numeric(), min(1), max(100))
  const res = await axiosInstance.get('/transactions', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0, page: body.page ?? 1, limit: body.limit ?? 20 }
  }
  return { data: [], total: 0, page: 1, limit: 20 }
}
