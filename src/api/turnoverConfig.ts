import axiosInstance from './axiosInstance'

export interface TurnoverRule {
  minAmount: number
  maxAmount: number
  multiplier: number
}

export async function fetchTurnoverConfig(): Promise<TurnoverRule[]> {
  const res = await axiosInstance.get('/turnover-config')
  return res.data
}

export async function updateTurnoverConfig(data: TurnoverRule[]): Promise<void> {
  await axiosInstance.put('/turnover-config', data)
}
