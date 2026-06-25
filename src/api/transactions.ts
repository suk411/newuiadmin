import axiosInstance from './axiosInstance'

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
  const res = await axiosInstance.get('/transactions', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0, page: body.page ?? 1, limit: body.limit ?? 20 }
  }
  return { data: [], total: 0, page: 1, limit: 20 }
}
