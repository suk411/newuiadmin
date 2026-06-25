import axiosInstance from './axiosInstance'

export interface VipTier {
  level: number
  name: string
  depositThreshold: number
  withdrawalLimit: number
  benefits: string[]
}

export async function fetchVipConfig(): Promise<VipTier[]> {
  const res = await axiosInstance.get('/vip-config')
  return res.data
}

export async function updateVipConfig(data: VipTier[]): Promise<void> {
  await axiosInstance.put('/vip-config', data)
}
