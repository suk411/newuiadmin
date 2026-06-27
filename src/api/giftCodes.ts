import axiosInstance from './axiosInstance'

export interface GiftCode {
  _id?: string
  code: string
  rewardAmount: number
  turnoverMultiplier: number
  maxRedemptions: number
  usedCount: number
  expiryDate: string
  minDepositToday: number
  isActive: boolean
  description: string
  createdAt: string
  updatedAt?: string
}

export interface GiftCodeListResponse {
  data: GiftCode[]
  total: number
  page: number
  limit: number
}

export async function fetchGiftCodes(params: Record<string, string | number>): Promise<GiftCodeListResponse> {
  const res = await axiosInstance.get('/gift-codes', { params })
  const body = res.data
  if (body.items && Array.isArray(body.items)) {
    return { data: body.items, total: body.total ?? 0, page: body.page ?? 1, limit: body.limit ?? 20 }
  }
  return { data: [], total: 0, page: 1, limit: 20 }
}

export async function createGiftCode(data: Partial<GiftCode>): Promise<void> {
  await axiosInstance.post('/gift-codes', data)
}

export async function updateGiftCode(code: string, data: Partial<GiftCode>): Promise<void> {
  await axiosInstance.put(`/gift-codes/${code}`, data)
}

export async function toggleGiftCode(code: string): Promise<void> {
  await axiosInstance.patch(`/gift-codes/${code}/toggle`)
}

export async function deleteGiftCode(code: string): Promise<void> {
  await axiosInstance.delete(`/gift-codes/${code}`)
}

export async function fetchRedemptions(code: string, page = 1, limit = 20): Promise<{ data: unknown[]; total: number }> {
  const res = await axiosInstance.get(`/gift-codes/${code}/redemptions`, { params: { page, limit } })
  return res.data
}
