import axiosInstance from './axiosInstance'

export interface DepositChannel {
  channel: string
  name: string
  isActive: boolean
  minAmount: number
  maxAmount: number
  exchangeRate?: number
  sortOrder?: number
  description?: string
}

export interface DepositBonusConfig {
  depositCount: number
  bonusRate: number
  active: boolean
}

export async function fetchDepositConfig(): Promise<DepositChannel[]> {
  const res = await axiosInstance.get('/deposit-config')
  const body = res.data
  return body.data ?? []
}

export async function updateDepositChannel(channel: string, data: Partial<DepositChannel>): Promise<DepositChannel> {
  const res = await axiosInstance.put(`/deposit-config/${channel}`, data)
  return res.data.data
}

export async function fetchDepositBonusConfig(): Promise<DepositBonusConfig[]> {
  const res = await axiosInstance.get('/deposit-bonus-config')
  const body = res.data
  return body.configs ?? []
}

export async function updateDepositBonusConfig(data: Partial<DepositBonusConfig>): Promise<DepositBonusConfig> {
  const res = await axiosInstance.put('/deposit-bonus-config', data)
  return res.data.config
}
