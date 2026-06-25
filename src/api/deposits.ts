import axiosInstance from './axiosInstance'

export interface DepositRecord {
  id: string
  userId: string
  mobile: string
  orderId: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  channel?: string
  remark?: string
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
  const params: Record<string, string | number> = { page: filters.page, limit: filters.limit }
  if (filters.userId) params.userId = filters.userId
  if (filters.mobile) params.mobile = filters.mobile
  if (filters.orderId) params.orderId = filters.orderId
  if (filters.status) params.status = filters.status
  if (filters.dateFrom) params.dateFrom = filters.dateFrom
  if (filters.dateTo) params.dateTo = filters.dateTo

  const { data } = await axiosInstance.get<DepositListResponse>('/deposits', { params })
  return data
}

export async function approveDeposit(orderId: string): Promise<void> {
  await axiosInstance.post('/deposits/approve', { orderId })
}
