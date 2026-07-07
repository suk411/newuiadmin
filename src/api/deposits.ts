import axiosInstance from './axiosInstance'
import { check, required, numeric, min, max } from '../utils/validate'

export interface DepositRecord {
  orderId: string
  userId: number
  amount: number
  receivedAmount: number
  currency: string
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  gatewayOrderNo: string
  channelName: string
  bonusOptIn: boolean
  bonusAmount: number
  createdAt: string
  updatedAt: string
}

export interface DepositListResponse {
  data: DepositRecord[]
  total: number
  page: number
  limit: number
}

export interface DepositFilters {
  userId?: string
  mobile?: string
  orderId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page: number
  limit: number
}

export async function fetchDeposits(filters: DepositFilters): Promise<DepositListResponse> {
  check('limit', filters.limit, numeric(), min(1), max(100))
  const params: Record<string, string | number> = { page: filters.page, limit: filters.limit }
  if (filters.userId) params.userId = filters.userId
  if (filters.mobile) params.mobile = filters.mobile
  if (filters.orderId) params.orderId = filters.orderId
  if (filters.status) params.status = filters.status
  if (filters.dateFrom) params.dateFrom = filters.dateFrom
  if (filters.dateTo) params.dateTo = filters.dateTo

  const response = await axiosInstance.get('/deposits', { params })
  const body = response.data

  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0, page: body.page ?? 1, limit: body.limit ?? filters.limit }
  }

  return { data: [], total: 0, page: 1, limit: filters.limit }
}

export async function approveDeposit(orderId: string): Promise<void> {
  check('orderId', orderId, required())
  await axiosInstance.post('/deposits/approve', { orderId })
}
