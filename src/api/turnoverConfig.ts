import axiosInstance from './axiosInstance'
import { ValidationError, check, required, numeric } from '../utils/validate'

export interface TurnoverRule {
  _id?: string
  type: string
  description: string
  multiplier: number
  active: boolean
}

export async function fetchTurnoverConfig(): Promise<TurnoverRule[]> {
  const res = await axiosInstance.get('/turnover-config')
  const body = res.data
  return Array.isArray(body) ? body : (body.configs ?? [])
}

export async function updateTurnoverConfig(data: TurnoverRule[]): Promise<void> {
  if (!Array.isArray(data) || data.length === 0) throw new ValidationError('turnover config must be a non-empty array')
  for (const rule of data) {
    check('type', rule.type, required())
    check('multiplier', rule.multiplier, required(), numeric())
  }
  await axiosInstance.put('/turnover-config', data)
}
