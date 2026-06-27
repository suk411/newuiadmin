import axiosInstance from './axiosInstance'

export interface VipTier {
  name: string
  minDeposit: number
  weeklyBonus: number
  upgradeBonus: number
  weeklyDepositRequirement: number
}

export async function fetchVipConfig(): Promise<VipTier[]> {
  const res = await axiosInstance.get('/vip-config')
  return res.data
}

export async function updateVipConfig(data: VipTier[]): Promise<void> {
  await axiosInstance.put('/vip-config', data)
}
