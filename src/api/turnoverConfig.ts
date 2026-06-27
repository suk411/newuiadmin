import axiosInstance from './axiosInstance'

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
  await axiosInstance.put('/turnover-config', data)
}
