import axiosInstance from './axiosInstance'

export interface WithdrawalRecord {
  orderId: string
  userId: number
  amount: number
  status: string
  method: string
  createdAt: string
}

export interface WithdrawalListResponse {
  data: WithdrawalRecord[]
  total: number
  page: number
  limit: number
}

export async function fetchWithdrawals(params: Record<string, string | number>): Promise<WithdrawalListResponse> {
  const res = await axiosInstance.get('/withdrawals', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0, page: body.page ?? 1, limit: body.limit ?? 20 }
  }
  return { data: [], total: 0, page: 1, limit: 20 }
}

export async function approveWithdrawal(orderId: string): Promise<void> {
  await axiosInstance.post('/withdrawals/approve', { orderId })
}

export async function cancelWithdrawal(orderId: string, reason: string): Promise<void> {
  await axiosInstance.post('/withdrawals/cancel', { orderId, reason })
}
