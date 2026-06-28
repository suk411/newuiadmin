import axiosInstance from './axiosInstance'

export interface ChannelLimit {
  min: number
  max: number
}

export interface WithdrawalConfig {
  key: string
  perDayLimit: number
  limits: {
    BANK: ChannelLimit
    UPI: ChannelLimit
    UPAY: ChannelLimit
  }
}

export async function fetchWithdrawalConfig(): Promise<WithdrawalConfig> {
  const res = await axiosInstance.get('/withdrawal-config')
  return res.data.data
}

export async function updateWithdrawalConfig(data: Partial<WithdrawalConfig>): Promise<WithdrawalConfig> {
  const res = await axiosInstance.put('/withdrawal-config', data)
  return res.data.data
}
