import axiosInstance from './axiosInstance'
import { check, required, numeric, min, futureDate } from '../utils/validate'

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
  check('rewardAmount', data.rewardAmount, required(), numeric(), min(1))
  check('maxRedemptions', data.maxRedemptions, required(), numeric(), min(1))
  check('expiryDate', data.expiryDate, required(), futureDate())
  await axiosInstance.post('/gift-codes', data)
}

export async function toggleGiftCode(code: string, isActive: boolean): Promise<void> {
  check('code', code, required())
  await axiosInstance.patch(`/gift-codes/${code}/toggle`, { isActive })
}

export async function deleteGiftCode(code: string): Promise<void> {
  check('code', code, required())
  await axiosInstance.delete(`/gift-codes/${code}`)
}
