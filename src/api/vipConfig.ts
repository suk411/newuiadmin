import axiosInstance from './axiosInstance'
import { ValidationError, check, required, numeric } from '../utils/validate'

export interface VipTier {
  name: string
  minDeposit: number
  weeklyBonus: number
  upgradeBonus: number
  weeklyDepositRequirement: number
}

export async function fetchVipConfig(): Promise<VipTier[]> {
  const res = await axiosInstance.get('/vip-config')
  const body = res.data
  return Array.isArray(body) ? body : (body.levels ?? [])
}

export async function updateVipConfig(data: VipTier[]): Promise<void> {
  if (!Array.isArray(data) || data.length === 0) throw new ValidationError('VIP config must be a non-empty array')
  for (const tier of data) {
    check('name', tier.name, required())
    check('minDeposit', tier.minDeposit, required(), numeric())
    check('weeklyBonus', tier.weeklyBonus, required(), numeric())
  }
  await axiosInstance.put('/vip-config', data)
}
